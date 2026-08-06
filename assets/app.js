/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Aplicação principal
   Carregamento de dados, tooltip, drag-to-pan, exportação PNG
   ═══════════════════════════════════════════════════════════════ */

// gvizFetch mora em data.js: o guia também carrega a planilha, para saber
// quais modelos existem na régua e poder linkar para a pílula certa.

// ─── CACHE LOCAL (sessionStorage) ───
function readCache() {
  try {
    const raw = sessionStorage.getItem(CONFIG.CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !obj.rows) return null;
    if (Date.now() - obj.ts > CONFIG.CACHE_TTL_MS) return null;
    return obj;
  } catch (e) {
    return null;
  }
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ ts: Date.now(), rows }));
  } catch (e) {
    // sessionStorage indisponível ou cheio — ignora
  }
}

// ─── PARSE DE DATAS DA PLANILHA ───
function parseSheetDate(val) {
  if (!val) return '';
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const parts = val.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
    if (parts) {
      const y = parts[1];
      const m = String(parseInt(parts[2]) + 1).padStart(2, '0');
      const d = String(parts[3]).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(val);
}

function parseSheetTimestamp(val) {
  if (!val) return 0;
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const parts = val.match(/Date\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?(?:,\s*(\d+))?(?:,\s*(\d+))?/);
    if (parts) {
      return new Date(+parts[1], +parts[2], +parts[3], +(parts[4] || 0), +(parts[5] || 0), +(parts[6] || 0)).getTime();
    }
  }
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
}

/* ─── ESTADO DE ZOOM ───
   A escala PADRÃO é a automática: a régua inteira cabendo na largura da
   janela. Abrir em 1,5 px/dia ancorado à esquerda mostrava 2022–2024, que é a
   parte mais vazia do acervo — faixas inteiras (IBM, MiniMax, Sakana AI)
   apareciam em branco com um contador ao lado, o que se lê como defeito, e
   metade do desenho ficava fora da tela. Encaixado, a aceleração de 2023 para
   2026 aparece sozinha, sem precisar de texto explicando.

   zoomIsAuto guarda se a escala atual ainda é a calculada ou se o usuário
   assumiu o controle. Enquanto for automática, ela se recalcula quando os
   dados crescem ou a janela muda de tamanho — e NÃO é gravada na sessão, para
   que a próxima visita refaça a conta com a largura daquela tela. Qualquer
   ação de zoom do usuário desliga o automático e passa a ser gravada. */
const ZOOM_CACHE_KEY = 'panorama-llms-zoom-v1';
let currentPxPerDay = CONFIG.PX_PER_DAY;
let zoomIsAuto = true;

function loadZoom() {
  try {
    const raw = sessionStorage.getItem(ZOOM_CACHE_KEY);
    if (raw) {
      const v = parseFloat(raw);
      if (!isNaN(v)) {
        currentPxPerDay = clampZoom(v);
        zoomIsAuto = false;
      }
    }
  } catch (e) { /* sessionStorage indisponível */ }
}

function saveZoom() {
  try {
    if (zoomIsAuto) sessionStorage.removeItem(ZOOM_CACHE_KEY);
    else sessionStorage.setItem(ZOOM_CACHE_KEY, String(currentPxPerDay));
  } catch (e) { /* ignora */ }
}

function clampZoom(v) {
  return Math.min(CONFIG.MAX_PX_PER_DAY, Math.max(CONFIG.MIN_PX_PER_DAY, Math.round(v * 100) / 100));
}

function getZoomLabel() {
  return `${currentPxPerDay.toFixed(1)} px/dia`;
}

/* ─── AS DUAS FONTES DA RÉGUA ───
   SHEET_ROWS  planilha: nível 1 (status `publicado`) e nível 2 (`secundario`)
   CATALOGO_ROWS  assets/catalogo.json: nível 3 (censo da Artificial Analysis),
                  já sem o que a planilha cobre (ver deduplicarCatalogo)
   RAW continua sendo "o que está desenhado agora" — o resto do código (tooltip,
   novidades, exportações) não precisa saber que existem duas fontes. */
let SHEET_ROWS = [];
let CATALOGO_ROWS = [];
let catalogoEstado = 'ausente';   // 'ausente' | 'carregando' | 'ok' | 'erro'

// Linhas visíveis no modo atual. A régua padrão mostra exatamente o que sempre
// mostrou — só os marcos —, então ligar o modo ampliado nunca "some" com nada.
function rowsDoModo() {
  return MODO === 'ampliada'
    ? SHEET_ROWS.concat(CATALOGO_ROWS)
    : SHEET_ROWS.filter(r => r.nivel === 1);
}

