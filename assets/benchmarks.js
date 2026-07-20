/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Modal Benchmarks
   Mostra notas dos modelos em testes padronizados (fonte: Artificial Analysis).
   Os dados vêm de assets/benchmarks.json (atualizado via API).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DATA_URL = 'assets/benchmarks.json';
  const CATEGORIES = ['Todos', 'Inteligência', 'Coding', 'Math', 'Agents', 'Instruções', 'Conhecimento'];

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  let bmData = null;       // dados carregados (cache em sessão)
  let activeCat = 'Todos'; // filtro de categoria ativo

  // ─── Carregamento (uma vez, lazy) ───
  async function loadData() {
    if (bmData) return bmData;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      bmData = await res.json();
    } catch (e) {
      console.error('Falha ao carregar benchmarks.json:', e);
      bmData = null;
    }
    return bmData;
  }

  // ─── Atribuição de cor por criador (mesma paleta simples, com fallback) ───
  const CREATOR_COLORS = {
    OpenAI: '#10a37f', Anthropic: '#d97757', Google: '#4285f4', Meta: '#0866ff',
    DeepSeek: '#4d6bfe', Alibaba: '#7c3aed', Mistral: '#ff7000', 'SpaceXAI': '#1f2937',
    'Z AI': '#0ea5e9', NVIDIA: '#76b900', Amazon: '#ff9900', Kimi: '#1e1b4b',
    Microsoft: '#0078d4', IBM: '#0f62fe', Baidu: '#2932e1', xAI: '#111111',
    Xiaomi: '#ff6900', MiniMax: '#6b4cff', 'China Mobile': '#e60012',
    KwaiKAT: '#ff5000', StepFun: '#0066ff'
  };
  function creatorColor(name) {
    return CREATOR_COLORS[name] || '#6b6860';
  }

  // ─── Renderização dos filtros (chips por categoria) ───
  function renderFilters() {
    const wrap = document.getElementById('bm-filters');
    if (!wrap || !bmData) return;
    const present = new Set(bmData.benchmarks.map(b => b.category));
    const cats = ['Todos', ...CATEGORIES.slice(1).filter(c => present.has(c))];
    wrap.innerHTML = cats.map(c =>
      `<button class="bm-chip${c === activeCat ? ' is-active' : ''}" data-cat="${c}" role="tab"
        aria-selected="${c === activeCat}">${c}</button>`
    ).join('');
    wrap.querySelectorAll('.bm-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        renderFilters();
        renderGrid();
      });
    });
  }

  // ─── Um card de benchmark ───
  function benchmarkCard(b) {
    const top = b.top || [];
    const max = top.length ? top[0].score : 1; // score do 1º = referência da barra
    const rows = top.map((m, i) => {
      const pct = max > 0 ? Math.max(4, (m.score / max) * 100) : 4;
      const rank = i + 1;
      const swatch = `<span class="bm-swatch" style="background:${creatorColor(m.creator)}"></span>`;
      const price = m.price_1m_blended != null
        ? `$${Number(m.price_1m_blended).toFixed(2)} /M`
        : '';
      return `
        <li class="bm-row${rank === 1 ? ' is-first' : ''}">
          <span class="bm-rank">${rank}</span>
          ${swatch}
          <span class="bm-model" title="${escapeHtml(m.model)}">${escapeHtml(m.model)}</span>
          <span class="bm-creator">${escapeHtml(m.creator)}</span>
          <span class="bm-barwrap"><span class="bm-bar" style="width:${pct}%"></span></span>
          <span class="bm-score">${b.is_fraction ? m.score.toFixed(1) + '%' : m.score}</span>
          ${price ? `<span class="bm-price" title="custo blended / 1M tokens">${price}</span>` : ''}
        </li>`;
    }).join('');
    return `
      <article class="bm-card" data-cat="${b.category}">
        <header class="bm-card-hd">
          <h3>${escapeHtml(b.label)}</h3>
          <span class="bm-cat-tag">${escapeHtml(b.category)}</span>
        </header>
        <p class="bm-desc">${escapeHtml(b.description)}</p>
        <ul class="bm-list">${rows || '<li class="bm-empty">sem dados</li>'}</ul>
        <footer class="bm-card-ft">
          <span>${b.models_evaluated} modelos avaliados</span>
          <span class="bm-unit">${escapeHtml(b.unit)}</span>
        </footer>
      </article>`;
  }

  // ─── Grade de cards (filtrada por categoria) ───
  function renderGrid() {
    const grid = document.getElementById('bm-grid');
    if (!grid || !bmData) return;
    const list = bmData.benchmarks.filter(b => activeCat === 'Todos' || b.category === activeCat);
    grid.innerHTML = list.map(benchmarkCard).join('') ||
      '<p class="bm-empty">Nenhum benchmark nesta categoria.</p>';
  }

  // ─── Meta (total de modelos + data) ───
  function renderMeta() {
    const el = document.getElementById('bm-meta');
    if (!el || !bmData) return;
    const d = bmData.fetched_at ? bmData.fetched_at.slice(0, 10) : '';
    el.textContent = `${bmData.models_total} modelos · ${bmData.benchmarks.length} benchmarks` +
      (d ? ` · dados de ${d}` : '');
    const att = document.getElementById('bm-attribution');
    if (att && bmData.attribution) att.textContent = bmData.attribution;
  }

  // ─── Abertura/fecho do modal ───
  async function openModal() {
    const overlay = document.getElementById('bm-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!bmData) {
      document.getElementById('bm-grid').innerHTML =
        '<p class="bm-empty">Carregando benchmarks…</p>';
      await loadData();
    }
    if (bmData) {
      renderMeta();
      renderFilters();
      renderGrid();
    } else {
      document.getElementById('bm-grid').innerHTML =
        '<p class="bm-empty">Não foi possível carregar os benchmarks agora.</p>';
    }
  }

  function closeModal() {
    const overlay = document.getElementById('bm-overlay');
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  // ─── Init ───
  function initBenchmarks() {
    const btn = document.getElementById('benchmarks-btn');
    const overlay = document.getElementById('bm-overlay');
    const close = document.getElementById('bm-close');
    if (!btn || !overlay) return;

    btn.addEventListener('click', e => { e.stopPropagation(); openModal(); });
    if (close) close.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (!overlay.hidden && e.key === 'Escape') closeModal();
    });
  }

  // Expõe init para o app.js chamar no DOMContentLoaded
  window.initBenchmarks = initBenchmarks;
})();