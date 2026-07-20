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
    best: { key: 'best', label: 'Mais capaz', hint: 'maior pontuação da categoria' },
    value: { key: 'value', label: 'Custo-benefício', hint: 'maior pontuação por dólar' },
    fast: { key: 'fast', label: 'Mais rápido', hint: 'maior velocidade (tokens por segundo)' },
  };

  let bmData = null;
  let reguaIndex = null;   // Map(nome normalizado → linha da régua) ou null se a planilha não carregou

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

  // ─── Escolhe os três destaques de uma categoria ───
  //
  // Regra central: um selo superlativo só vai para quem REALMENTE vence aquele
  // critério. Se o mesmo modelo vence dois (o de melhor custo-benefício costuma
  // ser também o mais rápido), ele carrega os dois selos — repassar "mais
  // rápido" ao segundo colocado seria simplesmente falso, já que o card ao lado
  // mostraria um tok/s maior.
  //
  // A vaga que sobra é preenchida por posição ("2º mais capaz"), que é verdadeira
  // por construção: não afirma superioridade em critério nenhum, só diz onde o
  // modelo está no ranking de pontuação.
  function pickRecommendations(list) {
    if (!list.length) return [];
    const best = list[0];
    const floor = best.score * FLOOR;
    let qualified = list.filter(m => m.score >= floor);
    if (qualified.length < 3) qualified = list.slice(0, 3); // piso restritivo demais

    const keyOf = m => `${m.creator}|${m.model}`;

    // Custo-benefício = maior pontuação por dólar (não o mais barato: o mais
    // barato tende a ser o pior da lista que ainda passa no piso).
    const byValue = qualified.filter(m => m.price_1m_blended > 0)
      .slice().sort((a, b) => (b.score / b.price_1m_blended) - (a.score / a.price_1m_blended));
    const bySpeed = qualified.filter(m => m.tok_per_sec > 0)
      .slice().sort((a, b) => b.tok_per_sec - a.tok_per_sec);

    const cards = new Map();
    const award = (m, slot) => {
      if (!m) return;
      const k = keyOf(m);
      if (!cards.has(k)) cards.set(k, { model: m, slots: [] });
      cards.get(k).slots.push(slot);
    };
    award(best, SLOTS.best);
    award(byValue[0], SLOTS.value);
    award(bySpeed[0], SLOTS.fast);

    // Completa até três cards com os melhores em pontuação ainda não exibidos.
    for (let i = 0; i < list.length && cards.size < 3; i++) {
      const m = list[i];
      if (cards.has(keyOf(m))) continue;
      cards.set(keyOf(m), {
        model: m,
        slots: [{
          key: 'rank',
          label: `${i + 1}º mais capaz`,
          hint: `${i + 1}ª maior pontuação da categoria`,
        }],
      });
    }

    // Ordem dos cards: mais capaz → custo-benefício → mais rápido; demais por pontuação.
    const SLOT_RANK = { best: 0, value: 1, fast: 2 };
    const slotRank = c => {
      let r = Infinity;
      for (const s of c.slots) {
        if (SLOT_RANK[s.key] !== undefined) r = Math.min(r, SLOT_RANK[s.key]);
      }
      return r;
    };
    return [...cards.values()].sort((a, b) => {
      const ra = slotRank(a), rb = slotRank(b);
      return ra !== rb ? ra - rb : b.model.score - a.model.score;
    });
  }

  // ─── Ligação com a régua ───
  // Linka pelo nome normalizado via MODEL_ALIASES (data.js): sinônimos conhecidos
  // (variantes agrupadas, nome comercial diferente, sufixo "Preview"/"Beta")
  // colapsam no nome canônico da régua. Aproximação fuzzy automática NÃO acontece
  // — só mapeamentos explícitos e versionados no git. Quem não está na tabela
  // precisa de nome idêntico para linkar.
  function reguaLink(m) {
    const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(m.creator) : m.creator;
    const hit = reguaIndex && reguaIndex.get(normModel(m.model));
    if (hit) {
      return {
        href: `index.html#emp=${encodeURIComponent(hit.emp)}&mod=${encodeURIComponent(hit.mod)}`,
        title: `Ver "${hit.mod}" na régua`,
        onRegua: true,
        company: canonical,
      };
    }
    return { href: null, title: '', onRegua: false, company: canonical };
  }

  // Quantos modelos de um ranking existem na régua
  function coverage(bench) {
    if (!reguaIndex) return null;
    const total = bench.top.length;
    const on = bench.top.filter(m => reguaIndex.has(normModel(m.model))).length;
    return { on, total };
  }

  // ─── Card de recomendação ───
  function recCard(entry, bench, best) {
    const m = entry.model;
    const isBest = entry.slots.some(s => s.key === 'best');
    const price = fmtPrice(m.price_1m_blended);
    const speed = fmtSpeed(m.tok_per_sec);
    const link = reguaLink(m);
    const canonical = link.company;

    // Um modelo pode acumular selos (ex.: melhor custo-benefício E mais rápido).
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

    // Nome do modelo vira link só quando existe na régua com o mesmo nome.
    const nameHtml = link.onRegua
      ? `<a class="qm-modellink" href="${link.href}" title="${escapeHtml(link.title)}">${escapeHtml(m.model)}<svg class="qm-goto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`
      : `<span class="qm-nolink" title="Ainda não está na régua">${escapeHtml(m.model)}</span>`;

    return `
      <article class="qm-rec${isBest ? ' is-best' : ''}">
        <div class="qm-rec-slots">${tags}</div>
        <div class="qm-rec-id">
          ${companyMark(m.creator)}
          <div class="qm-rec-names">
            <span class="qm-rec-model">${nameHtml}${openTag}</span>
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
      const link = reguaLink(m);
      const nameHtml = link.onRegua
        ? `<a class="qm-row-model qm-modellink" href="${link.href}" title="${escapeHtml(link.title)}">${escapeHtml(m.model)}</a>`
        : `<span class="qm-row-model qm-nolink" title="Ainda não está na régua">${escapeHtml(m.model)}</span>`;
      return `
        <li class="qm-row${i === 0 ? ' is-first' : ''}">
          <span class="qm-rank">${i + 1}</span>
          <span class="qm-row-name">
            <span class="qm-dot" style="background:${color}"></span>
            ${nameHtml}
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
    // Categoria sem dados fica VISÍVEL como indisponível. Escondê-la faria o
    // benchmark aposentado pela AA (ex.: terminalbench_v2_1 -> v3) sumir a
    // categoria inteira da página sem ninguém perceber.
    if (!bench || !bench.top.length) {
      return `
        <section class="qm-cat is-unavailable" id="cat-${cat.id}">
          <header class="qm-cat-hd">
            <h2>${escapeHtml(cat.label)}</h2>
            <p>${escapeHtml(cat.question)}</p>
          </header>
          <p class="qm-unavailable">
            Sem dados nesta rodada — o teste que embasa esta categoria
            (<code>${escapeHtml(cat.primary)}</code>) não veio na última coleta.
          </p>
        </section>`;
    }

    const recs = pickRecommendations(bench.top);
    const best = bench.top[0];
    const support = cat.support
      .map(k => bmData.benchmarks.find(b => b.key === k))
      .filter(Boolean);

    const supportTxt = support.length
      ? ` · também medido por ${support.map(b => b.label).join(', ')}`
      : '';

    const cov = coverage(bench);
    const covTxt = cov
      ? ` <span class="qm-cov">${cov.on} de ${cov.total} estão na régua</span>`
      : '';

    return `
      <section class="qm-cat" id="cat-${cat.id}">
        <header class="qm-cat-hd">
          <h2>${escapeHtml(cat.label)}</h2>
          <p>${escapeHtml(cat.question)}</p>
        </header>
        <div class="qm-trio">${recs.map(r => recCard(r, bench, best)).join('')}</div>
        <details class="qm-full">
          <summary>Ranking completo — ${bench.top.length} modelos${covTxt}</summary>
          <ul class="qm-list">${fullList(bench)}</ul>
          <p class="qm-src">
            Base: <strong>${escapeHtml(bench.label)}</strong> — ${escapeHtml(bench.description)}.
            ${bench.models_evaluated} avaliações${supportTxt}.
          </p>
        </details>
      </section>`;
  }

  // ─── Índice da régua (planilha) ───
  // Sabendo quais modelos estão na régua, o guia linka para a pílula certa e
  // mostra a cobertura — o que também expõe o que falta cadastrar na planilha.
  function parseSheetRows(data) {
    const rows = [];
    if (!data || !data.table || !data.table.rows) return rows;
    for (const row of data.table.rows.slice(1)) {   // pula o cabeçalho
      const c = row.c;
      if (!c || !c[0] || !c[1] || !c[2]) continue;
      if (!c[5] || String(c[5].v || '').toLowerCase() !== 'publicado') continue;
      rows.push({ emp: String(c[1].v || '').trim(), mod: String(c[2].v || '').trim() });
    }
    return rows;
  }

  function rowsFromCache() {
    try {
      const raw = sessionStorage.getItem(CONFIG.CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts || !Array.isArray(obj.rows)) return null;
      if (Date.now() - obj.ts > CONFIG.CACHE_TTL_MS) return null;
      return obj.rows;
    } catch (e) {
      return null;
    }
  }

  async function loadRegua() {
    // Se a timeline foi aberta nesta sessão, reaproveita o cache dela.
    let rows = rowsFromCache();
    if (!rows) {
      try {
        rows = parseSheetRows(await gvizFetch(CONFIG.SHEET_TABS[0]));
      } catch (e) {
        console.warn('Régua indisponível — o guia segue sem os links:', e);
        return null;   // degrada: nomes viram texto simples, sem cobertura
      }
    }
    const idx = new Map();
    for (const r of rows) {
      if (r && r.mod) idx.set(normModel(r.mod), { emp: r.emp, mod: r.mod });
    }
    return idx;
  }

  // ─── Índice de navegação entre categorias ───
  function renderNav() {
    const el = document.getElementById('qm-nav');
    if (!el) return;
    // Todas as categorias entram no índice, inclusive as sem dados: a seção
    // delas existe na página (marcada como indisponível), então o link tem
    // destino — e a ausência fica visível em vez de silenciosa.
    el.innerHTML = CATEGORIES
      .map(c => {
        const b = bmData.benchmarks.find(x => x.key === c.primary);
        const off = (!b || !b.top.length) ? ' is-off' : '';
        return `<a class="qm-navlink${off}" href="#cat-${c.id}">${escapeHtml(c.label)}</a>`;
      })
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
    // A régua é complementar: se a planilha falhar, o guia renderiza igual,
    // só sem os links e sem a linha de cobertura.
    reguaIndex = await loadRegua();

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
