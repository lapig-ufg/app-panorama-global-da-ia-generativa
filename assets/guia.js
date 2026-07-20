/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Guia "Qual modelo usar"
   Traduz os benchmarks brutos (assets/benchmarks.json) em uma
   recomendação por tipo de tarefa.

   Por que a análise mora aqui e não no pipeline:
   a política de recomendação (piso de qualidade, quais benchmarks
   representam cada categoria) é decisão editorial e muda mais que os
   dados. Mantendo-a no navegador, ajustá-la não exige chave de API
   nem nova coleta — o benchmarks.json semanal é reaproveitado.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DATA_URL = 'assets/benchmarks.json';

  // Piso de qualidade das alternativas: um modelo só é sugerido como
  // "custo-benefício" ou "mais rápido" se ficar a até 12% do líder.
  // Sem esse piso, o mais barato do ranking seria sempre o pior dele.
  const FLOOR = 0.88;

  /* ─── AS CATEGORIAS ───
     Cada categoria = UMA pergunta do usuário, respondida por UM benchmark
     principal. Os de apoio aparecem só como contexto no rodapé da seção.
     Regra que seguimos ao montar esta lista: só existe categoria onde o dado
     ainda separa os modelos. Por isso não há categoria de Matemática — o AIME
     está saturado em 99% e o MATH-500 tem spread de 1,3 ponto no top-15,
     com líder de ago/2025. Criar a categoria seria inventar uma resposta. */
  const CATEGORIES = [
    {
      id: 'geral',
      label: 'Uso geral',
      question: 'Conversar, escrever, resumir, tirar dúvidas do dia a dia.',
      primary: 'artificial_analysis_intelligence_index',
      support: ['mmlu_pro'],
    },
    {
      id: 'codigo',
      label: 'Programação',
      question: 'Escrever, revisar e consertar código.',
      primary: 'artificial_analysis_coding_index',
      support: ['scicode', 'livecodebench'],
    },
    {
      id: 'agentes',
      label: 'Agentes e automação',
      question: 'Executar tarefas sozinho, usando terminal, ferramentas e APIs.',
      primary: 'terminalbench_v2_1',
      support: ['tau2'],
    },
    {
      id: 'pesquisa',
      label: 'Pesquisa e raciocínio',
      question: 'Problemas difíceis, análise profunda, apoio à pesquisa científica.',
      primary: 'hle',
      support: ['gpqa', 'aime_25'],
    },
    {
      id: 'instrucoes',
      label: 'Instruções e dados estruturados',
      question: 'Seguir regras à risca, extrair campos, devolver formato fixo.',
      primary: 'ifbench',
      support: ['lcr'],
    },
  ];

  const SLOTS = {
    best: { key: 'best', label: 'O melhor', hint: 'maior pontuação, sem olhar preço' },
    value: { key: 'value', label: 'Custo-benefício', hint: 'quase o mesmo desempenho, bem mais barato' },
    fast: { key: 'fast', label: 'Mais rápido', hint: 'maior velocidade entre os bons' },
  };

  let bmData = null;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtScore(b, v) {
    return b.is_fraction ? `${Number(v).toFixed(1)}%` : String(v);
  }

  // Preço 0 na AA significa "sem preço publicado" (modelo aberto ou não ofertado
  // por API), não "de graça" — por isso é tratado como ausente, nunca como grátis.
  function fmtPrice(v) {
    if (v == null || v <= 0) return null;
    return `$${v.toFixed(2)}/M`;
  }

  function fmtSpeed(v) {
    return v > 0 ? `${Math.round(v)} tok/s` : null;
  }

  // ─── Logo da empresa, reusando a mesma fonte da régua (data.js) ───
  function companyMark(company) {
    const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(company) : company;
    const color = (typeof companyColor === 'function') ? companyColor(company) : '#6b6860';
    const logoKey = (typeof LOGO_MAP !== 'undefined') ? LOGO_MAP[canonical] : null;
    const path = (logoKey && typeof LOGO_PATHS !== 'undefined') ? LOGO_PATHS[logoKey] : null;
    const inner = path
      ? `<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">${path}</svg>`
      : `<span class="qm-mark-initial" aria-hidden="true">${escapeHtml(canonical.slice(0, 1))}</span>`;
    return `<span class="qm-mark" style="background:${color}">${inner}</span>`;
  }

  // ─── Escolhe os destaques de uma categoria ───
  // Quando o mesmo modelo ganha dois papéis (comum: o barato também é o rápido),
  // os selos se juntam num card só em vez de repetir o modelo.
  function pickRecommendations(list) {
    if (!list.length) return [];
    const best = list[0];
    const floor = best.score * FLOOR;
    const qualified = list.filter(m => m.score >= floor);

    const cheapest = qualified
      .filter(m => m.price_1m_blended > 0)
      .sort((a, b) => a.price_1m_blended - b.price_1m_blended)[0];
    const fastest = qualified
      .filter(m => m.tok_per_sec > 0)
      .sort((a, b) => b.tok_per_sec - a.tok_per_sec)[0];

    const slots = [];
    const add = (m, slot) => {
      if (!m) return;
      const key = `${m.creator}|${m.model}`;
      const hit = slots.find(s => s.key === key);
      if (hit) hit.slots.push(slot);
      else slots.push({ key, model: m, slots: [slot] });
    };
    add(best, SLOTS.best);
    add(cheapest, SLOTS.value);
    add(fastest, SLOTS.fast);
    return slots;
  }

  // ─── Card de recomendação ───
  function recCard(entry, bench, best) {
    const m = entry.model;
    const isBest = entry.slots.some(s => s.key === 'best');
    const price = fmtPrice(m.price_1m_blended);
    const speed = fmtSpeed(m.tok_per_sec);
    const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(m.creator) : m.creator;

    const tags = entry.slots.map(s =>
      `<span class="qm-slot qm-slot-${s.key}" title="${escapeHtml(s.hint)}">${escapeHtml(s.label)}</span>`
    ).join('');

    // Quanto o alternativo economiza / entrega em relação ao líder
    let delta = '';
    if (!isBest && best) {
      const pctScore = Math.round((m.score / best.score) * 100);
      const bits = [`${pctScore}% do desempenho do líder`];
      if (best.price_1m_blended > 0 && m.price_1m_blended > 0) {
        bits.push(`${Math.round((m.price_1m_blended / best.price_1m_blended) * 100)}% do preço`);
      }
      delta = `<p class="qm-rec-delta">${escapeHtml(bits.join(' · '))}</p>`;
    }

    const openTag = (bmData.has_open_weights && m.open_weights === true)
      ? '<span class="qm-open" title="Pesos abertos — pode ser executado localmente">aberto</span>'
      : '';

    return `
      <article class="qm-rec${isBest ? ' is-best' : ''}">
        <div class="qm-rec-slots">${tags}</div>
        <div class="qm-rec-id">
          ${companyMark(m.creator)}
          <div class="qm-rec-names">
            <span class="qm-rec-model">${escapeHtml(m.model)}${openTag}</span>
            <a class="qm-rec-company" href="index.html#emp=${encodeURIComponent(canonical)}"
               title="Ver os lançamentos da ${escapeHtml(canonical)} na régua">${escapeHtml(canonical)}</a>
          </div>
        </div>
        <div class="qm-rec-score">
          <strong>${fmtScore(bench, m.score)}</strong>
          <span>${escapeHtml(bench.label)}</span>
        </div>
        <ul class="qm-rec-facts">
          ${price ? `<li><span>Preço</span><b>${escapeHtml(price)}</b></li>` : ''}
          ${speed ? `<li><span>Velocidade</span><b>${escapeHtml(speed)}</b></li>` : ''}
          ${m.variant ? `<li><span>Configuração</span><b class="qm-variant" title="${escapeHtml(m.variant)}">${escapeHtml(m.variant)}</b></li>` : ''}
        </ul>
        ${delta}
      </article>`;
  }

  // ─── Ranking completo (dentro do <details>) ───
  function fullList(bench) {
    const max = bench.top.length ? bench.top[0].score : 1;
    return bench.top.map((m, i) => {
      const pct = max > 0 ? Math.max(4, (m.score / max) * 100) : 4;
      const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(m.creator) : m.creator;
      const color = (typeof companyColor === 'function') ? companyColor(m.creator) : '#6b6860';
      const price = fmtPrice(m.price_1m_blended);
      return `
        <li class="qm-row${i === 0 ? ' is-first' : ''}">
          <span class="qm-rank">${i + 1}</span>
          <span class="qm-row-name">
            <span class="qm-dot" style="background:${color}"></span>
            <span class="qm-row-model">${escapeHtml(m.model)}</span>
            ${m.variant ? `<span class="qm-row-variant" title="${escapeHtml(m.variant)}">${escapeHtml(m.variant)}</span>` : ''}
            <span class="qm-row-company">${escapeHtml(canonical)}</span>
          </span>
          <span class="qm-barwrap"><span class="qm-bar" style="width:${pct}%;background:${color}"></span></span>
          <span class="qm-row-score">${fmtScore(bench, m.score)}</span>
          <span class="qm-row-price">${price ? escapeHtml(price) : '—'}</span>
        </li>`;
    }).join('');
  }

  // ─── Uma seção de categoria ───
  function categorySection(cat) {
    const bench = bmData.benchmarks.find(b => b.key === cat.primary);
    if (!bench || !bench.top.length) return '';

    const recs = pickRecommendations(bench.top);
    const best = bench.top[0];
    const support = cat.support
      .map(k => bmData.benchmarks.find(b => b.key === k))
      .filter(Boolean);

    const supportTxt = support.length
      ? ` · também medido por ${support.map(b => b.label).join(', ')}`
      : '';

    return `
      <section class="qm-cat" id="cat-${cat.id}">
        <header class="qm-cat-hd">
          <h2>${escapeHtml(cat.label)}</h2>
          <p>${escapeHtml(cat.question)}</p>
        </header>
        <div class="qm-trio">${recs.map(r => recCard(r, bench, best)).join('')}</div>
        <details class="qm-full">
          <summary>Ranking completo — ${bench.top.length} modelos</summary>
          <ul class="qm-list">${fullList(bench)}</ul>
          <p class="qm-src">
            Base: <strong>${escapeHtml(bench.label)}</strong> — ${escapeHtml(bench.description)}.
            ${bench.models_evaluated} avaliações${supportTxt}.
          </p>
        </details>
      </section>`;
  }

  // ─── Índice de navegação entre categorias ───
  function renderNav() {
    const el = document.getElementById('qm-nav');
    if (!el) return;
    el.innerHTML = CATEGORIES
      .filter(c => bmData.benchmarks.some(b => b.key === c.primary && b.top.length))
      .map(c => `<a class="qm-navlink" href="#cat-${c.id}">${escapeHtml(c.label)}</a>`)
      .join('');
  }

  function renderMeta() {
    const d = bmData.fetched_at ? bmData.fetched_at.slice(0, 10).split('-').reverse().join('/') : '';
    const el = document.getElementById('qm-meta');
    if (el) {
      el.textContent = `${bmData.models_total} modelos rastreados · ${bmData.benchmarks.length} benchmarks` +
        (d ? ` · dados de ${d}` : '');
    }
    const upd = document.getElementById('qm-updated');
    if (upd) upd.textContent = d || '—';
    const att = document.getElementById('qm-attribution');
    if (att && bmData.attribution) att.textContent = bmData.attribution;
  }

  async function init() {
    const root = document.getElementById('qm-root');
    if (!root) return;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      bmData = await res.json();
    } catch (e) {
      console.error('Falha ao carregar benchmarks.json:', e);
      // Abrir o HTML por duplo-clique (file://) faz o navegador bloquear o fetch
      // do JSON local por CORS — origem "null". Não é erro do site: servido por
      // HTTP (GitHub Pages ou servidor local) funciona normalmente.
      root.innerHTML = location.protocol === 'file:'
        ? '<p class="qm-empty">Esta página precisa ser aberta por um servidor HTTP.<br>' +
          'Abrindo o arquivo direto (<code>file://</code>), o navegador bloqueia a leitura ' +
          'do <code>benchmarks.json</code>.<br>Rode <code>npx serve</code> na pasta do projeto ' +
          'ou acesse a versão publicada.</p>'
        : '<p class="qm-empty">Não foi possível carregar os dados de benchmark agora.</p>';
      return;
    }
    renderMeta();
    renderNav();
    root.innerHTML = CATEGORIES.map(categorySection).join('') ||
      '<p class="qm-empty">Nenhuma categoria disponível.</p>';

    // GA4: qual categoria as pessoas realmente abrem
    root.querySelectorAll('.qm-full').forEach(d => {
      d.addEventListener('toggle', () => {
        if (d.open && window.gtag) {
          const sec = d.closest('.qm-cat');
          gtag('event', 'abre_ranking', { categoria: sec ? sec.id.replace('cat-', '') : '?' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
