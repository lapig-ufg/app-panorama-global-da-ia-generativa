#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Mede os tiques de escrita de IA no texto da aba e FALHA se eles
   voltarem a se acumular.

   POR QUE ISTO EXISTE
   O texto desta aba é escrito com ajuda de IA, e IA tem tiques de
   ritmo reconhecíveis. O mais forte é o travessão usado como
   conector universal: "frase completa — reviravolta curta no fim".
   Numa revisão de 11/set/2026 a página tinha 148 travessões em
   11.500 palavras, um a cada 78 — cerca de cinco vezes a taxa de
   prosa técnica escrita à mão. Lido de enfiada, vira assinatura.

   A correção não é trocar todo travessão por ponto: isso só troca
   um tique por outro (o fragmento dramático de três palavras). É
   reescrever a frase — vírgula, subordinação, ou cortar a
   reviravolta quando ela não acrescenta nada.

   O QUE FICA PERMITIDO
   Travessão em aposto que tem vírgula dentro, onde a vírgula
   ficaria ambígua: "Ele examina cada um com cuidado — nome,
   tamanho, data, conteúdo — e não pergunta se dois são iguais."
   E pares rótulo–valor: "macOS — Cmd + Espaço".

   Referência: a família de skills "humanizer" (github.com/blader,
   github.com/jooray), que lista o travessão, o contraste "não X,
   mas Y", o fragmento dramático e o fecho de uma linha entre os
   sinais de texto gerado por máquina.

   Uso:  node automation/valida-escrita.mjs
   ═══════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

const raiz = new URL('..', import.meta.url).pathname;
const carrega = rel => readFileSync(raiz + rel, 'utf8');

/* Só o texto que vai para a tela: comentários de código não contam, porque
   ninguém os lê no site. */
function prosa(rel) {
  const cru = carrega(rel).replace(/\/\*[\s\S]*?\*\//g, '');
  const strings = cru.match(/"(?:[^"\\]|\\.)*"/g) || [];
  return strings.join(' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

function prosaHTML(rel) {
  return carrega(rel)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|title)[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

const texto = [
  prosa('assets/como-usar-data.js'),
  prosa('assets/como-usar-cenas.js'),
  prosaHTML('como-usar.html')
].join(' ');

const palavras = texto.split(/\s+/).filter(Boolean).length;

/* O travessão legítimo vem em par dentro da mesma frase (aposto com vírgula
   dentro) ou separa rótulo de valor. O que se mede aqui é o OUTRO uso: um
   travessão solto emendando uma reviravolta no fim da frase.

   Os tetos foram calibrados contra a versão de 11/set/2026, ANTES da limpeza:
   ela marcava 112 travessões soltos, 9 contrastes "não é X, é Y", 6 "é aqui
   que" e 12 advérbios de ênfase. Depois da limpeza: 11, 7, 3 e 5. Cada teto
   fica entre os dois, perto do valor atual, para pegar a volta do vício cedo
   em vez de só quando ele já tiver tomado a página. */
const soltos = (texto.match(/[^.!?—]{25,}—[^—]{0,90}?(?=[.!?]|$)/g) || []).length;

const MEDIDAS = [
  { nome: 'travessão solto no fim da frase', n: soltos,
    porQuantas: 500,
    dica: 'reescreva a frase: vírgula, subordinação, ou corte a reviravolta' },
  { nome: '"não é X, é Y"', n: (texto.match(/[Nn]ão (?:é|foi|era|são|eram) [^.;:]{3,60}[,:] (?:é|foi|era|são|eram|e sim)/g) || []).length,
    porQuantas: 1600,
    dica: 'só vale quando a negação descarta algo que o leitor de fato pensaria' },
  { nome: '"é aqui que" / "é isso que"', n: (texto.match(/[ÉéE] (?:aqui|isso) que\b/g) || []).length,
    porQuantas: 2500, dica: 'diga a coisa direto' },
  { nome: '"exatamente" / "justamente"', n: (texto.match(/\b(?:exatamente|justamente)\b/g) || []).length,
    porQuantas: 1800, dica: 'advérbio de ênfase quase nunca acrescenta informação' },
];

let falhou = false;
console.log(`${palavras} palavras de texto visível na aba\n`);
for (const m of MEDIDAS) {
  const limite = Math.floor(palavras / m.porQuantas);
  const taxa = m.n ? Math.round(palavras / m.n) : '∞';
  const ok = m.n <= limite;
  if (!ok) falhou = true;
  console.log(`${ok ? '✓' : '✗'} ${m.nome.padEnd(34)} ${String(m.n).padStart(3)}  (1 a cada ${taxa}, teto ${limite})`);
  if (!ok) console.log(`     ${m.dica}`);
}

if (falhou) {
  console.error('\nOs tiques voltaram a se acumular. Reescreva antes de publicar.');
  process.exit(1);
}
console.log('\nA escrita passa.');
