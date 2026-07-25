/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Guia de IAs Gratuitas
   Lógica de renderização dos cards, filtros por categoria e busca
   em tempo real.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentCategory = 'todos';
  let searchQuery = '';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initPage() {
    if (typeof GRATUITOS_DATA === 'undefined') {
      console.error('GRATUITOS_DATA não foi carregado.');
      return;
    }

    // Exibir data da última atualização
    const updatedEl = document.getElementById('gratuitos-updated');
    if (updatedEl && GRATUITOS_DATA.updatedText) {
      updatedEl.textContent = GRATUITOS_DATA.updatedText;
    }

    renderCategoryNav();
    bindSearch();
    renderCards();
  }

  function renderCategoryNav() {
    const navEl = document.getElementById('gratuitos-nav');
    if (!navEl) return;

    navEl.innerHTML = GRATUITOS_DATA.categories.map(cat => {
      const isActive = cat.id === currentCategory ? 'is-active' : '';
      return `
        <button type="button" class="g-navlink ${isActive}" data-cat="${escapeHtml(cat.id)}">
          ${escapeHtml(cat.label)}
        </button>
      `;
    }).join('');

    navEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.g-navlink');
      if (!btn) return;
      currentCategory = btn.dataset.cat;
      
      // Atualizar classe ativa
      navEl.querySelectorAll('.g-navlink').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      renderCards();
    });
  }

  function bindSearch() {
    const searchEl = document.getElementById('gratuitos-search');
    if (!searchEl) return;

    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCards();
    });
  }

  function filterItems() {
    return GRATUITOS_DATA.items.filter(item => {
      // Filtro de Categoria
      const matchCat = currentCategory === 'todos' || item.category === currentCategory;
      if (!matchCat) return false;

      // Filtro de Busca
      if (!searchQuery) return true;

      const inName = item.name.toLowerCase().includes(searchQuery);
      const inCompany = item.company.toLowerCase().includes(searchQuery);
      const inHighlight = item.highlight.toLowerCase().includes(searchQuery);
      const inQuota = item.freeQuota.toLowerCase().includes(searchQuery);
      const inBest = item.bestFor.toLowerCase().includes(searchQuery);
      const inModel = (item.freeModel || '').toLowerCase().includes(searchQuery);
      const inTags = (item.tags || []).some(t => t.toLowerCase().includes(searchQuery));

      return inName || inCompany || inHighlight || inQuota || inBest || inModel || inTags;
    });
  }

  function renderCards() {
    const gridEl = document.getElementById('gratuitos-grid');
    const countEl = document.getElementById('gratuitos-count');
    if (!gridEl) return;

    const filtered = filterItems();

    if (countEl) {
      countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}`;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="g-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p>Nenhuma ferramenta encontrada para a busca "${escapeHtml(searchQuery)}".</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(item => `
      <article class="g-card" id="card-${escapeHtml(item.id)}">
        <header class="g-card-header">
          <div class="g-card-brand">
            <span class="g-company">${escapeHtml(item.company)}</span>
            <h3 class="g-title">${escapeHtml(item.name)}</h3>
            ${item.freeModel ? `<span class="g-model">${escapeHtml(item.freeModel)}</span>` : ''}
          </div>
          <span class="g-badge">${escapeHtml(item.badge)}</span>
        </header>

        <p class="g-highlight">${escapeHtml(item.highlight)}</p>

        <div class="g-details">
          <div class="g-detail-item g-quota-item">
            <div class="g-detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <span>Plano Gratuito (Free Tier)</span>
            </div>
            <div class="g-detail-val">${escapeHtml(item.freeQuota)}</div>
          </div>

          <div class="g-detail-item">
            <div class="g-detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Limites &amp; Regras</span>
            </div>
            <div class="g-detail-val">${escapeHtml(item.limits)}</div>
          </div>

          <div class="g-detail-item">
            <div class="g-detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Ideal para</span>
            </div>
            <div class="g-detail-val">${escapeHtml(item.bestFor)}</div>
          </div>

          ${item.paidStepUp ? `
          <div class="g-detail-item">
            <div class="g-detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Plano Pago</span>
            </div>
            <div class="g-detail-val">${escapeHtml(item.paidStepUp)}</div>
          </div>` : ''}

          ${item.theCatch ? `
          <div class="g-detail-item g-catch-item">
            <div class="g-detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>O porém</span>
            </div>
            <div class="g-detail-val">${escapeHtml(item.theCatch)}</div>
          </div>` : ''}
        </div>

        <footer class="g-card-footer">
          <div class="g-tags">
            ${(item.tags || []).map(t => `<span class="g-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <a class="g-link-btn" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">
            <span>Acessar gratuitamente</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </footer>
      </article>
    `).join('');
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
