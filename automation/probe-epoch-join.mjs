/* ═══════════════════════════════════════════════════════════════
   Sonda 2 — o Epoch AI cobre o buraco que o free da AA deixa?

   A categoria "Pesquisa e raciocínio" do guia depende de HLE e GPQA
   Diamond, e nenhum dos dois vem na chave free da Artificial Analysis.
   O Epoch AI publica os dois em CSV sob licença CC BY.

   Esta sonda mede se dá para CRUZAR as duas fontes: o Epoch identifica
   modelos como "claude-opus-5_max" (slug + nível de esforço) e a AA
   expõe um campo `slug` em 100% dos modelos. Se o casamento for alto,
   a categoria sobrevive sem o Pro.

   NÃO grava nada. Custa 3 requisições à AA (limite free: 100/dia).
   Os CSVs do Epoch são baixados no runner, fora do orçamento da AA.

   Uso: AA_API_KEY=... node automation/probe-epoch-join.mjs <dir-dos-csvs>
   ═══════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = 'https://artificialanalysis.ai/api/v2';
const EPOCH_DIR = process.argv[2] || 'epoch-data';

// Sufixos de esforço que o Epoch cola no fim do identificador.
const ESFORCOS = ['max', 'xhigh', 'high', 'medium', 'low', 'minimal', 'none', 'unknown', 'thinking', 'nonthinking'];

/* CSV com aspas e quebras de linha dentro de campo (as notas do Epoch têm). */
function parseCSV(txt) {
  const linhas = [];
  let campo = '', linha = [], dentro = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (dentro) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else dentro = false; }
      else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const cab = linhas.shift();
  return linhas.filter(l => l.length > 1).map(l => Object.fromEntries(cab.map((k, i) => [k, l[i] ?? ''])));
}

// "claude-opus-5_max" → { slug: "claude-opus-5", esforco: "max" }
function separarEsforco(id) {
  const s = String(id).trim();
  for (const e of ESFORCOS) {
    if (s.toLowerCase().endsWith('_' + e)) return { slug: s.slice(0, -(e.length + 1)), esforco: e };
  }
  return { slug: s, esforco: null };
}

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

async function buscarAA() {
  const modelos = [];
  let pagina = 1, total = 1, gastas = 0;
  while (pagina <= total && pagina <= 10) {
    const res = await fetch(`${BASE}/language/models/free?page=${pagina}`, {
      headers: { 'x-api-key': process.env.AA_API_KEY },
    });
    gastas++;
    if (!res.ok) throw new Error(`AA HTTP ${res.status} na página ${pagina}`);
    const j = await res.json();
    if (pagina === 1) total = j.pagination?.total_pages ?? 1;
    modelos.push(...(j.data || []));
    pagina++;
  }
  return { modelos, gastas };
}

