/**
 * Codigo.gs — Apps Script vinculado à planilha do "Panorama Global da IA Generativa".
 *
 * Faz duas coisas:
 *  1) doPost(e): recebe os candidatos do GitHub Actions (publish.mjs), grava na aba
 *     "Pendentes" como rascunho (status = "pendente", checkbox "Aprovar?" desmarcado)
 *     e envia um e-mail-resumo.
 *  2) onEdit(e): quando você marca "Aprovar?" numa linha de "Pendentes", copia a linha
 *     para "Lancamentos" com status = "publicado" (é isso que o site lê).
 *
 * SETUP (uma vez):
 *  - Editar SECRET e EMAIL abaixo. SECRET deve ser igual ao secret APPS_SCRIPT_TOKEN do GitHub.
 *  - Criar a aba "Pendentes" com o MESMO cabeçalho de "Lancamentos" + uma coluna "Aprovar?".
 *  - Adicionar um gatilho INSTALÁVEL de onEdit: no editor → Gatilhos (ícone de relógio) →
 *    Adicionar gatilho → função onEdit, evento "Ao editar". (O onEdit simples não tem
 *    permissão p/ ler outras abas; por isso precisa do gatilho instalável.)
 *  - Implantar → Nova implantação → App da Web → Executar como: eu → Acesso: qualquer
 *    pessoa. Copiar a URL (é o secret APPS_SCRIPT_URL do GitHub).
 */

var SECRET = 'COLOQUE_O_MESMO_TOKEN_DO_GITHUB_AQUI';
var EMAIL = 'victor.amaral@ufg.br';
var TAB_LANC = 'Lancamentos';
var TAB_PEND = 'Pendentes';
var COL_APROVAR = 'Aprovar?';

// ───────────────────────── doPost: recebe candidatos ─────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body || body.token !== SECRET) return _json({ ok: false, error: 'token invalido' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pend = ss.getSheetByName(TAB_PEND);
    if (!pend) return _json({ ok: false, error: 'aba "' + TAB_PEND + '" nao existe' });

    var headers = _headers(pend);
    var existing = _existingKeys(ss);
    var added = [], skipped = 0;

    (body.rows || []).forEach(function (r) {
      var key = [r.data, String(r.empresa).trim().toUpperCase(), String(r.modelo).trim().toUpperCase()].join('|');
      if (existing[key]) { skipped++; return; }
      existing[key] = true;
      var obj = {
        data: r.data, empresa: r.empresa, modelo: r.modelo, impacto: r.impacto,
        referencia: r.referencia, status: 'pendente', tipo: r.tipo || 'modelo',
        dias: '', origem: r.origem || 'auto',
        timestamp: new Date(), data_atualizacao: new Date()
      };
      pend.appendRow(_rowFromObj(headers, obj));
      added.push(r);
    });

    _sendEmail(body, added, skipped);
    return _json({ ok: true, added: added.length, skipped: skipped });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// ──────────────────── onEdit: aprovar promove p/ Lancamentos ─────────────────
function onEdit(e) {
  var sh = e.range.getSheet();
  if (sh.getName() !== TAB_PEND) return;

  var headers = _headers(sh);
  var aprovarCol = headers.indexOf(COL_APROVAR) + 1; // 1-based
  if (aprovarCol === 0 || e.range.getColumn() !== aprovarCol) return;

  var checked = e.range.getValue() === true || String(e.value).toUpperCase() === 'TRUE';
  if (!checked) return;
  var row = e.range.getRow();
  if (row === 1) return;

  var ss = e.source;
  var lanc = ss.getSheetByName(TAB_LANC);
  if (!lanc) return;
  var lancHeaders = _headers(lanc);

  var vals = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];
  var obj = {};
  headers.forEach(function (h, i) { obj[h] = vals[i]; });
  obj.status = 'publicado';
  obj.data_atualizacao = new Date();

  lanc.appendRow(_rowFromObj(lancHeaders, obj));
  sh.getRange(row, aprovarCol).setNote('Aprovado e publicado em ' + new Date());
}

// ───────────────────────────── helpers ──────────────────────────────────────
function _headers(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
}

function _rowFromObj(headers, obj) {
  // Mapeia por NOME de cabeçalho (não por índice) — robusto a colunas extras/reordenadas.
  return headers.map(function (h) {
    var key = _norm(h);
    for (var k in obj) { if (_norm(k) === key) return obj[k]; }
    return '';
  });
}

function _norm(s) {
  return String(s).trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function _existingKeys(ss) {
  var keys = {};
  [TAB_LANC, TAB_PEND].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    var headers = _headers(sh);
    var iData = _col(headers, 'data'), iEmp = _col(headers, 'empresa'), iMod = _col(headers, 'modelo');
    if (iData < 0 || iEmp < 0 || iMod < 0) return;
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
    data.forEach(function (r) {
      var d = _fmtDate(r[iData]);
      var key = [d, String(r[iEmp]).trim().toUpperCase(), String(r[iMod]).trim().toUpperCase()].join('|');
      keys[key] = true;
    });
  });
  return keys;
}

function _col(headers, name) {
  var target = _norm(name);
  for (var i = 0; i < headers.length; i++) { if (_norm(headers[i]) === target) return i; }
  return -1;
}

function _fmtDate(v) {
  if (v instanceof Date) {
    return v.getFullYear() + '-' + _pad(v.getMonth() + 1) + '-' + _pad(v.getDate());
  }
  return String(v);
}
function _pad(n) { return (n < 10 ? '0' : '') + n; }

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function _sendEmail(body, added, skipped) {
  if (!added.length && !(body.novas || []).length) return;
  var rows = added.map(function (r) {
    return '<tr>' +
      '<td>' + r.data + '</td>' +
      '<td>' + _esc(r.empresa) + (r.empresa_nova ? ' <b style="color:#b00">(EMPRESA NOVA)</b>' : '') + '</td>' +
      '<td>' + _esc(r.modelo) + '</td>' +
      '<td>' + (r.confianca != null ? r.confianca : '') + '</td>' +
      '<td><a href="' + _esc(r.referencia) + '">fonte</a></td>' +
      '</tr>';
  }).join('');

  var novasHtml = '';
  (body.novas || []).forEach(function (n) {
    novasHtml += '<h4>' + _esc(n.empresa) + '</h4><pre style="background:#f5f5f5;padding:8px;white-space:pre-wrap">' + _esc(n.snippet) + '</pre>';
  });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var html =
    '<p>Pipeline automático encontrou <b>' + added.length + '</b> candidato(s) novo(s) ' +
    '(ignorados por já existirem: ' + skipped + ').</p>' +
    '<p>Eles estão na aba <b>' + TAB_PEND + '</b> como rascunho. Para publicar no site, ' +
    'marque a coluna <b>"' + COL_APROVAR + '"</b> na linha desejada.</p>' +
    '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">' +
    '<tr><th>Data</th><th>Empresa</th><th>Modelo</th><th>Conf.</th><th>Fonte</th></tr>' +
    rows + '</table>' +
    (novasHtml ? '<h3>Empresas novas — aplicar no assets/data.js antes de aprovar</h3>' + novasHtml : '') +
    '<p><a href="' + ss.getUrl() + '">Abrir a planilha</a></p>';

  MailApp.sendEmail({
    to: EMAIL,
    subject: '[Panorama IA] ' + added.length + ' novo(s) lançamento(s) para aprovar',
    htmlBody: html
  });
}

function _esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