// ─── PIPELINE DE PROCESSAMENTO DAS LINHAS ───
function processRows(allRows) {
  // Dedup por data|empresa|modelo
  const seen = new Set();
  RAW = allRows.filter(r => {
    const key = `${r.date}|${r.emp}|${r.mod}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // As trilhas do modo ampliado dependem das linhas (empresa com >= 3 modelos
  // ganha faixa própria), então são remontadas a cada carga.
  ACTIVE_GROUPS = MODO === 'ampliada' ? buildExpandedGroups(RAW) : LAYOUT_GROUPS;

  RAW.forEach(r => {
    const parts = r.date.split('-');
    const eventUTC = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    r.dias = Math.round((eventUTC - CONFIG.MARCO.getTime()) / 86400000);
  });

  if (RAW.length) {
    GLOBAL_MAX_DIAS = Math.max(...RAW.map(r => r.dias)) + 60;

    // Atualiza data da última atualização
    const maxUpdateMs = Math.max(...RAW.map(r => r.updatedAt || 0));
    let finalUpdateDate = new Date();
    if (maxUpdateMs > 0 && maxUpdateMs > 946684800000) {
      finalUpdateDate = new Date(maxUpdateMs);
    }
    const dateEl = document.getElementById('last-update-date');
    if (dateEl) {
      // A data vem de um Date local, então o ISO é montado com os getters
      // locais antes de passar pelo formatador único (fmtDataBR, em data.js).
      const iso = `${finalUpdateDate.getFullYear()}-` +
        `${String(finalUpdateDate.getMonth() + 1).padStart(2, '0')}-` +
        `${String(finalUpdateDate.getDate()).padStart(2, '0')}`;
      dateEl.innerText = fmtDataBR(iso);
    }
  }

  // Popula as tracks com os eventos filtrados
  ACTIVE_GROUPS.forEach(g => {
    g.tracks.forEach(t => {
      t.events = RAW.filter(t.filter).sort((a, b) => a.dias - b.dias);
    });
  });

  updateNovidades();

  /* Só agora GLOBAL_MAX_DIAS existe, então é aqui que a escala automática é
     resolvida — antes do desenho, para não redesenhar duas vezes. Se o usuário
     já mexeu no zoom, zoomIsAuto é falso e nada disto acontece. */
  const encaixe = zoomIsAuto ? escalaDeEncaixe() : null;
  if (encaixe !== null) currentPxPerDay = encaixe;

  rebuildV2(undefined, currentPxPerDay);
  updateZoomUI();
  atualizarBotaoModo();

  if (encaixe !== null) {
    const area = document.getElementById('timeline-area');
    if (area) area.scrollLeft = 0;
  }
  refreshScrollAffordance();

  // A régua já está no DOM: se viemos do guia, salta para a empresa pedida.
  setTimeout(focusCompanyFromHash, 120);
}

// ─── DEEP-LINK VINDO DO GUIA ───
// O guia linka "index.html#emp=OpenAI&mod=GPT-5.6 Sol" quando o modelo existe
// na régua, ou só "#emp=OpenAI" quando não existe (aí abre o lançamento mais
// recente da empresa). Reusa o focusPill das Novidades, que rola a régua até a
// pílula e abre o tooltip. O nome da empresa já chega canônico via data.js.
function focusCompanyFromHash() {
  const hash = location.hash || '';
  const readParam = re => {
    const m = hash.match(re);
    if (!m) return '';
    try { return decodeURIComponent(m[1]).trim(); } catch (e) { return ''; }
  };
  const emp = readParam(/[#&]emp=([^&]+)/);
  const mod = readParam(/[#&]mod=([^&]+)/);
  if (!emp && !mod) return;

  let hits = RAW;
  if (emp) hits = hits.filter(r => (r.emp || '').trim().toUpperCase() === emp.toUpperCase());
  // Com modelo: exige nome idêntico (normalizado). Nunca aproxima — mandar para
  // o modelo errado é pior do que só posicionar na empresa.
  if (mod) {
    const exact = hits.filter(r => normModel(r.mod) === normModel(mod));
    if (exact.length) hits = exact;
  }
  if (!hits.length) return;
  const latest = hits.reduce((a, b) => (b.dias > a.dias ? b : a));
  focusPill(latest);
}

// ─── NOVIDADES (últimos modelos adicionados à régua) ───
const NOVIDADES_MAX = 3;
const NOVIDADES_DOT_DAYS = 14; // idade máxima (dias) p/ marcar "novo" na pílula e no botão
let NOVIDADES = [];

function updateNovidades() {
  // "Adicionado" = data de atualização da planilha (quando aprovação/automação tocou na linha)
  NOVIDADES = RAW.filter(r => r.updatedAt > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, NOVIDADES_MAX);
  const cutoff = Date.now() - NOVIDADES_DOT_DAYS * 86400000;
  RAW.forEach(r => { r.isNew = false; });
  NOVIDADES.forEach(r => { r.isNew = r.updatedAt >= cutoff; });
  renderNovidades();
}

function renderNovidades() {
  const btn = document.getElementById('novidades-btn');
  const list = document.getElementById('novidades-list');
  if (!btn || !list) return;
  if (!NOVIDADES.length) { btn.hidden = true; return; }
  btn.hidden = false;

  const dot = btn.querySelector('.novidades-dot');
  if (dot) dot.hidden = !NOVIDADES.some(r => r.isNew);

  list.innerHTML = NOVIDADES.map((r, i) => {
    const color = COMPANY_COLORS[r.emp] || '#999';
    const fonte = r.ref && /^https?:\/\//.test(r.ref)
      ? `<a class="nv-fonte" href="${escapeXml(r.ref)}" target="_blank" rel="noopener">fonte ↗</a>`
      : '';
    return `<li>
      <button type="button" class="nv-item" data-nv="${i}" title="Localizar na régua">
        <span class="nv-swatch" style="background:${color}" aria-hidden="true"></span>
        <span class="nv-body">
          <span class="nv-model">${escapeXml(r.mod)}</span>
          <span class="nv-meta">${escapeXml(r.emp)} · ${fmtFull(r.date)}</span>
          ${r.impact ? `<span class="nv-impact">${escapeXml(r.impact)}</span>` : ''}
        </span>
      </button>
      ${fonte}
    </li>`;
  }).join('');

  list.querySelectorAll('.nv-item').forEach(b => {
    b.addEventListener('click', () => focusPill(NOVIDADES[+b.dataset.nv]));
  });
}

// Rola a timeline até a pílula do evento, dá um flash nela e abre o tooltip
function focusPill(ev) {
  toggleNovidades(false);
  const slider = document.getElementById('timeline-area');
  if (!slider) return;

  let pillId = null;
  for (const id in window.tooltipData) {
    const d = window.tooltipData[id];
    if (d.date === ev.date && d.emp === ev.emp && d.mod === ev.mod) { pillId = id; break; }
  }
  if (!pillId) return;
  const el = document.querySelector(`[data-pill-id="${pillId}"]`);
  if (!el) return;

  const x = CONFIG.PAD_L + Math.round(ev.dias * currentPxPerDay);
  slider.scrollTo({ left: Math.max(0, x - slider.clientWidth / 2), behavior: 'smooth' });

  setTimeout(() => {
    // Ajusta o scroll vertical se a pílula estiver fora da janela visível
    const areaRect = slider.getBoundingClientRect();
    let rect = el.getBoundingClientRect();
    if (rect.top < areaRect.top + 8 || rect.bottom > areaRect.bottom - 8) {
      slider.scrollTop += rect.top - areaRect.top - slider.clientHeight / 2 + rect.height / 2;
      rect = el.getBoundingClientRect();
    }
    showTip({ clientX: rect.left + rect.width / 2, clientY: rect.top }, pillId);
    el.classList.add('pill-flash');
    setTimeout(() => el.classList.remove('pill-flash'), 1800);
  }, 450);
}

function toggleNovidades(show) {
  const btn = document.getElementById('novidades-btn');
  const popover = document.getElementById('novidades-popover');
  if (!popover) return;
  popover.hidden = !show;
  if (btn) btn.setAttribute('aria-expanded', String(show));
}

function initNovidadesPopover() {
  const btn = document.getElementById('novidades-btn');
  const popover = document.getElementById('novidades-popover');
  const close = document.getElementById('novidades-close');
  if (!btn || !popover) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleNovidades(popover.hidden);
  });
  if (close) close.addEventListener('click', () => toggleNovidades(false));

  document.addEventListener('click', e => {
    if (!popover.hidden && !popover.contains(e.target) && !btn.contains(e.target)) {
      toggleNovidades(false);
    }
  });
  document.addEventListener('keydown', e => {
    if (!popover.hidden && e.key === 'Escape') toggleNovidades(false);
  });
}

/* ═══════════════════════════════════════════════════════════════
   TROCA DE MODO (régua padrão ↔ régua ampliada)
   ═══════════════════════════════════════════════════════════════ */

function modoSalvo() {
  try {
    if (/[#&]modo=ampliada/.test(location.hash || '')) return 'ampliada';
    return sessionStorage.getItem(CONFIG.MODO_KEY) === 'ampliada' ? 'ampliada' : 'padrao';
  } catch (e) {
    return 'padrao';
  }
}

function salvarModo(modo) {
  try { sessionStorage.setItem(CONFIG.MODO_KEY, modo); } catch (e) { /* ignora */ }
}

async function setModo(modo, opts = {}) {
  if (modo === MODO && !opts.forcar) return;
  const btn = document.getElementById('modo-btn');

  if (modo === 'ampliada' && catalogoEstado !== 'ok') {
    if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
    showLoading();
    const ok = await carregarCatalogo();
    if (btn) { btn.classList.remove('is-loading'); btn.disabled = false; }
    hideLoading();
    if (!ok) {
      // Sem catálogo, a ampliada ainda tem o nível 2 (planilha) para mostrar —
      // mas o usuário precisa saber que o censo automático não entrou.
      mostrarAvisoModo('Não foi possível carregar o catálogo da Artificial Analysis. ' +
        'A régua ampliada está mostrando só os lançamentos curados.');
    }
  }

  MODO = modo;
  salvarModo(modo);
  atualizarBotaoModo();
  processRows(rowsDoModo());

  // Voltar para a padrão com a régua rolada lá embaixo deixaria o usuário
  // olhando para o vazio: a ampliada é muito mais alta.
  const area = document.getElementById('timeline-area');
  if (area && modo === 'padrao') area.scrollTop = 0;

  if (window.gtag) gtag('event', 'troca_modo_regua', { modo });
}

function atualizarBotaoModo() {
  const btn = document.getElementById('modo-btn');
  if (!btn) return;
  const on = MODO === 'ampliada';
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', String(on));
  const cont = document.getElementById('modo-count');
  if (cont) {
    cont.textContent = on ? String(RAW.length) : '';
    cont.hidden = !on;
  }
}

function mostrarAvisoModo(msg) {
  const el = document.getElementById('modo-aviso');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 8000);
}

function toggleModoPopover(show) {
  const pop = document.getElementById('modo-popover');
  const btn = document.getElementById('modo-info');
  if (!pop) return;
  pop.hidden = !show;
  if (btn) btn.setAttribute('aria-expanded', String(show));
  if (show) preencherModoPopover();
}

// A explicação cita números reais (quantos modelos, de quando é o catálogo) em
// vez de só prometer "mais modelos" — é o que deixa o leitor calibrar confiança.
function preencherModoPopover() {
  const el = document.getElementById('modo-fonte');
  if (!el) return;
  if (catalogoEstado === 'ok') {
    const data = CATALOGO_META.fetched_at ? fmtFull(CATALOGO_META.fetched_at.slice(0, 10)) : '—';
    el.textContent = `Catálogo carregado: ${CATALOGO_META.total} modelos, coletados em ${data}.`;
  } else {
    el.textContent = 'O catálogo é baixado quando você liga o modo pela primeira vez.';
  }
}

function initModoControls() {
  const btn = document.getElementById('modo-btn');
  const info = document.getElementById('modo-info');
  const close = document.getElementById('modo-close');
  const pop = document.getElementById('modo-popover');

  if (btn) {
    btn.addEventListener('click', () => {
      const indo = MODO === 'padrao' ? 'ampliada' : 'padrao';
      setModo(indo);
      // Primeira vez que liga: abre a explicação sozinha. Um botão que muda a
      // régua inteira sem dizer o que mudou é uma armadilha.
      if (indo === 'ampliada') {
        try {
          if (!localStorage.getItem('panorama-llms-modo-explicado')) {
            localStorage.setItem('panorama-llms-modo-explicado', '1');
            toggleModoPopover(true);
          }
        } catch (e) { /* localStorage indisponível */ }
      }
    });
  }

  if (info) {
    info.addEventListener('click', e => {
      e.stopPropagation();
      toggleModoPopover(pop && pop.hidden);
    });
  }
  if (close) close.addEventListener('click', () => toggleModoPopover(false));

  document.addEventListener('click', e => {
    if (pop && !pop.hidden && !pop.contains(e.target) && e.target !== info) toggleModoPopover(false);
  });
  document.addEventListener('keydown', e => {
    if (pop && !pop.hidden && e.key === 'Escape') toggleModoPopover(false);
  });

  atualizarBotaoModo();
}

// ─── ESTADOS DE ERRO E LOADING ───
function showError(message) {
  hideLoading();
  const wrap = document.getElementById('svg-wrap');
  wrap.innerHTML = `
    <div class="error-state">
      <h2>Não foi possível carregar os dados</h2>
      <p>${escapeXml(message)}</p>
      <button onclick="loadSheetData()">Tentar novamente</button>
    </div>
  `;
}

function showLoading() {
  const loader = document.getElementById('timeline-loading');
  if (loader) loader.classList.add('visible');
}

function hideLoading() {
  const loader = document.getElementById('timeline-loading');
  if (loader) loader.classList.remove('visible');
}

// ─── CARREGAMENTO PRINCIPAL ───
async function loadSheetData() {
  showLoading();

  // Tenta usar cache primeiro (instantâneo)
  const cached = readCache();
  if (cached) {
    SHEET_ROWS = cached.rows;
    processRows(rowsDoModo());
    hideLoading();
    // Mas continua atualizando em background
    fetchFresh(true).catch(() => { /* silencioso, já temos cache */ });
    return;
  }

  try {
    await fetchFresh(false);
    hideLoading();
  } catch (e) {
    console.error('Falha ao carregar planilha:', e);
    hideLoading();
    showError('Verifique sua conexão e se a planilha está pública. Erro: ' + (e.message || 'desconhecido'));
  }
}

// Normaliza nome de cabeçalho ("data_atualizacao" → "dataatualizacao")
function normHeader(s) {
  return String(s == null ? '' : s).trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function fetchFresh(silent) {
  const allRows = [];
  for (const tab of CONFIG.SHEET_TABS) {
    const data = await gvizFetch(tab);
    if (!data || !data.table || !data.table.rows) continue;

    // A 1ª linha vem como dado (é o cabeçalho da planilha): usa p/ localizar
    // colunas novas por nome, com fallback nas posições históricas.
    const headerCells = (data.table.rows[0] && data.table.rows[0].c) || [];
    const colIdx = {};
    headerCells.forEach((cell, i) => {
      const n = normHeader(cell && cell.v);
      if (n && colIdx[n] === undefined) colIdx[n] = i;
    });
    const iGrupo = colIdx.grupo !== undefined ? colIdx.grupo : -1;
    const iTimestamp = colIdx.timestamp !== undefined ? colIdx.timestamp : 9;
    const iUpdated = colIdx.dataatualizacao !== undefined ? colIdx.dataatualizacao : 10;

    const rows = data.table.rows.slice(1); // pula header

    for (const row of rows) {
      const c = row.c;
      if (!c || !c[0] || !c[1] || !c[2]) continue;

      const emp = c[1] ? String(c[1].v || '') : '';
      const mod = c[2] ? String(c[2].v || '') : '';
      const impact = c[3] ? String(c[3].v || '') : '';
      const ref = c[4] ? String(c[4].v || '') : '';
      const status = c[5] ? String(c[5].v || '').toLowerCase() : '';

      /* Dois status entram na régua, com pesos diferentes:
           publicado  → nível 1, marco, aparece nos dois modos
           secundario → nível 2, curado mas não é marco, só na régua ampliada
         Qualquer outro (pendente, rejeitado, vazio) continua fora. O gate
         humano não muda: `secundario` também só existe depois de alguém
         aprovar na PWA. */
      const nivel = status === 'publicado' ? 1 : status === 'secundario' ? 2 : 0;
      if (!nivel) continue;
      if (!emp || !mod) continue;

      const date = parseSheetDate(c[0].v);
      if (!date) continue;

      const grupo = iGrupo >= 0 && c[iGrupo] ? String(c[iGrupo].v || '') : '';
      const addedAt = c[iTimestamp] && c[iTimestamp].v ? parseSheetTimestamp(c[iTimestamp].v) : 0;
      const updatedAt = c[iUpdated] && c[iUpdated].v ? parseSheetTimestamp(c[iUpdated].v) : 0;

      allRows.push({ date, emp, mod, impact, ref, grupo, addedAt, updatedAt, nivel });
    }
  }

  writeCache(allRows);
  SHEET_ROWS = allRows;
  // O catálogo já em memória foi deduplicado contra a planilha ANTERIOR; com
  // linhas novas, um modelo pode ter passado a existir dos dois lados.
  if (catalogoEstado === 'ok') CATALOGO_ROWS = deduplicarCatalogo(CATALOGO_BRUTO);
  processRows(rowsDoModo());
}

/* ═══════════════════════════════════════════════════════════════
   NÍVEL 3 — o catálogo da Artificial Analysis
   ═══════════════════════════════════════════════════════════════ */

let CATALOGO_BRUTO = [];   // como veio do arquivo, antes do dedup

/* Um mesmo modelo pode ter nome diferente na planilha e na AA — MODEL_ALIASES
   (aplicado dentro de normModel) resolve os casos conhecidos.

   Esta função cuida do resto: nome de linha que cita mais de um modelo. A
   convenção da planilha é UMA linha por modelo, mas nada impede alguém de
   escrever "X / Y" de novo, e aí a pílula compacta do catálogo apareceria ao
   lado do marco que já representa o mesmo lançamento. Quebrar por "/", "+" e
   parênteses é a rede de segurança para isso. */
/* normModel() apaga toda pontuação, e para o resto do sistema isso é o certo
   ("GPT-4" e "GPT 4" são o mesmo modelo). Aqui não: "Command-R+" e "Command-R"
   são modelos DIFERENTES da Cohere, e achatar os dois na mesma chave faria um
   sumir do censo sem deixar rastro — exatamente o erro que a régua ampliada
   existe para não cometer. Por isso o "+" vira palavra antes de normalizar.
   Nenhuma chave de MODEL_ALIASES tem "+", então os apelidos continuam valendo. */
function chaveModelo(nome) {
  return normModel(String(nome == null ? '' : nome).replace(/\+/g, ' plus '));
}

function partesDoNome(mod) {
  const bruto = String(mod == null ? '' : mod).trim();
  if (!bruto) return [];
  const candidatos = new Set([bruto]);
  const semParenteses = bruto.replace(/\([^)]*\)/g, ' ').trim();
  if (semParenteses) candidatos.add(semParenteses);
  (bruto.match(/\(([^)]*)\)/g) || []).forEach(p => candidatos.add(p.slice(1, -1)));

  const partes = new Set();
  candidatos.forEach(c => {
    partes.add(c.trim());
    // "+" só separa quando está cercado de espaço ("Large 3 + Ministral 3");
    // colado, faz parte do nome ("Command-R+") e não pode ser ponto de corte.
    c.split(/\s*\/\s*|\s+\+\s+/).forEach(x => {
      const t = x.trim();
      if (t) partes.add(t);
    });
  });

  return [...partes].filter(Boolean);
}

// Chaves "EMPRESA|modelo" de tudo que a curadoria já cobre (níveis 1 e 2).
function chavesCuradas(rows) {
  const set = new Set();
  rows.forEach(r => {
    const emp = canonicalCompany(r.emp).toUpperCase();
    partesDoNome(r.mod).forEach(p => set.add(`${emp}|${chaveModelo(p)}`));
  });
  return set;
}

function deduplicarCatalogo(modelos) {
  const curadas = chavesCuradas(SHEET_ROWS);
  const marcoMs = CONFIG.MARCO.getTime();
  const vistos = new Set();

  return modelos.filter(m => {
    const emp = canonicalCompany(m.emp).toUpperCase();
    const chave = `${emp}|${chaveModelo(m.mod)}`;
    if (curadas.has(chave) || vistos.has(chave)) return false;
    vistos.add(chave);
    // Nada antes do marco zero: a régua começa em 30/nov/2022 e uma pílula com
    // "dias" negativo seria desenhada por cima da calha de rótulos.
    return new Date(m.date + 'T00:00:00').getTime() >= marcoMs;
  });
}

// Baixa o catálogo uma única vez, sob demanda. A régua padrão nunca paga por
// isto: quem não liga o modo ampliado não baixa o arquivo.
async function carregarCatalogo() {
  if (catalogoEstado === 'ok' || catalogoEstado === 'carregando') return catalogoEstado === 'ok';
  catalogoEstado = 'carregando';
  try {
    const res = await fetch(CONFIG.CATALOGO_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const lista = Array.isArray(json.modelos) ? json.modelos : [];
    if (!lista.length) throw new Error('catálogo vazio');

    CATALOGO_BRUTO = lista
      .filter(m => m && m.mod && m.emp && /^\d{4}-\d{2}-\d{2}$/.test(String(m.date || '')))
      .map(m => ({
        date: String(m.date),
        emp: canonicalCompany(m.emp),
        mod: String(m.mod),
        impact: '',
        ref: json.source_url || '',
        grupo: '',
        addedAt: 0,
        updatedAt: 0,
        nivel: 3,
        score: typeof m.score === 'number' ? m.score : null
      }));
    CATALOGO_ROWS = deduplicarCatalogo(CATALOGO_BRUTO);
    CATALOGO_META = { fetched_at: json.fetched_at || '', total: CATALOGO_BRUTO.length };
    catalogoEstado = 'ok';
    return true;
  } catch (e) {
    console.error('Falha ao carregar o catálogo da régua ampliada:', e);
    catalogoEstado = 'erro';
    return false;
  }
}

let CATALOGO_META = { fetched_at: '', total: 0 };

// ─── TOOLTIP ───
let hideTipTimeout;
let activeTooltipId = null;

function getTooltip() {
  return document.getElementById('tooltip');
}

function showTip(e, id) {
  clearTimeout(hideTipTimeout);
  const ev = window.tooltipData[id];
  if (!ev) return;

  activeTooltipId = id;
  const tooltip = getTooltip();

  document.getElementById('tt-date').textContent = fmtFull(ev.date);
  document.getElementById('tt-day').textContent = '+ Dia ' + ev.dias;
  document.getElementById('tt-model').textContent = ev.mod;
  document.getElementById('tt-model').style.color = ev.color;
  document.getElementById('tt-company').textContent = ev.emp;
  document.getElementById('tt-impact').textContent = ev.impact || '—';

  /* Proveniência: quem lê a régua ampliada precisa saber, pílula a pílula, se
     aquilo passou por curadoria humana ou veio do censo automático. Sem isso a
     ampliada empresta a credibilidade da curadoria a dados que não a têm. */
  const fonteEl = document.getElementById('tt-fonte');
  if (fonteEl) {
    if (ev.nivel === 3) {
      const nota = ev.score != null ? ` · Intelligence Index ${ev.score}` : '';
      fonteEl.textContent = `Catálogo Artificial Analysis — sem curadoria editorial${nota}`;
      fonteEl.hidden = false;
    } else if (ev.nivel === 2) {
      fonteEl.textContent = 'Lançamento curado, classificado como secundário';
      fonteEl.hidden = false;
    } else {
      fonteEl.hidden = true;
    }
  }

  // Mede posição da pílula alvo para posicionar a seta
  const target = e.target && e.target.closest ? e.target.closest('.pill-group') : null;
  const targetRect = target ? target.getBoundingClientRect() : null;

  tooltip.classList.add('visible');

  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    const margin = 16;
    const arrow = tooltip.querySelector('.tooltip-arrow');

    let anchorX = e.clientX;
    let anchorY = targetRect ? targetRect.top : e.clientY;

    // Default: tooltip abaixo do alvo, centralizado horizontalmente
    let left = anchorX - rect.width / 2;
    let top = anchorY + (targetRect ? targetRect.height : 0) + 14;

    // Não vaza pela direita
    if (left + rect.width > window.innerWidth - margin) {
      left = window.innerWidth - rect.width - margin;
    }
    // Não vaza pela esquerda
    if (left < margin) left = margin;

    // Se não couber abaixo, coloca acima
    let placeAbove = false;
    if (top + rect.height > window.innerHeight - margin) {
      placeAbove = true;
      top = (targetRect ? targetRect.top : e.clientY) - rect.height - 14;
    }
    if (top < margin) top = margin;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    if (arrow) {
      arrow.classList.toggle('above', placeAbove);
      const arrowOffset = Math.max(10, Math.min(rect.width - 10, anchorX - left));
      arrow.style.left = arrowOffset + 'px';
    }
  });
}

function hideTip(immediate) {
  if (immediate) {
    clearTimeout(hideTipTimeout);
    getTooltip().classList.remove('visible');
    activeTooltipId = null;
    return;
  }
  hideTipTimeout = setTimeout(() => {
    getTooltip().classList.remove('visible');
    activeTooltipId = null;
  }, 300);
}

// ─── HANDLERS DAS PÍLULAS ───
function attachPillHandlers() {
  const pills = document.querySelectorAll('.pill-group');
  pills.forEach(pill => {
    const id = pill.getAttribute('data-pill-id');

    pill.addEventListener('mouseenter', e => {
      if (!isDragging && !justDragged) showTip(e, id);
    });
    pill.addEventListener('mouseleave', () => hideTip(false));

    pill.addEventListener('click', e => {
      if (justDragged) return; // ignora click após drag
      e.stopPropagation();
      showTip(e, id);
      // Google Analytics: registra qual modelo foi clicado
      if (window.gtag) {
        const ev = window.tooltipData && window.tooltipData[id];
        gtag('event', 'clique_modelo', {
          modelo: ev ? ev.mod : id,
          empresa: ev ? ev.emp : undefined
        });
      }
    });

    pill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rect = pill.getBoundingClientRect();
        showTip({ clientX: rect.left + rect.width / 2, clientY: rect.top }, id);
      } else if (e.key === 'Escape') {
        hideTip(true);
      }
    });
  });
}

// Fechar tooltip clicando fora
document.addEventListener('click', e => {
  if (!activeTooltipId) return;
  const tooltip = getTooltip();
  if (tooltip.contains(e.target)) return;
  if (e.target.closest('.pill-group')) return;
  hideTip(true);
});

// ESC fecha tooltip
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && activeTooltipId) {
    hideTip(true);
  }
});

// Botão X do tooltip (mobile)
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('tt-close');
  if (closeBtn) closeBtn.addEventListener('click', () => hideTip(true));
  initHelpPopover();
  initNovidadesPopover();
});

// ─── DRAG-TO-PAN (com threshold para não atrapalhar clicks) ───
let isDragging = false;
let justDragged = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartScroll = 0;
const DRAG_THRESHOLD = 5;

function initDragPan() {
  const slider = document.getElementById('timeline-area');
  if (!slider) return;

  slider.addEventListener('mousedown', e => {
    // Não inicia drag se foi clique numa pílula, link ou controle de zoom
    if (e.target.closest('.pill-group') || e.target.closest('a') || e.target.closest('.zoom-control')) return;
    isDragging = false;
    justDragged = false;
    dragStartX = e.pageX;
    dragStartY = e.pageY;
    dragStartScroll = slider.scrollLeft;
    slider._mouseDown = true;
  });

  slider.addEventListener('mousemove', e => {
    if (!slider._mouseDown) return;
    const dx = e.pageX - dragStartX;
    const dy = e.pageY - dragStartY;
    if (!isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      isDragging = true;
      slider.classList.add('is-dragging');
    }
    if (isDragging) {
      e.preventDefault();
      slider.scrollLeft = dragStartScroll - dx;
    }
  });

  function endDrag() {
    if (slider._mouseDown && isDragging) {
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 50);
    }
    slider._mouseDown = false;
    isDragging = false;
    slider.classList.remove('is-dragging');
  }

  slider.addEventListener('mouseup', endDrag);
  slider.addEventListener('mouseleave', endDrag);
}

// ─── ZOOM E AJUSTE À TELA ───
function updateZoomUI() {
  const label = document.getElementById('zoom-label');
  const slider = document.getElementById('zoom-slider');
  const fit = document.getElementById('zoom-fit');
  if (label) label.textContent = getZoomLabel();
  if (slider) slider.value = currentPxPerDay;
  // "Tela" é estado, não só ação: marcado enquanto a escala for a automática.
  if (fit) {
    fit.classList.toggle('is-on', zoomIsAuto);
    fit.setAttribute('aria-pressed', String(zoomIsAuto));
  }
}

function setZoom(v, opts = {}) {
  const next = clampZoom(v);
  const mesmaEscala = next === currentPxPerDay;

  zoomIsAuto = !!opts.auto;
  currentPxPerDay = next;
  saveZoom();
  updateZoomUI();
  if (mesmaEscala) return;

  // Memoriza a posição proporcional do scroll para tentar manter o ponto de vista
  const slider = document.getElementById('timeline-area');
  let relativeScroll = 0;
  if (slider && slider.scrollWidth > slider.clientWidth) {
    relativeScroll = slider.scrollLeft / (slider.scrollWidth - slider.clientWidth);
  }

  rebuildV2(undefined, currentPxPerDay);

  // Restaura a posição proporcional após o novo SVG ser renderizado
  if (slider && !opts.skipScroll) {
    requestAnimationFrame(() => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (maxScroll > 0) {
        slider.scrollLeft = relativeScroll * maxScroll;
      }
      refreshScrollAffordance();
    });
  }
}

function zoomIn() {
  setZoom(currentPxPerDay + CONFIG.ZOOM_STEP);
}

function zoomOut() {
  setZoom(currentPxPerDay - CONFIG.ZOOM_STEP);
}

/* Escala em que a régua inteira cabe na largura visível. Devolve só o número:
   quem chama decide se redesenha agora (fitToScreen) ou se aproveita o
   redesenho que já vai acontecer de qualquer jeito (processRows). */
function escalaDeEncaixe() {
  const slider = document.getElementById('timeline-area');
  if (!slider || !GLOBAL_MAX_DIAS) return null;
  const padding = CONFIG.PAD_L + CONFIG.PAD_R + 40;
  /* O piso de 240px (era 400) só importa em tela estreita: ali a conta dá uma
     escala menor que MIN_PX_PER_DAY e o clamp assume. Sem isso, o cálculo
     fingia ter 400px de espaço que não existiam e a régua saía mais larga do
     que o necessário justamente onde cada pixel conta. */
  const available = Math.max(240, slider.clientWidth - padding);
  return clampZoom(available / GLOBAL_MAX_DIAS);
}

function fitToScreen() {
  const slider = document.getElementById('timeline-area');
  const alvo = escalaDeEncaixe();
  if (!slider || alvo === null) return;
  setZoom(alvo, { skipScroll: true, auto: true });
  requestAnimationFrame(() => {
    slider.scrollLeft = 0;
    refreshScrollAffordance();
  });
}

function initZoomControls() {
  const btnIn = document.getElementById('zoom-in');
  const btnOut = document.getElementById('zoom-out');
  const btnFit = document.getElementById('zoom-fit');
  const slider = document.getElementById('zoom-slider');

  if (btnIn) btnIn.addEventListener('click', zoomIn);
  if (btnOut) btnOut.addEventListener('click', zoomOut);
  if (btnFit) btnFit.addEventListener('click', fitToScreen);
  if (slider) {
    slider.min = CONFIG.MIN_PX_PER_DAY;
    slider.max = CONFIG.MAX_PX_PER_DAY;
    slider.step = CONFIG.ZOOM_STEP;
    slider.value = currentPxPerDay;
    let debounce;
    slider.addEventListener('input', e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => setZoom(parseFloat(e.target.value)), 40);
    });
  }

  // Ctrl/Cmd + scroll para zoom (desktop)
  window.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -CONFIG.ZOOM_STEP : CONFIG.ZOOM_STEP;
    setZoom(currentPxPerDay + delta);
  }, { passive: false });

  // Atalhos de teclado: +/- e 0
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      zoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      fitToScreen();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   AFFORDANCE DE ROLAGEM
   ═══════════════════════════════════════════════════════════════
   O painel de ajuda ensinava "arraste horizontalmente ou use a barra de
   rolagem". Affordance que precisa de manual não é affordance. Aqui ela passa
   a ser visível: a borda esfumaça onde há conteúdo cortado, aparecem setas
   clicáveis (e focalizáveis pelo teclado) e uma etiqueta diz QUAL trecho de
   tempo está na tela — numa linha do tempo, "onde estou" é uma data, não uma
   porcentagem de barra de rolagem.
   ═══════════════════════════════════════════════════════════════ */

// Data correspondente a uma coordenada x do SVG (inverso de xOf, em render.js)
function dataNoX(x) {
  const dias = (x - CONFIG.PAD_L) / currentPxPerDay;
  const ms = CONFIG.MARCO.getTime() + dias * 86400000;
  return new Date(ms);
}

function rotuloMesAno(d) {
  return `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

let affordanceRaf = 0;

function refreshScrollAffordance() {
  const shell = document.getElementById('timeline-shell');
  const area = document.getElementById('timeline-area');
  if (!shell || !area) return;

  const maxX = area.scrollWidth - area.clientWidth;
  const x = area.scrollLeft;
  const temEsquerda = x > 4;
  const temDireita = x < maxX - 4;

  shell.classList.toggle('can-left', temEsquerda);
  shell.classList.toggle('can-right', temDireita);

  const pos = document.getElementById('tl-pos');
  if (pos) {
    if (maxX > 4 && GLOBAL_MAX_DIAS) {
      const fim = CONFIG.MARCO.getTime() + GLOBAL_MAX_DIAS * 86400000;
      const de = new Date(Math.max(CONFIG.MARCO.getTime(), dataNoX(x).getTime()));
      const ate = new Date(Math.min(fim, dataNoX(x + area.clientWidth).getTime()));
      pos.textContent = `${rotuloMesAno(de)} — ${rotuloMesAno(ate)}`;
    } else {
      pos.textContent = '';
    }
  }

  // Sombra na régua fixa só depois que ela realmente descola do topo
  const ruler = document.getElementById('tl-ruler');
  if (ruler) ruler.classList.toggle('is-stuck', area.scrollTop > 2);
}
window.refreshScrollAffordance = refreshScrollAffordance;

function agendarAffordance() {
  if (affordanceRaf) return;
  affordanceRaf = requestAnimationFrame(() => {
    affordanceRaf = 0;
    refreshScrollAffordance();
  });
}

function initScrollAffordance() {
  const shell = document.getElementById('timeline-shell');
  const area = document.getElementById('timeline-area');
  if (!shell || !area) return;

  area.addEventListener('scroll', agendarAffordance, { passive: true });

  shell.querySelectorAll('.tl-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir === 'left' ? -1 : 1;
      area.scrollBy({ left: dir * Math.round(area.clientWidth * 0.82), behavior: 'smooth' });
    });
  });

  // Setas do teclado: navegação sem mouse e sem barra de rolagem.
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches && e.target.matches('input, textarea, select')) return;
    const passo = Math.round(area.clientWidth * 0.82);
    if (e.key === 'ArrowRight') {
      area.scrollBy({ left: passo, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      area.scrollBy({ left: -passo, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      area.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      area.scrollTo({ left: area.scrollWidth, behavior: 'smooth' });
    } else {
      return;
    }
    e.preventDefault();
  });

  refreshScrollAffordance();
}

/* Altura real do cromo (cabeçalho + abas + controles). Os painéis flutuantes
   usavam um chute fixo de 160px e, no mobile, abriam por cima da própria
   navegação de abas que deveriam respeitar. */
function syncChromeHeight() {
  let h = 0;
  ['.app-header', '.page-nav-bar', '.controls'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) h += el.getBoundingClientRect().height;
  });
  if (h > 0) document.documentElement.style.setProperty('--chrome-h', Math.round(h) + 'px');
}