async function main() {
  if (!process.env.AA_API_KEY) { console.error('Erro: defina AA_API_KEY.'); process.exit(1); }

  console.log('═'.repeat(78));
  console.log(' SONDA 2 — cruzamento Artificial Analysis (free) × Epoch AI (CC BY)');
  console.log('═'.repeat(78));

  const { modelos, gastas } = await buscarAA();
  const slugsAA = new Set(modelos.map(m => m.slug).filter(Boolean));
  const porSlug = new Map(modelos.map(m => [m.slug, m]));
  console.log(`\nAA free: ${modelos.length} modelos, ${slugsAA.size} slugs distintos (${gastas} requisições)`);

  // Top 20 da AA por Intelligence Index — é o que o guia realmente exibe.
  const top20 = modelos
    .filter(m => m.evaluations?.artificial_analysis_intelligence_index != null)
    .sort((a, b) => b.evaluations.artificial_analysis_intelligence_index - a.evaluations.artificial_analysis_intelligence_index);
  const famTop = [];
  const vistas = new Set();
  for (const m of top20) {
    if (vistas.has(m.slug)) continue;
    vistas.add(m.slug); famTop.push(m);
    if (famTop.length >= 20) break;
  }

  const ARQUIVOS = [
    { arq: 'gpqa_diamond.csv', rot: 'GPQA Diamond', col: 'mean_score' },
    { arq: 'hle_external.csv', rot: "Humanity's Last Exam", col: 'Accuracy' },
    { arq: 'critpt_external.csv', rot: 'CritPt (física PhD)', col: 'Accuracy' },
    { arq: 'frontiermath.csv', rot: 'FrontierMath', col: 'mean_score' },
    { arq: 'scicode_external.csv', rot: 'SciCode', col: 'Score' },
    { arq: 'epoch_capabilities_index.csv', rot: 'Epoch Capabilities Index', col: 'ECI Score' },
  ];

  for (const { arq, rot, col } of ARQUIVOS) {
    let linhas;
    try { linhas = parseCSV(await readFile(join(EPOCH_DIR, arq), 'utf8')); }
    catch (e) { console.log(`\n── ${rot}: CSV não lido (${e.message})`); continue; }

    // Melhor pontuação por slug (colapsa níveis de esforço, igual ao pipeline).
    const porSlugEpoch = new Map();
    for (const l of linhas) {
      const v = parseFloat(l[col]);
      if (!Number.isFinite(v)) continue;
      const { slug } = separarEsforco(l['Model version']);
      const prev = porSlugEpoch.get(slug);
      if (!prev || v > prev.v) porSlugEpoch.set(slug, { v, data: l['Release date'], org: l['Organization'] });
    }

    const casaDireto = [...porSlugEpoch.keys()].filter(s => slugsAA.has(s)).length;
    const top20Casa = famTop.filter(m => porSlugEpoch.has(m.slug));
    const datas = [...porSlugEpoch.values()].map(x => x.data).filter(Boolean).sort();

    console.log(`\n── ${rot} ──`);
    console.log(`   modelos no Epoch        : ${porSlugEpoch.size} (após colapsar esforço)`);
    console.log(`   casam com slug da AA    : ${casaDireto} (${(casaDireto / porSlugEpoch.size * 100).toFixed(0)}% do Epoch)`);
    console.log(`   COBERTURA DO TOP-20 DO GUIA: ${top20Casa.length}/20  ${'█'.repeat(top20Casa.length)}${'·'.repeat(20 - top20Casa.length)}`);
    console.log(`   dado mais recente       : ${datas.at(-1) ?? '—'}`);
    const faltam = famTop.filter(m => !porSlugEpoch.has(m.slug)).map(m => m.slug);
    if (faltam.length) console.log(`   sem nota no top-20      : ${faltam.slice(0, 10).join(', ')}${faltam.length > 10 ? ` (+${faltam.length - 10})` : ''}`);
  }

  // Detalhe do GPQA sobre o top-10 — é o candidato a substituir a categoria.
  console.log(`\n── Como ficaria "Pesquisa e raciocínio" com GPQA Diamond do Epoch ──`);
  const gpqa = parseCSV(await readFile(join(EPOCH_DIR, 'gpqa_diamond.csv'), 'utf8'));
  const melhor = new Map();
  for (const l of gpqa) {
    const v = parseFloat(l['mean_score']);
    if (!Number.isFinite(v)) continue;
    const { slug, esforco } = separarEsforco(l['Model version']);
    const prev = melhor.get(slug);
    if (!prev || v > prev.v) melhor.set(slug, { v, esforco, org: l['Organization'] });
  }
  const rank = [...melhor.entries()]
    .filter(([s]) => slugsAA.has(s))
    .sort((a, b) => b[1].v - a[1].v)
    .slice(0, 12);
  console.log(`   ${'modelo (nome da AA)'.padEnd(34)} ${'slug'.padEnd(22)} ${'GPQA'.padStart(6)}  esforço`);
  for (const [slug, x] of rank) {
    const nomeAA = porSlug.get(slug)?.name ?? '—';
    console.log(`   ${String(nomeAA).slice(0, 34).padEnd(34)} ${slug.slice(0, 22).padEnd(22)} ${(x.v * 100).toFixed(1).padStart(6)}  ${x.esforco ?? '—'}`);
  }

  console.log(`\n${'═'.repeat(78)}`);
  console.log(` Requisições à AA nesta execução: ${gastas}`);
  console.log('═'.repeat(78));
}

main().catch(err => { console.error(err); process.exit(1); });
