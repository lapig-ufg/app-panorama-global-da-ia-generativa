/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Atualizador de IAs Gratuitas
   Busca a página "Best Free AI Tools" do The AI Rankings e regenera
   assets/gratuitos-data.js no formato consumido pela página
   gratuitos.html.

   ESTADO: STUB (24/Jul/2026). A coleta ainda é manual; este script
   é o esqueleto para a automação futura. Ele já faz o fetch, valida
   guardas e escreve o arquivo em DRY_RUN — falta apenas o parsing
   real do HTML (seletores marcados com TODO). Não há workflow ativo.

   Por que parsing de HTML e não API: o The AI Rankings NÃO expõe
   API/JSON público. A única fonte é a página renderizada, então a
   automação depende de scraping — frágil por natureza (mudam o HTML
   e quebra). Os guardas abaixo abortam em vez de publicar lixo,
   igual ao update-benchmarks.mjs.

   Rodar manualmente (valida sem escrever):
     DRY_RUN=true node automation/update-gratuitos.mjs
   Para escrever (quando o parsing estiver pronto):
     node automation/update-gratuitos.mjs

   Ver automation/GRATUITOS.md para o mapeamento de campos e o
   roadmap de coleta automatizada.
   ═══════════════════════════════════════════════════════════════ */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE_URL = 'https://theairankings.com/best-free-ai-tools/';
const OUT_PATH = join(ROOT, 'assets', 'gratuitos-data.js');

/* ── Mapeamento SCHEMA: campo da fonte → campo do nosso item ──
   A fonte organiza os chatbots numa tabela ranqueada e as demais
   ferramentas em seções por categoria. Cada bloco vira um item nosso.
   O `id` (slug estável) é a chave de junção: o scraper casa por nome
   e reusa o id já existente para não quebrar links/buscas salvos. */
const SCHEMA = {
  rank:       'rank',        // 1..11 (só chatbots ranqueados)
  name:       'name',        // "Gemini Free" → display
  freeModel:  'freeModel',   // "Gemini 3.5 Flash"
  freeQuota:  'freeQuota',    // limite do free tier (verbatim, pt-BR)
  bestFor:    'bestFor',     // "Best free for"
  paidStepUp: 'paidStepUp',  // "Paid step-up" (preço do 1º plano pago)
  theCatch:   'theCatch',    // "The catch" (caveat)
  // Campos nossos (não vindos da fonte) — o scraper os preserva do
  // arquivo atual via merge por id: badge, highlight, howToAccess,
  // link, tags, category, company.
};

/* Categorias da fonte → nossos ids de categoria. Usado quando um
   item novo aparece (não existia antes) e precisa de category. */
const CATEGORY_MAP = {
  chatbot:     'modelos-llm',
  image:       'imagem-design',
  video:       'midia-av',
  music:       'midia-av',
  coding:      'assistentes-dev',
  research:    'pesquisa-busca',
  writing:     'modelos-llm',
  transcription: 'midia-av',
};

/* TODO(scraping): implementar o parser real.
   Sugestão de abordagem (a confirmar contra o HTML atual da fonte):
     1. Buscar SOURCE_URL (HTML).
     2. A tabela de chatbots: cada linha tem rank, nome, modelo free,
        limite, "best for". Usar regex/seletor sobre o HTML cru (sem
        dependência de cheerio) ou carregar cheerio se aceitarmos a
        dep. Manter sem deps para igualar update-benchmarks.mjs.
     3. As seções por categoria: título da seção ("Best free AI image
        generator" etc.) → CATEGORY_MAP; dentro, pegar o pick + as
        alternativas listadas.
   Retornar array de itens no formato SCHEMA (chaves em inglês da
   fonte). main() normaliza para o formato pt-BR do nosso arquivo. */
function parsePage(/* html */) {
  // STUB: retorna array vazio até o parser existir.
  return [];
}

/* Normaliza um item cru (campos da fonte) para o formato do nosso
   arquivo. Mantém campos nossos (link, tags, badge…) que vieram do
   merge com o arquivo anterior. */
function normalizeItem(raw, existing) {
  return {
    id:         existing?.id ?? slugify(raw.name),
    rank:       raw.rank ?? null,
    name:       raw.name ?? existing?.name ?? '',
    company:    existing?.company ?? '',
    category:   existing?.category ?? CATEGORY_MAP[raw.section] ?? 'modelos-llm',
    badge:      existing?.badge ?? '',
    highlight:  existing?.highlight ?? raw.bestFor ?? '',
    freeModel:  raw.freeModel ?? '',
    freeQuota:  raw.freeQuota ?? '',
    limits:     raw.limits ?? existing?.limits ?? '',
    bestFor:    raw.bestFor ?? existing?.bestFor ?? '',
    paidStepUp: raw.paidStepUp ?? '',
    theCatch:   raw.theCatch ?? '',
    howToAccess: existing?.howToAccess ?? '',
    link:       existing?.link ?? '',
    sourceUrl:  SOURCE_URL,
    tags:       existing?.tags ?? [],
  };
}

