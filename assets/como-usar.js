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
  const CENAS = typeof COMO_USAR_CENAS !== 'undefined' ? COMO_USAR_CENAS : null;

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

  /* Prosa com trechos de comando e ênfase: no arquivo de dados eles vêm entre
     crases e asteriscos, como em markdown, porque escrever <code> ou <strong>
     no meio de uma frase em português torna o texto ilegível para quem edita.
     A conversão acontece DEPOIS do escape, então o conteúdo continua sendo
     tratado como texto — uma tag escrita à mão no arquivo de dados aparece
     como tag, e não vira marcação (foi assim que um <strong> perdido apareceu
     escrito na tela). Campos com HTML de verdade (tese, licao, fecho, lede)
     não passam por aqui: eles são inseridos crus, de propósito. */
  function txt(str) {
    return esc(str)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
      /* Linha vazia é espaço de respiro que o autor do dado escreveu de
         propósito; sem o &nbsp; o flex da linha colapsa a zero pixels. */
      default:     return `<div class="cu-t-linha cu-t-out"><code>${v || '&nbsp;'}</code></div>`;
    }
  }

  function linhaChat(l) {
    if (l.t === 'nota') return `<div class="cu-c-nota">${txt(l.v)}</div>`;
    const quem = l.t === 'voce' ? 'Você' : 'IA';
    /* txt(), não esc(): os dados usam crases para nomes de comando — a coluna
       do terminal converte, e a bolha de chat precisa converter igual. */
    return `
      <div class="cu-c-linha cu-c-${l.t === 'voce' ? 'voce' : 'ia'}">
        <span class="cu-c-quem">${quem}</span>
        <p>${txt(l.v)}</p>
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
    renderLicoes();
    pintarCenario();
    if (focar) {
      const alvo = $('cu-cenario-tabs').querySelector('.cu-tab.is-active');
      if (alvo) alvo.focus();
    }
  }

  function ligarTabs() {
    const tabs = $('cu-cenario-tabs');
    if (!tabs) return;

    const tira = $('cu-licoes');
    if (tira) {
      tira.addEventListener('click', (e) => {
        const chip = e.target.closest('.cu-licao-chip');
        if (!chip) return;
        /* focar=true também no clique: quem ativa com Enter precisa do foco
           de volta, senão o re-render apaga o botão e a fileira perde as
           setas do teclado até o próximo Tab do topo da página. */
        irPara(+chip.dataset.i, true);
      });
    }

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.cu-tab');
      if (!btn) return;
      irPara(+btn.dataset.i, true);
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

  /* A tira das cinco lições. Ela não é sumário: é o inventário do que cada
     cenário ensina de diferente, para o leitor saber o que ganha ao clicar.
     aria-hidden porque as abas logo abaixo já expõem a mesma navegação ao
     leitor de tela — repeti-la seria obrigá-lo a ouvir a fileira duas vezes. */
  function renderLicoes() {
    const el = $('cu-licoes');
    if (!el) return;
    el.innerHTML = D.cenarios.map((c, i) => `
      <button type="button" class="cu-licao-chip ${i === cenarioAtual ? 'is-active' : ''}"
              data-i="${i}" tabindex="-1">
        <span class="cu-licao-n">${i + 1}</span>
        <span class="cu-licao-txt">${esc(c.licaoCurta)}</span>
      </button>
    `).join('');
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

  /* ═══════════════════════════════════════════════════════════
     02b · AS CENAS — a conversa real, reproduzida
     ═══════════════════════════════════════════════════════════
     Antes esta seção era uma transcrição estática que eu tinha
     escrito à mão. Agora é a reprodução de uma conversa que
     aconteceu de verdade (ver automation/capturas/), tocada passo
     a passo dentro de uma janela de navegador simulada.

     Por que animar: o argumento da seção é sobre TEMPO e sobre
     ORDEM — a recomendação que chega antes da pergunta que a
     valida, a conferência que passa enquanto o dado se perde. Num
     bloco de texto parado, ordem é só posição na página; tocando,
     ela vira sequência, que é o que ela realmente é.

     Os blocos `marca` são a voz do site. Tudo o mais é citação
     literal, conferida por automation/valida-cenas.mjs. */

  const cena = {
    i: 0,          // qual cena
    b: 0,          // qual beat já foi revelado (exclusivo)
    tocando: false,
    timers: [],
    rapido: semMovimento
  };

  function cenaLimpar() {
    cena.timers.forEach(clearTimeout);
    cena.timers = [];
  }

  function cenaAgenda(fn, ms) { cena.timers.push(setTimeout(fn, ms)); }

  function cenaAtual() { return CENAS.cenas[cena.i]; }

  /* Cada beat dura o tempo de ser lido, não um valor fixo: uma bolha de
     duas linhas e um bloco de comando de oito não podem passar na mesma
     velocidade. O piso evita que beats curtos pisquem. */
  function cenaDuracao(b) {
    if (cena.rapido) return 0;
    const n = (b.txt || (b.ops || []).join(' ') || '').length;
    return Math.min(2200, Math.max(620, 340 + n * 7));
  }

  function beatHTML(b, revelando) {
    const cls = revelando ? ' is-entrando' : '';
    switch (b.t) {
      case 'voce':
        return `<div class="cn-msg cn-voce${cls}"><div class="cn-bolha">${txt(b.txt)}</div></div>`;
      case 'ia':
        return `<div class="cn-msg cn-ia${cls}">
          <span class="cn-av" aria-hidden="true"></span>
          <div class="cn-bolha">${txt(b.txt)}${b.corte ? '<span class="cn-corte">resposta cortada aqui</span>' : ''}</div>
        </div>`;
      case 'sandbox':
        /* Colapsado, como vinha na tela: o briefing registrou que os blocos
           de código executado ficavam atrás de um botão "Mostrar código", e
           que um usuário comum não veria que houve execução. Reproduzir isso
           fechado é parte do que a cena tem a dizer. */
        return `<div class="cn-msg cn-ia${cls}">
          <span class="cn-av" aria-hidden="true"></span>
          <details class="cn-sandbox">
            <summary>Mostrar código <span>executado no sandbox do Gemini</span></summary>
            <pre><code>${esc(b.txt)}</code></pre>
          </details>
        </div>`;
      case 'chips':
        return `<div class="cn-chips${cls}">${b.ops.map(o => `<span class="cn-chip">${esc(o)}</span>`).join('')}</div>`;
      case 'marca':
        return `<div class="cn-marca cn-tom-${esc(b.tom)}${cls}"><span class="cn-marca-p" aria-hidden="true"></span><p>${b.txt}</p></div>`;
      default:
        return '';
    }
  }

  function cenaPintar(revelado) {
    const c = cenaAtual();
    const palco = $('cn-palco');
    if (!palco) return;
    palco.innerHTML = c.beats.slice(0, cena.b)
      .map((b, i) => beatHTML(b, revelado === i)).join('');
    const rol = $('cn-rolagem');
    if (rol) rol.scrollTop = rol.scrollHeight;
    cenaPintarControles();
  }

  function cenaPintarControles() {
    const c = cenaAtual();
    const el = $('cn-controles');
    if (!el) return;
    const fim = cena.b >= c.beats.length;
    el.innerHTML = `
      <button type="button" class="cn-bt cn-bt-play" data-cn="${fim ? 'reiniciar' : (cena.tocando ? 'pausar' : 'tocar')}">
        ${fim ? '↺ Ver de novo' : (cena.tocando ? '❚❚ Pausar' : '▶ Tocar a conversa')}
      </button>
      <button type="button" class="cn-bt cn-bt-sec" data-cn="passo" ${fim ? 'disabled' : ''}>Passo a passo</button>
      <button type="button" class="cn-bt cn-bt-sec" data-cn="tudo" ${fim ? 'disabled' : ''}>Mostrar tudo</button>
      <span class="cn-prog" aria-hidden="true">
        <span class="cn-prog-tr" style="width:${Math.round((cena.b / c.beats.length) * 100)}%"></span>
      </span>
      <span class="cn-conta">${Math.min(cena.b, c.beats.length)} / ${c.beats.length}</span>`;
  }

  function cenaPasso() {
    const c = cenaAtual();
    if (cena.b >= c.beats.length) { cenaPausar(); return; }
    const b = c.beats[cena.b];
    cena.b++;
    cenaPintar(cena.b - 1);
    if (cena.tocando) cenaAgenda(cenaPasso, cenaDuracao(b));
  }

  function cenaTocar() {
    cenaLimpar();
    const c = cenaAtual();
    if (cena.b >= c.beats.length) { cena.b = 0; }
    cena.tocando = true;
    cenaPasso();
  }

  function cenaPausar() {
    cenaLimpar();
    cena.tocando = false;
    cenaPintarControles();
  }

  function cenaTudo() {
    cenaLimpar();
    cena.tocando = false;
    cena.b = cenaAtual().beats.length;
    cenaPintar(-1);
  }

  function cenaIr(i) {
    cenaLimpar();
    cena.i = (i + CENAS.cenas.length) % CENAS.cenas.length;
    cena.b = 0;
    cena.tocando = false;
    renderCenas();
  }

  const SELO = {
    confirmou: { r: 'a página acertou', c: 'ok' },
    refutou:   { r: 'a página errou',   c: 'erro' },
    pior:      { r: 'foi pior que a página dizia', c: 'pior' }
  };

  function renderCenas() {
    const el = $('cu-cenas');
    if (!el || typeof CENAS === 'undefined') return;
    const c = cenaAtual();
    const selo = SELO[c.vereditoTipo] || SELO.confirmou;

    el.innerHTML = `
      <div class="cn-abas" role="tablist" aria-label="Escolher a conversa">
        ${CENAS.cenas.map((x, i) => `
          <button type="button" role="tab" class="cn-aba ${i === cena.i ? 'is-active' : ''}"
                  data-cn="ir" data-i="${i}" tabindex="${i === cena.i ? '0' : '-1'}"
                  aria-selected="${i === cena.i}">${esc(x.aba)}</button>`).join('')}
      </div>

      <h3 class="cn-titulo">${esc(c.titulo)}</h3>
      <p class="cn-ctx">${txt(c.contexto)}</p>

      <div class="cn-quadro">
        <!-- A moldura de navegador não é enfeite: a seção inteira compara
             "dentro da aba" com "fora dela", e mostrar a aba com a barra de
             endereço à vista é o jeito mais curto de dizer onde estamos. -->
        <div class="cn-chrome">
          <div class="cn-barra">
            <span class="cn-pontos" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="cn-tab">Gemini</span>
            <span class="cn-url">gemini.google.com</span>
          </div>
          <div class="cn-rolagem" id="cn-rolagem">
            <div class="cn-palco" id="cn-palco"></div>
          </div>
        </div>
        <div class="cn-controles" id="cn-controles"></div>
      </div>

      <div class="cn-veredito cn-v-${esc(c.vereditoTipo)}">
        <span class="cn-selo cn-selo-${selo.c}">${esc(selo.r)}</span>
        <p>${c.veredito}</p>
      </div>

      <p class="cn-licao">${txt(c.licao)}</p>

      ${painelTerminal(c.id)}

      <p class="cn-fonte">
        Conversa real, capturada em ${esc(CENAS.fonte.data.split('-').reverse().join('/'))} no
        <strong>${esc(CENAS.fonte.modelo)}</strong>. ${esc(c.medido.turnos)} mensagem${c.medido.turnos > 1 ? 's' : ''} do
        usuário · ${esc(c.medido.desfecho)}. Todo texto em balão é citação literal —
        <a href="${esc(CENAS.fonte.arquivo)}">a transcrição completa está no repositório</a>.
      </p>`;

    cenaPintar(-1);
  }

  /* O outro lado da mesma tarefa. Continua sendo RECONSTITUIÇÃO — e agora que
     a coluna da esquerda é uma captura real, o rótulo aqui deixou de ser
     escrúpulo e virou necessidade: sem ele a seção compara uma medição com
     uma suposição sem dizer qual é qual. */
  function painelTerminal(id) {
    const c = (D.cenarios || []).find(x => x.id === id);
    if (!c) return '';
    return `
      <section class="cn-term-lado" aria-labelledby="h-tl-${esc(id)}">
        <header class="cn-tl-head">
          <h4 id="h-tl-${esc(id)}">O mesmo pedido, com acesso ao terminal</h4>
          <span class="cn-tl-selo">reconstituição — ainda não medida</span>
        </header>
        <p class="cn-tl-aviso">
          Esta coluna não veio de captura nenhuma: foi escrita à mão, com comandos que
          <em>foram executados</em> antes de entrar na página, mas fora de uma sessão real de
          agente. Enquanto a conversa ao lado é uma medição, esta é uma expectativa — e a
          próxima captura é justamente a dela.
        </p>
        <div class="cu-term">${c.terminal.transcricao.map(linhaTerminal).join('')}</div>
        <h5 class="cu-cmd-h">Os comandos, um por um</h5>
        <dl class="cu-cmds">
          ${c.comandos.map(k => `
            <div class="cu-cmd">
              <dt><code>${esc(k.cmd)}</code></dt>
              <dd>${txt(k.oQueFaz)}</dd>
            </div>`).join('')}
        </dl>
      </section>`;
  }

  function renderBalanco() {
    const el = $('cu-balanco');
    if (!el || typeof CENAS === 'undefined') return;
    const b = CENAS.balanco;
    el.innerHTML = `
      <section class="cn-bal" aria-labelledby="h-bal">
        <h3 id="h-bal">${esc(b.titulo)}</h3>
        <p class="cn-bal-lede">${txt(b.lede)}</p>
        <ul class="cn-bal-lista">
          ${b.itens.map(i => `
            <li>
              <span class="cn-bal-antes">${txt(i.antes)}</span>
              <span class="cn-bal-seta" aria-hidden="true">→</span>
              <span class="cn-bal-depois">${txt(i.depois)}</span>
            </li>`).join('')}
        </ul>
        <p class="cn-bal-fecho">${b.fecho}</p>
      </section>`;
  }

  function ligarCenas() {
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('#cu-cenas [data-cn]');
      if (!alvo) return;
      const a = alvo.dataset.cn;
      if (a === 'tocar') cenaTocar();
      else if (a === 'pausar') cenaPausar();
      else if (a === 'reiniciar') { cena.b = 0; cenaTocar(); }
      else if (a === 'passo') { cenaPausar(); cenaPasso(); }
      else if (a === 'tudo') cenaTudo();
      else if (a === 'ir') cenaIr(+alvo.dataset.i);
    });

    document.addEventListener('keydown', (e) => {
      const abas = e.target.closest('#cu-cenas .cn-aba');
      if (!abas) return;
      const mapa = { ArrowRight: cena.i + 1, ArrowLeft: cena.i - 1, Home: 0, End: CENAS.cenas.length - 1 };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      cenaIr(mapa[e.key]);
      const nova = document.querySelector('#cu-cenas .cn-aba.is-active');
      if (nova) nova.focus();
    });
  }

  /* ─── 02c · o gráfico dos custos ─────────────────────────── */

  /* FORMA: dumbbell. São dois valores por tarefa e o que interessa é o VÃO
     entre eles, não cada um isolado — barras agrupadas dariam dez marcas para
     comparar duas a duas; o haltere dá cinco vãos para ler de uma vez.

     COR: emparelhada com a própria página (índigo = a aba, verde = o terminal)
     e escolhida com o validador, não a olho. O cinza quente do site contra o
     verde do site davam ΔE 1,9 em protanopia — indistinguíveis. Este par passa
     os seis testes; a bolinha vazada contra a cheia é a codificação secundária,
     para quem imprime em preto e branco.

     O ponto todo do gráfico é a terceira linha: nela o terminal é MAIS LENTO.
     Uma figura que mostrasse cinco vitórias seria propaganda; esta mostra
     quatro vitórias e uma derrota, e é por isso que dá para acreditar nela. */
  const COR_CHAT = '#5B53A8';
  const COR_TERM = '#10a37f';

  function renderGrafico() {
    const el = $('cu-grafico');
    if (!el) return;

    const dados = D.cenarios.map(c => ({
      nome: c.aba,
      chat: c.chat.custo.minutos,
      term: c.terminal.custo.minutos
    }));

    const fmt = v => (v < 1 ? Math.round(v * 60) + ' s' : (Number.isInteger(v) ? v : v.toFixed(1).replace('.', ',')) + ' min');

    const L = 178, R = 64, T = 16, ALT_LINHA = 44;
    const W = 720;
    const H = T + dados.length * ALT_LINHA + 34;

    /* O eixo nasce dos dados, não de um número fixo: um cenário futuro com
       mais de 32 min colocaria o ponto para fora do viewBox e o SVG o
       cortaria em silêncio. Nunca menor que 32 (a geometria de hoje não
       muda), mas cresce com o que vier a existir no arquivo de dados. */
    const maxDados = Math.max(0, ...dados.flatMap(d => [d.chat, d.term]));
    const maxX = Math.max(32, Math.ceil(maxDados / 10) * 10);
    const x = m => L + (m / maxX) * (W - L - R);

    const passo = maxX <= 40 ? 10 : maxX / 4;
    const grades = [];
    for (let g = 0; g < maxX; g += passo) grades.push(g);

    const linhas = dados.map((d, i) => {
      const y = T + i * ALT_LINHA + ALT_LINHA / 2;
      const xc = x(d.chat), xt = x(d.term);

      /* Cada número fica do lado de FORA do seu próprio ponto, para os dois
         nunca se encontrarem no meio. Quando não cabe — ponto colado no zero,
         com o rótulo invadindo a coluna de nomes — o número sobe para cima da
         marca em vez de brigar por espaço. Foi o que aconteceu em três das
         cinco linhas: sem este desvio, "42 s" caía dentro de
         "Organizar 1.240 fotos". */
      const larg = t => t.length * 6.3;
      function poe(xp, valor, lado) {
        const t = fmt(valor);
        if (lado === 'esq') {
          if (xp - 11 - larg(t) >= L + 4) return { x: xp - 11, y: y + 4, anc: 'end', t };
        } else {
          if (xp + 11 + larg(t) <= W - 6) return { x: xp + 11, y: y + 4, anc: 'start', t };
        }
        return { x: xp, y: y - 12, anc: 'middle', t };
      }

      const esq = xc <= xt ? 'chat' : 'term';
      const rc = poe(xc, d.chat, esq === 'chat' ? 'esq' : 'dir');
      const rt = poe(xt, d.term, esq === 'chat' ? 'dir' : 'esq');

      return `
        <g class="cu-gr-linha">
          <title>${esc(d.nome)}: ${fmt(d.chat)} na aba, ${fmt(d.term)} com terminal</title>
          <rect x="0" y="${y - ALT_LINHA / 2}" width="${W}" height="${ALT_LINHA}" class="cu-gr-faixa" />
          <text x="${L - 14}" y="${y + 4}" class="cu-gr-rot">${esc(d.nome)}</text>
          <line x1="${Math.min(xc, xt)}" y1="${y}" x2="${Math.max(xc, xt)}" y2="${y}" class="cu-gr-haste" />
          <circle cx="${xc}" cy="${y}" r="6" class="cu-gr-p cu-gr-chat" />
          <circle cx="${xt}" cy="${y}" r="6" class="cu-gr-p cu-gr-term" />
          <text x="${rc.x}" y="${rc.y}" text-anchor="${rc.anc}" class="cu-gr-val">${rc.t}</text>
          <text x="${rt.x}" y="${rt.y}" text-anchor="${rt.anc}" class="cu-gr-val">${rt.t}</text>
        </g>`;
    }).join('');

    el.innerHTML = `
      <figure class="cu-graf">
        <figcaption class="cu-graf-cap">
          <h3>O que custou cada tarefa</h3>
          <p>Tempo <strong>em minutos</strong> até o trabalho ficar pronto e conferido, nas cinco
             tarefas acima. Estimativas do cenário descrito em cada aba — não são cronometragens.</p>
        </figcaption>

        <div class="cu-graf-leg">
          <span class="cu-lg"><span class="cu-lg-m cu-lg-chat"></span>na aba do navegador</span>
          <span class="cu-lg"><span class="cu-lg-m cu-lg-term"></span>com acesso ao terminal</span>
        </div>

        <div class="cu-graf-rola">
          <svg viewBox="0 0 ${W} ${H}" class="cu-graf-svg" role="img" aria-label="Gráfico de halteres comparando o tempo de cada tarefa nos dois modos. Em quatro das cinco tarefas o terminal é mais rápido; em converter 40 planilhas ele é mais lento.">
            ${grades.map(g => `
              <line x1="${x(g)}" y1="${T}" x2="${x(g)}" y2="${H - 30}" class="cu-gr-grade" />
              <text x="${x(g)}" y="${H - 14}" class="cu-gr-eixo">${g}</text>`).join('')}
            ${linhas}
          </svg>
        </div>

        <p class="cu-graf-nota">
          A linha que importa é a terceira. Converter 40 planilhas leva <strong>mais</strong> tempo com o
          agente — e ainda assim é o caso mais forte da página: foi só ali que alguém contou as abas e
          descobriu que 40 arquivos guardavam 97 tabelas. <strong>O ganho nem sempre é velocidade;
          às vezes é a única versão que está certa.</strong>
        </p>

        <details class="cu-graf-tab">
          <summary>Ver os números em tabela</summary>
          <table>
            <thead><tr><th>Tarefa</th><th>Na aba</th><th>Com terminal</th></tr></thead>
            <tbody>
              ${dados.map(d => `<tr><td>${esc(d.nome)}</td><td>${fmt(d.chat)}</td><td>${fmt(d.term)}</td></tr>`).join('')}
            </tbody>
          </table>
        </details>
      </figure>
    `;
  }

  /* ─── 02b · o contraponto ────────────────────────────────── */

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

  /* ─── 03 · o que fica depois ─────────────────────────────── */

  /* Forma deliberadamente diferente do resto da página: um comparativo em duas
     colunas (listas, não cartões) e depois quatro faixas de texto-com-artefato.
     A aba já tinha grade de cartões em quatro seções; mais uma aqui e a seção
     nova entraria como "mais do mesmo", que é justamente o problema que ela
     veio resolver. */
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

  /* ─── 04 · ferramentas ───────────────────────────────────── */

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

  /* ─── 06 · catálogo ──────────────────────────────────────── */

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

  /* ─── 06b · a ponte (`ollama launch`) ────────────────────── */

  /* Três blocos num só: os comandos, a tabela de integrações e os planos.
     Ficam juntos porque respondem à mesma pergunta prática — "e como eu ligo
     o modelo na ferramenta?" — e separá-los faria o leitor montar a resposta
     de cabeça a partir de três lugares da página. */
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

        <!-- Dezoito linhas de tabela são consulta, não leitura: abertas por
             padrão elas eram quase uma tela inteira de rolagem entre o leitor
             e os planos. Fechadas, o título já entrega o número — que é a única
             informação que a maioria quer daqui. -->
        <details class="cu-integs-caixa">
          <summary>
            <span class="cu-integs-sum">${txt(p.integracoesTitulo)}</span>
            <span class="cu-integs-n">${p.integracoes.length} integrações</span>
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

  /* No celular o catálogo ocupava 8,8 telas de rolagem — 45% da página — para
     entregar material de consulta. Aqui cada família passa a mostrar o primeiro
     cartão e um botão com a contagem do resto. No desktop nada muda: lá as
     famílias cabem em três colunas e a leitura é horizontal. */
  function colapsarCatalogoNoCelular() {
    const mq = window.matchMedia('(max-width: 760px)');
    const grades = [...document.querySelectorAll('.cu-fam-grid')];
    if (!grades.length) return;

    function aplicar() {
      grades.forEach(g => {
        const cards = [...g.children].filter(c => c.classList.contains('cu-ferr'));
        const btnAntigo = g.parentElement.querySelector('.cu-mais');
        if (btnAntigo) btnAntigo.remove();
        cards.forEach(c => c.hidden = false);

        if (!mq.matches || cards.length < 3) return;

        cards.slice(1).forEach(c => c.hidden = true);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cu-mais';
        btn.textContent = `Mostrar as outras ${cards.length - 1} ferramentas`;
        btn.addEventListener('click', () => {
          cards.forEach(c => c.hidden = false);
          btn.remove();
        });
        g.insertAdjacentElement('afterend', btn);
      });
    }

    aplicar();
    /* addEventListener em MediaQueryList é o caminho moderno; addListener é a
       reserva para Safari antigo, onde o outro simplesmente não existe. */
    if (mq.addEventListener) mq.addEventListener('change', aplicar);
    else if (mq.addListener) mq.addListener(aplicar);
  }

  /* ─── 07 · segurança ─────────────────────────────────────── */

  function renderSeguranca() {
    const el = $('cu-seg');
    if (!el) return;
    el.innerHTML = D.seguranca.map((s, i) => `
      <article class="cu-seg-item">
        <span class="cu-seg-n">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${txt(s.titulo)}</h3>
          <p>${txt(s.texto)}</p>
        </div>
      </article>
    `).join('');
  }

  /* ─── 05 · tutoriais em texto (o caminho sem simulação) ──── */

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
              ${p.prompt ? `<p class="cu-plain-nota"><strong>A tarefa dada ao agente:</strong> ${txt(p.prompt)}</p>` : ''}
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
     05 · O SIMULADOR
     ═══════════════════════════════════════════════════════════
     Uma tela de computador de mentira com um tutorial de verdade
     dentro. A brincadeira visual tem função: quem nunca abriu um
     terminal trava no primeiro `$`, e uma janela obviamente falsa
     deixa esse primeiro passo sem consequência — não há como
     quebrar nada aqui.

     O guia acontece DENTRO da tela, em pop-ups ancorados ao que
     explicam, e os comandos são digitados de verdade num input real.
     O painel abaixo da moldura continua existindo com as mesmas
     ações — é o caminho de teclado e de leitor de tela. */

  const os = {
    tutorial: null,   // objeto do tutorial aberto
    passo: 0,         // índice do passo corrente
    fase: 'guia',     // 'guia' → 'digitando' → 'rodando' → 'feito' → 'fim'
    erro: null,       // recado do último Enter errado
    guiaMin: false,   // o balão foi encolhido pela pessoa
    jaInteragiu: false, // já houve clique: só então damos foco ao input
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

    /* O ícone usa `nomeCurto` quando existe: numa célula de 84px, "Ollama Cloud
       + launch" quebraria em três linhas e empurraria os outros ícones. O nome
       inteiro continua no roteiro e no menu Iniciar, onde há largura. */
    const itens = D.tutoriais.map(t => ({
      id: t.id, nome: t.nomeCurto || t.nome, icone: t.icone, legenda: t.legenda
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
      os.fase = 'pronto';
      pintarJanela({
        tipo: 'leiame',
        titulo: 'Leia-me.txt'
      });
      pintarTaskbar('Leia-me.txt');
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
            <button type="button" class="cu-nav-btn cu-alvo" data-acao="avancar">${esc(n.botao)}</button>
          </div>
        </div>`;
    } else if (cfg.tipo === 'diff') {
      /* O diff é a coisa que a janela faz melhor que o terminal: a aprovação
         vira leitura, com a linha que sai e a linha que entra uma embaixo da
         outra. O sinal (+/-) vem antes da cor, para o caso de daltonismo e
         para quem copia o texto. */
      const d = cfg.diff;
      corpo = `
        <div class="cu-win-diff">
          <div class="cu-diff-barra">
            <span class="cu-diff-arq">${esc(d.arquivo)}</span>
            <span class="cu-diff-cont">${d.linhas.filter(l => l.t === 'mais').length} adições · ${d.linhas.filter(l => l.t === 'menos').length} remoção</span>
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

  function blocoDoPasso(p) {
    const bloco = [];
    if (p.prompt) bloco.push(linhaTerminal({ t: 'pedido', v: p.prompt }));
    if (p.cmd) bloco.push(linhaTerminal({ t: 'cmd', v: p.cmd }));
    (p.saida || []).forEach(l => bloco.push(linhaTerminal(l)));
    return bloco.join('');
  }

  /* ─── o terminal onde se digita de verdade ───────────────────
     A linha viva é um <input> real com a cor do texto transparente, sobreposto
     a um "espelho" que redesenha o que foi digitado caractere a caractere. O
     input de verdade é o que dá teclado, seleção, colar e leitor de tela de
     graça; o espelho é o que permite pintar o trecho certo de verde, o errado
     de vermelho e o que falta em cinza — coisa que nenhum input sozinho faz.
     Os dois ficam alinhados na mesma célula do grid, com a MESMA fonte e o
     MESMO tamanho: se divergirem, o cursor sai do lugar. */
  function linhaViva(p) {
    return `
      <div class="cu-t-linha cu-t-viva" id="cu-t-viva">
        <span class="cu-t-ps">$</span>
        <span class="cu-t-campo">
          <span class="cu-t-espelho" id="cu-t-espelho" aria-hidden="true"></span>
          <input class="cu-t-input" id="cu-t-input" type="text"
                 autocomplete="off" autocorrect="off" autocapitalize="off"
                 spellcheck="false" enterkeyhint="go"
                 aria-label="Digite o comando deste passo e tecle Enter">
        </span>
      </div>`;
  }

  function linhasDoPasso(p) {
    /* O scrollback é derivado, não acumulado: são os blocos de todos os
       passos de terminal anteriores ao corrente. É o que dá a sensação de
       uma sessão contínua — e, derivando do índice do passo, "voltar" não
       precisa adivinhar quantos blocos desfazer. */
    let html = os.tutorial.passos.slice(0, os.passo)
      .filter(pp => pp.janela === 'terminal')
      .map(blocoDoPasso).join('');
    if (p.prompt) html += linhaTerminal({ t: 'pedido', v: p.prompt });
    html += linhaViva(p);
    html += `<div id="cu-t-saida"></div>`;
    return html;
  }

  /* Pinta o espelho: o que bate com o comando esperado sai claro, o que
     divergiu sai vermelho, e o resto do comando aparece em cinza à frente do
     cursor — como a sugestão de um autocomplete. Esse cinza é o que faz a
     pessoa conseguir digitar um `curl -fsSL …` sem decorar nada. */
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
    /* Foco só quando a pessoa já está olhando para a tela: focar durante a
       rolagem da página arrastaria a viewport até aqui sem ela pedir. */
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

    /* Errou: o terminal responde como um terminal responderia. Nada de
       "tente de novo" — a mensagem é a que a pessoa vai ver de verdade, e é
       parte do que a tela está ensinando. */
    const primeiro = digitado.split(/\s+/)[0];
    const primeiroAlvo = alvo.split(/\s+/)[0];
    const erro = primeiro !== primeiroAlvo
      ? `bash: ${primeiro}: command not found`
      : `${primeiroAlvo}: erro de sintaxe — confira o trecho em vermelho acima`;

    /* A tentativa errada entra ANTES da linha viva, não na área de saída:
       senão o comando certo — que substitui a linha viva, acima dela — apareceria
       no histórico antes do erro que veio primeiro, e a sessão contaria a
       história ao contrário. */
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
      ? 'O primeiro pedaço do comando não confere — é ele que diz qual programa rodar.'
      : 'O começo está certo; o que diverge está marcado em vermelho na linha.';
    pintarBalao();
    anunciar(erro);
  }

  /* Digita sozinho, caractere a caractere, e roda. É a saída para quem está
     no celular (digitar `curl -fsSL …` num teclado de vidro é castigo), para
     quem usa leitor de tela e para quem só quer ver o resto. */
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

  /* ─── rodar o comando ───────────────────────────────────── */
  function rodar() {
    const t = os.tutorial;
    if (!t) return;
    const p = t.passos[os.passo];

    os.fase = 'rodando';
    os.erro = null;

    /* A linha viva vira linha fixa: o input some e o comando fica no
       histórico, exatamente como num terminal de verdade. */
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
    anunciar('Comando concluído. ' + (p.nota || 'Passo ' + (os.passo + 1) + ' pronto.'));
  }

  function avancar() {
    const t = os.tutorial;
    if (!t) return;
    limparTimers();
    if (os.passo >= t.passos.length - 1) {
      os.fase = 'fim';
      pintarBalao();
      anunciar('Tutorial concluído.');
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

  /* ─── o balão: o guia mora DENTRO da tela ────────────────────
     Antes a explicação ficava num painel abaixo da moldura, e o efeito era o
     de uma legenda: a pessoa lia embaixo e agia em cima. Como pop-up ancorado
     ao elemento de que fala, o guia vira parte da cena — que é como tutorial
     de programa de verdade funciona.
     O painel de fora não sumiu: virou o caminho acessível, com os mesmos
     botões, para quem navega por teclado ou leitor de tela. */
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

    /* A cena cede espaço ao guia em vez de ficar embaixo dele: sem isto o
       balão tapava justamente a margem esquerda do terminal, onde começa
       cada linha de comando. */
    const tela = $('cu-os-screen');
    if (tela) {
      const esq = !os.guiaMin && ancora === 'terminal';
      const dir = !os.guiaMin && ancora === 'janela';
      tela.classList.toggle('cu-guia-esq', esq);
      tela.classList.toggle('cu-guia-dir', dir);
    }

    if (os.guiaMin) {
      el.innerHTML = `<button type="button" class="cu-balao-abrir" data-acao="guia-abrir"
        aria-label="Reabrir o guia do tutorial">?</button>`;
      return;
    }

    let corpo, acoes;

    if (fim) {
      corpo = `
        <h4 class="cu-balao-t">Tutorial concluído</h4>
        <p class="cu-balao-p">${txt(t.fecho)}</p>`;
      acoes = `
        <button type="button" class="cu-balao-btn" data-acao="fechar">Fechar</button>
        <button type="button" class="cu-balao-sec" data-acao="reiniciar">Fazer de novo</button>`;
    } else {
      const precisaDigitar = p.janela === 'terminal' && os.fase === 'guia';
      const rodando = os.fase === 'rodando' || os.fase === 'digitando';

      corpo = `
        <h4 class="cu-balao-t">${esc(p.titulo)}</h4>
        <p class="cu-balao-p">${txt(p.explicacao)}</p>
        ${precisaDigitar ? `
          <div class="cu-balao-cmd">
            <span class="cu-balao-rot">digite no terminal</span>
            <code>${esc(p.cmd)}</code>
          </div>` : ''}
        ${os.erro ? `<p class="cu-balao-erro">${txt(os.erro)}</p>` : ''}
        ${os.fase === 'feito' && p.nota ? `<p class="cu-balao-nota">${txt(p.nota)}</p>` : ''}`;

      if (rodando) {
        acoes = `<span class="cu-balao-esperando">rodando…</span>`;
      } else if (precisaDigitar) {
        acoes = `
          <button type="button" class="cu-balao-btn" data-acao="digitar">Digitar por mim</button>
          <span class="cu-balao-dica">ou digite você e tecle <kbd>Enter</kbd></span>`;
      } else if (os.fase === 'guia') {
        /* Passo de janela: a ação é clicar no botão simulado, que está
           piscando dentro da própria janela. */
        acoes = `<span class="cu-balao-dica">clique em <strong>${esc(rotuloDoAlvo(p))}</strong> na janela</span>`;
      } else {
        acoes = `<button type="button" class="cu-balao-btn" data-acao="avancar">${ultimo ? 'Terminar' : 'Próximo passo'}</button>`;
      }
    }

    el.innerHTML = `
      <div class="cu-balao-topo">
        <span class="cu-balao-passo">${fim ? 'fim' : (os.passo + 1) + ' de ' + t.passos.length}</span>
        <span class="cu-balao-tut">${esc(t.nomeCurto || t.nome)}</span>
        <button type="button" class="cu-balao-x" data-acao="guia-min" aria-label="Encolher o guia">–</button>
      </div>
      ${corpo}
      <div class="cu-balao-acoes">${acoes}</div>
      ${!fim ? `<div class="cu-balao-nav">
        ${os.passo > 0 ? '<button type="button" class="cu-balao-sec" data-acao="voltar">Voltar</button>' : ''}
        <button type="button" class="cu-balao-sec" data-acao="fechar">Sair</button>
      </div>` : ''}`;

    medirBalao();
    pintarRoteiro();
  }

  /* No celular o balão é uma faixa no rodapé da tela, e a janela precisa
     recuar exatamente a altura dele — senão o pop-up cobre justamente o botão
     que ele está mandando clicar, e o passo fica impossível. A altura muda com
     o texto de cada passo, então é medida, não chutada. */
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
    return 'Continuar';
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
      pintarJanela({ tipo: 'navegador', titulo: 'Navegador', nav: p.navegador });
    } else if (p.janela === 'diff') {
      pintarJanela({ tipo: 'diff', titulo: 'Revisão — ' + (p.diff && p.diff.arquivo ? p.diff.arquivo : 'arquivo'), diff: p.diff });
    } else {
      pintarJanela({ tipo: 'dialogo', titulo: (p.dialogo && p.dialogo.titulo) || 'Aviso', dlg: p.dialogo });
    }

    pintarTaskbar(t.nome);
    pintarBalao();

    if (p.janela === 'terminal') ligarTerminal();

    const term = $('cu-win-term');
    if (term) term.scrollTop = term.scrollHeight;

    anunciar(`Passo ${os.passo + 1} de ${t.passos.length}: ${p.titulo}.`);
  }

  /* ─── o painel de fora: agora é o caminho acessível ───────────
     Mesmos comandos do balão, em HTML comum e sempre visível na ordem de
     tabulação. Quem enxerga a tela usa o pop-up; quem navega por teclado ou
     leitor de tela tem aqui a mesma operação sem depender da cena. */
  function pintarRoteiro() {
    const el = $('cu-roteiro');
    if (!el) return;
    const t = os.tutorial;

    if (!t) {
      el.innerHTML = `<p class="cu-rot-vazio">
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
    } else if (os.fase === 'rodando' || os.fase === 'digitando') {
      acao = `<button type="button" class="cu-rot-btn is-esperando" disabled>rodando…</button>`;
    } else if (os.fase === 'feito') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${ultimo ? 'Terminar' : 'Próximo passo'}</button>`;
    } else if (p.janela === 'terminal') {
      acao = `<button type="button" class="cu-rot-btn" data-acao="digitar">Rodar o comando deste passo</button>`;
    } else {
      acao = `<button type="button" class="cu-rot-btn" data-acao="avancar">${esc(rotuloDoAlvo(p))}</button>`;
    }

    el.innerHTML = `
      <p class="cu-rot-porque">
        O mesmo guia da telinha, em texto — para quem prefere ler antes de agir,
        navega por teclado ou usa leitor de tela. Os botões daqui e os do balão
        fazem exatamente a mesma coisa.
      </p>
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
        <button type="button" class="cu-rot-sec" data-acao="fechar">Sair do tutorial</button>
        <label class="cu-rot-rapido">
          <input type="checkbox" ${os.rapido ? 'checked' : ''} data-acao="rapido">
          sem animação
        </label>
      </div>`;
  }

  /* Um só despachante para o balão, o painel e os botões simulados dentro das
     janelas: as três superfícies disparam as MESMAS ações, e é isso que
     mantém o pop-up e o caminho acessível sempre no mesmo passo. */
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
      btn.textContent = 'copiado';
      btn.classList.add('is-ok');
      setTimeout(() => { btn.textContent = antes; btn.classList.remove('is-ok'); }, 1600);
    };
    const naoDeu = () => {
      const antes = btn.textContent;
      btn.textContent = 'não deu';
      setTimeout(() => { btn.textContent = antes; }, 1600);
    };
    /* Reserva para navegador antigo, contexto sem HTTPS e iframe sem
       permissão de clipboard — dentro do embed do Observatório a API
       existe mas nega, e é aqui que ela precisa ser tentada de novo. */
    const reserva = () => {
      const ta = document.createElement('textarea');
      ta.value = cmd;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      let foi = false;
      try { foi = document.execCommand('copy'); } catch (_) { /* sem alarde */ }
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

  /* ─── partida ────────────────────────────────────────────── */

  function init() {
    if (!D) {
      console.error('COMO_USAR_DATA não foi carregado.');
      return;
    }

    const upd = $('cu-updated');
    if (upd) upd.textContent = fmtDataCurta(D.updatedAt) || '—';

    renderVocabulario();
    renderCenas();
    ligarCenas();
    renderBalanco();
    renderContraponto();
    renderPermanencia();
    renderFerramentas();
    renderFamilias();
    colapsarCatalogoNoCelular();
    renderPonte();
    renderSeguranca();
    renderPlano();

    /* O roteiro é injetado por script logo abaixo da moldura: sem JS não há
       tutorial interativo nenhum, e um painel de controle órfão no HTML só
       confundiria quem cair aqui com o script bloqueado. */
    /* O balão mora DENTRO da moldura, sobreposto à cena; o roteiro fica
       abaixo dela. Os dois nascem por script porque, sem JS, não há tutorial
       nenhum — e um guia órfão no HTML só confundiria quem cair aqui com o
       script bloqueado. */
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
