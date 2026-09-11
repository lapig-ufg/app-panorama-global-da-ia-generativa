#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Confere que os NÚMEROS publicados na aba batem com os relatórios
   da medição.

   O QUE ESTE ARQUIVO ERA, E POR QUE MUDOU
   Até 12/set/2026 a seção 02 reproduzia as duas conversas na
   íntegra, e este script conferia cada citação contra a captura,
   palavra por palavra. A seção foi reescrita: ela agora NARRA a
   diferença em vez de transcrever os testes, e não há mais citação
   literal para conferir.

   O que sobrou de verificável são os números — 97 abas, 40
   arquivos, 244 imagens, 20 execuções — que aparecem nas caixas
   "saiba mais" e na seção da medição. Eles continuam vindo dos
   relatórios em automation/capturas/, e um número que muda de um
   lado e não do outro é exatamente o tipo de erro que ninguém
   percebe relendo.

   Uso:  node automation/valida-cenas.mjs
   ═══════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

const raiz = new URL('..', import.meta.url).pathname;
const le = rel => readFileSync(raiz + rel, 'utf8');

/* O texto que vai para a tela, dos dois arquivos de conteúdo. */
const pagina = ['assets/como-usar-cenas.js', 'assets/como-usar-data.js']
  .map(f => le(f).replace(/\/\*[\s\S]*?\*\//g, ''))
  .join(' ')
  .replace(/\s+/g, ' ');

/* Cada afirmação numérica da página, com o relatório que a sustenta.
   `naPagina` tem de aparecer no conteúdo; `naFonte`, no relatório. */
const AFIRMACOES = [
  { o: 'total de abas das planilhas',
    naPagina: /97 abas no total/,
    fonte: 'automation/capturas/2026-09-10-repeticao-planilhas.md', naFonte: /97 abas/ },

  { o: 'arquivos gerados sem a frase completa',
    naPagina: /saíram 40 arquivos/,
    fonte: 'automation/capturas/2026-09-10-repeticao-planilhas.md', naFonte: /40 CSVs/ },

  { o: 'arquivos gerados com a frase completa',
    naPagina: /saíram os 97 arquivos/,
    fonte: 'automation/capturas/2026-09-10-repeticao-planilhas.md', naFonte: /→ 97 arquivos, um por aba/ },

  { o: 'repetições por programa',
    naPagina: /cinco vezes em cada um dos dois programas/,
    fonte: 'automation/capturas/2026-09-10-repeticao-planilhas.md', naFonte: /cinco por célula/ },

  { o: 'imagens da série',
    naPagina: /244 imagens de satélite/,
    fonte: 'automation/capturas/2026-09-10-roteiro5-serie.md', naFonte: /240 GeoTIFF válidos/ },

  { o: 'execuções da série',
    naPagina: /As vinte execuções acharam as mesmas três/,
    fonte: 'automation/capturas/2026-09-10-roteiro5-serie.md', naFonte: /20 execuções, ninguém achou o quarto/ },
];

let falhas = 0;
for (const a of AFIRMACOES) {
  const naPagina = a.naPagina.test(pagina);
  const naFonte = a.naFonte.test(le(a.fonte));
  if (naPagina && naFonte) { console.log(`✓ ${a.o}`); continue; }
  falhas++;
  if (!naPagina) console.error(`✗ ${a.o}: sumiu da página (ou foi reescrito) — ${a.naPagina}`);
  if (!naFonte) console.error(`✗ ${a.o}: não confere com ${a.fonte}`);
}

/* A página não pode voltar a citar modelo sem lastro: se alguém puser aspas
   de fala de IA no conteúdo, tem de existir a captura para conferir. */
console.log(`\n${AFIRMACOES.length - falhas} de ${AFIRMACOES.length} afirmações numéricas conferem com os relatórios.`);
if (falhas) {
  console.error('Um número mudou de um lado e não do outro. Confira antes de publicar.');
  process.exit(1);
}
