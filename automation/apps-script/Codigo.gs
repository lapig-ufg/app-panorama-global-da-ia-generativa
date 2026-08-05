/**
 * Codigo.gs — Apps Script vinculado à planilha do "Panorama Global da IA Generativa".
 *
 * Faz três coisas:
 *  1) doPost(e) ingestão: recebe os candidatos do GitHub Actions (publish.mjs), grava na
 *     aba "Pendentes" como rascunho (status = "pendente") e envia um e-mail-resumo.
 *  2) doPost(e) admin: ações { action:'aprovar'|'rejeitar', token, data, empresa, modelo,
 *     nivel? } vindas da PWA de curadoria — aprovar promove p/ "Lancamentos" e remove de
 *     "Pendentes"; rejeitar remove de "Pendentes".
 *     nivel:'secundario' publica com status "secundario" em vez de "publicado": a linha
 *     entra em Lancamentos mas o site só a desenha no modo "régua ampliada". Serve para o
 *     lançamento real que não é marco (point-release, variante, ferramenta menor).
 *  3) onEdit(e): marcar "Aprovar?" numa linha de "Pendentes" também promove p/ "Lancamentos".
 *
 * SETUP (uma vez, nesta ordem):
 *  - Project Settings → Script Properties → adicionar a propriedade "SECRET" com um token
 *    aleatório. Esse MESMO valor é o secret APPS_SCRIPT_TOKEN no GitHub E o token que a PWA
 *    de curadoria guarda no localStorage. (O segredo NÃO fica no código-fonte.)
 *  - Rodar a função setup() uma vez (autorizar): cria a aba "Pendentes" e o gatilho onEdit.
 *  - Implantar → App da Web (acesso já vem do appsscript.json). Copiar a URL /exec.
 */

var EMAIL = 'victor.amaral@ufg.br';
var TAB_LANC = 'Lancamentos';
var TAB_PEND = 'Pendentes';
var COL_APROVAR = 'Aprovar?';

function getSecret_() {
  var s = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!s) throw new Error('Script Property "SECRET" não definida (Project Settings → Script Properties).');
  return s;
}

// ─────────────────────────── setup (rodar 1x) ───────────────────────────────
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lanc = ss.getSheetByName(TAB_LANC);
  if (!lanc) throw new Error('Aba "' + TAB_LANC + '" não encontrada — abra a planilha certa.');

  // 1) Cria/garante a aba Pendentes com o mesmo cabeçalho + coluna Aprovar?
  var pend = ss.getSheetByName(TAB_PEND);
  if (!pend) pend = ss.insertSheet(TAB_PEND);
  var lancHeaders = _headers(lanc);
  if (lancHeaders.indexOf(COL_APROVAR) === -1) lancHeaders = lancHeaders.concat([COL_APROVAR]);
  pend.getRange(1, 1, 1, lancHeaders.length).setValues([lancHeaders]).setFontWeight('bold');
  pend.setFrozenRows(1);

  // checkbox na coluna Aprovar? (linhas 2..1000)
  var aprovarCol = lancHeaders.indexOf(COL_APROVAR) + 1;
  pend.getRange(2, aprovarCol, 1000, 1)
      .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());

  // 1b) Garante as colunas grupo/pais nas duas abas
  _ensureExtraCols_(ss);

  // 2) Gatilho instalável onEdit. Remove TODOS os gatilhos antigos primeiro
  //    (tentativas anteriores podem ter deixado gatilhos por tempo que agora falhariam).
  var removidos = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); removidos++; });
  ScriptApp.newTrigger('onEdit').forSpreadsheet(ss).onEdit().create();

  return 'setup ok: aba "' + TAB_PEND + '" pronta + gatilho onEdit instalado (gatilhos antigos removidos: ' + removidos + ').';
}

