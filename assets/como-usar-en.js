/* ═══════════════════════════════════════════════════════════════
   Generative AI Global Overview — "How to use outside the browser"
   Rendering of the sections and the desktop simulator with the
   interactive tutorials.

   TWO DECISIONS THAT EXPLAIN THE REST OF THE FILE:

   1. Everything is generated from COMO_USAR_DATA. The page holds
      no text in HTML because the content here is a five-act thesis,
      and a thesis gets revised: keeping the text in a single file
      avoids the classic situation of correcting a number on a card
      and forgetting the same number in the table.

   2. The simulator is never the only path. Every step in the tutorials
      is also available in running text inside <details> — anyone using
      a screen reader, on a mobile phone, or who just wants to copy
      the commands shouldn't need to operate a fake little window to
      reach the content.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const D = typeof COMO_USAR_DATA !== 'undefined' ? COMO_USAR_DATA : null;
  const CENAS = typeof COMO_USAR_CENAS !== 'undefined' ? COMO_USAR_CENAS : null;

  /* ─── utilities ─────────────────────────────────────────── */

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Local copy of fmtDataBR from data.js, as in gratuitos.js: this page
     also doesn't load data.js just to format a date. */
  const MESES_BR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmtDataCurta(iso) {
    const m = String(iso == null ? '' : iso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    return `${m[3]} ${MESES_BR[+m[2] - 1]} ${m[1]}`;
  }

  /* Prose with command snippets and emphasis: in the data file they come between
     backticks and asterisks, like in markdown, because writing <code> or <strong>
     in the middle of a sentence in Portuguese makes the text illegible for editors.
     The conversion happens AFTER escaping, so the content continues to be
     treated as text — a hand-written tag in the data file appears
     as a tag, and doesn't become markup (this is how a stray <strong> ended up
     displayed on screen). Fields with actual HTML (thesis, lesson, closing, lede)
     don't go through here: they are inserted raw, on purpose. */
  function txt(str) {
    return esc(str)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function $(id) { return document.getElementById(id); }

  /* The user requested less animation in their operating system. Respecting that
     is not an accessibility embellishment: for those with vestibular sensitivity,
     text that types itself out is real discomfort. */
  const semMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── "learn more" box ─────────────────────────────────── */

  /* A single implementation for the entire page. The request was to keep the
     surface short without throwing away the rich measurement material: all
     details go in here, closed, and whoever wants to can open it. `<details>`
     does this on its own — without JavaScript, it works with keyboard, and the
     browser's Ctrl+F finds the text inside. */
  function saibaMais(item, extra) {
    return `
      <details class="cu-saiba${extra ? ' ' + extra : ''}">
        <summary><span class="cu-saiba-rot">Learn more</span>${esc(item.titulo)}</summary>
        <div class="cu-saiba-corpo">${item.corpo}</div>
      </details>
    `;
  }

  /* ─── 07 · the summary (closes the page) ───────────────── */

  /* It was born at the top, as "Start here": three conclusions with the
     evidence beside them and the provenance below. It moved to the end because
     it cited measurement numbers to a reader who didn't yet know the measurement
     existed. Here each conclusion can point backward: the link leads to the
     section where the demonstration is, and the reader who reached the end
     reads the same block as a recap. */
  function renderEssencial() {
    const el = $('cu-essencial');
    const lede = $('cu-resumo-lede');
    if (!el || !D.essencial) return;
    const e = D.essencial;

    if (lede) lede.innerHTML = 'Three conclusions to take away from the page — each with the path back to the section that demonstrates it.';

    el.innerHTML = `
      <div class="cu-ess">
        <span class="cu-ess-rot">${esc(e.rotulo)}</span>

        <!-- The premise still comes BEFORE the conclusion: without the two
             context sentences, "describe your machine" is advice about a thing
             the reader doesn't know exists. -->
        <p class="cu-ess-intro">${e.intro}</p>

        <span class="cu-ess-sub">${esc(e.conclusoesRotulo)}</span>
        <ol class="cu-ess-lista">
          ${e.conclusoes.map(c => `
            <li class="cu-ess-item">
              <span class="cu-ess-n" aria-hidden="true">${esc(c.n)}</span>
              <div>
                <p class="cu-ess-frase">${txt(c.frase)}</p>
                <p class="cu-ess-prova">${txt(c.prova)}${c.link ? ` <a class="cu-ess-link" href="${esc(c.link.href)}">${esc(c.link.texto)}</a>` : ''}</p>
              </div>
            </li>`).join('')}
        </ol>

        <div class="cu-ess-proc">
          <div class="cu-ess-nums">
            ${e.procedencia.numeros.map(n => `
              <div class="cu-ess-num">
                <span class="cu-ess-num-v">${esc(n.valor)}</span>
                <span class="cu-ess-num-r">${esc(n.rotulo)}</span>
              </div>`).join('')}
          </div>
          <div class="cu-ess-proc-txt">
            <span class="cu-ess-proc-t">${esc(e.procedencia.titulo)}</span>
            <p>${e.procedencia.texto}
              <a href="${esc(e.procedencia.link.href)}">${esc(e.procedencia.link.texto)}</a>.</p>
          </div>
        </div>
      </div>`;
  }

  /* ─── 01 · the difference, explained ────────────────────── */

  /* This section opens the tab. It exists for those who have never installed
     anything and only use AI in a browser tab — which is why it's the only
     one on the page written in running text before any boxes. The previous
     version opened by discussing how to CALL the two things, and the reader
     reached the comparison without having understood what was being compared.
     The naming discussion didn't disappear: it became the last closed box here. */

  function ladoEixo(lado, classe, rotulo) {
    return `
      <div class="cu-lado ${classe}">
        <span class="cu-lado-rot">${esc(rotulo)}</span>
        <h4 class="cu-lado-tit">${esc(lado.titulo)}</h4>
        <p class="cu-lado-txt">${lado.texto}</p>
        ${lado.glossario ? `
          <details class="cu-gloss">
            <summary>What is a ${esc(lado.glossario.termo)}?</summary>
            <p>${lado.glossario.texto}</p>
          </details>` : ''}
        <p class="cu-lado-cons">${lado.consequencia}</p>
      </div>
    `;
  }

  /* The underpinning. A sentence that says what we saw and names the tools,
     with the path for whoever wants the details. Here there used to be a dark
     box with the execution table: it presented an internal test conclusion as
     a general rule, and whoever arrived had no way of knowing what it was about. */
  function lastroEixo(txtLastro) {
    return `
      <p class="cu-lastro">
        <span class="cu-lastro-rot">How we know this</span>
        ${txtLastro}
        <a class="cu-lastro-link" href="#medicao">how the measurement was done</a>
      </p>`;
  }

  function renderAbertura() {
    const a = D.abertura;

    const lede = $('cu-ab-lede');
    if (lede) lede.innerHTML = a.lede;

    const prosa = $('cu-ab-prosa');
    if (prosa) prosa.innerHTML = a.paragrafos.map(p => `<p>${p}</p>`).join('');

    const eixos = $('cu-ab-eixos');
    if (eixos) {
      eixos.innerHTML = a.eixos.map(e => `
        <article class="cu-eixo" id="cu-eixo-${e.n}">
          <header class="cu-eixo-head">
            <span class="cu-eixo-n" aria-hidden="true">${e.n}</span>
            <div class="cu-eixo-tit">
              <h3>${esc(e.nome)}</h3>
              <p class="cu-eixo-q">${esc(e.pergunta)}</p>
            </div>
          </header>
          <div class="cu-eixo-par">
            ${ladoEixo(e.navegador, 'is-nav', 'In the browser')}
            ${ladoEixo(e.instalada, 'is-maq', 'Installed on the machine')}
          </div>
          ${lastroEixo(e.lastro)}
          <p class="cu-eixo-regra">${e.regra}</p>
        </article>
      `).join('');
    }

    const ganho = $('cu-ab-ganho');
    if (ganho && a.ganho) {
      ganho.innerHTML = `
        <section class="cu-ganho" aria-labelledby="h-ganho">
          <h3 id="h-ganho">${esc(a.ganho.titulo)}</h3>
          <p class="cu-ganho-lede">${txt(a.ganho.lede)}</p>
          <div class="cu-ganho-itens">
            ${a.ganho.itens.map(i => `
              <article class="cu-ganho-i">
                <h4>${esc(i.titulo)}</h4>
                <p>${i.texto}</p>
              </article>`).join('')}
          </div>
          <p class="cu-ganho-custo">${txt(a.ganho.custo)}</p>
        </section>`;
    }

    const saiba = $('cu-ab-saiba');
    if (saiba) saiba.innerHTML = a.saibaMais.map(i => saibaMais(i)).join('');
  }

  /* ─── transcripts ───────────────────────────────────────── */

  /* A single renderer for both sides of the comparison and for the simulator's
     terminal: if the command line look diverges between sections, the reader
     starts to think they are different things. */
  function linhaTerminal(l) {
    const v = esc(l.v);
    switch (l.t) {
      case 'cmd':  return `<div class="cu-t-linha"><span class="cu-t-ps">$</span><code>${v}</code></div>`;
      case 'cont': return `<div class="cu-t-linha"><span class="cu-t-ps cu-t-ps2">&gt;</span><code>${v}</code></div>`;
      case 'err':  return `<div class="cu-t-linha cu-t-err"><code>${v}</code></div>`;
      case 'nota': return `<div class="cu-t-nota">${txt(l.v)}</div>`;
      case 'pedido': return `<div class="cu-t-linha cu-t-pedido"><span class="cu-t-ps">❯</span><code>${v}</code></div>`;
      /* Empty line is breathing room the data author wrote on purpose;
         without &nbsp; the line's flex collapses to zero pixels. */
      default:     return `<div class="cu-t-linha cu-t-out"><code>${v || '&nbsp;'}</code></div>`;
    }
  }

  /* The scenario tabs, the lesson strip, and the cost chart lived here.
     All three read from D.cenarios — the hand-written reconstruction that the
     10/Sep measurement replaced. They left together with it: code that nobody
     calls is still code that someone will reactivate without knowing the
     numbers behind it were disproved. See the balance at the end of section 02. */

  /* ═══════════════════════════════════════════════════════════
     02 · THE EXAMPLES
     ═══════════════════════════════════════════════════════════
     A work question, and what changes between answering it in a
     browser tab and in a program installed on the computer.

     This section used to be a measurement report: two transcripts
     playing in sync, file counts, each scenario's pitfall. It got
     technical and boring. Now it NARRATES the difference; the
     measurement remains intact in the repository and section 05
     tells how it was done. The numbers that remain are in the
     closed boxes, for whoever wants them. */

  let exemploAtual = 0;

  function ladoExemplo(l, classe) {
    return `
      <article class="cn-lado ${classe}">
        <header class="cn-lado-head">
          <h4>${esc(l.rotulo)}</h4>
          <span class="cn-lado-sub">${esc(l.sub)}</span>
        </header>
        <p class="cn-lado-narr">${l.narrativa}</p>
        <dl class="cn-lado-saldo">
          <div class="is-bom"><dt>What you gain</dt><dd>${txt(l.bom)}</dd></div>
          <div class="is-lim"><dt>What stays with you</dt><dd>${txt(l.limite)}</dd></div>
        </dl>
      </article>`;
  }

  function renderCenas() {
    const el = $('cu-cenas');
    if (!el || typeof CENAS === 'undefined') return;
    const c = CENAS.cenas[exemploAtual];
    const F = CENAS.fontes;
    const totalCenas = CENAS.cenas.length;
    const proxIdx = (exemploAtual + 1) % totalCenas;
    const antIdx = (exemploAtual - 1 + totalCenas) % totalCenas;

    el.innerHTML = `
      <div class="cn-seletor" role="region" aria-label="Example selector">
        <div class="cn-abas-topo">
          <div class="cn-abas-chamada">
            <span class="cn-abas-icone" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l7 18 3-7 7-3L3 3z"/>
              </svg>
            </span>
            <span class="cn-abas-titulo">Click an example to see the comparison:</span>
          </div>
          <span class="cn-abas-contador">
            <span class="cn-abas-contador-atual">Example ${exemploAtual + 1}</span> of ${totalCenas} selected
          </span>
        </div>

        <div class="cn-abas" role="tablist" aria-label="Choose the example">
          ${CENAS.cenas.map((x, i) => {
            const ativa = i === exemploAtual;
            return `
            <button type="button" role="tab" class="cn-aba ${ativa ? 'is-active' : ''}"
                    data-cn="ir" data-i="${i}" tabindex="${ativa ? '0' : '-1'}"
                    aria-selected="${ativa}"
                    title="Click to see example ${i + 1}: ${esc(x.aba)}">
              <span class="cn-aba-num" aria-hidden="true">0${i + 1}</span>
              <span class="cn-aba-corpo">
                <span class="cn-aba-rotulo">Example 0${i + 1}</span>
                <strong class="cn-aba-txt">${esc(x.aba)}</strong>
              </span>
              <span class="cn-aba-indicador" aria-hidden="true">
                ${ativa ? `
                  <span class="cn-aba-status-tag">Active</span>
                  <svg class="cn-aba-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : `
                  <span class="cn-aba-status-tag is-ver">See</span>
                  <svg class="cn-aba-seta" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                `}
              </span>
            </button>`;
          }).join('')}
        </div>
      </div>

      <article class="cn-ex">
        <div class="cn-ex-pergunta">
          <div class="cn-ex-pergunta-meta">
            <span class="cn-ex-rot">Example 0${exemploAtual + 1} of 0${totalCenas} · The question</span>
            <span class="cn-ex-tema">${esc(c.aba)}</span>
          </div>
          <h3>${esc(c.pergunta)}</h3>
        </div>

        <div class="cn-ex-par">
          ${ladoExemplo(c.navegador, 'is-nav')}
          ${ladoExemplo(c.instalado, 'is-maq')}
        </div>

        <div class="cn-ex-dif">
          <span class="cn-ex-rot">What changes, in practice</span>
          <p>${c.diferenca}</p>
        </div>

        <div class="cn-ex-quando">
          <span class="cn-ex-rot">When to use each</span>
          <dl>
            <div><dt>Browser</dt><dd>${txt(c.quandoUsar.navegador)}</dd></div>
            <div><dt>Installed program</dt><dd>${txt(c.quandoUsar.instalado)}</dd></div>
          </dl>
        </div>

        ${c.saibaMais ? `<div class="cu-saibas">${[].concat(c.saibaMais).map(i => saibaMais(i)).join('')}</div>` : ''}

        <nav class="cn-ex-nav" aria-label="Navigate between examples">
          <button type="button" class="cn-ex-nav-btn is-ant" data-cn="ir" data-i="${antIdx}" title="See previous example: ${esc(CENAS.cenas[antIdx].aba)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span class="cn-ex-nav-texto">
              <span class="cn-ex-nav-legenda">Previous example (0${antIdx + 1})</span>
              <span class="cn-ex-nav-nome">${esc(CENAS.cenas[antIdx].aba)}</span>
            </span>
          </button>
          <button type="button" class="cn-ex-nav-btn is-prox" data-cn="ir" data-i="${proxIdx}" title="See next example: ${esc(CENAS.cenas[proxIdx].aba)}">
            <span class="cn-ex-nav-texto">
              <span class="cn-ex-nav-legenda">Next example (0${proxIdx + 1})</span>
              <span class="cn-ex-nav-nome">${esc(CENAS.cenas[proxIdx].aba)}</span>
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </nav>
      </article>

      <p class="cn-fonte">
        Both columns describe what actually happened: ${esc(F.navegador.rotulo)} in
        ${esc(F.navegador.data)} and ${esc(F.agente.rotulo)} in ${esc(F.agente.data)}, over a
        folder with real files. <a href="#medicao">How the measurement was done</a>, and the
        full transcripts <a href="automation/capturas/">are in the repository</a>.
      </p>`;
  }

  function ligarCenas() {
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('#cu-cenas [data-cn="ir"]');
      if (!alvo) return;
      exemploAtual = (+alvo.dataset.i + CENAS.cenas.length) % CENAS.cenas.length;
      renderCenas();
    });

    document.addEventListener('keydown', (e) => {
      if (!e.target.closest('#cu-cenas .cn-aba')) return;
      const mapa = { ArrowRight: exemploAtual + 1, ArrowLeft: exemploAtual - 1,
                     Home: 0, End: CENAS.cenas.length - 1 };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      exemploAtual = (mapa[e.key] + CENAS.cenas.length) % CENAS.cenas.length;
      renderCenas();
      const nova = document.querySelector('#cu-cenas .cn-aba.is-active');
      if (nova) nova.focus();
    });
  }

  /* ─── 02b · the counterpoint ────────────────────────────── */

  function renderContraponto() {
    const el = $('cu-contraponto');
    if (!el || !D.contraponto) return;
    const c = D.contraponto;
    el.innerHTML = `
      <section class="cu-contra" aria-labelledby="h-contra">
        <header>
          <h3 id="h-contra">${esc(c.titulo)}</h3>
          <p class="cu-contra-lede">${txt(c.lede)}</p>
        </header>
        <div class="cu-contra-grid">
          ${c.itens.map(i => `
            <article class="cu-contra-item">
              <h4>${esc(i.titulo)}</h4>
              <p>${txt(i.texto)}</p>
            </article>
          `).join('')}
        </div>
        <p class="cu-contra-fecho">${c.fecho}</p>
      </section>
    `;
  }

  /* ─── 03 · what stays afterwards ─────────────────────────── */

  /* Deliberately different shape from the rest of the page: a two-column
     comparison (lists, not cards) and then four text-with-artifact bands.
     The tab already had a card grid in four sections; another one here and
     the new section would come across as "more of the same", which is exactly
     the problem it came to solve. */
  function renderPermanencia() {
    const el = $('cu-permanencia');
    const lede = $('cu-perm-lede');
    if (!el || !D.permanencia) return;
    const P = D.permanencia;

    if (lede) lede.innerHTML = P.lede;

    const lista = (itens) => itens.map(i => `
      <li class="${i.ok ? 'is-fica' : 'is-some'}">
        <span class="cu-rst-m" aria-hidden="true">${i.ok ? '✓' : '×'}</span>
        <span>${txt(i.v)}</span>
      </li>`).join('');

    const artefato = (a) => {
      if (!a) return '';
      if (a.tipo === 'terminal') {
        return `<div class="cu-art cu-art-term">${a.linhas.map(l =>
          l.startsWith('$ ')
            ? `<div class="cu-art-l"><span class="cu-art-ps">$</span><code>${esc(l.slice(2))}</code></div>`
            : `<div class="cu-art-l cu-art-out"><code>${esc(l)}</code></div>`
        ).join('')}</div>`;
      }
      if (a.tipo === 'arquivo') {
        return `<div class="cu-art cu-art-arq">
          <div class="cu-art-barra">${esc(a.nome)}</div>
          <div class="cu-art-corpo">${a.linhas.map(l => `<div class="cu-art-l"><code>${esc(l) || '&nbsp;'}</code></div>`).join('')}</div>
        </div>`;
      }
      return `<div class="cu-art cu-art-arv">${a.linhas.map(l => `<div class="cu-art-l"><code>${esc(l)}</code></div>`).join('')}</div>`;
    };

    el.innerHTML = `
      <section class="cu-resta" aria-labelledby="h-resta">
        <h3 id="h-resta">${esc(P.restaTitulo)}</h3>
        <div class="cu-resta-par">
          <div class="cu-resta-lado cu-resta-chat">
            <span class="cu-resta-rot">${esc(P.resta.conversaRotulo)}</span>
            <ul>${lista(P.resta.conversa)}</ul>
          </div>
          <div class="cu-resta-lado cu-resta-term">
            <span class="cu-resta-rot">${esc(P.resta.agenteRotulo)}</span>
            <ul>${lista(P.resta.agente)}</ul>
          </div>
        </div>
        <p class="cu-resta-nota">${txt(P.resta.nota)}</p>
      </section>

      <div class="cu-mecs">
        ${P.mecanismos.map((m, i) => `
          <article class="cu-mec">
            <div class="cu-mec-txt">
              <h4><span class="cu-mec-n">${String(i + 1).padStart(2, '0')}</span>${esc(m.titulo)}</h4>
              <p>${txt(m.texto)}</p>
              ${m.nota ? `<p class="cu-mec-nota">${txt(m.nota)}</p>` : ''}
            </div>
            <div class="cu-mec-art">${artefato(m.artefato)}</div>
          </article>
        `).join('')}
      </div>

      <p class="cu-licao cu-perm-fecho">${P.fecho}</p>
    `;
  }

  /* ─── 04 · tools ────────────────────────────────────────── */

  function renderFerramentas() {
    const el = $('cu-tools');
    if (!el) return;
    el.innerHTML = D.ferramentas.map(f => `
      <article class="cu-tool">
        <h3>${esc(f.nome)}</h3>
        <p class="cu-tool-oq">${txt(f.oQueE)}</p>
        <p class="cu-tool-dest">${txt(f.destrava)}</p>
        <p class="cu-tool-ex"><code>${esc(f.exemplo)}</code></p>
      </article>
    `).join('');
  }

  /* ─── 06 · catalog ──────────────────────────────────────── */

  function renderFamilias() {
    const el = $('cu-familias');
    if (!el) return;
    el.innerHTML = D.familias.map(fam => `
      <section class="cu-fam" aria-labelledby="fam-${esc(fam.id)}">
        <header class="cu-fam-head">
          <h3 id="fam-${esc(fam.id)}">${esc(fam.titulo)}</h3>
          <p class="cu-fam-sub">${esc(fam.subtitulo)}</p>
        </header>
        <p class="cu-fam-exp">${txt(fam.explicacao)}</p>
        <div class="cu-fam-grid">
          ${fam.itens.map(it => `
            <article class="cu-ferr ${it.destaque ? 'is-destaque' : ''}">
              <header class="cu-ferr-head">
                <div>
                  <span class="cu-ferr-emp">${esc(it.empresa)}</span>
                  <h4>${esc(it.nome)}</h4>
                </div>
                ${it.codigoAberto ? `<span class="cu-ferr-open">${esc(it.licenca || 'open source')}</span>` : ''}
              </header>

              <div class="cu-ferr-inst">
                <span class="cu-ferr-rot">How to install</span>
                ${it.comando
                  ? `<code>${esc(it.instala)}</code>`
                  : `<p class="cu-ferr-gui">${esc(it.instala)}</p>`}
                <p class="cu-ferr-alt">${esc(it.instalaAlt)}</p>
              </div>

              <div class="cu-ferr-campo">
                <span class="cu-ferr-rot">Requires</span>
                <p>${txt(it.precisa)}</p>
              </div>

              <div class="cu-ferr-campo">
                <span class="cu-ferr-rot">Reach</span>
                <p>${txt(it.acesso)}</p>
              </div>

              ${it.destaque ? `<p class="cu-ferr-dest">${esc(it.destaque)}</p>` : ''}

              <a class="cu-link-btn" href="${esc(it.link)}" target="_blank" rel="noopener">
                <span>Official page</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');
  }

  /* ─── 06b · the bridge (`ollama launch`) ────────────────── */

  /* Three blocks in one: the commands, the integration table, and the plans.
     They stay together because they answer the same practical question — "and
     how do I connect the model to the tool?" — and separating them would force
     the reader to assemble the answer in their head from three places on the page. */
  function renderPonte() {
    const el = $('cu-ponte');
    if (!el || !D.ponte) return;
    const p = D.ponte;

    el.innerHTML = `
      <section class="cu-ponte" aria-labelledby="h-ponte">
        <header class="cu-ponte-head">
          <h3 id="h-ponte">${esc(p.titulo)}</h3>
          <p class="cu-ponte-lede">${txt(p.lede)}</p>
        </header>

        <dl class="cu-cmds cu-ponte-cmds">
          ${p.comandos.map(k => `
            <div class="cu-cmd">
              <dt><code>${esc(k.cmd)}</code></dt>
              <dd>${txt(k.oQueFaz)}</dd>
            </div>
          `).join('')}
        </dl>

        <!-- Eighteen lines of table are reference, not reading: left open
             by default they were almost a full screen of scrolling between the
             reader and the plans. Closed, the title already delivers the number —
             which is the only thing most people want from here. -->
        <details class="cu-integs-caixa">
          <summary>
            <span class="cu-integs-sum">${txt(p.integracoesTitulo)}</span>
            <span class="cu-integs-n">${p.integracoes.length} integrations</span>
          </summary>
          <p class="cu-ponte-nota">${txt(p.integracoesNota)}</p>
          <ul class="cu-integs">
            ${p.integracoes.map(i => `
              <li class="cu-integ">
                <code>${esc(i.id)}</code>
                <strong>${esc(i.nome)}</strong>
                <span>${esc(i.nota)}</span>
              </li>
            `).join('')}
          </ul>
        </details>

        <h4 class="cu-ponte-h4">${txt(p.planosTitulo)}</h4>
        <div class="cu-planos">
          ${p.planos.map(pl => `
            <article class="cu-plano ${pl.destaque ? 'is-destaque' : ''}">
              <h5>${esc(pl.nome)}</h5>
              <p class="cu-plano-preco">${esc(pl.preco)}</p>
              <p class="cu-plano-credito">${esc(pl.credito)}</p>
              <p class="cu-plano-det">${txt(pl.detalhe)}</p>
            </article>
          `).join('')}
        </div>
        <p class="cu-ponte-nota">${txt(p.planosExtra)}</p>
        <p class="cu-ponte-nota cu-ponte-fonte">${txt(p.planosNota)}</p>

        <p class="cu-licao cu-ponte-fecho">${p.fecho}</p>
      </section>
    `;
  }

  /* On mobile the catalog took up 8.8 screens of scrolling — 45% of the page —
     to deliver reference material. Here each family now shows the first card
     and a button with the count of the rest. On desktop nothing changes: there
     the families fit in three columns and reading is horizontal. */
  /* The catalog is reference, not reading: on its own it was 30% of the words
     on the page. Now each family starts closed, with the list of names in a
     single line — whoever is looking for a specific tool finds it by name and
     opens it; whoever is reading the page moves right along. Previously this
     only applied on mobile, and it was on the computer that the catalog most
     disrupted reading. */
  function colapsarCatalogo() {
    document.querySelectorAll('.cu-fam-grid').forEach(g => {
      const cards = [...g.children].filter(c => c.classList.contains('cu-ferr'));
      if (cards.length < 2 || g.dataset.colapsado === '1') return;
      g.dataset.colapsado = '1';

      const nomes = cards
        .map(c => (c.querySelector('.cu-ferr-nome') || c.querySelector('h4') || {}).textContent)
        .filter(Boolean).map(t => t.trim());

      const cx = document.createElement('details');
      cx.className = 'cu-fam-cx';
      const sm = document.createElement('summary');
      sm.innerHTML = `<span class="cu-fam-cx-n">${cards.length} tools</span>` +
                     `<span class="cu-fam-cx-l">${nomes.map(n => esc(n)).join(' · ')}</span>`;
      cx.appendChild(sm);

      g.insertAdjacentElement('beforebegin', cx);
      cx.appendChild(g);
    });
  }


  /* ─── 07 · security ─────────────────────────────────────── */


  /* ─── 08 · how this was measured ─────────────────────────── */

  /* The section that underpins all the others. Short on purpose: the method in
     three sentences, the list of what was NOT measured, and a path for whoever
     wants to check provenance. The list of what was missing is not modesty — it
     is what separates a page that measured from a page that asserts. */
  function renderMedicao() {
    const el = $('cu-medicao');
    if (!el || !D.medicao) return;
    const m = D.medicao;
    el.innerHTML = `
      <p class="cu-med-lede">${txt(m.lede)}</p>

      <ol class="cu-metodo">
        ${m.passos.map((p, i) => `
          <li class="cu-metodo-p">
            <span class="cu-metodo-n" aria-hidden="true">${i + 1}</span>
            <div>
              <h3>${txt(p.titulo)}</h3>
              <p>${txt(p.texto)}</p>
            </div>
          </li>`).join('')}
      </ol>

      <section class="cu-naomed" aria-labelledby="h-naomed">
        <h3 id="h-naomed">${esc(m.naoMedidoTitulo)}</h3>
        <p class="cu-naomed-lede">${txt(m.naoMedidoLede)}</p>
        <dl class="cu-naomed-lista">
          ${m.naoMedido.map(n => `
            <div class="cu-naomed-l">
              <dt>${txt(n.item)}</dt>
              <dd>${txt(n.porque)}</dd>
            </div>`).join('')}
        </dl>
      </section>

      <div class="cu-saibas">${saibaMais(m.saibaMais)}</div>`;
  }

  /* ─── 05 · text tutorials (the path without simulation) ──── */

  function renderPlano() {
    const el = $('cu-plain-body');
    if (!el) return;
    el.innerHTML = D.tutoriais.map(t => `
      <section class="cu-plain-tut">
        <h3>${esc(t.nome)} <span>· ${esc(t.legenda)}</span></h3>
        ${t.objetivo ? `<p class="cu-plain-obj">${txt(t.objetivo)}</p>` : ''}
        <ol>
          ${t.passos.map((p, i) => `
            <li>
              ${p.ato && (i === 0 || t.passos[i - 1].ato !== p.ato)
                ? `<span class="cu-plain-ato">${esc(p.ato)}</span>` : ''}
              <strong>${esc(p.titulo)}</strong>
              <p>${txt(p.explicacao)}</p>
              ${p.prompt ? `<p class="cu-plain-nota"><strong>The task given to the agent:</strong> ${txt(p.prompt)}</p>` : ''}
              ${p.cmd ? `<pre><code>${esc(p.cmd)}</code></pre>` : ''}
              ${p.dialogo ? `<ul>${(p.dialogo.linhas || []).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
              ${p.navegador ? `<p class="cu-plain-url">${esc(p.navegador.url)}</p>` : ''}
              ${p.diff ? `<pre><code>${(p.diff.linhas || []).map(l => esc((l.t === 'mais' ? '+ ' : l.t === 'menos' ? '- ' : '  ') + l.v)).join('\n')}</code></pre>` : ''}
              ${p.nota ? `<p class="cu-plain-nota">${txt(p.nota)}</p>` : ''}
            </li>
          `).join('')}
        </ol>
        <p class="cu-plain-fecho">${txt(t.fecho)}</p>
      </section>
    `).join('');
  }

  /* ═══════════════════════════════════════════════════════════
     05 · THE SIMULATOR
     ═══════════════════════════════════════════════════════════
     A fake computer screen with a real tutorial inside. The
     visual play has a function: whoever has never opened a
     terminal freezes at the first `$`, and an obviously fake
     window makes that first step consequence-free — there is
     no way to break anything here.

     The guide happens INSIDE the screen, in pop-ups anchored to
     what they explain, and the commands are typed for real in a
     real input. The panel below the frame still exists with the
     same actions — it is the keyboard and screen reader path. */

  const os = {
    tutorial: null,   // object of the open tutorial
    passo: 0,          // index of the current step
    fase: 'guia',      // 'guia' → 'digitando' → 'rodando' → 'feito' → 'fim'
    erro: null,        // message from the last wrong Enter
    guiaMin: false,    // the balloon was shrunk by the person
    jaInteragiu: false, // there was a click: only then do we focus the input
    timers: [],
    rapido: semMovimento
  };

  function limparTimers() {
    os.timers.forEach(clearTimeout);
    os.timers = [];
  }

  function agenda(fn, ms) {
    os.timers.push(setTimeout(fn, ms));
  }

  const ICONES = {
    terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M7 9.5l3 2.5-3 2.5"/><path d="M12.5 15h4.5"/>',
    janela: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 9h19"/><circle cx="6" cy="6.5" r="0.6" fill="currentColor"/>',
    leiame: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>'
  };

  function svgIcone(nome, tam) {
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ICONES.janela}</svg>`;
  }

  function renderDesktop() {
    const desk = $('cu-desk');
    if (!desk) return;

    /* The icon uses `nomeCurto` when it exists: in an 84px cell, "Ollama Cloud
       + launch" would break into three lines and push the other icons. The full
       name remains in the script and in the Start menu, where there is width. */
    const itens = D.tutoriais.map(t => ({
      id: t.id, nome: t.nomeCurto || t.nome, icone: t.icone, legenda: t.legenda
    })).concat([{ id: 'leiame', nome: 'Readme.txt', icone: 'leiame', legenda: 'What this screen is' }]);

    desk.innerHTML = itens.map(it => `
      <button type="button" class="cu-icone" data-abrir="${esc(it.id)}"
              title="${esc(it.legenda)}">
        <span class="cu-icone-fig">${svgIcone(it.icone, 26)}</span>
        <span class="cu-icone-txt">${esc(it.nome)}</span>
      </button>
    `).join('');

    desk.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-abrir]');
      if (!btn) return;
      abrir(btn.dataset.abrir);
    });
  }

  function renderStartMenu() {
    const menu = $('cu-startmenu');
    const start = $('cu-start');
    if (!menu || !start) return;

    menu.innerHTML = `
      <div class="cu-sm-faixa" aria-hidden="true">Tutorials</div>
      <div class="cu-sm-lista">
        ${D.tutoriais.map(t => `
          <button type="button" class="cu-sm-item" data-abrir="${esc(t.id)}">
            ${svgIcone(t.icone, 18)}
            <span><strong>${esc(t.nome)}</strong><em>${esc(t.legenda)}</em></span>
          </button>
        `).join('')}
        <button type="button" class="cu-sm-item" data-abrir="leiame">
          ${svgIcone('leiame', 18)}
          <span><strong>Readme.txt</strong><em>What this screen is</em></span>
        </button>
      </div>
    `;

    start.addEventListener('click', () => {
      const aberto = !menu.hidden;
      menu.hidden = aberto;
      start.setAttribute('aria-expanded', String(!aberto));
      start.classList.toggle('is-on', !aberto);
    });

    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-abrir]');
      if (!btn) return;
      menu.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      start.classList.remove('is-on');
      abrir(btn.dataset.abrir);
    });

    document.addEventListener('click', (e) => {
      if (menu.hidden) return;
      if (e.target.closest('#cu-startmenu') || e.target.closest('#cu-start')) return;
      menu.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      start.classList.remove('is-on');
    });
  }

  function relogio() {
    const el = $('cu-clock');
    if (!el) return;
    const t = () => {
      const d = new Date();
      el.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    };
    t();
    setInterval(t, 30000);
  }

  function abrir(id) {
    limparTimers();
    if (id === 'leiame') {
      os.tutorial = null;
      os.fase = 'pronto';
      pintarJanela({
        tipo: 'leiame',
        titulo: 'Readme.txt'
      });
      pintarTaskbar('Readme.txt');
      os.fase = 'guia';
      pintarBalao();
      return;
    }
    const t = D.tutoriais.find(x => x.id === id);
    if (!t) return;
    os.tutorial = t;
    os.passo = 0;
    os.fase = 'guia';
    os.erro = null;
    os.guiaMin = false;
    os.jaInteragiu = true;
    pintarPasso();
  }

  function fechar() {
    limparTimers();
    os.tutorial = null;
    os.fase = 'guia';
    os.erro = null;
    os.guiaMin = false;
    $('cu-windows').innerHTML = '';
    pintarTaskbar(null);
    pintarBalao();
  }

  /* One window at a time. A real window manager would be a more faithful
     toy and a worse tutorial: the reader needs to know, without thinking,
     where the current step is. */
  function pintarJanela(cfg) {
    const wrap = $('cu-windows');
    if (!wrap) return;

    let corpo = '';
    if (cfg.tipo === 'terminal') {
      corpo = `<div class="cu-win-term" id="cu-win-term">${cfg.linhas}</div>`;
    } else if (cfg.tipo === 'navegador') {
      const n = cfg.nav;
      corpo = `
        <div class="cu-win-nav">
          <div class="cu-nav-barra">
            <span class="cu-nav-botoes" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="cu-nav-url">${esc(n.url)}</span>
          </div>
          <div class="cu-nav-pagina">
            <h5>${esc(n.titulo)}</h5>
            <p>${esc(n.texto)}</p>
            <ul>${n.opcoes.map((o, i) => `<li class="${i === 0 ? 'is-sel' : ''}">${esc(o)}</li>`).join('')}</ul>
            <button type="button" class="cu-nav-btn cu-alvo" data-acao="avancar">${esc(n.botao)}</button>
          </div>
        </div>`;
    } else if (cfg.tipo === 'diff') {
      /* The diff is the thing the window does better than the terminal: the
         approval becomes reading, with the departing line and the incoming line
         one below the other. The sign (+/-) comes before the color, for color
         blindness and for whoever copies the text. */
      const d = cfg.diff;
      corpo = `
        <div class="cu-win-diff">
          <div class="cu-diff-barra">
            <span class="cu-diff-arq">${esc(d.arquivo)}</span>
            <span class="cu-diff-cont">${d.linhas.filter(l => l.t === 'mais').length} additions · ${d.linhas.filter(l => l.t === 'menos').length} removals</span>
          </div>
          <div class="cu-diff-corpo">
            ${d.linhas.map(l => `
              <div class="cu-diff-l cu-diff-${esc(l.t)}"><span class="cu-diff-s">${l.t === 'mais' ? '+' : l.t === 'menos' ? '−' : ' '}</span><code>${esc(l.v)}</code></div>
            `).join('')}
          </div>
          <div class="cu-diff-bts">
            ${(d.botoes || []).map((b, i) => i === 0
              ? `<button type="button" class="cu-dlg-btn is-primario cu-alvo" data-acao="avancar">${esc(b)}</button>`
              : `<span class="cu-dlg-btn">${esc(b)}</span>`).join('')}
          </div>
        </div>`;
    } else if (cfg.tipo === 'dialogo') {
      const g = cfg.dlg;
      corpo = `
        <div class="cu-win-dlg">
          <h5>${esc(g.titulo)}</h5>
          <ul>${g.linhas.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
          <button type="button" class="cu-dlg-btn cu-alvo" data-acao="avancar">${esc(g.botao)}</button>
        </div>`;
    } else {
      corpo = `
        <div class="cu-win-dlg cu-win-leiame">
          <h5>What this screen is</h5>
          <p>A toy computer, with the look of the 2000s. It exists so that
             your first encounter with the terminal happens in a place where nothing can go wrong.</p>
          <p>The commands are real and have been tested. The outputs are faithful reconstructions —
             they are not recordings, and nothing here actually executes.</p>
          <p>When you run it on your own computer, the screen will look similar to this one. That's the idea.</p>
        </div>`;
    }

    wrap.innerHTML = `
      <div class="cu-win ${cfg.tipo === 'terminal' ? 'is-term' : ''}">
        <div class="cu-win-bar">
          <span class="cu-win-titulo">${esc(cfg.titulo)}</span>
          <span class="cu-win-bts" aria-hidden="true">
            <i class="cu-wb">_</i><i class="cu-wb">□</i>
          </span>
          <button type="button" class="cu-wb cu-wb-x" id="cu-win-x" aria-label="Close the window">×</button>
        </div>
        ${corpo}
      </div>
    `;

    const x = $('cu-win-x');
    if (x) x.addEventListener('click', fechar);
  }

  function pintarTaskbar(nome) {
    const el = $('cu-task-items');
    if (!el) return;
    el.innerHTML = nome ? `<span class="cu-task-item">${esc(nome)}</span>` : '';
  }

  function blocoDoPasso(p) {
    const bloco = [];
    if (p.prompt) bloco.push(linhaTerminal({ t: 'pedido', v: p.prompt }));
    if (p.cmd) bloco.push(linhaTerminal({ t: 'cmd', v: p.cmd }));
    (p.saida || []).forEach(l => bloco.push(linhaTerminal(l)));
    return bloco.join('');
  }

  /* ─── the terminal where you type for real ───────────────────
     The live line is a real <input> with transparent text color, overlaid
     on a "mirror" that redraws what was typed character by character. The
     real input is what gives keyboard, selection, paste, and screen reader
     for free; the mirror is what allows painting the correct part green,
     the wrong part red, and what's missing in gray — things no single input
     can do. The two are aligned in the same grid cell, with the SAME font
     and the SAME size: if they diverge, the cursor goes out of place. */
  function linhaViva(p) {
    return `
      <div class="cu-t-linha cu-t-viva" id="cu-t-viva">
        <span class="cu-t-ps">$</span>
        <span class="cu-t-campo">
          <span class="cu-t-espelho" id="cu-t-espelho" aria-hidden="true"></span>
          <input class="cu-t-input" id="cu-t-input" type="text"
                 autocomplete="off" autocorrect="off" autocapitalize="off"
                 spellcheck="false" enterkeyhint="go"
                 aria-label="Type this step's command and press Enter">
        </span>
      </div>`;
  }

  function linhasDoPasso(p) {
    /* The scrollback is derived, not accumulated: it is the blocks of all
       terminal steps prior to the current one. This is what gives the feel
       of a continuous session — and, by deriving from the step index,
       "going back" doesn't need to guess how many blocks to undo. */
    let html = os.tutorial.passos.slice(0, os.passo)
      .filter(pp => pp.janela === 'terminal')
      .map(blocoDoPasso).join('');
    if (p.prompt) html += linhaTerminal({ t: 'pedido', v: p.prompt });
    html += linhaViva(p);
    html += `<div id="cu-t-saida"></div>`;
    return html;
  }

  /* Paints the mirror: what matches the expected command comes out light, what
     diverged comes out red, and the rest of the command appears in gray ahead of
     the cursor — like an autocomplete suggestion. That gray is what lets someone
     type a `curl -fsSL …` without memorizing anything. */
  function atualizarEspelho() {
    const inp = $('cu-t-input');
    const esp = $('cu-t-espelho');
    if (!inp || !esp) return;
    const alvo = (os.tutorial.passos[os.passo].cmd) || '';
    const v = inp.value;

    let iguais = 0;
    while (iguais < v.length && iguais < alvo.length && v[iguais] === alvo[iguais]) iguais++;

    const ok = esc(v.slice(0, iguais));
    const ruim = esc(v.slice(iguais));
    const falta = esc(alvo.slice(iguais));

    esp.innerHTML =
      `<span class="cu-e-ok">${ok}</span>` +
      (ruim ? `<span class="cu-e-ruim">${ruim}</span>` : '') +
      `<span class="cu-e-cursor"></span>` +
      (ruim ? '' : `<span class="cu-e-falta">${falta}</span>`);

    const viva = $('cu-t-viva');
    if (viva) viva.classList.toggle('is-errado', !!ruim);
  }

  function ligarTerminal() {
    const inp = $('cu-t-input');
    if (!inp) return;

    inp.addEventListener('input', atualizarEspelho);
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      submeter();
    });
    atualizarEspelho();
    /* Focus only when the person is already looking at the screen: focusing
       during page scroll would drag the viewport down here without them asking. */
    if (os.jaInteragiu) inp.focus();
  }

  function submeter() {
    const inp = $('cu-t-input');
    if (!inp || os.fase !== 'guia') return;
    const p = os.tutorial.passos[os.passo];
    const digitado = inp.value.trim();
    const alvo = (p.cmd || '').trim();

    if (!digitado) return;

    if (digitado === alvo) { rodar(); return; }

    /* Wrong: the terminal responds as a terminal would. No
       "try again" — the message is what the person will actually see, and it's
       part of what the screen is teaching. */
    const primeiro = digitado.split(/\s+/)[0];
    const primeiroAlvo = alvo.split(/\s+/)[0];
    const erro = primeiro !== primeiroAlvo
      ? `bash: ${primeiro}: command not found`
      : `${primeiroAlvo}: syntax error — check the red portion above`;

    /* The failed attempt goes BEFORE the live line, not in the output area:
       otherwise the correct command — which replaces the live line, above it —
       would appear in the history before the error that came first, and the
       session would tell the story backwards. */
    const viva = $('cu-t-viva');
    if (viva) {
      viva.insertAdjacentHTML('beforebegin',
        linhaTerminal({ t: 'cmd', v: digitado }) + linhaTerminal({ t: 'err', v: erro }));
      inp.value = '';
      atualizarEspelho();
      const term = $('cu-win-term');
      if (term) term.scrollTop = term.scrollHeight;
    }
    os.erro = primeiro !== primeiroAlvo
      ? 'The first part of the command doesn\'t match — it\'s what tells which program to run.'
      : 'The beginning is correct; what diverges is marked in red on the line.';
    pintarBalao();
    anunciar(erro);
  }

  /* Types by itself, character by character, and runs. This is the way out for
     those on mobile (typing `curl -fsSL …` on a glass keyboard is punishment),
     for those using a screen reader, and for those who just want to see the rest. */
  function digitarPorMim() {
    const inp = $('cu-t-input');
    const p = os.tutorial.passos[os.passo];
    if (!inp || !p.cmd || os.fase !== 'guia') return;
    const cmd = p.cmd;

    if (os.rapido) {
      inp.value = cmd;
      atualizarEspelho();
      rodar();
      return;
    }

    os.fase = 'digitando';
    pintarBalao();
    const porChar = Math.max(10, Math.min(34, 1200 / Math.max(cmd.length, 1)));
    let i = 0;
    const teclar = () => {
      i++;
      inp.value = cmd.slice(0, i);
      atualizarEspelho();
      if (i < cmd.length) agenda(teclar, porChar);
      else agenda(() => { os.fase = 'guia'; rodar(); }, 220);
    };
    agenda(teclar, 90);
  }

  /* ─── run the command ───────────────────────────────────── */
  function rodar() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    os.fase = 'rodando';
    os.erro = null;

    /* The live line becomes a fixed line: the input disappears and the command
       stays in the history, exactly like in a real terminal. */
    const viva = $('cu-t-viva');
    if (viva) viva.outerHTML = linhaTerminal({ t: 'cmd', v: p.cmd || '' });

    pintarBalao();

    const saida = $('cu-t-saida');
    const term = $('cu-win-term');
    const linhas = p.saida || [];
    const passoMs = os.rapido ? 0 : 60;

    if (!saida || !linhas.length) { terminarPasso(); return; }

    linhas.forEach((l, i) => {
      agenda(() => {
        saida.insertAdjacentHTML('beforeend', linhaTerminal(l));
        if (term) term.scrollTop = term.scrollHeight;
        if (i === linhas.length - 1) terminarPasso();
      }, passoMs * i);
    });
  }

  function terminarPasso() {
    if (!os.tutorial) return;
    os.fase = 'feito';
    pintarBalao();
    const p = os.tutorial.passos[os.passo];
    anunciar('Command completed. ' + (p.nota || 'Step ' + (os.passo + 1) + ' done.'));
  }

  function avancar() {
    const t = os.tutorial;
    if (!t) return;
    limparTimers();
    if (os.passo >= t.passos.length - 1) {
      os.fase = 'fim';
      pintarBalao();
      anunciar('Tutorial completed.');
      return;
    }
    os.passo++;
    os.fase = 'guia';
    os.erro = null;
    os.jaInteragiu = true;
    pintarPasso();
  }

  function voltar() {
    const t = os.tutorial;
    if (!t || os.passo === 0) return;
    limparTimers();
    os.passo--;
    os.fase = 'guia';
    os.erro = null;
    pintarPasso();
  }

  /* ─── the balloon: the guide lives INSIDE the screen ────────────
     Before, the explanation lived in a panel below the frame, and the
     effect was that of a caption: the person read below and acted above.
     As a pop-up anchored to the element it talks about, the guide becomes
     part of the scene — which is how real program tutorials work.
     The outer panel didn't disappear: it became the accessible path, with
     the same buttons, for whoever navigates by keyboard or screen reader. */
  function pintarBalao() {
    const el = $('cu-balao');
    if (!el) return;
    const t = os.tutorial;

    if (!t) {
      el.hidden = true;
      el.innerHTML = '';
      const tl = $('cu-os-screen');
      if (tl) tl.classList.remove('cu-guia-esq', 'cu-guia-dir');
      pintarRoteiro();
      return;
    }

    const p = t.passos[os.passo];
    const fim = os.fase === 'fim';
    const ultimo = os.passo === t.passos.length - 1;
    const ancora = fim ? 'centro' : (p.janela === 'terminal' ? 'terminal' : 'janela');

    el.hidden = false;
    el.className = 'cu-balao is-' + ancora + (os.guiaMin ? ' is-min' : '');

    /* The scene yields space to the guide instead of sitting under it: without
       this the balloon would cover exactly the left margin of the terminal, where
       each command line starts. */
    const tela = $('cu-os-screen');
    if (tela) {
      const esq = !os.guiaMin && ancora === 'terminal';
      const dir = !os.guiaMin && ancora === 'janela';
      tela.classList.toggle('cu-guia-esq', esq);
      tela.classList.toggle('cu-guia-dir', dir);
    }

    if (os.guiaMin) {
      el.innerHTML = `<button type="button" class="cu-balao-abrir" data-acao="guia-abrir"
        aria-label="Reopen the tutorial guide">?</button>`;
      return;
    }

    let corpo, acoes;

    if (fim) {
      corpo = `
        <h4 class="cu-balao-t">Tutorial completed</h4>
        <p class="cu-balao-p">${txt(t.fecho)}</p>`;
      acoes = `
        <button type="button" class="cu-balao-btn" data-acao="fechar">Close</button>
        <button type="button" class="cu-balao-sec" data-acao="reiniciar">Do it again</button>`;
    } else {
      const precisaDigitar = p.janela === 'terminal' && os.fase === 'guia';
      const rodando = os.fase === 'rodando' || os.fase === 'digitando';

      corpo = `
        <h4 class="cu-balao-t">${esc(p.titulo)}</h4>
        <p class="cu-balao-p">${txt(p.explicacao)}</p>
        ${precisaDigitar ? `
          <div class="cu-balao-cmd">
            <span class="cu-balao-rot">type in the terminal</span>
            <code>${esc(p.cmd)}</code>
          </div>` : ''}
        ${os.erro ? `<p class="cu-balao-erro">${txt(os.erro)}</p>` : ''}
        ${os.fase === 'feito' && p.nota ? `<p class="cu-balao-nota">${txt(p.nota)}</p>` : ''}`;

      if (rodando) {
        acoes = `<span class="cu-balao-esperando">running…</span>`;
      } else if (precisaDigitar) {
        acoes = `
          <button type="button" class="cu-balao-btn" data-acao="digitar">Type for me</button>
          <span class="cu-balao-dica">or type it yourself and press <kbd>Enter</kbd></span>`;
      } else if (os.fase === 'guia') {
        /* Window step: the action is clicking the simulated button, which is
           blinking inside the window itself. */
        acoes = `<span class="cu-balao-dica">click <strong>${esc(rotuloDoAlvo(p))}</strong> in the window</span>`;
      } else {
        acoes = `<button type="button" class="cu-balao-btn" data-acao="avancar">${ultimo ? 'Finish' : 'Next step'}</button>`;
      }
    }

    el.innerHTML = `
      <div class="cu-balao-topo">
        <span class="cu-balao-passo">${fim ? 'end' : (os.passo + 1) + ' of ' + t.passos.length}</span>
        <span class="cu-balao-tut">${fim || !p.ato ? esc(t.nomeCurto || t.nome) : esc(p.ato)}</span>
        <button type="button" class="cu-balao-x" data-acao="guia-min" aria-label="Shrink the guide">–</button>
      </div>
      ${corpo}
      <div class="cu-balao-acoes">${acoes}</div>
      ${!fim ? `<div class="cu-balao-nav">
        ${os.passo > 0 ? '<button type="button" class="cu-balao-sec" data-acao="voltar">Back</button>' : ''}
        <button type="button" class="cu-balao-sec" data-acao="fechar">Exit</button>
      </div>` : ''}`;

    medirBalao();
    pintarRoteiro();
  }

  /* On mobile the balloon is a strip at the bottom of the screen, and the
     window needs to shrink by exactly its height — otherwise the pop-up covers
     the very button it's telling you to click, and the step becomes impossible.
     The height changes with the text of each step, so it's measured, not guessed. */
  function medirBalao() {
    const el = $('cu-balao');
    const tela = $('cu-os-screen');
    if (!el || !tela) return;
    requestAnimationFrame(() => {
      const h = (!el.hidden && !os.guiaMin) ? el.offsetHeight : 0;
      tela.style.setProperty('--cu-balao-h', h + 'px');
    });
  }

  function rotuloDoAlvo(p) {
    if (p.dialogo) return p.dialogo.botao;
    if (p.navegador) return p.navegador.botao;
    if (p.diff && p.diff.botoes) return p.diff.botoes[0];
    return 'Continue';
  }

  function anunciar(txtMsg) {
    const vivo = $('cu-roteiro-vivo');
    if (vivo) vivo.textContent = txtMsg;
  }

  function pintarPasso() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    if (p.janela === 'terminal') {
      pintarJanela({ tipo: 'terminal', titulo: 'Terminal — bash', linhas: linhasDoPasso(p) });
    } else if (p.janela === 'navegador') {
      pintarJanela({ tipo: 'navegador', titulo: 'Browser', nav: p.navegador });
    } else if (p.janela === 'diff') {
      pintarJanela({ tipo: 'diff', titulo: 'Review — ' + (p.diff && p.diff.arquivo ? p.diff.arquivo : 'file'), diff: p.diff });
    } else {
      pintarJanela({ tipo: 'dialogo', titulo: (p.dialogo && p.dialogo.titulo) || 'Notice', dlg: p.dialogo });
    }

    pintarTaskbar(t.nome);
    pintarBalao();

    if (p.janela === 'terminal') ligarTerminal();

    const term = $('cu-win-term');
    if (term) term.scrollTop = term.scrollHeight;

    anunciar(`Step ${os.passo + 1} of ${t.passos.length}: ${p.titulo}.`);
  }

  /* ─── the outer panel: now it's the accessible path ───────────
     Same commands as the balloon, in plain HTML and always visible in tab
     order. Whoever can see the screen uses the pop-up; whoever navigates by
     keyboard or screen reader has the same operation here without depending
     on the scene. */
  function pintarRoteiro() {
    const el = $('cu-roteiro');
    if (!el) return;
    const t = os.tutorial;

    if (!t) {
      el.innerHTML = `<p class="cu-rot-vazio">
        Choose a tutorial on the desktop above — or via the <strong>Start</strong> button.
      </p>`;
      return;
    }

    const p = t.passos[os.passo];
    const fim = os.fase === 'fim';
    const ultimo = os.passo === t.passos.length - 1;

    let acao = '';
    if (fim) {
      acao = `<button type="button" class="cu-rot-btn" data-acao="fechar">Finish and close</button>`;
    } else if (os.fase === 'rodando' || os.fase === 'digitando') {
      acao = `<button type="button" class="cu-rot-btn is-esperando" disabled>running…</button>`;
    } else if (os.fase === 'feito') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${ultimo ? 'Finish' : 'Next step'}</button>`;
    } else if (p.janela === 'terminal') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="digitar">Run this step's command</button>`;
    } else {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${esc(rotuloDoAlvo(p))}</button>`;
    }

    el.innerHTML = `
      <p class="cu-rot-porque">
        The same guide from the little screen, in text — for those who prefer to read before acting,
        navigate by keyboard, or use a screen reader. The buttons here and in the balloon
        do exactly the same thing.
      </p>
      <div class="cu-rot-topo">
        <span class="cu-rot-passo">${fim ? 'end' : `step ${os.passo + 1} of ${t.passos.length}`}</span>
        <span class="cu-rot-tut">${esc(t.nome)}${!fim && p.ato ? ' · ' + esc(p.ato) : ''}</span>
        <span class="cu-rot-min">~${t.minutos} min total</span>
      </div>
      ${t.objetivo ? `<p class="cu-rot-objetivo"><span>Where this will lead</span>${txt(t.objetivo)}</p>` : ''}
      ${fim ? `
        <h3 class="cu-rot-titulo">Tutorial completed</h3>
        <p class="cu-rot-exp">${txt(t.fecho)}</p>
      ` : `
        <h3 class="cu-rot-titulo">${esc(p.titulo)}</h3>
        <p class="cu-rot-exp">${txt(p.explicacao)}</p>
        ${p.cmd ? `
          <div class="cu-rot-cmd">
            <code>${esc(p.cmd)}</code>
            <button type="button" class="cu-copiar" data-acao="copiar" data-cmd="${esc(p.cmd)}">copy</button>
          </div>` : ''}
        ${os.fase === 'feito' && p.nota ? `<p class="cu-rot-nota">${txt(p.nota)}</p>` : ''}
      `}
      <div class="cu-rot-acoes">
        ${acao}
        ${os.passo > 0 && !fim ? '<button type="button" class="cu-rot-sec" data-acao="voltar">Previous step</button>' : ''}
        <button type="button" class="cu-rot-sec" data-acao="fechar">Exit tutorial</button>
        <label class="cu-rot-rapido">
          <input type="checkbox" ${os.rapido ? 'checked' : ''} data-acao="rapido">
          no animation
        </label>
      </div>`;
  }

  /* A single dispatcher for the balloon, the panel, and the simulated buttons
     inside the windows: the three surfaces trigger the SAME actions, and that's
     what keeps the pop-up and the accessible path always on the same step. */
  function acao(nome, alvo) {
    if (nome === 'digitar') digitarPorMim();
    else if (nome === 'avancar') avancar();
    else if (nome === 'voltar') voltar();
    else if (nome === 'sair' || nome === 'fechar') fechar();
    else if (nome === 'reiniciar') { const id = os.tutorial && os.tutorial.id; if (id) abrir(id); }
    else if (nome === 'copiar') copiar(alvo);
    else if (nome === 'guia-min') { os.guiaMin = true; pintarBalao(); }
    else if (nome === 'guia-abrir') { os.guiaMin = false; pintarBalao(); }
  }

  function ligarControles() {
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('#cu-roteiro [data-acao], #cu-balao [data-acao], #cu-windows [data-acao]');
      if (!alvo) return;
      os.jaInteragiu = true;
      acao(alvo.dataset.acao, alvo);
    });

    document.addEventListener('change', (e) => {
      const alvo = e.target.closest('[data-acao="rapido"]');
      if (!alvo) return;
      os.rapido = alvo.checked;
    });
  }


  function copiar(btn) {
    const cmd = btn.dataset.cmd || '';
    const ok = () => {
      const antes = btn.textContent;
      btn.textContent = 'copied';
      btn.classList.add('is-ok');
      setTimeout(() => { btn.textContent = antes; btn.classList.remove('is-ok'); }, 1600);
    };
    const naoDeu = () => {
      const antes = btn.textContent;
      btn.textContent = 'failed';
      setTimeout(() => { btn.textContent = antes; }, 1600);
    };
    /* Fallback for old browser, context without HTTPS, and iframe without
       clipboard permission — inside the Observatory embed the API
       exists but denies access, and that's where it needs to be retried. */
    const reserva = () => {
      const ta = document.createElement('textarea');
      ta.value = cmd;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      let foi = false;
      try { foi = document.execCommand('copy'); } catch (_) { /* no fuss */ }
      document.body.removeChild(ta);
      return foi;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(ok, () => {
        if (!reserva()) naoDeu();
      });
      return;
    }
    if (!reserva()) naoDeu();
  }

  /* ─── kickoff ────────────────────────────────────────────── */

  function init() {
    if (!D) {
      console.error('COMO_USAR_DATA was not loaded.');
      return;
    }

    const upd = $('cu-updated');
    if (upd) upd.textContent = fmtDataCurta(D.updatedAt) || '—';

    renderEssencial(); // the summary lives at the end (section 07), but renders just the same
    renderAbertura();
    renderCenas();
    ligarCenas();
    renderContraponto();
    renderPermanencia();
    renderFerramentas();
    renderFamilias();
    colapsarCatalogo();
    renderPonte();
    renderMedicao();
    renderPlano();

    /* The script is injected right below the frame: without JS there is
       no interactive tutorial at all, and an orphaned control panel in the
       HTML would only confuse anyone who lands here with scripts blocked. */
    /* The balloon lives INSIDE the frame, overlaid on the scene; the script
       stays below it. Both are born via script because, without JS, there is
       no tutorial at all — and an orphaned guide in the HTML would only
       confuse anyone who lands here with scripts blocked. */
    const tela = $('cu-os-screen');
    if (tela) {
      const balao = document.createElement('div');
      balao.id = 'cu-balao';
      balao.className = 'cu-balao';
      balao.hidden = true;
      tela.appendChild(balao);
    }

    const osEl = $('cu-os');
    if (osEl) {
      const roteiro = document.createElement('div');
      roteiro.className = 'cu-rot';
      roteiro.id = 'cu-roteiro';
      const vivo = document.createElement('p');
      vivo.className = 'sr-only';
      vivo.id = 'cu-roteiro-vivo';
      vivo.setAttribute('role', 'status');
      vivo.setAttribute('aria-live', 'polite');
      osEl.appendChild(roteiro);
      osEl.appendChild(vivo);
    }

    renderDesktop();
    renderStartMenu();
    relogio();
    ligarControles();
    pintarBalao();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
