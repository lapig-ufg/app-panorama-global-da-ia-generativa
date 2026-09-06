/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — "Como usar fora do navegador"
   Renderização das seções e o simulador de área de trabalho com os
   tutoriais interativos.

   DUAS DECISÕES QUE EXPLICAM O RESTO DO ARQUIVO:

   1. Tudo é gerado a partir de COMO_USAR_DATA. A página não guarda
      texto no HTML porque o conteúdo aqui é uma tese em cinco atos,
      e tese se revisa: manter o texto num arquivo só evita a
      situação clássica de corrigir um número no card e esquecer o
      mesmo número na tabela.

   2. O simulador nunca é o único caminho. Todo passo dos tutoriais
      também sai em texto corrido dentro de <details> — quem usa
      leitor de tela, quem está no celular e quem só quer copiar os
      comandos não deveria precisar operar uma janelinha de mentira
      para chegar ao conteúdo.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const D = typeof COMO_USAR_DATA !== 'undefined' ? COMO_USAR_DATA : null;

  /* ─── utilidades ─────────────────────────────────────────── */

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Cópia local do fmtDataBR de data.js, como em gratuitos.js: esta página
     também não carrega data.js só para formatar uma data. */
  const MESES_BR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  function fmtDataCurta(iso) {
    const m = String(iso == null ? '' : iso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    return `${m[3]} ${MESES_BR[+m[2] - 1]} ${m[1]}`;
  }

  /* Prosa com trechos de comando: no arquivo de dados eles vêm entre crases,
     como em markdown, porque escrever <code> no meio de uma frase em
     português torna o texto ilegível para quem edita. A conversão acontece
     DEPOIS do escape, então o conteúdo continua sendo tratado como texto. */
  function txt(str) {
    return esc(str).replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function $(id) { return document.getElementById(id); }

  /* O usuário pediu menos animação no sistema operacional dele. Respeitar isso
     não é enfeite de acessibilidade: para quem tem sensibilidade vestibular,
     texto que se datilografa sozinho é desconforto real. */
  const semMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 01 · vocabulário ───────────────────────────────────── */

  function renderVocabulario() {
    const v = D.vocabulario;

    const lede = $('cu-vocab-lede');
    if (lede) lede.textContent = v.lede;

    const eixos = $('cu-eixos');
    if (eixos) {
      eixos.innerHTML = v.eixos.map((e, i) => `
        <article class="cu-eixo ${i === 0 ? 'is-nao' : 'is-sim'}">
          <h3 class="cu-eixo-q">${esc(e.pergunta)}</h3>
          <div class="cu-eixo-par">
            <div class="cu-eixo-lado">
              <span class="cu-eixo-rot">Numa aba do navegador</span>
              <p>${esc(e.esquerda)}</p>
            </div>
            <div class="cu-eixo-lado">
              <span class="cu-eixo-rot">Com acesso ao terminal</span>
              <p>${esc(e.direita)}</p>
            </div>
          </div>
          <p class="cu-eixo-ver">${esc(e.veredito)}</p>
          <p class="cu-eixo-nota">${txt(e.nota)}</p>
        </article>
      `).join('');
    }

    const tese = $('cu-tese');
    if (tese) tese.innerHTML = v.tese;

    const nomes = $('cu-nomes');
    if (nomes) {
      nomes.innerHTML = v.candidatos.map(c => `
        <article class="cu-nome ${c.recomendado ? 'is-rec' : ''}">
          <header class="cu-nome-head">
            <h4>${esc(c.par)}</h4>
            ${c.recomendado ? '<span class="cu-nome-badge">nossa proposta</span>' : ''}
          </header>
          <p class="cu-nome-pro"><span>A favor</span>${txt(c.aFavor)}</p>
          <p class="cu-nome-con"><span>Contra</span>${txt(c.contra)}</p>
        </article>
      `).join('');
    }

    const aberto = $('cu-aberto');
    if (aberto) aberto.textContent = v.emAberto;
  }

  /* ─── transcrições ───────────────────────────────────────── */

  /* Um único renderizador para os dois lados da comparação e para o terminal
     do simulador: se a aparência da linha de comando divergir entre as
     seções, o leitor passa a achar que são coisas diferentes. */
  function linhaTerminal(l) {
    const v = esc(l.v);
    switch (l.t) {
      case 'cmd':  return `<div class="cu-t-linha"><span class="cu-t-ps">$</span><code>${v}</code></div>`;
      case 'cont': return `<div class="cu-t-linha"><span class="cu-t-ps cu-t-ps2">&gt;</span><code>${v}</code></div>`;
      case 'err':  return `<div class="cu-t-linha cu-t-err"><code>${v}</code></div>`;
      case 'nota': return `<div class="cu-t-nota">${txt(l.v)}</div>`;
      case 'pedido': return `<div class="cu-t-linha cu-t-pedido"><span class="cu-t-ps">❯</span><code>${v}</code></div>`;
      default:     return `<div class="cu-t-linha cu-t-out"><code>${v}</code></div>`;
    }
  }

  function linhaChat(l) {
    const v = esc(l.v);
    if (l.t === 'nota') return `<div class="cu-c-nota">${txt(l.v)}</div>`;
    const quem = l.t === 'voce' ? 'Você' : 'IA';
    return `
      <div class="cu-c-linha cu-c-${l.t === 'voce' ? 'voce' : 'ia'}">
        <span class="cu-c-quem">${quem}</span>
        <p>${v}</p>
      </div>`;
  }

  /* ─── 02 · cenários ──────────────────────────────────────── */

  let cenarioAtual = 0;

  /* Só desenha os botões. Os ouvintes ficam em ligarTabs(), chamado uma vez na
     partida: como esta função é reexecutada a cada troca de aba, registrar o
     ouvinte aqui empilharia um a cada clique — e a seta do teclado passaria a
     pular várias abas de uma vez, uma por ouvinte acumulado. */
  function renderTabs() {
    const tabs = $('cu-cenario-tabs');
    if (!tabs) return;

    tabs.innerHTML = D.cenarios.map((c, i) => `
      <button type="button" role="tab" class="cu-tab ${i === cenarioAtual ? 'is-active' : ''}"
              id="cu-tab-${esc(c.id)}" data-i="${i}" tabindex="${i === cenarioAtual ? '0' : '-1'}"
              aria-selected="${i === cenarioAtual}" aria-controls="cu-painel-cenario">
        ${esc(c.aba)}
      </button>
    `).join('');
  }

  function irPara(i, focar) {
    cenarioAtual = (i + D.cenarios.length) % D.cenarios.length;
    renderTabs();
    pintarCenario();
    if (focar) {
      const alvo = $('cu-cenario-tabs').querySelector('.cu-tab.is-active');
      if (alvo) alvo.focus();
    }
  }

  function ligarTabs() {
    const tabs = $('cu-cenario-tabs');
    if (!tabs) return;

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.cu-tab');
      if (!btn) return;
      irPara(+btn.dataset.i, false);
    });

    /* Setas, Home e End dentro da fileira, com tabindex móvel: é o padrão
       WAI-ARIA de tablist. Sem ele o Tab gasta cinco paradas para atravessar
       as abas antes de chegar ao conteúdo que elas controlam. */
    tabs.addEventListener('keydown', (e) => {
      const mapa = {
        ArrowRight: cenarioAtual + 1,
        ArrowLeft: cenarioAtual - 1,
        Home: 0,
        End: D.cenarios.length - 1
      };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      irPara(mapa[e.key], true);
    });
  }

  function pintarCenario() {
    const painel = $('cu-cenario-painel');
    if (!painel) return;
    const c = D.cenarios[cenarioAtual];

    painel.innerHTML = `
      <div class="cu-cen" id="cu-painel-cenario" role="tabpanel"
           aria-labelledby="cu-tab-${esc(c.id)}" tabindex="0">

        <h3 class="cu-cen-titulo">${esc(c.titulo)}</h3>
        <p class="cu-cen-ctx">${esc(c.contexto)}</p>

        <div class="cu-lado-a-lado">
          <section class="cu-col cu-col-chat" aria-label="${esc(c.chat.rotulo)}">
            <header class="cu-col-head">
              <span class="cu-col-tag cu-tag-chat">${esc(c.chat.rotulo)}</span>
            </header>
            <div class="cu-chat">${c.chat.transcricao.map(linhaChat).join('')}</div>
            <footer class="cu-custo">
              <div><span>Tempo</span>${esc(c.chat.custo.tempo)}</div>
              <div><span>Vaivém</span>${esc(c.chat.custo.idas)}</div>
              <div class="cu-custo-risco"><span>Risco</span>${txt(c.chat.custo.risco)}</div>
            </footer>
          </section>

          <section class="cu-col cu-col-term" aria-label="${esc(c.terminal.rotulo)}">
            <header class="cu-col-head">
              <span class="cu-col-tag cu-tag-term">${esc(c.terminal.rotulo)}</span>
            </header>
            <div class="cu-term">${c.terminal.transcricao.map(linhaTerminal).join('')}</div>
            <footer class="cu-custo">
              <div><span>Tempo</span>${esc(c.terminal.custo.tempo)}</div>
              <div><span>Vaivém</span>${esc(c.terminal.custo.idas)}</div>
              <div class="cu-custo-risco"><span>Risco</span>${txt(c.terminal.custo.risco)}</div>
            </footer>
          </section>
        </div>

        <h4 class="cu-cmd-h">Os comandos, um por um</h4>
        <dl class="cu-cmds">
          ${c.comandos.map(k => `
            <div class="cu-cmd">
              <dt><code>${esc(k.cmd)}</code></dt>
              <dd>${txt(k.oQueFaz)}</dd>
            </div>
          `).join('')}
        </dl>

        <p class="cu-licao">${c.licao}</p>
      </div>
    `;
  }

  /* ─── 03 · ferramentas ───────────────────────────────────── */

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

  /* ─── 05 · catálogo ──────────────────────────────────────── */

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
                ${it.codigoAberto ? `<span class="cu-ferr-open">${esc(it.licenca || 'código aberto')}</span>` : ''}
              </header>

              <div class="cu-ferr-inst">
                <span class="cu-ferr-rot">Como instala</span>
                ${it.comando
                  ? `<code>${esc(it.instala)}</code>`
                  : `<p class="cu-ferr-gui">${esc(it.instala)}</p>`}
                <p class="cu-ferr-alt">${esc(it.instalaAlt)}</p>
              </div>

              <div class="cu-ferr-campo">
                <span class="cu-ferr-rot">Precisa de</span>
                <p>${txt(it.precisa)}</p>
              </div>

              <div class="cu-ferr-campo">
                <span class="cu-ferr-rot">Alcance</span>
                <p>${txt(it.acesso)}</p>
              </div>

              ${it.destaque ? `<p class="cu-ferr-dest">${esc(it.destaque)}</p>` : ''}

              <a class="cu-link-btn" href="${esc(it.link)}" target="_blank" rel="noopener">
                <span>Página oficial</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');
  }

  /* ─── 06 · segurança ─────────────────────────────────────── */

  function renderSeguranca() {
    const el = $('cu-seg');
    if (!el) return;
    el.innerHTML = D.seguranca.map((s, i) => `
      <article class="cu-seg-item">
        <span class="cu-seg-n">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${esc(s.titulo)}</h3>
          <p>${txt(s.texto)}</p>
        </div>
      </article>
    `).join('');
  }

  /* ─── 04 · tutoriais em texto (o caminho sem simulação) ──── */

  function renderPlano() {
    const el = $('cu-plain-body');
    if (!el) return;
    el.innerHTML = D.tutoriais.map(t => `
      <section class="cu-plain-tut">
        <h3>${esc(t.nome)} <span>· ${esc(t.legenda)}</span></h3>
        <ol>
          ${t.passos.map(p => `
            <li>
              <strong>${esc(p.titulo)}</strong>
              <p>${txt(p.explicacao)}</p>
              ${p.cmd ? `<pre><code>${esc(p.cmd)}</code></pre>` : ''}
              ${p.dialogo ? `<ul>${p.dialogo.linhas.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
              ${p.navegador ? `<p class="cu-plain-url">${esc(p.navegador.url)}</p>` : ''}
              ${p.nota ? `<p class="cu-plain-nota">${txt(p.nota)}</p>` : ''}
            </li>
          `).join('')}
        </ol>
        <p class="cu-plain-fecho">${txt(t.fecho)}</p>
      </section>
    `).join('');
  }

  /* ═══════════════════════════════════════════════════════════
     04 · O SIMULADOR
     ═══════════════════════════════════════════════════════════
     Uma tela de computador de mentira com um tutorial de verdade
     dentro. A brincadeira visual tem função: quem nunca abriu um
     terminal trava no primeiro `$`, e uma janela obviamente falsa
     deixa esse primeiro passo sem consequência — não há como
     quebrar nada aqui.

     O roteiro (passo, explicação, botão) mora FORA da moldura, em
     HTML normal, com botões de verdade. Assim o teclado e o leitor
     de tela operam o tutorial sem precisar entender a simulação. */

  const os = {
    tutorial: null,   // objeto do tutorial aberto
    passo: 0,         // índice do passo corrente
    fase: 'pronto',   // 'pronto' → 'rodando' → 'feito'
    scrollback: [],   // linhas já impressas no terminal simulado
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

    const itens = D.tutoriais.map(t => ({
      id: t.id, nome: t.nome, icone: t.icone, legenda: t.legenda
    })).concat([{ id: 'leiame', nome: 'Leia-me.txt', icone: 'leiame', legenda: 'O que é esta tela' }]);

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
      <div class="cu-sm-faixa" aria-hidden="true">Tutoriais</div>
      <div class="cu-sm-lista">
        ${D.tutoriais.map(t => `
          <button type="button" class="cu-sm-item" data-abrir="${esc(t.id)}">
            ${svgIcone(t.icone, 18)}
            <span><strong>${esc(t.nome)}</strong><em>${esc(t.legenda)}</em></span>
          </button>
        `).join('')}
        <button type="button" class="cu-sm-item" data-abrir="leiame">
          ${svgIcone('leiame', 18)}
          <span><strong>Leia-me.txt</strong><em>O que é esta tela</em></span>
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
      pintarJanela({
        tipo: 'leiame',
        titulo: 'Leia-me.txt'
      });
      pintarTaskbar('Leia-me.txt');
      pintarRoteiro();
      return;
    }
    const t = D.tutoriais.find(x => x.id === id);
    if (!t) return;
    os.tutorial = t;
    os.passo = 0;
    os.fase = 'pronto';
    os.scrollback = [];
    pintarPasso();
  }

  function fechar() {
    limparTimers();
    os.tutorial = null;
    os.fase = 'pronto';
    os.scrollback = [];
    $('cu-windows').innerHTML = '';
    pintarTaskbar(null);
    pintarRoteiro();
  }

  /* Uma janela por vez. Um gerenciador de janelas de verdade seria uma
     brincadeira mais fiel e um tutorial pior: o leitor precisa saber, sem
     pensar, onde está o passo atual. */
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
            <span class="cu-nav-btn">${esc(n.botao)}</span>
          </div>
        </div>`;
    } else if (cfg.tipo === 'dialogo') {
      const g = cfg.dlg;
      corpo = `
        <div class="cu-win-dlg">
          <h5>${esc(g.titulo)}</h5>
          <ul>${g.linhas.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
          <span class="cu-dlg-btn">${esc(g.botao)}</span>
        </div>`;
    } else {
      corpo = `
        <div class="cu-win-dlg cu-win-leiame">
          <h5>O que é esta tela</h5>
          <p>Um computador de brincadeira, com a cara dos anos 2000. Ele existe para que o
             primeiro contato com o terminal aconteça num lugar onde nada pode dar errado.</p>
          <p>Os comandos são reais e foram testados. As saídas são reconstituições fiéis —
             não são gravações, e nada aqui executa de verdade.</p>
          <p>Quando você rodar no seu computador, a tela vai ser parecida com esta. Essa é a ideia.</p>
        </div>`;
    }

    wrap.innerHTML = `
      <div class="cu-win ${cfg.tipo === 'terminal' ? 'is-term' : ''}">
        <div class="cu-win-bar">
          <span class="cu-win-titulo">${esc(cfg.titulo)}</span>
          <span class="cu-win-bts" aria-hidden="true">
            <i class="cu-wb">_</i><i class="cu-wb">□</i>
          </span>
          <button type="button" class="cu-wb cu-wb-x" id="cu-win-x" aria-label="Fechar a janela">×</button>
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

  function linhasDoPasso(p) {
    /* O scrollback acumula os passos anteriores: é o que dá a sensação de uma
       sessão contínua, e não de sete telas soltas. */
    let html = os.scrollback.join('');
    if (p.prompt) html += linhaTerminal({ t: 'pedido', v: p.prompt });
    html += `<div class="cu-t-linha" id="cu-t-atual"><span class="cu-t-ps">$</span><code id="cu-t-cmd"></code><span class="cu-cursor" id="cu-cursor"></span></div>`;
    html += `<div id="cu-t-saida"></div>`;
    return html;
  }

  function pintarPasso() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    if (p.janela === 'terminal') {
      pintarJanela({ tipo: 'terminal', titulo: 'Terminal — bash', linhas: linhasDoPasso(p) });
    } else if (p.janela === 'navegador') {
      pintarJanela({ tipo: 'navegador', titulo: 'Navegador', nav: p.navegador });
    } else {
      pintarJanela({ tipo: 'dialogo', titulo: p.dialogo.titulo, dlg: p.dialogo });
    }

    pintarTaskbar(t.nome);
    pintarRoteiro();

    const term = $('cu-win-term');
    if (term) term.scrollTop = term.scrollHeight;
  }

  function executar() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    /* Passo que não é comando (navegador, caixa de diálogo) não tem o que
       executar: o botão dele já é "avancei". */
    if (p.janela !== 'terminal') {
      avancar();
      return;
    }

    os.fase = 'rodando';
    pintarRoteiro();

    const alvo = $('cu-t-cmd');
    const cursor = $('cu-cursor');
    const saida = $('cu-t-saida');
    const term = $('cu-win-term');
    if (!alvo || !saida) { terminarPasso(); return; }

    const cmd = p.cmd || '';

    const imprimirSaida = () => {
      if (cursor) cursor.remove();
      const linhas = p.saida || [];
      const passoMs = os.rapido ? 0 : 55;
      linhas.forEach((l, i) => {
        agenda(() => {
          saida.insertAdjacentHTML('beforeend', linhaTerminal(l));
          if (term) term.scrollTop = term.scrollHeight;
          if (i === linhas.length - 1) terminarPasso();
        }, passoMs * i);
      });
      if (!linhas.length) terminarPasso();
    };

    if (os.rapido) {
      alvo.textContent = cmd;
      imprimirSaida();
      return;
    }

    /* Velocidade de digitação: rápida o bastante para não entediar, lenta o
       bastante para o olho acompanhar o comando sendo montado — que é o
       ponto pedagógico da animação. Comandos longos aceleram para o total
       nunca passar de ~1,4 s. */
    const porChar = Math.max(12, Math.min(38, 1400 / Math.max(cmd.length, 1)));
    let i = 0;
    const teclar = () => {
      i++;
      alvo.textContent = cmd.slice(0, i);
      if (term) term.scrollTop = term.scrollHeight;
      if (i < cmd.length) {
        agenda(teclar, porChar);
      } else {
        agenda(imprimirSaida, 260);
      }
    };
    agenda(teclar, 120);
  }

  function terminarPasso() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    /* Congela o passo no scrollback para que o próximo comando apareça
       embaixo dele, como numa sessão de verdade. */
    const bloco = [];
    if (p.prompt) bloco.push(linhaTerminal({ t: 'pedido', v: p.prompt }));
    if (p.cmd) bloco.push(linhaTerminal({ t: 'cmd', v: p.cmd }));
    (p.saida || []).forEach(l => bloco.push(linhaTerminal(l)));
    os.scrollback.push(bloco.join(''));

    os.fase = 'feito';
    pintarRoteiro();
  }

  function avancar() {
    const t = os.tutorial;
    if (!t) return;
    if (os.passo >= t.passos.length - 1) {
      os.fase = 'fim';
      pintarRoteiro();
      return;
    }
    os.passo++;
    os.fase = 'pronto';
    pintarPasso();
  }

  function voltar() {
    const t = os.tutorial;
    if (!t || os.passo === 0) return;
    limparTimers();
    os.passo--;
    os.scrollback = os.scrollback.slice(0, Math.max(0, os.scrollback.length - 1));
    os.fase = 'pronto';
    pintarPasso();
  }

  /* O roteiro é o painel de controle do tutorial — e o único lugar onde há
     botões de verdade. Ele fica fora da moldura de propósito: a simulação é
     ilustração, a operação é HTML comum. */
  function pintarRoteiro() {
    const el = $('cu-roteiro');
    if (!el) return;

    const t = os.tutorial;

    if (!t) {
      el.innerHTML = `
        <p class="cu-rot-vazio">
          Escolha um tutorial na área de trabalho acima — ou pelo botão <strong>Iniciar</strong>.
        </p>`;
      return;
    }

    const p = t.passos[os.passo];
    const fim = os.fase === 'fim';
    const ultimo = os.passo === t.passos.length - 1;

    let acao = '';
    if (fim) {
      acao = `<button type="button" class="cu-rot-btn" data-acao="fechar">Concluir e fechar</button>`;
    } else if (p.janela !== 'terminal') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${esc((p.dialogo && p.dialogo.botao) || (p.navegador && p.navegador.botao) || 'Continuar')}</button>`;
    } else if (os.fase === 'pronto') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="executar">Executar o comando</button>`;
    } else if (os.fase === 'rodando') {
      acao = `<button type="button" class="cu-rot-btn is-esperando" disabled>rodando…</button>`;
    } else {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${ultimo ? 'Terminar' : 'Próximo passo'}</button>`;
    }

    el.innerHTML = `
      <div class="cu-rot-topo">
        <span class="cu-rot-passo">${fim ? 'fim' : `passo ${os.passo + 1} de ${t.passos.length}`}</span>
        <span class="cu-rot-tut">${esc(t.nome)}</span>
        <span class="cu-rot-min">~${t.minutos} min no total</span>
      </div>

      ${fim ? `
        <h3 class="cu-rot-titulo">Tutorial concluído</h3>
        <p class="cu-rot-exp">${txt(t.fecho)}</p>
      ` : `
        <h3 class="cu-rot-titulo">${esc(p.titulo)}</h3>
        <p class="cu-rot-exp">${txt(p.explicacao)}</p>
        ${p.cmd ? `
          <div class="cu-rot-cmd">
            <code>${esc(p.cmd)}</code>
            <button type="button" class="cu-copiar" data-acao="copiar" data-cmd="${esc(p.cmd)}">copiar</button>
          </div>` : ''}
        ${os.fase === 'feito' && p.nota ? `<p class="cu-rot-nota">${txt(p.nota)}</p>` : ''}
      `}

      <div class="cu-rot-acoes">
        ${acao}
        ${os.passo > 0 && !fim ? '<button type="button" class="cu-rot-sec" data-acao="voltar">Passo anterior</button>' : ''}
        <button type="button" class="cu-rot-sec" data-acao="sair">Sair do tutorial</button>
        <label class="cu-rot-rapido">
          <input type="checkbox" ${os.rapido ? 'checked' : ''} data-acao="rapido">
          sem animação
        </label>
      </div>
    `;

    /* Estado do tutorial anunciado a quem não vê a janelinha. */
    const vivo = $('cu-roteiro-vivo');
    if (vivo) {
      vivo.textContent = fim
        ? `${t.nome}: tutorial concluído.`
        : `${t.nome}, passo ${os.passo + 1} de ${t.passos.length}: ${p.titulo}.`;
    }
  }

  function ligarRoteiro() {
    const el = $('cu-roteiro');
    if (!el) return;

    el.addEventListener('click', (e) => {
      const alvo = e.target.closest('[data-acao]');
      if (!alvo) return;
      const acao = alvo.dataset.acao;

      if (acao === 'executar') executar();
      else if (acao === 'avancar') avancar();
      else if (acao === 'voltar') voltar();
      else if (acao === 'sair' || acao === 'fechar') fechar();
      else if (acao === 'copiar') copiar(alvo);
    });

    el.addEventListener('change', (e) => {
      const alvo = e.target.closest('[data-acao="rapido"]');
      if (!alvo) return;
      os.rapido = alvo.checked;
    });
  }

  function copiar(btn) {
    const txt = btn.dataset.cmd || '';
    const ok = () => {
      const antes = btn.textContent;
      btn.textContent = 'copiado';
      btn.classList.add('is-ok');
      setTimeout(() => { btn.textContent = antes; btn.classList.remove('is-ok'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, () => {});
      return;
    }
    /* Reserva para navegador antigo e para contexto sem HTTPS, onde a API de
       área de transferência simplesmente não existe. */
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); ok(); } catch (_) { /* sem alarde */ }
    document.body.removeChild(ta);
  }

  /* ─── partida ────────────────────────────────────────────── */

  function init() {
    if (!D) {
      console.error('COMO_USAR_DATA não foi carregado.');
      return;
    }

    const upd = $('cu-updated');
    if (upd) upd.textContent = fmtDataCurta(D.updatedAt) || '—';

    renderVocabulario();
    renderTabs();
    ligarTabs();
    pintarCenario();
    renderFerramentas();
    renderFamilias();
    renderSeguranca();
    renderPlano();

    /* O roteiro é injetado por script logo abaixo da moldura: sem JS não há
       tutorial interativo nenhum, e um painel de controle órfão no HTML só
       confundiria quem cair aqui com o script bloqueado. */
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
    ligarRoteiro();
    pintarRoteiro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