// ───────────────────────────── doPost (roteador) ─────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body && (body.action === 'aprovar' || body.action === 'rejeitar')) {
      return _handleAdmin_(body, body.action);
    }
    if (body && body.action === 'rodar') {
      return _rodarWorkflow_(body);
    }
    return _handleIngestao_(body);
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// ───────────────────────────── doGet (leitura) ──────────────────────────────
// Leituras públicas (não exigem token — os Pendentes já são legíveis via gviz hoje,
// então listar não vaza nada novo). Devolve JSON puro, lido pela PWA via fetch CORS
// (o web app responde com Access-Control-Allow-Origin: * — inclusive no 302 que
// redireciona p/ script.googleusercontent.com — então o fetch lê o JSON direto,
// sem o problema do JSONP-via-<script>, que falha nesse redirect).
//   ?action=listar → {candidatos:[{data,empresa,modelo,impacto,referencia}]}
//   ?action=ping   → {ok,serverTime,pendentesRows,execMs,ghToken}  (teste de latência)
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (p.action === 'listar') return _json(_listarData_());
  if (p.action === 'ping')   return _json(_pingData_());
  return _json({ ok: false, error: 'acao desconhecida (use ?action=listar ou ping)' });
}

function _listarData_() {
  var t0 = Date.now();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pend = ss.getSheetByName(TAB_PEND);
  if (!pend) return { candidatos: [] };
  var h = _headers(pend);
  var iD = _col(h, 'data'), iE = _col(h, 'empresa'), iM = _col(h, 'modelo'),
      iImp = _col(h, 'impacto'), iRef = _col(h, 'referencia'), iSt = _col(h, 'status');
  if (iD < 0 || iE < 0 || iM < 0) return { candidatos: [] };
  var last = pend.getLastRow(), out = [];
  if (last >= 2) {
    var rows = pend.getRange(2, 1, last - 1, pend.getLastColumn()).getValues();
    for (var r = 0; r < rows.length; r++) {
      var v = rows[r];
      var st = iSt >= 0 ? String(v[iSt]).trim().toLowerCase() : 'pendente';
      if (st && st !== 'pendente') continue; // só pendentes (igual à PWA)
      var dataV = _fmtDate(v[iD]);
      var empV = String(v[iE] || '').trim();
      var modV = String(v[iM] || '').trim();
      if (!dataV || !empV || !modV) continue; // pula linhas vazias (ex.: checkboxes sem dados)
      out.push({
        data: dataV, empresa: empV, modelo: modV,
        impacto: iImp >= 0 ? String(v[iImp] || '') : '',
        referencia: iRef >= 0 ? String(v[iRef] || '') : ''
      });
    }
  }
  console.log('[listar] linhas=' + out.length + ' exec=' + (Date.now() - t0) + 'ms');
  return { candidatos: out };
}

function _pingData_() {
  var t0 = Date.now();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pend = ss.getSheetByName(TAB_PEND);
  var n = pend ? pend.getLastRow() : -1;
  var ghToken = !!PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
  var execMs = Date.now() - t0;
  console.log('[ping] exec=' + execMs + 'ms pendentesLastRow=' + n + ' ghToken=' + ghToken);
  return { ok: true, serverTime: new Date().getTime(), pendentesRows: n, execMs: execMs, ghToken: ghToken };
}

// ── ingestão: recebe candidatos do GitHub Actions ──
function _handleIngestao_(body) {
  var t0 = Date.now();
  if (!body || body.token !== getSecret_()) return _json({ ok: false, error: 'token invalido' });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pend = ss.getSheetByName(TAB_PEND);
  if (!pend) return _json({ ok: false, error: 'aba "' + TAB_PEND + '" nao existe' });

  _ensureExtraCols_(ss); // colunas grupo/pais: cria na 1ª ingestão que precisar delas

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
      timestamp: new Date(), data_atualizacao: new Date(),
      grupo: r.grupo || '', pais: r.pais || ''
    };
    pend.appendRow(_rowFromObj(headers, obj));
    added.push(r);
  });

  _sendEmail(body, added, skipped);
  SpreadsheetApp.flush();
  console.log('[ingestao] added=' + added.length + ' skipped=' + skipped + ' exec=' + (Date.now() - t0) + 'ms');
  return _json({ ok: true, added: added.length, skipped: skipped });
}