function initLayoutSync() {
  syncChromeHeight();

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      syncChromeHeight();
      // Enquanto a escala for a automática, ela acompanha a largura da janela.
      if (zoomIsAuto) fitToScreen();
      else refreshScrollAffordance();
    }, 180);
  });

  // A barra de controles muda de altura quando os clusters embrulham; o
  // observer pega isso sem depender de um evento de resize da janela.
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => syncChromeHeight());
    ['.app-header', '.page-nav-bar', '.controls'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) ro.observe(el);
    });
  }
}

function initHelpPopover() {
  const btn = document.getElementById('help-btn');
  const popover = document.getElementById('help-popover');
  const close = document.getElementById('help-close');
  if (!btn || !popover) return;

  function toggle(show) {
    popover.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggle(popover.hidden);
  });

  if (close) close.addEventListener('click', () => toggle(false));

  document.addEventListener('click', e => {
    if (!popover.hidden && !popover.contains(e.target) && e.target !== btn) {
      toggle(false);
    }
  });

  document.addEventListener('keydown', e => {
    if (!popover.hidden && e.key === 'Escape') toggle(false);
  });
}

// ─── EXPORTAÇÃO PNG (nativo, sem dependência do html2canvas) ───
async function downloadPNG() {
  const svg = document.getElementById('global-svg');
  if (!svg) return;

  const btn = document.getElementById('btnExport');
  const oldHTML = btn.innerHTML;
  btn.innerHTML = 'Gerando HD…';
  btn.disabled = true;

  // Aguarda 50ms para que o botão atualize visualmente na UI
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    let w = 0;
    let h = 0;

    // Tenta obter as dimensões nativas do viewBox (coordenadas reais de design da timeline)
    if (svg.viewBox && svg.viewBox.baseVal) {
      w = svg.viewBox.baseVal.width;
      h = svg.viewBox.baseVal.height;
    }

    // Se falhar ou não estiver definido, tenta ler os atributos de largura/altura
    if (!w || isNaN(w)) {
      w = parseInt(svg.getAttribute('width'), 10);
    }
    if (!h || isNaN(h)) {
      h = parseInt(svg.getAttribute('height'), 10);
    }

    // Fallbacks finais se tudo falhar
    w = w || 1200;
    h = h || 800;

    // ─── ESCALA ADAPTATIVA COM LIMITE DE CANVAS ───
    const MAX_CANVAS_PIXELS = 100000000; // ~100 megapixels
    const MAX_CANVAS_DIM = 16384;
    const desiredScale = 3;
    let scale = desiredScale;
    const pixelCount = w * h * desiredScale * desiredScale;
    const maxDim = Math.max(w, h) * desiredScale;

    if (pixelCount > MAX_CANVAS_PIXELS || maxDim > MAX_CANVAS_DIM) {
      scale = Math.min(
        Math.floor(Math.sqrt(MAX_CANVAS_PIXELS / (w * h))),
        Math.floor(MAX_CANVAS_DIM / Math.max(w, h))
      );
      scale = Math.max(1, scale);
      console.log(`[PNG Export] Escala adaptada de ${desiredScale} para ${scale} para respeitar limites do browser.`);
    }

    // ─── CLONA E CONFIGURA O SVG ───
    const cloned = svg.cloneNode(true);
    
    // Configura as dimensões físicas e o viewBox da cópia para o tamanho ampliado.
    // Isso garante que o canvas final tenha a resolução desejada.
    cloned.setAttribute('width', w * scale);
    cloned.setAttribute('height', h * scale);
    cloned.setAttribute('viewBox', `0 0 ${w * scale} ${h * scale}`);

    // Cria um grupo wrapper com transform="scale(scale)" para aplicar a escala vetorial
    // diretamente em todos os elementos gráficos. Isso força o motor de renderização do
    // navegador a rasterizar as fontes, caminhos e formas na resolução nativa ampliada (HD/UHD),
    // eliminando qualquer serrilhado ou perda de nitidez.
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapper.setAttribute('transform', `scale(${scale})`);

    // Move os filhos visuais para dentro do wrapper (preservando title, defs, style e o rect de fundo no topo)
    const children = Array.from(cloned.childNodes);
    children.forEach(child => {
      const tag = child.tagName ? child.tagName.toLowerCase() : '';
      if (tag === 'title' || tag === 'defs' || tag === 'style') {
        return;
      }
      if (tag === 'rect' && child.getAttribute('width') === '100%') {
        return; // Mantém o fundo branco de 100% no nível raiz do SVG
      }
      wrapper.appendChild(child);
    });
    cloned.appendChild(wrapper);

    // Define explicitamente o namespace xmlns caso falte
    if (!cloned.getAttribute('xmlns')) {
      cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Injeta os estilos de fonte originais conforme solicitado
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      text { font-family: Inter, -apple-system, system-ui, sans-serif; }
      text[font-family*="Mono"], text[font-family*="mono"] { font-family: 'DM Mono', 'Courier New', monospace; }
    `;
    cloned.insertBefore(style, cloned.firstChild);

    // Serializa o SVG
    const serializer = new XMLSerializer();
    let xml = serializer.serializeToString(cloned);
    
    // Adiciona declaração XML se não estiver presente
    if (!xml.startsWith('<?xml')) {
      xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
    }

    // ─── DATA URI EM VEZ DE BLOB URL OU BASE64 ───
    // encodeURIComponent funciona perfeitamente com caracteres especiais (como acentos em PT-BR)
    // e é muito mais confiável em vários navegadores que o Blob URL para SVG→Img→Canvas.
    const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

    // ─── CARREGAMENTO DA IMAGEM E img.decode() ───
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            if (typeof img.decode === 'function') {
              await img.decode(); // Garante decodificação completa antes de desenhar
            }
            resolve(img);
          } catch (err) {
            console.warn('[PNG Export] img.decode() falhou, tentando desenhar diretamente:', err);
            resolve(img); // Resolve mesmo assim se a decodificação falhar, como fallback
          }
        };
        img.onerror = (err) => {
          reject(new Error('Erro ao carregar os elementos gráficos do SVG.'));
        };
        img.src = src;
      });
    };

    const img = await loadImage(svgDataUri);

    // ─── DESENHA NO CANVAS ───
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Navegador não suporta o contexto 2D do Canvas.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhamos a imagem de alta resolução na proporção 1:1 direta no canvas.
    // Não usamos mais ctx.scale(scale, scale), pois a imagem 'img' já está renderizada
    // nativamente no tamanho correto e nítido.
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // ─── CONVERTE PARA BLOB PNG E DIRECIONA DOWNLOAD ───
    const canvasToBlob = (cv) => {
      return new Promise((resolve) => {
        cv.toBlob(resolve, 'image/png');
      });
    };

    const pngBlob = await canvasToBlob(canvas);
    if (!pngBlob) {
      throw new Error('Não foi possível gerar a imagem final.');
    }

    const pngUrl = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.download = `panorama-llms-${new Date().toISOString().slice(0, 10)}.png`;
    a.href = pngUrl;
    a.click();
    
    // Revoga a URL do Blob após um pequeno intervalo
    setTimeout(() => URL.revokeObjectURL(pngUrl), 2000);

  } catch (e) {
    console.error('Erro na exportação PNG:', e);
    alert('Erro ao gerar PNG: ' + e.message + '\nComo alternativa, utilize a exportação em SVG.');
  } finally {
    btn.innerHTML = oldHTML;
    btn.disabled = false;
  }
}

// ─── EXPORTAÇÃO SVG (vetorial, ideal para publicação acadêmica) ───
function downloadSVG() {
  const svg = document.getElementById('global-svg');
  if (!svg) return;

  const cloned = svg.cloneNode(true);
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Inter:wght@400;500;600;700;800&display=swap');
    text { font-family: Inter, sans-serif; }
  `;
  cloned.insertBefore(style, cloned.firstChild);

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(cloned);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `panorama-llms-${new Date().toISOString().slice(0, 10)}.svg`;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── EXPORTAÇÃO CSV (dados tabulares dos modelos) ───
function csvEscape(value) {
  const s = String(value == null ? '' : value);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadCSV() {
  if (!RAW || !RAW.length) {
    alert('Ainda não há modelos carregados para exportar.');
    return;
  }

  const btn = document.getElementById('btnExportCSV');
  const oldHTML = btn ? btn.innerHTML : null;
  if (btn) { btn.innerHTML = 'Gerando…'; btn.disabled = true; }

  try {
    // `nivel`/`fonte` viajam com o CSV: quem baixar os dados para uma análise
    // consegue separar marco curado de censo automático sem voltar ao site.
    const headers = ['Data', 'Empresa', 'Modelo', 'Impacto', 'Referência', 'Grupo',
                     'Dias desde o marco zero', 'Nível', 'Fonte'];
    const rotuloNivel = { 1: 'marco', 2: 'secundário', 3: 'catálogo' };
    const rotuloFonte = { 1: 'curadoria', 2: 'curadoria', 3: 'Artificial Analysis' };
    const linhas = RAW.slice().sort((a, b) => a.dias - b.dias).map(r => [
      r.date,
      r.emp,
      r.mod,
      r.impact || '',
      r.ref || '',
      r.grupo || '',
      r.dias,
      rotuloNivel[r.nivel || 1],
      rotuloFonte[r.nivel || 1]
    ].map(csvEscape).join(','));

    const csv = [headers.map(csvEscape).join(','), ...linhas].join('\r\n');
    // BOM UTF-8 para o Excel reconhecer acentos
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `panorama-llms-${new Date().toISOString().slice(0, 10)}.csv`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('Erro na exportação CSV:', e);
    alert('Erro ao gerar CSV: ' + e.message);
  } finally {
    if (btn) { btn.innerHTML = oldHTML; btn.disabled = false; }
  }
}

// ─── INICIALIZAÇÃO ───
document.addEventListener('DOMContentLoaded', () => {
  loadZoom();
  initZoomControls();
  initDragPan();
  initScrollAffordance();
  initLayoutSync();
  initModoControls();
  // A régua padrão é desenhada primeiro em qualquer caso; só depois o modo
  // salvo (ou o #modo=ampliada do link) baixa o catálogo e redesenha. Assim o
  // primeiro paint nunca espera por um arquivo que 90% das visitas não usa.
  loadSheetData().then(() => {
    if (modoSalvo() === 'ampliada') setModo('ampliada');
  });
});
