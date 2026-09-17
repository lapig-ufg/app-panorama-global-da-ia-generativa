/* ═══════════════════════════════════════════════════════════════
   Generative AI Global Landscape — "Which model to use" Guide
   Translates raw benchmarks (assets/benchmarks.json) into rankings
   by task type, with sorting (most capable / best value /
   fastest), model search, and side-by-side comparison.

   Why the analysis lives here and not in the pipeline:
   policy (quality floor, which benchmarks represent each
   category) is an editorial decision and changes more often than the data.
   In the browser, adjusting it requires no API key or new collection — the
   weekly benchmarks.json is reused.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DATA_URL = '../assets/benchmarks-en.json';

  // Quality floor for alternatives: a model only competes for
  // "best value" or "fastest" if it is within 12% of the leader's
  // score. Without this floor, the cheapest in the ranking would always be the worst.
  const FLOOR = 0.88;

  // Maximum number of models in the comparison tray — more than this clutters the table.
  const MAX_COMPARE = 4;

  // Source methodology — linked in the "how we measure" section of every category. The reader
  // needs to be able to reach the index definition in one click; previously the only
  // link was to the AA homepage.
  const AA_METHOD_URL = 'https://artificialanalysis.ai/methodology/intelligence-benchmarking';

  /* ─── THE CATEGORIES ───
     Each category = ONE user question, answered by ONE primary benchmark
     (currently the three are composite indices from AA itself). The support
     benchmarks measure the same area in different ways: they appear only as cross-references
     in "how we measure" and in the "other tests" row — never in the position calculation.
     Rule when building the list: a category only exists where the data still separates
     the models. This is why there is no Mathematics category — AIME is saturated
     (>99%) and does not distinguish current top models.

     Stagnant support benchmarks were removed (Jul/24/2026): MMLU-Pro, LiveCodeBench, and
     AIME 2025 did not evaluate current top models — matching 0/20 and only
     generating "—". At runtime, supports matching fewer than 5 of the top 20 models in the
     main ranking are also hidden (safeguard against future staleness).
     With the free key NO support exists (they are all Pro-only): the "support" block and
     the "see other tests" button do not render. They are intentionally declared —
     they will return on their own if the key becomes Pro.

     ── Reduction from 5 to 3 categories (Aug/5/2026) ──
     AA shut down the legacy endpoint and started serving individual benchmarks
     only on the Pro tier ($417/month). With the free key, only the 3 composite
     indices remain, and two categories lost their foundation:

       • "Research and reasoning" (was HLE) — the available substitute would be
         GPQA Diamond, but it is saturated (3.0 point spread in the top-15
         vs. a standard error of 1.59: the top positions are noise) and, worse, is
         an ingredient of the Intelligence Index itself. HLE was the most independent
         and has no free source: Scale's leaderboard stopped in Apr/2026 and
         aggregators covering the frontier publish numbers self-reported by
         the manufacturers themselves.
       • "Instructions and data" (was IFBench + AA-LCR) — no equivalent on the free tier.

     If the key becomes Pro, the pipeline restores the individual benchmarks on its own and
     these categories can return.

     ── ⚠ WHAT THESE THREE INDICES ACTUALLY ARE (Aug/5/2026) ──
     The Intelligence Index v4.1 is the weighted average of FOUR blocks:
     Agents 34% · Code 24% · Scientific reasoning 24% · General 18%.
     And the other two indices delivered by the free key ARE two of those blocks:
     `coding_index` = Code block, `agentic_index` = Agents block. That is,
     58% of the score on the first tab is literally the content of the other two.

     Two consequences for anyone working here:
       1. The first tab does NOT measure conversation, writing, or summarization — zero weight. That
          is why it stopped being called "General use" (which promised exactly
          that) and became "General capability", with a `caveat` saying what was left
          out. Do not describe it again as "the everyday model".
       2. The three lists sort almost identically (rho ~0.96; see `spearman()`, which
          calculates the number at runtime instead of hardcoding it in the text). This is
          declared in the "how we measure" section of each tab, via `overlapLine()`. The tabs
          continue to exist because they answer different questions and the
          MAGNITUDES differ — not because they produce independent orders.
     Weights verified in the AA methodology (AA_METHOD_URL). */
  const CATEGORIES = [
    {
      id: 'geral',
      label: 'Overall capability',
      question: 'Reasoning, knowledge and difficult tasks — the model’s capability ceiling.',
      primary: 'artificial_analysis_intelligence_index',
      support: ['gpqa_diamond', 'hle'],
      // The weights live here, and not in the `description` of benchmarks.json, because the
      // JSON only brings the list of acronyms — and it's the weight that changes the reading of the score.
      composition: {
        intro: '<b>v4.1</b>, a weighted average of four blocks',
        parts: [
          { part: 'Agents', weight: '34%', tests: 'GDPval-AA v2 (20%) — professional tasks across 44 occupations; τ³-Banking (14%) — service tasks using tools' },
          { part: 'Coding', weight: '24%', tests: 'Terminal-Bench v2.1 (16%) — real software engineering; SciCode (8%) — scientific computing' },
          { part: 'Scientific reasoning', weight: '24%', tests: 'Humanity’s Last Exam (12%); GPQA Diamond (6%) — doctoral level; CritPt (6%) — research physics' },
          { part: 'General', weight: '18%', tests: 'AA-Omniscience (12%) — knowledge and hallucination rate; AA-LCR (6%) — long-document reading' },
        ],
      },
      // What the index does NOT measure. Previously the page promised exactly this.
      caveat: 'None of the nine tests measures conversation, writing or summarization quality. ' +
              'This score reflects the model’s ceiling on difficult tasks, not its everyday usefulness — ' +
              'almost any model on this list can write an email or summarize text.',
      // Answers the question that disappeared along with the "Research and
      // reasoning" category. Honest version: the reason isn't an "external" correlation
      // (GPQA is an ingredient in the index — citing it as proof was circular),
      // but rather that the research block is ALREADY built into this score.
      note: 'There is no separate research ranking because research is already included here: ' +
            'the scientific-reasoning block represents 24% of the score — Humanity’s Last Exam (12%), ' +
            'GPQA Diamond (6%) and CritPt (6%), all at doctoral level. ' +
            'This same list applies to academic work.',
    },
    {
      id: 'codigo',
      label: 'Coding',
      question: 'Write, review and fix code.',
      primary: 'artificial_analysis_coding_index',
      support: ['scicode'],
      // This index is one of the four blocks of the Intelligence Index — declared
      // here so that "how we measure" can tell the reader this with the correct weight.
      blockLabel: 'Coding', blockWeight: '24%',
      composition: {
        intro: 'a closer look at the <b>coding</b> block of the Intelligence Index (24% of the overall score)',
        parts: [
          { part: 'Terminal-Bench v2.1', weight: '2/3', tests: 'verified software-engineering and systems-administration tasks' },
          { part: 'SciCode', weight: '1/3', tests: 'scientific-computing problems in Python' },
        ],
      },
      caveat: 'Both tests cover back-end and command-line work. <b>Artificial Analysis does not evaluate front-end work</b> — ' +
              'this score says nothing about interface development.',
    },
    {
      id: 'agentes',
      label: 'Agents and automation',
      question: 'Complete tasks autonomously using terminals, tools and APIs.',
      primary: 'artificial_analysis_agentic_index',
      support: ['terminalbench_v2_1', 'tau2_telecom'],
      blockLabel: 'Agents', blockWeight: '34%',
      composition: {
        intro: 'a closer look at the <b>agents</b> block of the Intelligence Index (34% of the overall score, the largest block)',
        parts: [
          { part: 'GDPval-AA v2', weight: '20/34', tests: 'real economic-value tasks across 44 occupations' },
          { part: 'τ³-Banking', weight: '14/34', tests: 'multi-step financial service with information retrieval and tool use' },
        ],
      },
    },
  ];

  // The three sorting modes become the "filters" of the list.
  const SORTS = {
    best: {
      key: 'best', label: 'Most capable',
      hint: 'Models are ordered by their score in this category. The bar shows how close each one is to the leader.',
      bar: 'pontos',
    },
    value: {
      key: 'value', label: 'Best value',
      hint: 'Ordered by the best score per dollar — not the cheapest model, but the one that delivers the most per dollar. The bar shows that efficiency.',
      bar: 'pts/$',
    },
    fast: {
      key: 'fast', label: 'Fastest',
      hint: 'Ordered by response speed in tokens per second. The bar shows relative speed.',
      bar: 'tok/s',
    },
  };

  // ─── State ───
  let bmData = null;
  let reguaIndex = null;   // Map(normalized name → ruler row) or null
  let modelIndex = null;   // Map(normModel → model profile across categories)
  let activeCat = CATEGORIES[0].id;
  let sortMode = 'best';
  const compare = [];      // normModel keys selected for comparison (order = insertion)

  // ─── Utilities ───
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtScore(isFraction, v) {
    if (v == null) return '—';
    return isFraction ? `${Number(v).toFixed(1)}%` : String(v);
  }

  // Price 0 on AA means "no published price" (open model or not offered
  // via API), not "free" — so it's treated as absent, never free.
  function fmtPrice(v) {
    if (v == null || v <= 0) return null;
    return `$${v.toFixed(2)}/M`;
  }

  function fmtSpeed(v) {
    return v > 0 ? `${Math.round(v)} tok/s` : null;
  }

  // Identity of a model for search/comparison: normalized name WITHOUT the
  // MODEL_ALIASES. Different from normModel (which applies aliases to link to
  // the ruler): here GPT-5.6 Sol, Terra, and Luna are DISTINCT families, with their own
  // scores — collapsing them via alias would mark all three when selecting just one.
  function idKey(name) {
    return String(name == null ? '' : name).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function catById(id) { return CATEGORIES.find(c => c.id === id); }
  function benchByKey(key) { return bmData.benchmarks.find(b => b.key === key); }
  function primaryBench(cat) { return benchByKey(cat.primary); }
  function hasData(cat) { const b = primaryBench(cat); return !!(b && b.top && b.top.length); }

  // Map idKey -> { score, rank, is_fraction } of ALL families evaluated in a
  // benchmark. Uses `full` (complete list) when it exists; otherwise falls back to `top`
  // (old JSONs, pre-`full`). Serves for comparison and "other
  // tests": returns the score and rank of any model, even outside the top-20.
  function rankMap(bench) {
    const m = new Map();
    (bench.full || bench.top || []).forEach((x, i) => {
      m.set(idKey(x.model), { score: x.score, rank: i + 1, is_fraction: bench.is_fraction });
    });
    return m;
  }

  // Highest score in the benchmark (the leader) — to scale the bar of the
  // "other tests" relative to the top of that test, not an arbitrary range.
  function maxScore(bench) {
    let mx = 0;
    for (const x of (bench.full || bench.top || [])) if (x.score > mx) mx = x.score;
    return mx;
  }

  /* ─── Rank correlation between two rankings ───
     Serves to DECLARE to the reader how much two tabs repeat the same order —
     necessary because the three categories are the same index and two blocks of it.
     Calculated at runtime, intentionally: if AA changes the index composition,
     the number on the site follows it instead of becoming an old statement hardcoded in
     text. Ranks are recalculated WITHIN the intersection (using the position in
     the original list would give rho outside [-1,1] when the lists have
     different sizes). Ties are rare here and handled by score order. */
  function spearman(benchA, benchB) {
    if (!benchA || !benchB) return null;
    const A = new Map((benchA.full || benchA.top || []).map(x => [idKey(x.model), x.score]));
    const B = new Map((benchB.full || benchB.top || []).map(x => [idKey(x.model), x.score]));
    const keys = [...A.keys()].filter(k => B.has(k));
    const n = keys.length;
    if (n < 10) return null; // intersection too small to assert anything
    const ranksOf = (M) => {
      const r = new Map();
      keys.slice().sort((a, b) => M.get(b) - M.get(a)).forEach((k, i) => r.set(k, i + 1));
      return r;
    };
    const ra = ranksOf(A), rb = ranksOf(B);
    let sd = 0;
    for (const k of keys) { const d = ra.get(k) - rb.get(k); sd += d * d; }
    return { rho: 1 - (6 * sd) / (n * (n * n - 1)), n };
  }

  // How many of the top 20 in one ranking are also in the top 20 of the other.
  function topOverlap(benchA, benchB) {
    const a = (benchA.top || []).slice(0, 20).map(x => idKey(x.model));
    const b = new Set((benchB.top || []).slice(0, 20).map(x => idKey(x.model)));
    return { on: a.filter(k => b.has(k)).length, total: a.length };
  }

  /* Overlap phrase from "how we measure": which other category/ies
     does this list repeat the order of, with the measured number. The first tab (the full
     index) is compared against the other two; each block is compared against the
     full index it is part of. */
  function overlapLine(cat) {
    const mine = primaryBench(cat);
    if (!mine) return '';
    const others = CATEGORIES.filter(c => c.id !== cat.id && primaryBench(c));
    const bits = others.map(o => {
      const ob = primaryBench(o);
      const s = spearman(mine, ob);
      if (!s) return null;
      const ov = topOverlap(mine, ob);
      // Decimal comma: the rest of the page is pt-BR.
      const rho = s.rho.toFixed(2).replace('.', ',');
      return `<b>${escapeHtml(o.label)}</b> ${rho} ` +
             `<span class="qm-ov-detail">(${s.n} models in common; ${ov.on} of the top ${ov.total} overlap)</span>`;
    }).filter(Boolean);
    if (!bits.length) return '';

    const why = cat.id === 'geral'
      ? 'The other two tabs are blocks of <em>this same</em> index — Coding represents 24% and Agents 34%. Together they make up 58% of this score.'
      : `This list is the <b>${escapeHtml(cat.blockLabel || cat.label)}</b> block of the ` +
        `<b>Overall capability</b> (${escapeHtml(cat.blockWeight || '')} of its score), isolated — ` +
        'it is not an independent measure.';

    return `<p><span class="qm-mtag qm-mtag-warn">overlap</span>
      ${why} This is why the lists rank similarly — rank correlation:
      ${bits.join(' · ')}.
      What changes across tabs is less the order than the <b>distance</b> between models:
      a model may lead clearly in one block and tie in another.</p>`;
  }

  // ─── Company mark (same source as the ruler: data.js) ───
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

  // ─── Link to the ruler ───
  // Links by normalized name via MODEL_ALIASES (data.js). Fuzzy matching
  // does NOT happen — only explicit, versioned mappings in git.
  function reguaHit(modelName) {
    return reguaIndex ? reguaIndex.get(normModel(modelName)) : null;
  }

  function modelNameHtml(modelName, cls) {
    const hit = reguaHit(modelName);
    if (hit) {
      const href = `index.html#emp=${encodeURIComponent(hit.emp)}&mod=${encodeURIComponent(hit.mod)}`;
      return `<a class="${cls} qm-modellink" href="${href}" title="View &quot;${escapeHtml(hit.mod)}&quot; on the timeline">${escapeHtml(modelName)}<svg class="qm-goto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`;
    }
    return `<span class="${cls} qm-nolink" title="Not yet on the timeline">${escapeHtml(modelName)}</span>`;
  }

  // How many models in a ranking exist on the ruler
  function coverage(bench) {
    if (!reguaIndex) return null;
    const total = bench.top.length;
    const on = bench.top.filter(m => reguaIndex.has(normModel(m.model))).length;
    return { on, total };
  }

  /* ─── List sorting ───
     Re-sorts the top-N of the category by the chosen criterion. Since the top-N is already the
     cutoff of the most capable, "best value" and "fastest" are always among
     models that pass a quality floor — bad cheap never leads.
     Each item gets `metric` (value of the criterion) to draw the bar. */
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
    // best — already comes by score
    return items.map(x => ({ ...x, metric: x.m.score }));
  }

  // ─── One row of the list ───
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

    // "Other tests" for this category: the model's score in each support
    // benchmark (cross-reference), with a bar relative to the leader of that
    // test. Hidden by default; visible when the panel gets the
    // is-show-extras class ("see other tests" button). We only render the support
    // when the model has a real score — no score, omit (no "—").
    const extras = (() => {
      if (!supportMaps || !supportMaps.length) return '';
      const items = supportMaps.map(({ bench: sb, map, max }) => {
        const s = map.get(key);
        if (!s) return ''; // model not evaluated in this support: omit
        const val = fmtScore(sb.is_fraction, s.score);
        const barPct = max > 0 ? Math.max(3, (s.score / max) * 100) : 0;
        return `<span class="qm-extra">
              <span class="qm-extra-name">${escapeHtml(sb.label)}</span>
              <span class="qm-extra-barwrap"><span class="qm-extra-bar" style="width:${barPct}%;background:${color}"></span></span>
              <span class="qm-extra-val">${val}</span>
            </span>`;
      }).join('');
      return items ? `
        <div class="qm-row-extras">
          <span class="qm-extras-label">other tests</span>
          ${items}
        </div>` : '';
    })();

    return `
      <li class="qm-row${i === 0 ? ' is-first' : ''}">
        <span class="qm-rank">${i + 1}</span>
        <span class="qm-id">
          ${companyMark(m.creator, 'sm')}
          <span class="qm-id-text">
            <span class="qm-row-model-wrap">
              ${modelNameHtml(m.model, 'qm-row-model')}
              ${m.variant ? `<span class="qm-row-variant" title="Configuration: ${escapeHtml(m.variant)}">${escapeHtml(m.variant)}</span>` : ''}
            </span>
            <span class="qm-row-company">${escapeHtml(canonical)}${moved ? ` · ${entry.baseRank}º in capability` : ''}</span>
          </span>
        </span>
        <span class="qm-c qm-c-score${sortMode === 'best' ? ' is-active' : ''}">${fmtScore(bench.is_fraction, m.score)}</span>
        <span class="qm-c qm-c-price${sortMode === 'value' ? ' is-active' : ''}">${price ? escapeHtml(price) : '—'}</span>
        <span class="qm-c qm-c-speed${sortMode === 'fast' ? ' is-active' : ''}">${speed ? escapeHtml(speed) : '—'}</span>
        <span class="qm-barwrap"><span class="qm-bar" style="width:${pct}%;background:${color}"></span></span>
        <button class="qm-add${inCompare ? ' is-on' : ''}" data-add="${escapeHtml(key)}"
          title="${inCompare ? 'Remove from comparison' : 'Add to comparison'}"
          aria-pressed="${inCompare ? 'true' : 'false'}" aria-label="${inCompare ? 'Remove' : 'Compare'} ${escapeHtml(m.model)}">
          ${inCompare ? '✓' : '+'}
        </button>
        ${extras}
      </li>`;
  }

  // ─── Active category panel (sorting + how we measure + list) ───
  function renderPanel() {
    const el = document.getElementById('qm-panel');
    if (!el) return;
    const cat = catById(activeCat);
    const bench = primaryBench(cat);

    if (!bench || !bench.top.length) {
      el.innerHTML = `
        <p class="qm-unavailable">
          No data in this run — the test supporting this category
          (<code>${escapeHtml(cat.primary)}</code>) was not included in the latest collection.
        </p>`;
      return;
    }

    const list = rankedList(bench, sortMode);
    const maxMetric = list.reduce((mx, x) => Math.max(mx, x.metric || 0), 0);
    const sort = SORTS[sortMode];

    const sortBtns = Object.values(SORTS).map(s =>
      `<button class="qm-sort${s.key === sortMode ? ' is-active' : ''}" data-sort="${s.key}">${s.label}</button>`
    ).join('');

    // Support benchmarks for the category — only those matching current models.
    // Discards stagnant supports (did not evaluate top models of the main
    // ranking): match < 5 of 20 and would only generate "—". Safeguard against future
    // source staleness. `supportMaps` feeds the "how we measure" and the "other tests" line
    // of each model (score + bar relative to the support leader).
    const supportMaps = cat.support
      .map(k => benchByKey(k))
      .filter(b => b && b.top && b.top.length)
      .map(b => ({ bench: b, map: rankMap(b), max: maxScore(b) }))
      .filter(sm => bench.top.filter(m => sm.map.has(idKey(m.model))).length >= 5);
    const support = supportMaps.map(sm => sm.bench);
    const cov = coverage(bench);

    /* "How we measure" — what the number is, what it's made of (with WEIGHTS), what
       it doesn't measure, how much it repeats the other tabs, and the role of the support.
       The composition comes from `cat.composition` (editorial, with weights) and not from
       `bench.description` from the JSON, which is just a dump of acronyms without weights. */
    const comp = cat.composition;
    const method = `
      <details class="qm-method-cat">
        <summary><span class="qm-info-i" aria-hidden="true">i</span> how this category is measured</summary>
        <div class="qm-method-body">
          <p><span class="qm-mtag qm-mtag-main">the score</span>
            Each model’s score is its result on <b>${escapeHtml(bench.label)}</b> —
            ${comp ? comp.intro : escapeHtml(bench.description)}.
            Scale: <b>${escapeHtml(bench.unit)}</b> —
            ${bench.is_fraction ? 'accuracy percentage' : 'composite index, 0–100'}, higher is better.</p>
          ${comp ? `
          <p><span class="qm-mtag qm-mtag-main">composition</span>
            What the score contains and how much each part weighs:</p>
          <ul class="qm-comp">
            ${comp.parts.map(p => `
              <li><span class="qm-comp-w">${escapeHtml(p.weight)}</span>
                <span class="qm-comp-t"><b>${escapeHtml(p.part)}</b> — ${escapeHtml(p.tests)}</span></li>`).join('')}
          </ul>` : ''}
          ${cat.caveat ? `
          <p><span class="qm-mtag qm-mtag-warn">not measured</span> ${cat.caveat}</p>` : ''}
          ${overlapLine(cat)}
          ${support.length ? `
          <p><span class="qm-mtag">supporting tests</span>
            ${support.map(b => `<b>${escapeHtml(b.label)}</b>`).join(', ')} — measure the same area
            in other ways. They do not affect the ranking position and serve as cross-references.
            Select <em>view other tests in this category</em> to see each model’s score on them.</p>` : ''}
          ${cat.note ? `
          <p><span class="qm-mtag">note</span> ${escapeHtml(cat.note)}</p>` : ''}
          <p class="qm-method-foot">
            Measurements come from <b>Artificial Analysis</b>, which <b>runs the tests independently</b>,
            using the same protocol for every model rather than republishing vendor claims.
            ${bench.models_evaluated} models evaluated in this index${
              cov ? ` · <b>${cov.on} de ${cov.total}</b> from this ranking are also on the timeline` : ''}.
            <a href="${AA_METHOD_URL}" target="_blank" rel="noopener">Full methodology ↗</a>
          </p>
        </div>
      </details>`;

    el.innerHTML = `
      <div class="qm-cat-hd">
        <div class="qm-cat-title"><h2>${escapeHtml(cat.label)}</h2><p>${escapeHtml(cat.question)}</p></div>
      </div>
      <div class="qm-toolbar">
        <div class="qm-sortgroup" role="group" aria-label="Sort by">
          <span class="qm-sortlabel">Sort by</span>
          ${sortBtns}
        </div>
        ${support.length ? `<button class="qm-extras-toggle" data-toggle-extras="1" aria-pressed="false">▸ view other tests in this category</button>` : ''}
      </div>
      <p class="qm-sorthint">${escapeHtml(sort.hint)}</p>
      ${method}
      <ol class="qm-list qm-list-headed">
        <li class="qm-row qm-head" aria-hidden="true">
          <span class="qm-rank">#</span>
          <span class="qm-id">Model</span>
          <span class="qm-c qm-c-score${sortMode === 'best' ? ' is-active' : ''}">Score</span>
          <span class="qm-c qm-c-price${sortMode === 'value' ? ' is-active' : ''}">Price</span>
          <span class="qm-c qm-c-speed${sortMode === 'fast' ? ' is-active' : ''}">Speed</span>
          <span class="qm-barwrap qm-barhead">${escapeHtml(sort.bar)}</span>
          <span class="qm-add-head" title="Compare">⇄</span>
        </li>
        ${list.map((e, i) => listRow(e, bench, maxMetric, i, supportMaps)).join('')}
      </ol>`;
  }

  // ─── Category tabs ───
  function renderTabs() {
    const el = document.getElementById('qm-tabs');
    if (!el) return;
    const cat = catById(activeCat);
    el.innerHTML = `
      <div class="qm-tabs-label">Choose a use</div>
      <div class="qm-tabs" role="tablist" aria-label="Categories">
        ${CATEGORIES.map(c => {
          const off = hasData(c) ? '' : ' is-off';
          const active = c.id === activeCat ? ' is-active' : '';
          return `<button class="qm-tab${active}${off}" data-cat="${c.id}"${c.id === activeCat ? ' aria-current="true"' : ''}>${escapeHtml(c.label)}</button>`;
        }).join('')}
      </div>
      <p class="qm-tabs-caption">${escapeHtml(cat ? cat.question : '')}</p>`;
  }

  /* ─── Model index across categories ───
     For search and comparison: each distinct model that appears in ANY of the
     categories, with its score and position in each. Scores/ranks come
     from `full` (complete list) when it exists — so the comparison shows a
     model in all categories where it was evaluated, even if not in the
     displayed top-20. Price/speed only live in `top` (rich rows); that's why
     enrichment is done separately, from `top`. */
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
      // Scores and ranks: from the complete ranking (fallback top in old JSONs).
      const source = bench.full || bench.top || [];
      source.forEach((m, i) => {
        const p = ensure(idKey(m.model), m.model, m.creator);
        p.cats[cat.id] = { score: m.score, rank: i + 1, is_fraction: bench.is_fraction };
      });
      // Price/speed: only exist in the rich `top` rows.
      (bench.top || []).forEach(m => {
        const p = ensure(idKey(m.model), m.model, m.creator);
        if (p.price == null && m.price_1m_blended > 0) p.price = m.price_1m_blended;
        if (!p.speed && m.tok_per_sec > 0) p.speed = m.tok_per_sec;
      });
    }
    return idx;
  }

  // ─── Search suggestions ───
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
      box.innerHTML = `<div class="qm-sug-empty">No model matching “${escapeHtml(q)}” in the rankings.</div>`;
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

  // ─── Comparison tray ───
  // The content lives inside <details class="qm-compare"> (the "Want to
  // compare models?" accordion). Here we only fill #qm-cmp-content — the
  // <details>/<summary> element is mounted once in init(), to not reset the
  // open/closed state on every model toggle.
  function renderCompare() {
    const el = document.getElementById('qm-cmp-content');
    if (!el) return;
    const chips = compare.map(k => {
      const p = modelIndex.get(k);
      if (!p) return '';
      return `<span class="qm-chip" style="border-color:${companyColor(p.creator)}">
        ${companyMark(p.creator, 'sm')}<span>${escapeHtml(p.name)}</span>
        <button class="qm-chip-x" data-add="${escapeHtml(k)}" aria-label="Remove ${escapeHtml(p.name)}">×</button>
      </span>`;
    }).join('');

    let table = '';
    if (compare.length) {
      const models = compare.map(k => modelIndex.get(k)).filter(Boolean);
      // Who wins in each row: the best score AMONG the compared models
      // (not the global leader). Tied score = win for both. The scoreboard
      // only counts in capability categories — price and speed only get
      // highlighted in their own row.
      const wins = new Map(models.map(p => [p.key, 0]));
      const bestScoreAmong = (catId) => {
        let best = null;
        for (const p of models) {
          const c = p.cats[catId];
          if (c && (best === null || c.score > best)) best = c.score;
        }
        return best;
      };
      for (const cat of CATEGORIES) {
        const best = bestScoreAmong(cat.id);
        if (best === null) continue;
        for (const p of models) {
          const c = p.cats[cat.id];
          if (c && c.score === best) wins.set(p.key, (wins.get(p.key) || 0) + 1);
        }
      }
      const maxWins = models.reduce((mx, p) => Math.max(mx, wins.get(p.key) || 0), 0);

      const rowFor = (cat) => {
        const best = bestScoreAmong(cat.id);
        const cells = models.map(p => {
          const c = p.cats[cat.id];
          if (!c) return `<td class="qm-cmp-out">—</td>`;
          const cls = `qm-cmp-v${c.rank === 1 ? ' is-lead' : ''}${best !== null && c.score === best ? ' is-winner' : ''}`;
          return `<td class="${cls}">${fmtScore(c.is_fraction, c.score)}<span class="qm-cmp-rank">#${c.rank}</span></td>`;
        }).join('');
        return `<tr><th scope="row">${escapeHtml(cat.label)}</th>${cells}</tr>`;
      };
      // Price: lowest wins. Speed: highest wins.
      const priceVals = models.map(p => p.price).filter(v => v != null && v > 0);
      const minPrice = priceVals.length ? Math.min(...priceVals) : null;
      const speedVals = models.map(p => p.speed).filter(v => v > 0);
      const maxSpeed = speedVals.length ? Math.max(...speedVals) : null;
      const priceRow = `<tr class="qm-cmp-sep"><th scope="row">Price</th>${
        models.map(p => {
          const win = minPrice !== null && p.price === minPrice ? ' is-winner' : '';
          return `<td class="qm-cmp-v${win}">${p.price != null ? escapeHtml(fmtPrice(p.price)) : '—'}</td>`;
        }).join('')}</tr>`;
      const speedRow = `<tr><th scope="row">Speed</th>${
        models.map(p => {
          const win = maxSpeed !== null && p.speed === maxSpeed ? ' is-winner' : '';
          return `<td class="qm-cmp-v${win}">${p.speed > 0 ? escapeHtml(fmtSpeed(p.speed)) : '—'}</td>`;
        }).join('')}</tr>`;
      const headCols = models.map(p => {
        const w = wins.get(p.key) || 0;
        const crown = maxWins > 0 && w === maxWins
          ? `<span class="qm-cmp-crown" title="Wins the most categories among compared models">★</span>` : '';
        const wbadge = w > 0 ? `<span class="qm-cmp-wins">${w} ${w === 1 ? 'win' : 'wins'}</span>` : '';
        return `<th scope="col"><span class="qm-cmp-hcol"><span class="qm-cmp-h">${companyMark(p.creator, 'sm')}<span>${escapeHtml(p.name)}</span></span>${crown}${wbadge}</span></th>`;
      }).join('');
      table = `
        <div class="qm-cmp-scroll">
          <table class="qm-cmp-table">
            <thead><tr><th scope="col" class="qm-cmp-corner">Performance</th>${headCols}</tr></thead>
            <tbody>
              ${CATEGORIES.map(rowFor).join('')}
              ${priceRow}
              ${speedRow}
            </tbody>
          </table>
        </div>
        <p class="qm-cmp-note">The <span class="qm-cmp-win-key">highlighted cell</span> wins that category among compared models; <span class="qm-cmp-lead-key">#1</span> is the global category leader. “—” = not evaluated. O <span class="qm-cmp-crown-key">★</span> marks the model that wins the most categories.</p>`;
    } else {
      table = `<p class="qm-cmp-hint">Search for a model above or select the <b>+</b> button in a row to compare up to ${MAX_COMPARE} models side by side across all categories.</p>`;
    }

    el.innerHTML = `
      <div class="qm-cmp-hd">
        <h3>Compare models</h3>
        <div class="qm-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" id="qm-searchinput" placeholder="Search for a model…" autocomplete="off"
            aria-label="Search for a model to compare"${compare.length >= MAX_COMPARE ? ' disabled' : ''}>
          <div class="qm-suggest" id="qm-suggest"></div>
        </div>
      </div>
      ${compare.length ? `<div class="qm-chips">${chips}${compare.length >= MAX_COMPARE ? `<span class="qm-chip-max">max ${MAX_COMPARE}</span>` : ''}<button class="qm-chip-clear" data-clear="1">clear</button></div>` : ''}
      ${table}`;
  }

  // ─── Meta / footer ───
  function renderMeta() {
    // Same format as the timeline and free tiers header — see fmtDataBR.
    const d = bmData.fetched_at ? fmtDataBR(bmData.fetched_at) : '';
    const el = document.getElementById('qm-meta');
    if (el) {
      el.textContent = `${bmData.models_total} models tracked · ${bmData.benchmarks.length} benchmarks` +
        (d ? ` · data from ${d}` : '');
    }
    const upd = document.getElementById('qm-updated');
    if (upd) upd.textContent = d || '—';
    const att = document.getElementById('qm-attribution');
    if (att && bmData.attribution) att.textContent = bmData.attribution;
  }

  // ─── Actions ───
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
      // Opens the comparison accordion when adding via list, so the user
      // immediately sees the assembled table.
      const det = document.getElementById('qm-compare');
      if (det) det.open = true;
    }
    renderPanel();      // updates the state of the + buttons in the list
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

  // ─── Event delegation ───
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
          tog.textContent = on ? '▾ hide other tests' : '▸ view other tests in this category';
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

    // Closes suggestions when clicking outside
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.qm-search')) {
        const sug = document.getElementById('qm-suggest');
        if (sug) sug.classList.remove('is-open');
      }
    });
  }

  // ─── Ruler index (spreadsheet) ───
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
        rows = [];
      }
    }
    if (!rows.length) {
      try {
        const response = await fetch('../assets/lancamentos-en.json?v=1', { cache: 'no-cache' });
        if (response.ok) {
          rows = (await response.json())
            .filter(r => r.status === 'publicado')
            .map(r => ({ emp: r.emp, mod: r.mod }));
        }
      } catch (e) {
        console.warn('Timeline unavailable — the guide will continue without links:', e);
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
      console.error('Failed to load benchmarks.json:', e);
      root.innerHTML = location.protocol === 'file:'
        ? '<p class="qm-empty">This page must be opened through an HTTP server.<br>' +
          'When the file is opened directly (<code>file://</code>), the browser blocks access ' +
          'do <code>benchmarks.json</code>.<br>Run <code>npx serve</code> in the project folder ' +
          'or open the published version.</p>'
        : '<p class="qm-empty">Benchmark data could not be loaded right now.</p>';
      return;
    }

    // First category with data becomes active (avoids opening on an empty one).
    const firstOk = CATEGORIES.find(hasData);
    if (firstOk) activeCat = firstOk.id;

    modelIndex = buildModelIndex();

    // The ruler is complementary: if the spreadsheet fails, the guide renders the same,
    // just without the links and without the coverage line.
    reguaIndex = await loadRegua();

    renderMeta();
    root.innerHTML = `
      <details class="qm-compare" id="qm-compare">
        <summary class="qm-cmp-toggle">
          <span class="qm-cmp-toggle-ico" aria-hidden="true">⇄</span>
          <span class="qm-cmp-toggle-text">Want to compare models?</span>
          <span class="qm-cmp-toggle-hint">Search for a model or select <b>+</b> in a row — compare up to ${MAX_COMPARE} side by side across all categories.</span>
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
