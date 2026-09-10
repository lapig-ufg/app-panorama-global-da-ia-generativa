#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Confere que TODA citação das cenas existe, literalmente, na
   captura de onde ela diz ter vindo.

   Por que isto existe: a seção 02 da aba "Como usar fora do
   navegador" afirma reproduzir uma conversa real. Basta alguém
   "melhorar" uma frase — tirar uma vírgula, encurtar no meio —
   para a página passar a atribuir ao Gemini algo que ele não
   disse. Um teste é mais barato do que essa confiança.

   Uso:  node automation/valida-cenas.mjs
   Sai com código 1 se qualquer citação divergir.
   ═══════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

const CENAS = 'assets/como-usar-cenas.js';
const raiz = new URL('..', import.meta.url).pathname;

function carrega(rel) {
  return readFileSync(raiz + rel, 'utf8');
}

/* O arquivo de cenas é um script de navegador, não um módulo: avalia e
   devolve a constante que ele declara. */
const C = (0, eval)(carrega(CENAS) + '\n;COMO_USAR_CENAS');
const captura = JSON.parse(carrega(C.fonte.arquivo));

/* Normaliza só o que é ruído de transporte — espaço repetido, quebra de
   linha, aspas curvas que a interface troca sozinha. NÃO mexe em palavra,
   ordem nem pontuação: se o texto divergir nisso, tem de falhar mesmo. */
function normaliza(s) {
  return String(s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const corpo = captura.conversas
  .map(c => c.transcricao.map(t => t.texto).join('\n'))
  .join('\n');
const agulheiro = normaliza(corpo);

const TIPOS_LITERAIS = new Set(['voce', 'ia', 'sandbox']);

let falhas = 0;
let conferidas = 0;

for (const cena of C.cenas) {
  for (const [i, b] of cena.beats.entries()) {
    if (b.t === 'chips') {
      for (const op of b.ops) {
        conferidas++;
        if (!agulheiro.includes(normaliza(op))) {
          falhas++;
          console.error(`✗ ${cena.id} · beat ${i} (chip)\n   não está na captura: "${op}"`);
        }
      }
      continue;
    }
    if (!TIPOS_LITERAIS.has(b.t)) continue;   // `marca` é a voz do site, não citação

    conferidas++;
    if (!agulheiro.includes(normaliza(b.txt))) {
      falhas++;
      console.error(`✗ ${cena.id} · beat ${i} (${b.t})\n   não está na captura: "${String(b.txt).slice(0, 90)}…"`);
    }
  }
}

/* As contagens exibidas na tela também têm de bater com o arquivo de
   captura — é o número que o leitor usa para julgar o resto. */
const porId = { fotos: 1, nomes: 2, planilhas: 3, disco: 4, rasters: 5 };
for (const cena of C.cenas) {
  const conv = captura.conversas.find(c => c.roteiro === porId[cena.id]);
  if (!conv) { falhas++; console.error(`✗ ${cena.id}: sem conversa correspondente na captura`); continue; }
  conferidas++;
  if (conv.turnos_usuario !== cena.medido.turnos) {
    falhas++;
    console.error(`✗ ${cena.id}: turnos divergem — cena diz ${cena.medido.turnos}, captura diz ${conv.turnos_usuario}`);
  }
}

console.log(`${conferidas} citações e contagens conferidas contra ${C.fonte.arquivo}`);
if (falhas) {
  console.error(`\n${falhas} divergência(s). A página estaria atribuindo ao ${C.fonte.modelo} algo que ele não disse.`);
  process.exit(1);
}
console.log('tudo confere.');