// ── admin: aprovar/rejeitar uma linha pendente (vindo da PWA de curadoria) ──
function _handleAdmin_(body, action) {
  var t0 = Date.now();
  if (!body || body.token !== getSecret_()) return _json({ ok: false, error: 'token invalido' });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pend = ss.getSheetByName(TAB_PEND);
  if (!pend) return _json({ ok: false, error: 'aba "' + TAB_PEND + '" nao existe' });

  var headers = _headers(pend);
  var iData = _col(headers, 'data'), iEmp = _col(headers, 'empresa'),
      iMod = _col(headers, 'modelo'), iStatus = _col(headers, 'status');
  if (iData < 0 || iEmp < 0 || iMod < 0) return _json({ ok: false, error: 'cabecalho invalido' });

  var alvo = [String(body.data).trim(),
              String(body.empresa).trim().toUpperCase(),
              String(body.modelo).trim().toUpperCase()].join('|');

  // idempotência: se um commit anterior já publicou a linha (meio-fez: no Lancamentos
  // mas ainda na fila), só remove de Pendentes — não duplica em Lancamentos.
  // Só Lancamentos aqui: a linha sendo aprovada está em Pendentes por definição,
  // então incluir Pendentes faria jaNoLanc ser sempre true (linha sumia sem publicar).
  var jaNoLanc = !!_existingKeys(ss, [TAB_LANC])[alvo];

  var last = pend.getLastRow();
  if (last >= 2) {
    var all = pend.getRange(2, 1, last - 1, pend.getLastColumn()).getValues(); // lê tudo de uma vez (não linha a linha)
    for (var r = 0; r < all.length; r++) {
      var vals = all[r];
      var st = iStatus >= 0 ? String(vals[iStatus]).trim().toLowerCase() : 'pendente';
      if (st && st !== 'pendente') continue; // só age sobre pendentes
      var dataV = _fmtDate(vals[iData]);
      var empV = String(vals[iEmp] || '').trim();
      var modV = String(vals[iMod] || '').trim();
      if (!dataV || !empV || !modV) continue; // pula linhas vazias (checkboxes sem dados)
      var key = [dataV, empV.toUpperCase(), modV.toUpperCase()].join('|');
      if (key !== alvo) continue;

      var sheetRow = r + 2;
      // nivel=2 (body.nivel === 'secundario') publica com status "secundario":
      // a linha vai para Lancamentos como qualquer outra, mas o site só a desenha
      // no modo "regua ampliada". Sem nivel, continua sendo aprovacao normal.
      var statusAlvo = (body.nivel === 'secundario' || body.nivel === 2) ? 'secundario' : 'publicado';
      if (action === 'aprovar' && !jaNoLanc) _promoverLinha_(ss, pend, headers, sheetRow, statusAlvo);
      pend.deleteRow(sheetRow);
      SpreadsheetApp.flush(); // propaga imediatamente p/ abas abertas e PWA
      console.log('[admin] ' + action + ' ' + alvo + (action === 'aprovar' ? ' status=' + statusAlvo : '') +
                  (jaNoLanc ? ' (ja publicado, so removeu)' : '') +
                  ' commit=' + (Date.now() - t0) + 'ms');
      return _json({ ok: true, action: action, status: statusAlvo, empresa: empV, modelo: modV, jaNoLanc: jaNoLanc });
    }
  }
  return _json({ ok: false, error: 'linha pendente nao encontrada (ja processada?)' });
}

