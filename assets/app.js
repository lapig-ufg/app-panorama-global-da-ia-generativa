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

// ─── ESTADO DE ZOOM ───
const ZOOM_CACHE_KEY = 'panorama-llms-zoom-v1';
let currentPxPerDay = CONFIG.PX_PER_DAY;

function loadZoom() {
  try {
    const raw = sessionStorage.getItem(ZOOM_CACHE_KEY);
    if (raw) {
      const v = parseFloat(raw);
      if (!isNaN(v)) currentPxPerDay = clampZoom(v);
    }
  } catch (e) { /* sessionStorage indisponível */ }
}

function saveZoom() {
  try {
    sessionStorage.setItem(ZOOM_CACHE_KEY, String(currentPxPerDay));
  } catch (e) { /* ignora */ }
}

function clampZoom(v) {
  return Math.min(CONFIG.MAX_PX_PER_DAY, Math.max(CONFIG.MIN_PX_PER_DAY, Math.round(v * 100) / 100));
}

function getZoomLabel() {
  return `${currentPxPerDay.toFixed(1)} px/dia`;
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
      const fmtUpdate = `${String(finalUpdateDate.getDate()).padStart(2, '0')} ${MESES[finalUpdateDate.getMonth()]} ${finalUpdateDate.getFullYear()}`;
      dateEl.innerText = fmtUpdate;
    }
  }

  // Popula as tracks com os eventos filtrados
  LAYOUT_GROUPS.forEach(g => {
    g.tracks.forEach(t => {
      t.events = RAW.filter(t.filter).sort((a, b) => a.dias - b.dias);
    });
  });

  updateNovidades();
  rebuildV2(undefined, currentPxPerDay);
  updateZoomUI();
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
    processRows(cached.rows);
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

      if (status !== 'publicado') continue;
      if (!emp || !mod) continue;

      const date = parseSheetDate(c[0].v);
      if (!date) continue;

      const grupo = iGrupo >= 0 && c[iGrupo] ? String(c[iGrupo].v || '') : '';
      const addedAt = c[iTimestamp] && c[iTimestamp].v ? parseSheetTimestamp(c[iTimestamp].v) : 0;
      const updatedAt = c[iUpdated] && c[iUpdated].v ? parseSheetTimestamp(c[iUpdated].v) : 0;

      allRows.push({ date, emp, mod, impact, ref, grupo, addedAt, updatedAt });
    }
  }

  writeCache(allRows);
  processRows(allRows);
}

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
  if (label) label.textContent = getZoomLabel();
  if (slider) slider.value = currentPxPerDay;
}

function setZoom(v, opts = {}) {
  const next = clampZoom(v);
  if (next === currentPxPerDay) return;
  currentPxPerDay = next;
  saveZoom();
  updateZoomUI();

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
    });
  }
}

function zoomIn() {
  setZoom(currentPxPerDay + CONFIG.ZOOM_STEP);
}

function zoomOut() {
  setZoom(currentPxPerDay - CONFIG.ZOOM_STEP);
}

function fitToScreen() {
  const slider = document.getElementById('timeline-area');
  if (!slider) return;
  const padding = CONFIG.PAD_L + CONFIG.PAD_R + 40;
  const available = Math.max(400, slider.clientWidth - padding);
  const target = available / GLOBAL_MAX_DIAS;
  setZoom(target, { skipScroll: true });
  requestAnimationFrame(() => {
    slider.scrollLeft = 0;
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

// ─── INICIALIZAÇÃO ───
document.addEventListener('DOMContentLoaded', () => {
  loadZoom();
  initZoomControls();
  initDragPan();
  loadSheetData();
});
