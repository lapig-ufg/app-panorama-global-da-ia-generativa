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

  /* ─── caixa "saiba mais" ─────────────────────────────────── */

  /* Uma só implementação para a página inteira. O pedido era manter a
     superfície curta sem jogar fora o material rico da medição: tudo que é
     detalhe entra aqui, fechado, e quem quiser abre. `<details>` faz isso
     sozinho — sem JavaScript, funciona com teclado, e o Ctrl+F do navegador
     encontra o texto de dentro. */
  function saibaMais(item, extra) {
    return `
      <details class="cu-saiba${extra ? ' ' + extra : ''}">
        <summary><span class="cu-saiba-rot">Saiba mais</span>${esc(item.titulo)}</summary>
        <div class="cu-saiba-corpo">${item.corpo}</div>
      </details>
    `;
  }

  /* ─── 00 · o essencial ───────────────────────────────────── */

  /* A única parte da página escrita para quem NÃO vai ler a página. Três
     conclusões, cada uma com a evidência ao lado, e a procedência logo
     abaixo. Fica antes da seção 01 porque a pergunta "vocês testaram
     mesmo?" tem de ser respondida antes de a pessoa decidir se lê o resto. */
  function renderEssencial() {
    const el = $('cu-essencial');
    if (!el || !D.essencial) return;
    const e = D.essencial;

    el.innerHTML = `
      <div class="cu-ess">
        <span class="cu-ess-rot">${esc(e.rotulo)}</span>

        <!-- A premissa vem ANTES da conclusão. Sem estas duas frases, "descreva
             a sua máquina" é conselho sobre uma coisa que o leitor ainda não
             sabe que existe. -->
        <p class="cu-ess-intro">${e.intro}</p>

        <span class="cu-ess-sub">${esc(e.conclusoesRotulo)}</span>
        <ol class="cu-ess-lista">
          ${e.conclusoes.map(c => `
            <li class="cu-ess-item">
              <span class="cu-ess-n" aria-hidden="true">${esc(c.n)}</span>
              <div>
                <p class="cu-ess-frase">${txt(c.frase)}</p>
                <p class="cu-ess-prova">${txt(c.prova)}</p>
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

  /* ─── 01 · a diferença, explicada ────────────────────────── */

  /* Esta seção abre a aba. Ela existe para quem nunca instalou nada e só usa
     IA em aba de navegador — por isso é a única da página escrita em texto
     corrido antes de qualquer quadro. A versão anterior abria discutindo como
     CHAMAR as duas coisas, e o leitor chegava na comparação sem ter entendido
     o que estava sendo comparado. A discussão de nome não sumiu: virou a
     última caixa fechada daqui. */

  function ladoEixo(lado, classe, rotulo) {
    return `
      <div class="cu-lado ${classe}">
        <span class="cu-lado-rot">${esc(rotulo)}</span>
        <h4 class="cu-lado-tit">${esc(lado.titulo)}</h4>
        <p class="cu-lado-txt">${lado.texto}</p>
        ${lado.glossario ? `
          <details class="cu-gloss">
            <summary>O que é um ${esc(lado.glossario.termo)}?</summary>
            <p>${lado.glossario.texto}</p>
          </details>` : ''}
        <p class="cu-lado-cons">${lado.consequencia}</p>
      </div>
    `;
  }

  /* O lastro. Uma frase que diz o que vimos e nomeia as ferramentas, com o
     caminho para quem quiser o detalhe. Aqui antes havia um quadro escuro com
     a tabela de execuções: ele apresentava conclusão interna do teste como
     regra geral, e quem chegava não tinha como saber do que se tratava. */
  function lastroEixo(txtLastro) {
    return `
      <p class="cu-lastro">
        <span class="cu-lastro-rot">Como sabemos disso</span>
        ${txtLastro}
        <a class="cu-lastro-link" href="#medicao">como a medição foi feita</a>
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
            ${ladoEixo(e.navegador, 'is-nav', 'No navegador')}
            ${ladoEixo(e.instalada, 'is-maq', 'Instalada na máquina')}
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

  /* As abas de cenário, a tira de lições e o gráfico de custos viviam aqui.
     Todos os três liam D.cenarios — a reconstituição escrita à mão que a
     medição de 10/set substituiu. Saíram junto com ela: código que ninguém
     chama continua sendo código que alguém vai reativar sem saber que os
     números por trás foram desmentidos. Ver o balanço no fim da seção 02. */

  /* ═══════════════════════════════════════════════════════════
     02 · OS EXEMPLOS
     ═══════════════════════════════════════════════════════════
     Uma pergunta de trabalho, e o que muda entre respondê-la numa
     aba do navegador e num programa instalado no computador.

     Esta seção já foi um relatório de medição: duas transcrições
     tocando em sincronia, contagem de arquivos, armadilha de cada
     cenário. Ficou técnica e chata. Agora ela NARRA a diferença; a
     medição continua inteira no repositório e a seção 05 conta
     como foi feita. Os números que sobraram estão nas caixas
     fechadas, para quem quiser. */

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
          <div class="is-bom"><dt>O que ganha</dt><dd>${txt(l.bom)}</dd></div>
          <div class="is-lim"><dt>O que fica com você</dt><dd>${txt(l.limite)}</dd></div>
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
      <div class="cn-seletor" role="region" aria-label="Seletor de exemplos">
        <div class="cn-abas-topo">
          <div class="cn-abas-chamada">
            <span class="cn-abas-icone" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l7 18 3-7 7-3L3 3z"/>
              </svg>
            </span>
            <span class="cn-abas-titulo">Clique em um exemplo para ver a comparação:</span>
          </div>
          <span class="cn-abas-contador">
            <span class="cn-abas-contador-atual">Exemplo ${exemploAtual + 1}</span> de ${totalCenas} selecionado
          </span>
        </div>

        <div class="cn-abas" role="tablist" aria-label="Escolher o exemplo">
          ${CENAS.cenas.map((x, i) => {
            const ativa = i === exemploAtual;
            return `
            <button type="button" role="tab" class="cn-aba ${ativa ? 'is-active' : ''}"
                    data-cn="ir" data-i="${i}" tabindex="${ativa ? '0' : '-1'}"
                    aria-selected="${ativa}"
                    title="Clique para ver o exemplo ${i + 1}: ${esc(x.aba)}">
              <span class="cn-aba-num" aria-hidden="true">0${i + 1}</span>
              <span class="cn-aba-corpo">
                <span class="cn-aba-rotulo">Exemplo 0${i + 1}</span>
                <strong class="cn-aba-txt">${esc(x.aba)}</strong>
              </span>
              <span class="cn-aba-indicador" aria-hidden="true">
                ${ativa ? `
                  <span class="cn-aba-status-tag">Ativo</span>
                  <svg class="cn-aba-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : `
                  <span class="cn-aba-status-tag is-ver">Ver</span>
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
            <span class="cn-ex-rot">Exemplo 0${exemploAtual + 1} de 0${totalCenas} · A pergunta</span>
            <span class="cn-ex-tema">${esc(c.aba)}</span>
          </div>
          <h3>${esc(c.pergunta)}</h3>
        </div>

        <div class="cn-ex-par">
          ${ladoExemplo(c.navegador, 'is-nav')}
          ${ladoExemplo(c.instalado, 'is-maq')}
        </div>

        <div class="cn-ex-dif">
          <span class="cn-ex-rot">O que muda, na prática</span>
          <p>${c.diferenca}</p>
        </div>

        <div class="cn-ex-quando">
          <span class="cn-ex-rot">Quando usar cada um</span>
          <dl>
            <div><dt>Navegador</dt><dd>${txt(c.quandoUsar.navegador)}</dd></div>
            <div><dt>Programa instalado</dt><dd>${txt(c.quandoUsar.instalado)}</dd></div>
          </dl>
        </div>

        ${c.saibaMais ? `<div class="cu-saibas">${[].concat(c.saibaMais).map(i => saibaMais(i)).join('')}</div>` : ''}

        <nav class="cn-ex-nav" aria-label="Navegar entre exemplos">
          <button type="button" class="cn-ex-nav-btn is-ant" data-cn="ir" data-i="${antIdx}" title="Ver exemplo anterior: ${esc(CENAS.cenas[antIdx].aba)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span class="cn-ex-nav-texto">
              <span class="cn-ex-nav-legenda">Exemplo anterior (0${antIdx + 1})</span>
              <span class="cn-ex-nav-nome">${esc(CENAS.cenas[antIdx].aba)}</span>
            </span>
          </button>
          <button type="button" class="cn-ex-nav-btn is-prox" data-cn="ir" data-i="${proxIdx}" title="Ver próximo exemplo: ${esc(CENAS.cenas[proxIdx].aba)}">
            <span class="cn-ex-nav-texto">
              <span class="cn-ex-nav-legenda">Próximo exemplo (0${proxIdx + 1})</span>
              <span class="cn-ex-nav-nome">${esc(CENAS.cenas[proxIdx].aba)}</span>
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </nav>
      </article>

      <p class="cn-fonte">
        As duas colunas descrevem o que aconteceu de verdade: ${esc(F.navegador.rotulo)} em
        ${esc(F.navegador.data)} e ${esc(F.agente.rotulo)} em ${esc(F.agente.data)}, sobre uma
        pasta com arquivos reais. <a href="#medicao">Como a medição foi feita</a>, e as
        transcrições completas <a href="automation/capturas/">estão no repositório</a>.
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
  /* O catálogo é referência, não leitura: sozinho era 30% das palavras da
     página. Agora cada família abre fechada, com a lista dos nomes numa linha
     só — quem procura uma ferramenta específica acha pelo nome e abre; quem
     está lendo a página passa direto. Antes isso valia só no celular, e era
     no computador que o catálogo mais atrapalhava a leitura. */
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
      sm.innerHTML = `<span class="cu-fam-cx-n">${cards.length} ferramentas</span>` +
                     `<span class="cu-fam-cx-l">${nomes.map(n => esc(n)).join(' · ')}</span>`;
      cx.appendChild(sm);

      g.insertAdjacentElement('beforebegin', cx);
      cx.appendChild(g);
    });
  }


  /* ─── 07 · segurança ─────────────────────────────────────── */


  /* ─── 08 · como isto foi medido ──────────────────────────── */

  /* A seção que dá crédito a todas as outras. Curta de propósito: o método em
     três frases, a lista do que NÃO foi medido, e um caminho para quem quiser
     conferir procedência. A lista do que faltou não é modéstia — é ela que
     separa uma página que mediu de uma página que afirma. */
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

  /* ─── 05 · tutoriais em texto (o caminho sem simulação) ──── */

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
        <span class="cu-balao-tut">${fim || !p.ato ? esc(t.nomeCurto || t.nome) : esc(p.ato)}</span>
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
        <span class="cu-rot-tut">${esc(t.nome)}${!fim && p.ato ? ' · ' + esc(p.ato) : ''}</span>
        <span class="cu-rot-min">~${t.minutos} min no total</span>
      </div>
      ${t.objetivo ? `<p class="cu-rot-objetivo"><span>Onde isto vai dar</span>${txt(t.objetivo)}</p>` : ''}
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

    renderEssencial();
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