// ── rodar: dispara a workflow do GitHub Actions (pesquisa MANUAL de lançamentos) ──
// Requer Script Property GH_TOKEN (fine-grained PAT com permissão "Actions: write"
// no repo lapig-ufg/app-panorama-global-da-ia-generativa). dry_run=false → grava em
// Pendentes (você curadoria depois); dry_run=true → só mostra no log do Actions.
// O PAT fica no servidor (Script Properties), nunca na PWA.
function _rodarWorkflow_(body) {
  var t0 = Date.now();
  if (!body || body.token !== getSecret_()) return _json({ ok: false, error: 'token invalido' });
  var ghToken = PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
  if (!ghToken) return _json({ ok: false, error: 'GH_TOKEN nao configurado em Script Properties' });
  var repo = 'lapig-ufg/app-panorama-global-da-ia-generativa';
  var dry = (body.dry_run === true || String(body.dry_run).toLowerCase() === 'true') ? 'true' : 'false';
  var url = 'https://api.github.com/repos/' + repo + '/actions/workflows/auto-update.yml/dispatches';
  try {
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/vnd.github+json',
      headers: { Authorization: 'Bearer ' + ghToken, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      payload: JSON.stringify({ ref: 'main', inputs: { dry_run: dry } }),
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    console.log('[rodar] dry_run=' + dry + ' github_http=' + code + ' exec=' + (Date.now() - t0) + 'ms');
    if (code === 204) return _json({ ok: true, dispatched: true, dry_run: dry });
    return _json({ ok: false, error: 'github http ' + code + ': ' + resp.getContentText().slice(0, 300) });
  } catch (err) {
    console.log('[rodar] erro: ' + err + ' exec=' + (Date.now() - t0) + 'ms');
    return _json({ ok: false, error: 'falha UrlFetch: ' + String(err) });
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

  _promoverLinha_(e.source, sh, headers, row);

  // Marca a linha como publicada p/ sair da fila da PWA (sem apagar, deixa rastro na planilha).
  var iStatus = _col(headers, 'status');
  if (iStatus >= 0) sh.getRange(row, iStatus + 1).setValue('publicado');
  sh.getRange(row, aprovarCol).setNote('Aprovado e publicado em ' + new Date());
}

// ── helper compartilhado: copia a linha de Pendentes p/ Lancamentos ──
// status: 'publicado' (marco, aparece sempre) | 'secundario' (nivel 2, so na
// regua ampliada). O gate humano vale igual para os dois: nada chega em
// Lancamentos sem alguem aprovar.
function _promoverLinha_(ss, pend, pendHeaders, rowIndex, status) {
  var lanc = ss.getSheetByName(TAB_LANC);
  if (!lanc) throw new Error('aba "' + TAB_LANC + '" nao existe');
  var lancHeaders = _headers(lanc);
  var vals = pend.getRange(rowIndex, 1, 1, pend.getLastColumn()).getValues()[0];
  var obj = {};
  pendHeaders.forEach(function (h, i) { obj[h] = vals[i]; });
  obj.status = (status === 'secundario') ? 'secundario' : 'publicado';
  obj.data_atualizacao = new Date();
  lanc.appendRow(_rowFromObj(lancHeaders, obj));
}

// ───────────────────────────── helpers ──────────────────────────────────────
// Colunas extras preenchidas pela automação (roteiam empresa desconhecida no site).
// Mapeamento é sempre por NOME de cabeçalho, então a posição não importa —
// só anexa no fim da aba quando faltar.
var EXTRA_COLS = ['grupo', 'pais'];
function _ensureExtraCols_(ss) {
  [TAB_LANC, TAB_PEND].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    EXTRA_COLS.forEach(function (col) {
      if (_col(_headers(sh), col) === -1) {
        sh.getRange(1, sh.getLastColumn() + 1).setValue(col).setFontWeight('bold');
      }
    });
  });
}

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

function _existingKeys(ss, tabs) {
  var keys = {};
  (tabs || [TAB_LANC, TAB_PEND]).forEach(function (name) {
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
    '<p>Abra a <b>PWA de curadoria</b> para aprovar/rejeitar, ou marque a coluna <b>"' +
    COL_APROVAR + '"</b> na aba <b>' + TAB_PEND + '</b>.</p>' +
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