function slugify(name) {
  return String(name).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Carrega o arquivo atual para preservar campos nossos (link, tags,
   badge, company, howToAccess) via merge por id. */
async function loadCurrentItems() {
  try {
    const src = await readFile(OUT_PATH, 'utf8');
    const m = src.match(/const GRATUITOS_DATA = (\{[\s\S]*\});/);
    if (!m) return { items: [], categories: [] };
    // Sem dependências: avalia só o objeto. O arquivo é JS válido.
    const data = (new Function(`return ${m[1]};`))();
    const byId = new Map(data.items.map(i => [i.id, i]));
    const byName = new Map(data.items.map(i => [i.name.toLowerCase(), i]));
    return { byId, byName, categories: data.categories };
  } catch (e) {
    console.log('::warning::Arquivo atual não encontrado — sem merge de campos nossos.');
    return { byId: new Map(), byName: new Map(), categories: [] };
  }
}

function matchExisting(raw, byId, byName) {
  if (raw.id && byId.has(raw.id)) return byId.get(raw.id);
  return byName.get(String(raw.name).toLowerCase());
}

async function main() {
  console.log(`Buscando ${SOURCE_URL}…`);
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'Panorama-LLMS/1.0 (LAPIG/UFG; gratuitos updater)' },
  });
  if (!res.ok) {
    console.error(`Erro ao buscar a fonte: HTTP ${res.status}`);
    process.exit(1);
  }
  const html = await res.text();
  console.log(`Página recebida: ${html.length} bytes`);

  const rawItems = parsePage(html);

  /* ── Guardas ──
     Sem parser implementado, rawItems é vazio: aborta em vez de
     sobrescrever o catálogo com nada. Mesmo padrão do
     update-benchmarks.mjs: prefere manter o arquivo anterior no ar. */
  if (rawItems.length === 0) {
    console.error('::error::parsePage() não retornou itens (stub). Nada foi escrito — ' +
      'o gratuitos-data.js atual continua valendo. Implemente o parser em ' +
      'automation/update-gratuitos.mjs.');
    process.exit(1);
  }
  // Guarda de sanidade: menos que isso indica quebra de parsing.
  if (rawItems.length < 8) {
    console.error(`::error::Só ${rawItems.length} itens extraídos (esperado: ~20-40). ` +
      'O HTML da fonte provavelmente mudou. Nada foi escrito.');
    process.exit(1);
  }

  const { byId, byName, categories } = await loadCurrentItems();
  const items = rawItems.map(raw => {
    const existing = matchExisting(raw, byId, byName);
    return normalizeItem(raw, existing);
  });

  const today = new Date().toISOString().slice(0, 10);
  const data = {
    source: {
      name: 'The AI Rankings — Best Free AI Tools',
      url: SOURCE_URL,
      attribution: 'Cotas e limites adaptados de The AI Rankings (theairankings.com)',
      lastChecked: today,
      schemaVersion: 2,
    },
    updatedAt: today,
    updatedText: ptBrDate(today),
    categories: categories.length ? categories : defaultCategories(),
    items,
  };

  const fileContent = serializeFile(data);

  const dry = process.env.DRY_RUN === 'true';
  if (dry) {
    console.log('\n[DRY_RUN] Validou sem escrever o arquivo.');
  } else {
    await writeFile(OUT_PATH, fileContent, 'utf8');
    console.log(`\nSalvo: ${OUT_PATH}`);
  }
  console.log(`Itens: ${items.length} · Fonte: ${SOURCE_URL} · Data: ${today}`);
}

function ptBrDate(iso) {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${meses[m - 1]} de ${y}`;
}

function defaultCategories() {
  return [
    { id: 'todos', label: 'Todas as IAs' },
    { id: 'assistentes-dev', label: 'Assistentes de Código & IDEs' },
    { id: 'modelos-llm', label: 'LLMs & Chat Web' },
    { id: 'apis-inferencia', label: 'APIs & Provedores' },
    { id: 'pesquisa-busca', label: 'Pesquisa & Raciocínio' },
    { id: 'imagem-design', label: 'Geração de Imagens & UI' },
    { id: 'midia-av', label: 'Vídeo, Voz & Música' },
  ];
}

/* Serializa o objeto de volta para o formato do arquivo (JS, não
   JSON), preservando o cabeçalho e a forma `const GRATUITOS_DATA`. */
function serializeFile(data) {
  const header = `/* ═══════════════════════════════════════════════════════════════
   Panorama Global da IA Generativa — Catálogo de IAs Gratuitas
   Gerado automaticamente por automation/update-gratuitos.mjs a partir
   de The AI Rankings (${data.source.url}). Edição manual ainda é
   possível, mas será sobrescrita na próxima execução do scraper.
   ═══════════════════════════════════════════════════════════════ */
`;
  return `${header}const GRATUITOS_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});