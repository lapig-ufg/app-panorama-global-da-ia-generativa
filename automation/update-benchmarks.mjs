/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Atualizador de Benchmarks
   Busca dados na API da Artificial Analysis e gera
   assets/benchmarks.json no formato consumido pelo guia
   "Qual modelo usar" (guia.html).

   Divisão de responsabilidades:
     • aqui (pipeline)  → busca, normaliza empresa, colapsa variantes de esforço
     • no navegador     → categorias e recomendações (assets/guia.js)
   Assim, mudar a política de recomendação não exige nova chamada à API.
   ═══════════════════════════════════════════════════════════════ */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* Contrato v2 documentado. O endpoint legado (/api/v2/data/llms/models) foi
   desligado em 4/nov/2026 — ele não tinha paginação, devolvia todos os
   benchmarks para qualquer chave e usava outros nomes de campo.

   Duas rotas, escolhidas pelo tier da chave:
     • free → só os 3 índices compostos, sem os benchmarks individuais
     • pro  → o conjunto completo
   O tier vem no corpo da resposta, então detectamos em vez de configurar. */
const API_BASE = 'https://artificialanalysis.ai/api/v2';
const ROTA_FREE = '/language/models/free';
const ROTA_PRO = '/language/models';
const MAX_PAGINAS = 20;   // trava contra loop se a paginação vier maluca
const OUT_PATH = join(ROOT, 'assets', 'benchmarks.json');

// Nº de modelos DISTINTOS (famílias) guardados por benchmark. Como as variantes
// de esforço são colapsadas antes do corte, 20 famílias ≈ 40-50 linhas cruas.
const TOP_N = 20;

// ── identidade das empresas: mesma fonte da régua (assets/data.js) ──
async function loadDataJs(fields) {
  const src = await readFile(join(ROOT, 'assets', 'data.js'), 'utf8');
  const ctx = { Date, console };
  vm.createContext(ctx);
  vm.runInContext(`${src}\n;globalThis.__X = { ${fields.join(', ')} };`, ctx, { filename: 'data.js' });
  return ctx.__X;
}

/* Os 3 índices compostos da AA — tudo que a chave free entrega. Todos em
   escala 0–100 (só os benchmarks individuais vêm em fração). */
const BENCHMARKS_FREE = [
  { key: 'artificial_analysis_intelligence_index', label: 'Intelligence Index', category: 'Inteligência', description: 'Composite AA de raciocínio geral (v4.1: GDPval-AA, τ³-Banking, Terminal-Bench, SciCode, AA-LCR, AA-Omniscience, HLE, GPQA Diamond, CritPt)', unit: 'índice (0–100)', is_fraction: false },
  { key: 'artificial_analysis_coding_index', label: 'Coding Index', category: 'Coding', description: 'Composite AA de código, derivado de um subconjunto das avaliações do Intelligence Index', unit: 'índice (0–100)', is_fraction: false },
  { key: 'artificial_analysis_agentic_index', label: 'Agentic Index', category: 'Agents', description: 'Composite AA de uso autônomo de ferramentas e terminal', unit: 'índice (0–100)', is_fraction: false },
];

/* Benchmarks individuais — só com chave Pro. Mantidos aqui para que a migração
   de tier seja automática: se a assinatura mudar, a tabela volta inteira sem
   tocar no código. Os nomes seguem o contrato v2, que difere do legado:
   gpqa→gpqa_diamond, lcr→aa_lcr, tau2→tau2_telecom. E mmlu_pro, aime_25 e
   livecodebench não existem mais em nenhum tier — a AA os aposentou. */
