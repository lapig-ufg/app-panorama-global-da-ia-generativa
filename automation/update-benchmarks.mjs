/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Atualizador de Benchmarks
   Busca dados na API da Artificial Analysis e gera
   assets/benchmarks.json no formato consumido pelo site.
   ═══════════════════════════════════════════════════════════════ */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://artificialanalysis.ai/api/v2/data/llms/models';
const OUT_PATH = path.resolve(process.cwd(), 'assets', 'benchmarks.json');
const TOP_N = 15;

const BENCHMARKS = [
  // Inteligência geral
  { key: 'artificial_analysis_intelligence_index', label: 'Intelligence Index', category: 'Inteligência', description: 'Composite AA de raciocínio geral (v4.1)', unit: 'índice (0–100)', is_fraction: false },
  { key: 'gpqa', label: 'GPQA Diamond', category: 'Inteligência', description: 'Perguntas de nível PhD — raciocínio profundo', unit: '%', is_fraction: true },
  { key: 'hle', label: "Humanity's Last Exam", category: 'Inteligência', description: 'Perguntas de especialistas — fronteira do conhecimento', unit: '%', is_fraction: true },
  // Coding
  { key: 'artificial_analysis_coding_index', label: 'Coding Index', category: 'Coding', description: 'Composite AA de agentes de código (DeepSWE, Terminal-Bench, SWE-Atlas)', unit: 'índice (0–100)', is_fraction: false },
  { key: 'scicode', label: 'SciCode', category: 'Coding', description: 'Geração de código científico', unit: '%', is_fraction: true },
  { key: 'livecodebench', label: 'LiveCodeBench', category: 'Coding', description: 'Problemas de programação inéditos', unit: '%', is_fraction: true },
  // Math
  { key: 'artificial_analysis_math_index', label: 'Math Index', category: 'Math', description: 'Composite AA de matemática', unit: 'índice (0–100)', is_fraction: false },
  { key: 'aime_25', label: 'AIME 2025', category: 'Math', description: 'Olimpíada de matemática', unit: '%', is_fraction: true },
  { key: 'math_500', label: 'MATH-500', category: 'Math', description: 'Problemas de matemática de competição', unit: '%', is_fraction: true },
  // Agents
  { key: 'terminalbench_v2_1', label: 'Terminal-Bench v2.1', category: 'Agents', description: 'Agentes em terminal (tarefas reais)', unit: '%', is_fraction: true },
  { key: 'tau2', label: 'TAU-bench', category: 'Agents', description: 'Agentes com ferramentas de atendimento', unit: '%', is_fraction: true },
  // Conhecimento
  { key: 'mmlu_pro', label: 'MMLU-Pro', category: 'Conhecimento', description: 'Conhecimento acadêmico multi-domínio', unit: '%', is_fraction: true },
  // Instruções
  { key: 'ifbench', label: 'IFBench', category: 'Instruções', description: 'Seguimento complexo de instruções', unit: '%', is_fraction: true },
  { key: 'lcr', label: 'LCR', category: 'Instruções', description: 'Leitura crítica e raciocínio longo', unit: '%', is_fraction: true },
];

function getValue(obj, keys) {
  for (const k of keys) {
    if (obj && typeof obj === 'object' && k in obj && obj[k] != null) return obj[k];
  }
  return undefined;
}

function priceBlended(model) {
  // Prefer blended; fallback to média de input/output em $/1M tokens
  const blended = getValue(model, ['price_1m_blended', 'price_blended_usd', 'price_usd_per_1m_tokens']);
  if (blended != null) return Number(blended);
  const inp = getValue(model, ['price_1m_input', 'price_input_usd_per_1m_tokens', 'input_price_usd_per_1m_tokens']);
  const out = getValue(model, ['price_1m_output', 'price_output_usd_per_1m_tokens', 'output_price_usd_per_1m_tokens']);
  if (inp != null && out != null) return (Number(inp) + Number(out)) / 2;
  if (inp != null) return Number(inp);
  return null;
}

function tokenSpeed(model) {
  return getValue(model, ['tok_per_sec', 'tokens_per_second', 'output_tokens_per_second', 'throughput_tokens_per_second']);
}

function creatorName(model) {
  return getValue(model, ['creator', 'organization', 'provider', 'developer']) || 'Desconhecido';
}

function modelName(model) {
  return getValue(model, ['name', 'model', 'model_name', 'id']) || 'Modelo';
}

function releaseDate(model) {
  const d = getValue(model, ['release_date', 'releaseDate', 'released_at']);
  if (!d) return null;
  // AA envia ISO; normaliza para YYYY-MM-DD
  return String(d).slice(0, 10);
}

function benchmarkScore(model, key) {
  // A API pode expor scores como campos diretos ou dentro de evaluations/benchmarks
  if (model[key] != null) return Number(model[key]);
  if (model.evaluations && typeof model.evaluations === 'object' && model.evaluations[key] != null) {
    return Number(model.evaluations[key]);
  }
  if (model.benchmarks && typeof model.benchmarks === 'object' && model.benchmarks[key] != null) {
    return Number(model.benchmarks[key]);
  }
  return null;
}

async function main() {
  const apiKey = process.env.AA_API_KEY;
  if (!apiKey) {
    console.error('Erro: defina a variável de ambiente AA_API_KEY.');
    process.exit(1);
  }

  console.log(`Buscando ${API_URL}…`);
  const res = await fetch(API_URL, {
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) {
    console.error(`Erro na API: HTTP ${res.status}`);
    process.exit(1);
  }

  const payload = await res.json();
  // A API pode retornar { models: [...] } ou diretamente um array
  const models = Array.isArray(payload) ? payload : (payload.models || payload.data || []);
  console.log(`Modelos recebidos: ${models.length}`);

  const fetchedAt = new Date().toISOString();

  const benchmarks = BENCHMARKS.map(b => {
    const evaluated = models
      .map(m => ({ m, score: benchmarkScore(m, b.key) }))
      .filter(x => x.score != null && !Number.isNaN(x.score));

    const top = evaluated
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map(x => {
        const m = x.m;
        return {
          model: modelName(m),
          creator: creatorName(m),
          score: x.score,
          release_date: releaseDate(m),
          price_1m_blended: priceBlended(m),
          tok_per_sec: tokenSpeed(m) ?? 0,
        };
      });

    return {
      key: b.key,
      label: b.label,
      category: b.category,
      description: b.description,
      unit: b.unit,
      is_fraction: b.is_fraction,
      models_evaluated: evaluated.length,
      top,
    };
  });

  const out = {
    source: 'Artificial Analysis Data API',
    source_url: 'https://artificialanalysis.ai/',
    attribution: 'Dados: Artificial Analysis — artificialanalysis.ai',
    models_total: models.length,
    fetched_at: fetchedAt,
    benchmarks,
  };

  await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

  console.log(`\nSalvo: ${OUT_PATH}`);
  console.log(`Modelos: ${models.length} · Benchmarks: ${benchmarks.length} · Data: ${fetchedAt.slice(0, 10)}`);
  benchmarks.forEach(b => {
    const first = b.top[0];
    console.log(`  ${b.label.padEnd(24)} ${String(b.models_evaluated).padStart(4)} modelos  #1 ${first ? `${first.model} (${first.score})` : '—'}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
