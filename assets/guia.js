/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Guia "Qual modelo usar"
   Traduz os benchmarks brutos (assets/benchmarks.json) em rankings
   por tipo de tarefa, com ordenação (mais capaz / custo-benefício /
   mais rápido), busca de modelo e comparação lado a lado.

   Por que a análise mora aqui e não no pipeline:
   a política (piso de qualidade, quais benchmarks representam cada
   categoria) é decisão editorial e muda mais que os dados. No
   navegador, ajustá-la não exige chave de API nem nova coleta — o
   benchmarks.json semanal é reaproveitado.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DATA_URL = 'assets/benchmarks.json';

  // Piso de qualidade das alternativas: um modelo só concorre a
  // "custo-benefício" ou "mais rápido" se ficar a até 12% do líder em
  // pontuação. Sem esse piso, o mais barato do ranking seria sempre o pior.
  const FLOOR = 0.88;

  // Teto de modelos na bandeja de comparação — mais que isso polui a tabela.
  const MAX_COMPARE = 4;

  /* ─── AS CATEGORIAS ───
     Cada categoria = UMA pergunta do usuário, respondida por UM benchmark
     principal (alguns são compostos da própria AA). Os de apoio entram só
     como contexto no "como medimos". Regra ao montar a lista: só existe
     categoria onde o dado ainda separa os modelos. Por isso não há categoria
     de Matemática — o AIME está saturado (>99%) e não distingue os atuais. */
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
      label: 'Instruções e dados',
      question: 'Seguir regras à risca, extrair campos, devolver formato fixo.',
      primary: 'ifbench',
      support: ['lcr'],
    },
  ];

  // Os três modos de ordenação viram os "filtros" da lista.
  const SORTS = {
    best: {
      key: 'best', label: 'Mais capaz',
      hint: 'Os modelos estão na ordem da pontuação nesta categoria. A barra mostra o quão perto cada um está do líder.',
      bar: 'pontos',
    },
    value: {
      key: 'value', label: 'Custo-benefício',
      hint: 'Ordenado pela melhor pontuação por dólar — não o mais barato, e sim o que entrega mais por cada real gasto. A barra mostra essa eficiência.',
      bar: 'pts/$',
    },
    fast: {
      key: 'fast', label: 'Mais rápido',
      hint: 'Ordenado pela velocidade de resposta, em tokens por segundo. A barra mostra a velocidade relativa.',
      bar: 'tok/s',
    },
  };

  // ─── Estado ───
  let bmData = null;
  let reguaIndex = null;   // Map(nome normalizado → linha da régua) ou null
  let modelIndex = null;   // Map(normModel → perfil do modelo entre categorias)
  let activeCat = CATEGORIES[0].id;
  let sortMode = 'best';
  const compare = [];      // chaves normModel selecionadas p/ comparação (ordem = inserção)

  // ─── Utilitários ───
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtScore(isFraction, v) {
    if (v == null) return '—';
    return isFraction ? `${Number(v).toFixed(1)}%` : String(v);
  }

  // Preço 0 na AA significa "sem preço publicado" (modelo aberto ou não ofertado
  // por API), não "de graça" — por isso é tratado como ausente, nunca grátis.
  function fmtPrice(v) {
    if (v == null || v <= 0) return null;
    return `$${v.toFixed(2)}/M`;
  }

  function fmtSpeed(v) {
    return v > 0 ? `${Math.round(v)} tok/s` : null;
  }

  // Identidade de um modelo para busca/comparação: nome normalizado SEM os
  // MODEL_ALIASES. Diferente de normModel (que aplica os aliases para linkar à
  // régua): aqui GPT-5.6 Sol, Terra e Luna são famílias DISTINTAS, com scores
  // próprios — colapsá-las via alias marcaria as três ao selecionar uma só.
  function idKey(name) {
    return String(name == null ? '' : name).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function catById(id) { return CATEGORIES.find(c => c.id === id); }
  function benchByKey(key) { return bmData.benchmarks.find(b => b.key === key); }
  function primaryBench(cat) { return benchByKey(cat.primary); }
  function hasData(cat) { const b = primaryBench(cat); return !!(b && b.top && b.top.length); }

  // Mapa idKey -> { score, rank, is_fraction } de TODAS as famílias avaliadas num
  // benchmark. Usa `full` (lista completa) quando existe; senão cai no `top`
  // (JSONs antigos, pré-`full`). Serve para a comparação e para os "outros
  // testes": devolve a nota e o posto de qualquer modelo, mesmo fora do top-20.
  function rankMap(bench) {
    const m = new Map();
    (bench.full || bench.top || []).forEach((x, i) => {
      m.set(idKey(x.model), { score: x.score, rank: i + 1, is_fraction: bench.is_fraction });
    });
    return m;
  }

  // ─── Marca da empresa (mesma fonte da régua: data.js) ───
  function companyMark(company, size) {
    const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(company) : company;
    const color = (typeof companyColor === 'function') ? companyColor(company) : '#6b6860';
    const logoKey = (typeof LOGO_MAP !== 'undefined') ? LOGO_MAP[canonical] : null;
    const path = (logoKey && typeof LOGO_PATHS !== 'undefined') ? LOGO_PATHS[logoKey] : null;
    const inner = path
      ? `<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">${path}</svg>`
      : `<span class="qm-mark-initial" aria-hidden="true">${escapeHtml(canonical.slice(0, 1))}</span>`;
    const cls = size === 'sm' ? 'qm-mark qm-mark-sm' : 'qm-mark';
    return `<span class="${cls}" style="background:${color}">${inner}</span>`;
  }

  // ─── Ligação com a régua ───
  // Linka pelo nome normalizado via MODEL_ALIASES (data.js). Aproximação fuzzy
  // NÃO acontece — só mapeamentos explícitos e versionados no git.
  function reguaHit(modelName) {
    return reguaIndex ? reguaIndex.get(normModel(modelName)) : null;
  }

  function modelNameHtml(modelName, cls) {
    const hit = reguaHit(modelName);
    if (hit) {
      const href = `index.html#emp=${encodeURIComponent(hit.emp)}&mod=${encodeURIComponent(hit.mod)}`;
      return `<a class="${cls} qm-modellink" href="${href}" title="Ver &quot;${escapeHtml(hit.mod)}&quot; na régua">${escapeHtml(modelName)}<svg class="qm-goto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`;
    }
    return `<span class="${cls} qm-nolink" title="Ainda não está na régua">${escapeHtml(modelName)}</span>`;
  }

  // Quantos modelos de um ranking existem na régua
  function coverage(bench) {
    if (!reguaIndex) return null;
    const total = bench.top.length;
    const on = bench.top.filter(m => reguaIndex.has(normModel(m.model))).length;
    return { on, total };
  }

  /* ─── Ordenação da lista ───
     Reordena o top-N da categoria pelo critério escolhido. Como o top-N já é o
     corte dos mais capazes, "custo-benefício" e "mais rápido" são sempre entre
     modelos que passam num piso de qualidade — o barato ruim nunca lidera.
     Cada item ganha `metric` (valor do critério) para desenhar a barra. */
  function rankedList(bench, mode) {
    const items = bench.top.map((m, i) => ({ m, baseRank: i + 1 }));
    if (mode === 'value') {
      const withP = items.filter(x => x.m.price_1m_blended > 0)
        .map(x => ({ ...x, metric: x.m.score / x.m.price_1m_blended }));
      const without = items.filter(x => !(x.m.price_1m_blended > 0)).map(x => ({ ...x, metric: 0 }));
      withP.sort((a, b) => b.metric - a.metric);
      return withP.concat(without);
    }
    if (mode === 'fast') {
      const withS = items.filter(x => x.m.tok_per_sec > 0).map(x => ({ ...x, metric: x.m.tok_per_sec }));
      const without = items.filter(x => !(x.m.tok_per_sec > 0)).map(x => ({ ...x, metric: 0 }));
      withS.sort((a, b) => b.metric - a.metric);
      return withS.concat(without);
    }
    // best — já vem por pontuação
    return items.map(x => ({ ...x, metric: x.m.score }));
  }

  // ─── Uma linha da lista ───
  function listRow(entry, bench, maxMetric, i, supportMaps) {
    const m = entry.m;
    const color = (typeof companyColor === 'function') ? companyColor(m.creator) : '#6b6860';
    const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(m.creator) : m.creator;
    const price = fmtPrice(m.price_1m_blended);
    const speed = fmtSpeed(m.tok_per_sec);
    const pct = maxMetric > 0 && entry.metric > 0 ? Math.max(4, (entry.metric / maxMetric) * 100) : 0;
    const key = idKey(m.model);
    const inCompare = compare.includes(key);
    const moved = sortMode !== 'best' && entry.baseRank !== i + 1;

    // "Outros testes" desta categoria: a nota do modelo em cada benchmark de
    // apoio (referência cruzada). Ocultos por padrão; visíveis quando o painel
    // ganha a classe is-show-extras (botão "ver outros testes").
    const extras = (supportMaps && supportMaps.length) ? `
        <div class="qm-row-extras">
          <span class="qm-extras-label">outros testes</span>
          ${supportMaps.map(({ bench: sb, map }) => {
            const s = map.get(key);
            const val = s ? fmtScore(sb.is_fraction, s.score) : '—';
            return `<span class="qm-extra"><span class="qm-extra-name">${escapeHtml(sb.label)}</span><span class="qm-extra-val${s ? '' : ' is-na'}">${val}</span></span>`;
          }).join('')}
        </div>` : '';

    return `
      <li class="qm-row${i === 0 ? ' is-first' : ''}">
        <span class="qm-rank">${i + 1}</span>
        <span class="qm-id">
          ${companyMark(m.creator, 'sm')}
          <span class="qm-id-text">
            <span class="qm-row-model-wrap">
              ${modelNameHtml(m.model, 'qm-row-model')}
              ${m.variant ? `<span class="qm-row-variant" title="Configuração: ${escapeHtml(m.variant)}">${escapeHtml(m.variant)}</span>` : ''}
            </span>
            <span class="qm-row-company">${escapeHtml(canonical)}${moved ? ` · ${entry.baseRank}º em capacidade` : ''}</span>
          </span>
        </span>
        <span class="qm-c qm-c-score${sortMode === 'best' ? ' is-active' : ''}">${fmtScore(bench.is_fraction, m.score)}</span>
        <span class="qm-c qm-c-price${sortMode === 'value' ? ' is-active' : ''}">${price ? escapeHtml(price) : '—'}</span>
        <span class="qm-c qm-c-speed${sortMode === 'fast' ? ' is-active' : ''}">${speed ? escapeHtml(speed) : '—'}</span>
        <span class="qm-barwrap"><span class="qm-bar" style="width:${pct}%;background:${color}"></span></span>
        <button class="qm-add${inCompare ? ' is-on' : ''}" data-add="${escapeHtml(key)}"
          title="${inCompare ? 'Remover da comparação' : 'Adicionar à comparação'}"
          aria-pressed="${inCompare ? 'true' : 'false'}" aria-label="${inCompare ? 'Remover' : 'Comparar'} ${escapeHtml(m.model)}">
          ${inCompare ? '✓' : '+'}
        </button>
        ${extras}
      </li>`;
  }

  // ─── Painel da categoria ativa (ordenação + como medimos + lista) ───
  function renderPanel() {
    const el = document.getElementById('qm-panel');
    if (!el) return;
    const cat = catById(activeCat);
    const bench = primaryBench(cat);

    if (!bench || !bench.top.length) {
      el.innerHTML = `
        <p class="qm-unavailable">
          Sem dados nesta rodada — o teste que embasa esta categoria
          (<code>${escapeHtml(cat.primary)}</code>) não veio na última coleta.
        </p>`;
      return;
    }

    const list = rankedList(bench, sortMode);
    const maxMetric = list.reduce((mx, x) => Math.max(mx, x.metric || 0), 0);
    const sort = SORTS[sortMode];

    const sortBtns = Object.values(SORTS).map(s =>
      `<button class="qm-sort${s.key === sortMode ? ' is-active' : ''}" data-sort="${s.key}">${s.label}</button>`
    ).join('');

    // Benchmarks de apoio da categoria — só os que trouxeram dados. `supportMaps`
    // alimenta tanto a explicação do "como medimos" quanto a linha "outros
    // testes" de cada modelo (nota dele em cada teste de apoio).
    const support = cat.support.map(k => benchByKey(k)).filter(b => b && b.top && b.top.length);
    const supportMaps = support.map(b => ({ bench: b, map: rankMap(b) }));
    const cov = coverage(bench);

    // "Como medimos" — o que é o número, de onde vem, e o papel do apoio.
    const method = `
      <details class="qm-method-cat">
        <summary><span class="qm-info-i" aria-hidden="true">i</span> como medimos esta categoria</summary>
        <div class="qm-method-body">
          <p><span class="qm-mtag qm-mtag-main">o número</span>
            A pontuação de cada modelo é a sua nota no <b>${escapeHtml(bench.label)}</b> —
            ${escapeHtml(bench.description)}. Escala: <b>${escapeHtml(bench.unit)}</b>.
            ${bench.is_fraction
              ? 'É a porcentagem de acerto — quanto mais alta, melhor.'
              : 'É um índice composto (0–100) montado pela Artificial Analysis — quanto mais alto, melhor.'}</p>
          <p><span class="qm-mtag qm-mtag-main">principal</span>
            <b>${escapeHtml(bench.label)}</b> é o teste que ordena este ranking.</p>
          ${support.length ? `
          <p><span class="qm-mtag">apoio</span>
            ${support.map(b => `<b>${escapeHtml(b.label)}</b>`).join(', ')} — medem a mesma área
            de outras formas. Não entram na posição do ranking: servem como referência cruzada.
            Toque em <em>ver outros testes desta categoria</em> para ver a nota de cada modelo neles.</p>` : ''}
          <p class="qm-method-foot">
            Dados da <b>Artificial Analysis</b> — testes independentes e padronizados.
            ${bench.models_evaluated} modelos avaliados no teste principal${
              cov ? ` · <b>${cov.on} de ${cov.total}</b> deste ranking também estão na régua` : ''}.
          </p>
        </div>
      </details>`;

    el.innerHTML = `
      <div class="qm-cat-hd">
        <div class="qm-cat-title"><h2>${escapeHtml(cat.label)}</h2><p>${escapeHtml(cat.question)}</p></div>
      </div>
      <div class="qm-toolbar">
        <div class="qm-sortgroup" role="group" aria-label="Ordenar por">
          <span class="qm-sortlabel">Ordenar por</span>
          ${sortBtns}
        </div>
        ${support.length ? `<button class="qm-extras-toggle" data-toggle-extras="1" aria-pressed="false">▸ ver outros testes desta categoria</button>` : ''}
      </div>
      <p class="qm-sorthint">${escapeHtml(sort.hint)}</p>
      ${method}
      <ol class="qm-list qm-list-headed">
        <li class="qm-row qm-head" aria-hidden="true">
          <span class="qm-rank">#</span>
          <span class="qm-id">Modelo</span>
          <span class="qm-c qm-c-score${sortMode === 'best' ? ' is-active' : ''}">Pontos</span>
          <span class="qm-c qm-c-price${sortMode === 'value' ? ' is-active' : ''}">Preço</span>
          <span class="qm-c qm-c-speed${sortMode === 'fast' ? ' is-active' : ''}">Veloc.</span>
          <span class="qm-barwrap qm-barhead">${escapeHtml(sort.bar)}</span>
          <span class="qm-add-head" title="Comparar">⇄</span>
        </li>
        ${list.map((e, i) => listRow(e, bench, maxMetric, i, supportMaps)).join('')}
      </ol>`;
  }

  // ─── Abas de categoria ───
  function renderTabs() {
    const el = document.getElementById('qm-tabs');
    if (!el) return;
    const cat = catById(activeCat);
    el.innerHTML = `
      <div class="qm-tabs-label">Selecione o tipo de tarefa</div>
      <div class="qm-tabs" role="tablist" aria-label="Categorias">
        ${CATEGORIES.map(c => {
          const off = hasData(c) ? '' : ' is-off';
          const active = c.id === activeCat ? ' is-active' : '';
          return `<button class="qm-tab${active}${off}" data-cat="${c.id}"${c.id === activeCat ? ' aria-current="true"' : ''}>${escapeHtml(c.label)}</button>`;
        }).join('')}
      </div>
      <p class="qm-tabs-caption">${escapeHtml(cat ? cat.question : '')}</p>`;
  }

  /* ─── Índice de modelos entre categorias ───
     Para a busca e a comparação: cada modelo distinto que aparece em ALGUMA das
     5 categorias, com sua pontuação e posição em cada uma. As notas/postos vêm
     do `full` (lista completa) quando existe — assim a comparação mostra um
     modelo em todas as categorias onde ele foi avaliado, mesmo se não estiver no
     top-20 exibido. Preço/velocidade só vivem no `top` (linhas ricas); por isso
     o enriquecimento é feito separadamente, a partir do `top`. */
  function buildModelIndex() {
    const idx = new Map();
    const ensure = (key, name, creator) => {
      let p = idx.get(key);
      if (!p) { p = { key, name, creator, cats: {}, price: null, speed: 0 }; idx.set(key, p); }
      return p;
    };
    for (const cat of CATEGORIES) {
      const bench = primaryBench(cat);
      if (!bench) continue;
      // Notas e postos: do ranking completo (fallback top em JSONs antigos).
      const source = bench.full || bench.top || [];
      source.forEach((m, i) => {
        const p = ensure(idKey(m.model), m.model, m.creator);
        p.cats[cat.id] = { score: m.score, rank: i + 1, is_fraction: bench.is_fraction };
      });
      // Preço/velocidade: só existem nas linhas ricas do `top`.
      (bench.top || []).forEach(m => {
        const p = ensure(idKey(m.model), m.model, m.creator);
        if (p.price == null && m.price_1m_blended > 0) p.price = m.price_1m_blended;
        if (!p.speed && m.tok_per_sec > 0) p.speed = m.tok_per_sec;
      });
    }
    return idx;
  }

  // ─── Sugestões de busca ───
  function renderSuggestions(q) {
    const box = document.getElementById('qm-suggest');
    if (!box) return;
    const query = String(q || '').trim().toLowerCase();
    if (!query) { box.innerHTML = ''; box.classList.remove('is-open'); return; }
    const nq = query.replace(/[^a-z0-9]/g, '');
    const hits = [...modelIndex.values()]
      .filter(p => p.name.toLowerCase().includes(query) || p.key.includes(nq))
      .filter(p => !compare.includes(p.key))
      .slice(0, 8);
    if (!hits.length) {
      box.innerHTML = `<div class="qm-sug-empty">Nenhum modelo com “${escapeHtml(q)}” nos rankings.</div>`;
      box.classList.add('is-open');
      return;
    }
    box.innerHTML = hits.map(p => {
      const canonical = (typeof canonicalCompany === 'function') ? canonicalCompany(p.creator) : p.creator;
      const nCats = Object.keys(p.cats).length;
      return `<button class="qm-sug" data-add="${escapeHtml(p.key)}">
        ${companyMark(p.creator, 'sm')}
        <span class="qm-sug-name">${escapeHtml(p.name)}</span>
        <span class="qm-sug-co">${escapeHtml(canonical)}</span>
        <span class="qm-sug-n">${nCats} cat.</span>
      </button>`;
    }).join('');
    box.classList.add('is-open');
  }

  // ─── Bandeja de comparação ───
  // O conteúdo vive dentro de <details class="qm-compare"> (o acordeão "Quer
  // comparar modelos?"). Aqui só preenchemos #qm-cmp-content — o elemento
  // <details>/<summary> é montado uma vez em init(), para não resetar o estado
  // aberto/fechado a cada toggle de modelo.
  function renderCompare() {
    const el = document.getElementById('qm-cmp-content');
    if (!el) return;
    const chips = compare.map(k => {
      const p = modelIndex.get(k);
      if (!p) return '';
      return `<span class="qm-chip" style="border-color:${companyColor(p.creator)}">
        ${companyMark(p.creator, 'sm')}<span>${escapeHtml(p.name)}</span>
        <button class="qm-chip-x" data-add="${escapeHtml(k)}" aria-label="Remover ${escapeHtml(p.name)}">×</button>
      </span>`;
    }).join('');

    let table = '';
    if (compare.length) {
      const models = compare.map(k => modelIndex.get(k)).filter(Boolean);
      const rowFor = (cat) => {
        const cells = models.map(p => {
          const c = p.cats[cat.id];
          if (!c) return `<td class="qm-cmp-out">—</td>`;
          const lead = c.rank === 1 ? ' is-lead' : '';
          return `<td class="qm-cmp-v${lead}">${fmtScore(c.is_fraction, c.score)}<span class="qm-cmp-rank">#${c.rank}</span></td>`;
        }).join('');
        return `<tr><th scope="row">${escapeHtml(cat.label)}</th>${cells}</tr>`;
      };
      const priceRow = `<tr class="qm-cmp-sep"><th scope="row">Preço</th>${
        models.map(p => `<td>${p.price != null ? escapeHtml(fmtPrice(p.price)) : '—'}</td>`).join('')}</tr>`;
      const speedRow = `<tr><th scope="row">Velocidade</th>${
        models.map(p => `<td>${p.speed > 0 ? escapeHtml(fmtSpeed(p.speed)) : '—'}</td>`).join('')}</tr>`;
      const headCols = models.map(p =>
        `<th scope="col"><span class="qm-cmp-h">${companyMark(p.creator, 'sm')}<span>${escapeHtml(p.name)}</span></span></th>`).join('');
      table = `
        <div class="qm-cmp-scroll">
          <table class="qm-cmp-table">
            <thead><tr><th scope="col" class="qm-cmp-corner">Desempenho</th>${headCols}</tr></thead>
            <tbody>
              ${CATEGORIES.map(rowFor).join('')}
              ${priceRow}
              ${speedRow}
            </tbody>
          </table>
        </div>
        <p class="qm-cmp-note">Pontuação e posição de cada modelo em cada categoria. “—” = o modelo não foi avaliado naquele teste. <span class="qm-cmp-lead-key">#1</span> = líder da categoria.</p>`;
    } else {
      table = `<p class="qm-cmp-hint">Busque um modelo acima ou toque no <b>+</b> de uma linha para comparar até ${MAX_COMPARE} modelos, lado a lado, em todas as categorias.</p>`;
    }

    el.innerHTML = `
      <div class="qm-cmp-hd">
        <h3>Comparar modelos</h3>
        <div class="qm-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" id="qm-searchinput" placeholder="Buscar um modelo…" autocomplete="off"
            aria-label="Buscar modelo para comparar"${compare.length >= MAX_COMPARE ? ' disabled' : ''}>
          <div class="qm-suggest" id="qm-suggest"></div>
        </div>
      </div>
      ${compare.length ? `<div class="qm-chips">${chips}${compare.length >= MAX_COMPARE ? `<span class="qm-chip-max">máx. ${MAX_COMPARE}</span>` : ''}<button class="qm-chip-clear" data-clear="1">limpar</button></div>` : ''}
      ${table}`;
  }

  // ─── Meta / rodapé ───
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

  // ─── Ações ───
  function setCat(id) {
    if (id === activeCat || !catById(id)) return;
    activeCat = id;
    renderTabs();
    renderPanel();
    if (window.gtag) gtag('event', 'troca_categoria', { categoria: id });
  }

  function setSort(mode) {
    if (mode === sortMode || !SORTS[mode]) return;
    sortMode = mode;
    renderPanel();
    if (window.gtag) gtag('event', 'ordena_lista', { modo: mode, categoria: activeCat });
  }

  function toggleCompare(key) {
    if (!modelIndex.has(key)) return;
    const at = compare.indexOf(key);
    if (at >= 0) {
      compare.splice(at, 1);
    } else {
      if (compare.length >= MAX_COMPARE) return;
      compare.push(key);
      if (window.gtag) gtag('event', 'compara_modelos', { n: compare.length });
      // Abre o acordeão de comparação ao adicionar via lista, para o usuário
      // ver imediatamente a tabela montada.
      const det = document.getElementById('qm-compare');
      if (det) det.open = true;
    }
    renderPanel();      // atualiza o estado dos botões + na lista
    renderCompare();
    const inp = document.getElementById('qm-searchinput');
    if (inp) inp.value = '';
    const sug = document.getElementById('qm-suggest');
    if (sug) { sug.innerHTML = ''; sug.classList.remove('is-open'); }
  }

  function clearCompare() {
    compare.length = 0;
    renderPanel();
    renderCompare();
  }

  // ─── Delegação de eventos ───
  function bindEvents(root) {
    root.addEventListener('click', (ev) => {
      const tab = ev.target.closest('.qm-tab');
      if (tab && !tab.classList.contains('is-off')) { setCat(tab.dataset.cat); return; }
      const sort = ev.target.closest('.qm-sort');
      if (sort) { setSort(sort.dataset.sort); return; }
      const tog = ev.target.closest('[data-toggle-extras]');
      if (tog) {
        const panel = document.getElementById('qm-panel');
        if (panel) {
          const on = panel.classList.toggle('is-show-extras');
          tog.setAttribute('aria-pressed', on ? 'true' : 'false');
          tog.textContent = on ? '▾ ocultar outros testes' : '▸ ver outros testes desta categoria';
        }
        return;
      }
      const add = ev.target.closest('[data-add]');
      if (add) { toggleCompare(add.dataset.add); return; }
      const clr = ev.target.closest('[data-clear]');
      if (clr) { clearCompare(); return; }
    });

    root.addEventListener('input', (ev) => {
      if (ev.target.id === 'qm-searchinput') renderSuggestions(ev.target.value);
    });

    // Fecha as sugestões ao clicar fora
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.qm-search')) {
        const sug = document.getElementById('qm-suggest');
        if (sug) sug.classList.remove('is-open');
      }
    });
  }

  // ─── Índice da régua (planilha) ───
  function parseSheetRows(data) {
    const rows = [];
    if (!data || !data.table || !data.table.rows) return rows;
    for (const row of data.table.rows.slice(1)) {
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
    } catch (e) { return null; }
  }

  async function loadRegua() {
    let rows = rowsFromCache();
    if (!rows) {
      try {
        rows = parseSheetRows(await gvizFetch(CONFIG.SHEET_TABS[0]));
      } catch (e) {
        console.warn('Régua indisponível — o guia segue sem os links:', e);
        return null;
      }
    }
    const idx = new Map();
    for (const r of rows) {
      if (r && r.mod) idx.set(normModel(r.mod), { emp: r.emp, mod: r.mod });
    }
    return idx;
  }

  // ─── Boot ───
  async function init() {
    const root = document.getElementById('qm-root');
    if (!root) return;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      bmData = await res.json();
    } catch (e) {
      console.error('Falha ao carregar benchmarks.json:', e);
      root.innerHTML = location.protocol === 'file:'
        ? '<p class="qm-empty">Esta página precisa ser aberta por um servidor HTTP.<br>' +
          'Abrindo o arquivo direto (<code>file://</code>), o navegador bloqueia a leitura ' +
          'do <code>benchmarks.json</code>.<br>Rode <code>npx serve</code> na pasta do projeto ' +
          'ou acesse a versão publicada.</p>'
        : '<p class="qm-empty">Não foi possível carregar os dados de benchmark agora.</p>';
      return;
    }

    // Primeira categoria com dados vira a ativa (evita abrir numa vazia).
    const firstOk = CATEGORIES.find(hasData);
    if (firstOk) activeCat = firstOk.id;

    modelIndex = buildModelIndex();

    // A régua é complementar: se a planilha falhar, o guia renderiza igual,
    // só sem os links e sem a linha de cobertura.
    reguaIndex = await loadRegua();

    renderMeta();
    root.innerHTML = `
      <details class="qm-compare" id="qm-compare">
        <summary class="qm-cmp-toggle">
          <span class="qm-cmp-toggle-ico" aria-hidden="true">⇄</span>
          <span class="qm-cmp-toggle-text">Quer comparar modelos?</span>
          <span class="qm-cmp-toggle-hint">Busque um modelo ou toque no <b>+</b> de uma linha — até ${MAX_COMPARE} lado a lado, em todas as categorias.</span>
          <span class="qm-cmp-toggle-chev" aria-hidden="true">›</span>
        </summary>
        <div class="qm-cmp-content" id="qm-cmp-content"></div>
      </details>
      <div id="qm-tabs"></div>
      <div class="qm-panel" id="qm-panel"></div>`;

    renderTabs();
    renderPanel();
    renderCompare();
    bindEvents(root);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
