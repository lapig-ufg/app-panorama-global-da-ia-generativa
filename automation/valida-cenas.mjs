#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Confere que TODA citação das cenas existe, literalmente, na
   captura de onde ela diz ter vindo.

   Por que isto existe: a aba "Como usar" afirma reproduzir duas
   conversas reais lado a lado — uma no navegador, outra num
   programa instalado na máquina. Basta alguém "melhorar" uma frase
   — tirar uma vírgula, encurtar no meio — para a página passar a
   atribuir a um modelo algo que ele não disse. Um teste é mais
   barato do que essa confiança.

   Confere três coisas:
     1. cada bloco `voce`/`ia`/`sandbox`/`chips` do lado do
        navegador está em gemini-2026-09-09.json;
     2. cada bloco `voce`/`ia` do lado do programa instalado está
        na transcrição de uma das duas capturas de 10/set, e cada
        bloco `cmd` está na lista de comandos de uma delas;
     3. as citações soltas declaradas em `citacoesAvulsas`.

   Uso:  node automation/valida-cenas.mjs
   Sai com código 1 se qualquer citação divergir.
   ═══════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

const CENAS = 'assets/como-usar-cenas.js';
const raiz = new URL('..', import.meta.url).pathname;

const carrega = rel => readFileSync(raiz + rel, 'utf8');

/* O arquivo de cenas é um script de navegador, não um módulo: avalia e
   devolve a constante que ele declara. */
const C = (0, eval)(carrega(CENAS) + '\n;COMO_USAR_CENAS');

/* Normaliza só o que é ruído de transporte — espaço repetido, quebra de
   linha, aspas curvas que a interface troca sozinha. NÃO mexe em palavra,
   ordem nem pontuação: se o texto divergir nisso, tem de falhar mesmo. */
const normaliza = s => String(s)
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/ /g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/* ── os dois palheiros ─────────────────────────────────────────── */

const capNav = JSON.parse(carrega(C.fontes.navegador.arquivo));
const palheiroNav = normaliza(
  capNav.conversas.map(c => c.transcricao.map(t => t.texto).join('\n')).join('\n')
);

const capsAg = C.fontes.agente.arquivos.map(a => JSON.parse(carrega(a)));
/* Capturas de outras execuções: NÃO alimentam as cenas, só as citações
   avulsas — e cada uma dessas tem de dizer na página que veio de outra
   execução. Por isso o palheiro é separado. */
const capsExtra = (C.fontes.extras?.arquivos ?? []).map(a => JSON.parse(carrega(a)));
const palheiroAgFala = normaliza(
  capsAg.map(d => d.tarefas.map(t => t.transcricao.map(b => b.texto).join('\n')).join('\n')).join('\n')
);
const palheiroAgCmd = normaliza(
  capsAg.map(d => d.tarefas.map(t => t.comandos.map(c => c.cmd).join('\n')).join('\n')).join('\n')
);
/* Um bloco `ia` do agente pode citar uma nota do executor? NÃO — por isso
   as notas ficam de fora do palheiro de propósito. */

const LITERAIS = new Set(['voce', 'ia', 'sandbox']);

let falhas = 0;
let conferidas = 0;

function confere(rotulo, texto, palheiro, ondeDiz) {
  conferidas++;
  if (palheiro.includes(normaliza(texto))) return;
  falhas++;
  console.error(`✗ ${rotulo}\n   não está em ${ondeDiz}: "${String(texto).slice(0, 100)}…"`);
}

for (const cena of C.cenas) {
  for (const [lado, palheiro, ondeDiz] of [
    ['navegador', palheiroNav, C.fontes.navegador.arquivo],
    ['agente', palheiroAgFala, 'nenhuma das capturas de 10/set']
  ]) {
    const bloco = cena[lado];
    if (!bloco) { falhas++; console.error(`✗ ${cena.id}: falta o lado "${lado}"`); continue; }

    for (const [i, b] of bloco.beats.entries()) {
      const rotulo = `${cena.id} · ${lado} · beat ${i} (${b.t})`;

      if (b.t === 'chips') {
        for (const op of b.ops) confere(rotulo + ' [chip]', op, palheiro, ondeDiz);
        continue;
      }
      if (b.t === 'cmd') {
        confere(rotulo, b.txt, palheiroAgCmd, 'na lista de comandos das capturas de 10/set');
        continue;
      }
      if (!LITERAIS.has(b.t)) continue;   // `marca` é a voz do site, não citação
      confere(rotulo, b.txt, palheiro, ondeDiz);
    }
  }

  /* Os dois pedidos da virada são citações do par de formulações medido. */
  if (cena.virada) {
    confere(`${cena.id} · virada.antes`, cena.virada.antes, palheiroAgFala, 'nas capturas de 10/set');
  }
}

/* ── citações que aparecem fora das cenas ─────────────────────── */
const palheiroExtra = normaliza(
  capsExtra.map(d => d.tarefas.map(t => t.transcricao.map(b => b.texto).join('\n')).join('\n')).join('\n')
);
const AVULSAS = [
  ['saibaMais nomes · escopo', 'mantive parênteses, hífens e `(2)`/`CÓPIA` como estão (só minúsculo, sem acento, espaço→`_`), já que você não pediu para removê-los'],
];
for (const [rotulo, txt] of AVULSAS) {
  confere(rotulo, txt, palheiroAgFala + '\n' + palheiroExtra, 'em nenhuma captura de 10/set');
}

console.log(`${conferidas} citações conferidas contra as capturas.`);
if (falhas) {
  console.error(`\n${falhas} divergência(s). A página estaria atribuindo a um modelo algo que ele não disse.`);
  process.exit(1);
}
console.log('tudo confere.');