const BENCHMARKS_PRO = [
  ...BENCHMARKS_FREE,
  { key: 'gpqa_diamond', label: 'GPQA Diamond', category: 'Inteligência', description: 'Perguntas de nível PhD — raciocínio profundo', unit: '%', is_fraction: true },
  { key: 'hle', label: "Humanity's Last Exam", category: 'Inteligência', description: 'Perguntas de especialistas — fronteira do conhecimento', unit: '%', is_fraction: true },
  { key: 'scicode', label: 'SciCode', category: 'Coding', description: 'Geração de código científico', unit: '%', is_fraction: true },
  { key: 'terminalbench_v2_1', label: 'Terminal-Bench v2.1', category: 'Agents', description: 'Agentes em terminal (tarefas reais)', unit: '%', is_fraction: true },
  { key: 'tau2_telecom', label: 'TAU-bench', category: 'Agents', description: 'Agentes com ferramentas de atendimento', unit: '%', is_fraction: true },
  { key: 'ifbench', label: 'IFBench', category: 'Instruções', description: 'Seguimento complexo de instruções', unit: '%', is_fraction: true },
  { key: 'aa_lcr', label: 'AA-LCR', category: 'Instruções', description: 'Leitura crítica e raciocínio longo', unit: '%', is_fraction: true },
  { key: 'critpt', label: 'CritPt', category: 'Inteligência', description: 'Raciocínio de física em nível de doutorado', unit: '%', is_fraction: true },
];

/* Removidos de propósito:
   • artificial_analysis_math_index — top-15 byte a byte idêntico ao aime_25.
   • math_500 — saturado: teto 99,4% e spread de 1,3 ponto no top-15, com o #1
     de ago/2025. Não separa mais os modelos, então só ocupava espaço.
   • mmlu_pro, aime_25, livecodebench — aposentados pela AA no contrato v2. */

function getValue(obj, keys) {
  for (const k of keys) {
    if (obj && typeof obj === 'object' && k in obj && obj[k] != null) return obj[k];
  }
  return undefined;
}

function priceBlended(model) {
  /* O preço exibido é o "blended 3:1" — 3 tokens de entrada para cada 1 de
     saída, a proporção típica de uso real. A AA entrega esse campo pronto só
     no tier Pro, mas ele é reproduzível: blended = (3·input + 1·output) / 4.
     Conferido contra o benchmarks.json gerado pelo endpoint legado — Opus 5
     (5/25) → 10,00 e GPT-5.6 Sol (5/30) → 11,25, batendo exato.

     Ou seja: o free não degrada o preço, só exige a conta. */
  const p = (model && model.pricing && typeof model.pricing === 'object') ? model.pricing : model;
  const blended = getValue(p, ['price_1m_blended_3_to_1', 'price_1m_blended', 'price_blended_usd', 'price_usd_per_1m_tokens']);
  if (blended != null) return Number(blended);
  const inp = getValue(p, ['price_1m_input_tokens', 'price_1m_input', 'price_input_usd_per_1m_tokens', 'input_price_usd_per_1m_tokens']);
  const out = getValue(p, ['price_1m_output_tokens', 'price_1m_output', 'price_output_usd_per_1m_tokens', 'output_price_usd_per_1m_tokens']);
  if (inp != null && out != null) return (3 * Number(inp) + Number(out)) / 4;
  if (inp != null) return Number(inp);
  return null;
}

function tokenSpeed(model) {
  // Contrato v2: as métricas de performance vivem em model.performance.*.
  // Sem este aninhamento a velocidade viraria 0 em TODA linha, em silêncio —
  // por isso a guarda de velocidade lá embaixo.
  const perf = (model && model.performance && typeof model.performance === 'object') ? model.performance : model;
  return getValue(perf, ['median_output_tokens_per_second', 'tok_per_sec', 'tokens_per_second', 'output_tokens_per_second', 'throughput_tokens_per_second']);
}

function creatorName(model) {
  // Schema v2 da AA: o criador virou um objeto { id, name, slug }.
  const mc = model && model.model_creator;
  if (mc && typeof mc === 'object' && mc.name) return String(mc.name);
  // Fallback: schema antigo (campo string) e variações.
  return getValue(model, ['creator', 'organization', 'provider', 'developer']) || 'Desconhecido';
}

