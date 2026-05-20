/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Aplicação principal
   Carregamento de dados, tooltip, drag-to-pan, exportação PNG
   ═══════════════════════════════════════════════════════════════ */

// ─── CARREGAMENTO DA PLANILHA (Google Sheets via gviz/JSONP) ───
function gvizFetch(tab) {
  return new Promise((resolve, reject) => {
    const cb = '_gv_' + tab.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
    const timer = setTimeout(() => {
      delete window[cb];
      reject(new Error('timeout'));
    }, 15000);
    window[cb] = function (resp) {
      clearTimeout(timer);
      delete window[cb];
      resolve(resp);
    };
    const s = document.createElement('script');
    s.src = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(tab)}&tqx=responseHandler:${cb}`;
    s.onerror = () => {
      clearTimeout(timer);
      delete window[cb];
      reject(new Error('load failed'));
    };
    s.onload = () => { if (s.parentNode) s.parentNode.removeChild(s); };
    document.head.appendChild(s);
  });
}

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
    const parts = val.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
    if (parts) {
      return new Date(parts[1], parts[2], parts[3]).getTime();
    }
  }
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
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
    r.dias = Math.round((new Date(r.date + 'T00:00:00') - CONFIG.MARCO) / 86400000);
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

  rebuildV2();
}

// ─── ESTADOS DE ERRO E LOADING ───
function showError(message) {
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
  const wrap = document.getElementById('svg-wrap');
  wrap.innerHTML = '<div class="loading-state">Carregando dados da planilha…</div>';
}

// ─── CARREGAMENTO PRINCIPAL ───
async function loadSheetData() {
  showLoading();

  // Tenta usar cache primeiro (instantâneo)
  const cached = readCache();
  if (cached) {
    processRows(cached.rows);
    // Mas continua atualizando em background
    fetchFresh(true).catch(() => { /* silencioso, já temos cache */ });
    return;
  }

  try {
    await fetchFresh(false);
  } catch (e) {
    console.error('Falha ao carregar planilha:', e);
    showError('Verifique sua conexão e se a planilha está pública. Erro: ' + (e.message || 'desconhecido'));
  }
}

async function fetchFresh(silent) {
  const allRows = [];
  for (const tab of CONFIG.SHEET_TABS) {
    const data = await gvizFetch(tab);
    if (!data || !data.table || !data.table.rows) continue;

    const rows = data.table.rows.slice(1); // pula header

    for (const row of rows) {
      const c = row.c;
      if (!c || !c[0] || !c[1] || !c[2]) continue;

      const emp = c[1] ? String(c[1].v || '') : '';
      const mod = c[2] ? String(c[2].v || '') : '';
      const impact = c[3] ? String(c[3].v || '') : '';
      const foo = c[4] ? String(c[4].v || '') : '';
      const status = c[5] ? String(c[5].v || '').toLowerCase() : '';

      if (status !== 'publicado') continue;
      if (!emp || !mod) continue;

      const date = parseSheetDate(c[0].v);
      if (!date) continue;

      const updatedAt = c[10] && c[10].v ? parseSheetTimestamp(c[10].v) : 0;

      allRows.push({ date, emp, mod, impact, foo, updatedAt });
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



  // Mostra invisível primeiro para medir altura real
  tooltip.classList.add('visible');

  // Posicionamento robusto baseado em medidas reais
  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    const margin = 12;

    let left = e.clientX + 20;
    let top = e.clientY - 40;

    if (left + rect.width > window.innerWidth - margin) {
      left = e.clientX - rect.width - 20;
    }
    if (left < margin) left = margin;

    if (top + rect.height > window.innerHeight - margin) {
      top = window.innerHeight - rect.height - margin;
    }
    if (top < margin) top = margin;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
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
    // Não inicia drag se foi clique numa pílula ou link
    if (e.target.closest('.pill-group') || e.target.closest('a')) return;
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

// ─── EXPORTAÇÃO PNG (nativo, sem dependência do html2canvas) ───
function downloadPNG() {
  const svg = document.getElementById('global-svg');
  if (!svg) return;

  const btn = document.getElementById('btnExport');
  const oldHTML = btn.innerHTML;
  btn.innerHTML = 'Gerando HD…';
  btn.disabled = true;

  // Usa setTimeout para liberar a thread e deixar o botão atualizar visualmente
  setTimeout(() => {
    try {
      const w = parseInt(svg.getAttribute('width'), 10);
      const h = parseInt(svg.getAttribute('height'), 10);

      // Escala 3x é o ponto ideal: legível sem estourar o limite de memória do canvas
      const scale = 3;
      const canvasW = w * scale;
      const canvasH = h * scale;

      // Limite de segurança: a maioria dos browsers suporta até ~16384×16384px
      const MAX_DIM = 16000;
      if (canvasW > MAX_DIM || canvasH > MAX_DIM) {
        btn.innerHTML = oldHTML;
        btn.disabled = false;
        alert(`A imagem seria muito grande (${canvasW}×${canvasH}px). Use "Exportar SVG" para qualidade máxima.`);
        return;
      }

      // Clona e injeta estilos de fonte inline para garantir renderização
      const cloned = svg.cloneNode(true);
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        text { font-family: Inter, -apple-system, system-ui, sans-serif; }
        text[font-family*="Mono"], text[font-family*="mono"] { font-family: 'DM Mono', 'Courier New', monospace; }
      `;
      cloned.insertBefore(style, cloned.firstChild);

      const xml = new XMLSerializer().serializeToString(cloned);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const dataUrl = 'data:image/svg+xml;base64,' + svg64;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });

        if (!ctx) {
          btn.innerHTML = oldHTML;
          btn.disabled = false;
          alert('Seu navegador não conseguiu criar o canvas. Use "Exportar SVG".');
          return;
        }

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
          if (!blob) {
            btn.innerHTML = oldHTML;
            btn.disabled = false;
            alert('Falha ao gerar PNG (canvas muito grande). Use "Exportar SVG" para qualidade máxima.');
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = `panorama-llms-${new Date().toISOString().slice(0, 10)}.png`;
          a.href = url;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          btn.innerHTML = oldHTML;
          btn.disabled = false;
        }, 'image/png');
      };
      img.onerror = () => {
        btn.innerHTML = oldHTML;
        btn.disabled = false;
        alert('Erro ao renderizar SVG. Tente exportar como SVG.');
      };
      img.src = dataUrl;
    } catch (e) {
      btn.innerHTML = oldHTML;
      btn.disabled = false;
      console.error('Erro na exportação:', e);
      alert('Erro inesperado na exportação. Use "Exportar SVG" como alternativa.');
    }
  }, 50);
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
  initDragPan();
  loadSheetData();
});