function modelName(model) {
  return getValue(model, ['name', 'model', 'model_name', 'id']) || 'Modelo';
}

// Pesos abertos: no contrato v2 é licensing.is_open_weights, e o campo inteiro
// só existe no tier Pro. No free devolve null e o guia simplesmente não mostra
// o selo "aberto" — nunca chuta. (Já era o caso com o endpoint legado, que
// também não trazia o campo: has_open_weights vinha false.)
function openWeights(model) {
  const lic = (model && model.licensing && typeof model.licensing === 'object') ? model.licensing : model;
  const v = getValue(lic, ['is_open_weights', 'open_weights', 'openWeights', 'open_source', 'is_open_source']);
  if (v == null) return null;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', '1', 'open', 'open_weights'].includes(s)) return true;
  if (['false', 'no', '0', 'proprietary', 'closed'].includes(s)) return false;
  return null;
}

function releaseDate(model) {
  const d = getValue(model, ['release_date', 'releaseDate', 'released_at']);
  if (!d) return null;
  // AA envia ISO; normaliza para YYYY-MM-DD
  return String(d).slice(0, 10);
}

// Separa "GPT-5.6 Sol (max)" em família + variante de esforço.
// A API lista cada nível de esforço como um modelo próprio, o que faz um mesmo
// modelo ocupar 4-5 vagas do ranking. Guardamos a família para colapsar.
function splitVariant(name) {
  const m = String(name).match(/^(.*?)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$/);
  if (!m) return { family: String(name).trim(), variant: null };
  return { family: m[1].trim(), variant: m[2].trim() };
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

// Schema v2 da AA passou a devolver os benchmarks percentuais em fração (0–1),
// enquanto os índices (Intelligence/Coding) seguem em 0–100. O site espera tudo
// em 0–100 (is_fraction controla só o sufixo "%"). Então, para os percentuais,
// convertemos 0–1 → 0–100. O guard `<= 1` deixa passar dados já em 0–100 caso a
// AA volte atrás, evitando multiplicar duas vezes.
function normalizeScore(v, isFraction) {
  if (v == null || Number.isNaN(v)) return v;
  // 0–1 → 0–100, arredondando p/ 4 casas: mata o ruído de ponto flutuante
  // (0.533 * 100 = 53.300000000000004) sem perder fidelidade de ranking.
  return (isFraction && v <= 1) ? Math.round(v * 1e6) / 1e4 : v;
}

/* Busca uma rota inteira, seguindo a paginação (page_size = 200 hoje).
   Devolve também o tier e se a paginação fechou — sem isso o pipeline
   publicaria a primeira página e jogaria o resto fora em silêncio. */
async function buscarRota(rota, apiKey) {
  const models = [];
  let pagina = 1, totalPaginas = 1, tier = null, completa = false;

  while (pagina <= totalPaginas && pagina <= MAX_PAGINAS) {
    const url = `${API_BASE}${rota}?page=${pagina}`;
    const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
    if (!res.ok) return { erro: res.status, rota, models, tier };

    const payload = await res.json();
    const lote = Array.isArray(payload) ? payload : (payload.data || payload.models || []);
    models.push(...lote);

    if (pagina === 1) {
      tier = payload.tier ?? res.headers.get('x-aa-tier') ?? null;
      totalPaginas = payload.pagination?.total_pages ?? 1;
      console.log(`  tier=${tier} · ${totalPaginas} página(s) · ${payload.pagination?.page_size ?? '?'} por página`);
    }
    completa = payload.pagination ? payload.pagination.has_more === false : true;
    pagina++;
  }
  return { models, tier, totalPaginas, completa };
}

async function main() {
  const apiKey = process.env.AA_API_KEY;
  if (!apiKey) {
    console.error('Erro: defina a variável de ambiente AA_API_KEY.');
    process.exit(1);
  }

  const { canonicalCompany, COMPANY_COLORS, BENCH_ONLY_COLORS, MODEL_ALIASES } =
    await loadDataJs(['canonicalCompany', 'COMPANY_COLORS', 'BENCH_ONLY_COLORS', 'MODEL_ALIASES']);

  /* Tenta o Pro primeiro: se a assinatura existir, o guia ganha os benchmarks
     individuais de volta sozinho. 403 é a resposta esperada numa chave free —
     não é erro, é a detecção funcionando. */
  console.log(`Buscando ${API_BASE}${ROTA_PRO}…`);
  let r = await buscarRota(ROTA_PRO, apiKey);
  if (r.erro === 403) {
    console.log('  403 — a chave não cobre o tier Pro. Usando a rota free.');
    console.log(`Buscando ${API_BASE}${ROTA_FREE}…`);
    r = await buscarRota(ROTA_FREE, apiKey);
  }
  if (r.erro) {
    console.error(`::error::Erro na API: HTTP ${r.erro} em ${r.rota}. ` +
      'Nada foi escrito — o benchmarks.json anterior continua valendo.');
    process.exit(1);
  }

  const models = r.models;
  const ehPro = r.tier === 'pro' || r.tier === 'commercial';
  const BENCHMARKS = ehPro ? BENCHMARKS_PRO : BENCHMARKS_FREE;
  console.log(`Modelos recebidos: ${models.length} · tier ${r.tier} · ${BENCHMARKS.length} benchmarks`);

  /* Guarda de PAGINAÇÃO: se a última página disse has_more=true, veio só um
     pedaço do catálogo. O ranking sairia plausível mas incompleto — o pior
     tipo de erro, porque nenhuma outra guarda pega. */
  if (!r.completa) {
    console.error(`::error::A paginação não fechou (${r.totalPaginas} páginas, has_more ainda true). ` +
      'Recebemos um catálogo parcial. Nada foi escrito — o benchmarks.json anterior continua valendo.');
    process.exit(1);
  }

  const fetchedAt = new Date().toISOString();
  let openWeightsSeen = 0;

  const benchmarks = BENCHMARKS.map(b => {
    const evaluated = models
      .map(m => ({ m, score: normalizeScore(benchmarkScore(m, b.key), b.is_fraction) }))
      .filter(x => x.score != null && !Number.isNaN(x.score));

    // Colapsa variantes: mantém a melhor pontuação de cada família de modelo.
    const byFamily = new Map();
    for (const x of evaluated) {
      const { family, variant } = splitVariant(modelName(x.m));
      const creator = canonicalCompany(creatorName(x.m));
      const id = `${creator} ${family}`;
      const prev = byFamily.get(id);
      if (!prev || x.score > prev.score) {
        byFamily.set(id, { m: x.m, score: x.score, family, variant, creator });
      }
    }

    // Ranking completo de famílias, ordenado por pontuação. O `top` alimenta o
    // ranking EXIBIDO (campos ricos: preço, velocidade, variante). O `full`
    // guarda TODAS as famílias avaliadas, em campos mínimos, só para lookup —
    // assim a comparação mostra a nota e o posto de um modelo mesmo quando ele
    // não está no top-N de uma categoria (ex.: GLM 5.1 fora dos 20 em coding).
    // Sem custo extra de API: os dados já vieram nesta mesma resposta; antes
    // eram descartados pelo slice. O posto é implícito pela posição no array.
    const ranked = [...byFamily.values()].sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, TOP_N).map(x => {
        const ow = openWeights(x.m);
        if (ow != null) openWeightsSeen++;
        return {
          model: x.family,          // nome curto, sem o sufixo de esforço
          variant: x.variant,       // nível de esforço que atingiu a pontuação
          creator: x.creator,       // já canônico (mesmo nome/cor da régua)
          score: x.score,
          release_date: releaseDate(x.m),
          price_1m_blended: priceBlended(x.m),
          tok_per_sec: tokenSpeed(x.m) ?? 0,
          open_weights: ow,
        };
      });

    // Lista completa para lookup da comparação — só o essencial (sem preço/
    // velocidade/variant, que só importam no top exibido). Mantém o arquivo
    // enxuto: ~12 benchmarks × ~150-300 famílias ≈ 25-35 KB gzip a mais.
    const full = ranked.map(x => ({
      model: x.family,
      creator: x.creator,
      score: x.score,
    }));

    return {
      key: b.key,
      label: b.label,
      category: b.category,
      description: b.description,
      unit: b.unit,
      is_fraction: b.is_fraction,
      models_evaluated: evaluated.length,   // entradas cruas avaliadas pela AA
      families_evaluated: byFamily.size,    // modelos distintos após colapsar
      top,
      full,
    };
  });

  /* ─── Guardas ───
     Sem isto, uma resposta ruim da API sobrescreve em silêncio um arquivo bom,
     e o site publica uma página vazia até alguém reparar. Preferimos abortar e
     manter o benchmarks.json anterior no ar. */
  const vazios = benchmarks.filter(b => !b.top.length);

  if (models.length < 50) {
    console.error(`::error::A API devolveu só ${models.length} modelos (esperado: centenas). ` +
      'Nada foi escrito — o benchmarks.json anterior continua valendo.');
    process.exit(1);
  }
  if (vazios.length > benchmarks.length / 2) {
    console.error(`::error::${vazios.length} de ${benchmarks.length} benchmarks voltaram vazios. ` +
      'Nada foi escrito — o benchmarks.json anterior continua valendo.');
    process.exit(1);
  }

  /* Guarda de SCHEMA (jul/2026): quando a AA renomeia/reestrutura campos, os
     scores continuam vindo mas criador/preço/velocidade viram lixo — e o site
     publica "Desconhecido"/sem preço em silêncio (foi o que aconteceu quando o
     criador virou objeto e o preço foi para model.pricing). Aborta se a maioria
     das linhas vier sem criador reconhecido, ou se NENHUMA vier com preço. */
  const allTop = benchmarks.flatMap(b => b.top);
  const nTop = allTop.length;
  const semCreator = allTop.filter(m => !m.creator || m.creator === 'Desconhecido').length;
  const comPreco = allTop.filter(m => m.price_1m_blended != null).length;
  const comVeloc = allTop.filter(m => m.tok_per_sec > 0).length;
  if (nTop > 0 && semCreator > nTop * 0.5) {
    console.error(`::error::${semCreator}/${nTop} linhas sem criador reconhecido — a AA ` +
      'provavelmente mudou o schema do campo de criador. Nada foi escrito; ' +
      'confira creatorName() em automation/update-benchmarks.mjs.');
    process.exit(1);
  }
  if (nTop > 0 && comPreco === 0) {
    console.error(`::error::Nenhuma das ${nTop} linhas veio com preço — a AA provavelmente ` +
      'mudou o schema de pricing. Nada foi escrito; confira priceBlended().');
    process.exit(1);
  }
  /* Velocidade: só ~51% dos modelos têm medição, então não dá para exigir
     maioria. Mas ZERO linhas com velocidade significa que performance.* mudou
     de lugar — e como o guia trata ausência como 0, o ordenador "mais rápido"
     viraria uma lista aleatória sem nenhum sinal de erro. */
  if (nTop > 0 && comVeloc === 0) {
    console.error(`::error::Nenhuma das ${nTop} linhas veio com velocidade — a AA provavelmente ` +
      'mudou o schema de performance. Nada foi escrito; confira tokenSpeed().');
    process.exit(1);
  }

  /* Um benchmark isolado vazio provavelmente é chave renomeada na AA
     (ex.: terminalbench_v2_1 -> v3). O arquivo é gravado do mesmo jeito, para
     não travar os benchmarks saudáveis, mas o aviso aparece na aba Actions —
     e o guia mostra a categoria como indisponível em vez de escondê-la. */
  for (const b of vazios) {
    console.log(`::warning::Benchmark "${b.key}" (${b.label}) voltou sem nenhum modelo. ` +
      'A AA pode ter renomeado ou aposentado a chave — confira em artificialanalysis.ai ' +
      'e atualize BENCHMARKS em automation/update-benchmarks.mjs.');
  }

  // Empresa nova sem cor/apelido em data.js aparece cinza e com o nome da AA.
  const conhecidas = new Set(
    [...Object.keys(COMPANY_COLORS), ...Object.keys(BENCH_ONLY_COLORS)].map(s => s.toUpperCase()));
  const novas = new Set();
  for (const b of benchmarks) {
    for (const m of b.top) if (!conhecidas.has(String(m.creator).toUpperCase())) novas.add(m.creator);
  }
  if (novas.size) {
    console.log(`::warning::Empresas sem entrada em data.js: ${[...novas].join(', ')}. ` +
      'Adicione em BENCH_ONLY_COLORS (e em COMPANY_ALIASES se a régua usa outro nome).');
  }

  // Modelos do top-N que a régua provavelmente já tem sob outro nome, mas que
  // não casam nem direto nem via MODEL_ALIASES. Sinal para o curador adicionar
  // um alias (ou cadastrar o modelo na régua, se for realmente novo).
  // Aviso apenas — não bloqueia a gravação do benchmarks.json.
  const aliasValues = new Set(Object.values(MODEL_ALIASES || {}));
  const semLink = new Set();
  for (const b of benchmarks) {
    for (const m of b.top) {
      const norm = String(m.model).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
      if (MODEL_ALIASES && (MODEL_ALIASES[norm] || aliasValues.has(norm))) continue;
      semLink.add(`${m.creator} · ${m.model}`);
    }
  }
  if (semLink.size) {
    const lista = [...semLink].slice(0, 20).join(' | ');
    console.log(`::notice::${semLink.size} modelo(s) no top-N sem link para a régua ` +
      `(sem correspondência direta nem em MODEL_ALIASES). Se algum já está na régua ` +
      `sob outro nome, adicione o alias em assets/data.js. Primeiros: ${lista}` +
      (semLink.size > 20 ? ` … (+${semLink.size - 20})` : ''));
  }

  const out = {
    source: 'Artificial Analysis Data API v2',
    source_url: 'https://artificialanalysis.ai/',
    attribution: 'Dados: Artificial Analysis — artificialanalysis.ai',
    api_tier: r.tier,          // 'free' | 'pro' — o guia usa para explicar a cobertura
    models_total: models.length,
    fetched_at: fetchedAt,
    has_open_weights: openWeightsSeen > 0,
    benchmarks,
  };

  // DRY_RUN=true valida e imprime o resumo SEM escrever o arquivo — usado para
  // conferir uma correção de schema antes de deixá-la publicar de verdade.
  const dry = process.env.DRY_RUN === 'true';
  if (dry) {
    console.log('\n[DRY_RUN] Validou sem escrever o arquivo.');
  } else {
    await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
    console.log(`\nSalvo: ${OUT_PATH}`);
  }
  console.log(`Modelos: ${models.length} · Benchmarks: ${benchmarks.length} · Tier: ${r.tier} · Data: ${fetchedAt.slice(0, 10)}`);
  console.log(`Preço: ${comPreco}/${nTop} linhas · Velocidade: ${comVeloc}/${nTop} linhas`);
  console.log(`Campo open_weights: ${openWeightsSeen > 0 ? `presente (${openWeightsSeen} linhas)` : 'AUSENTE na API — selo "aberto" fica oculto'}`);
  benchmarks.forEach(b => {
    const first = b.top[0];
    const info = first
      ? `${first.model} · ${first.creator} · ${first.score}${b.is_fraction ? '%' : ''} · ` +
        `${first.price_1m_blended != null ? '$' + first.price_1m_blended : 'sem preço'} · ${first.tok_per_sec || 0} tok/s`
      : '—';
    console.log(`  ${b.label.padEnd(24)} ${String(b.families_evaluated).padStart(4)} mod  #1 ${info}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
