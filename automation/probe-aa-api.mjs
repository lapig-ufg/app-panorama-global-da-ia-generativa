/* ═══════════════════════════════════════════════════════════════
   Sonda de diagnóstico da API da Artificial Analysis.

   NÃO grava nada. Só chama a API e imprime o que veio, para decidir
   como migrar do endpoint legado (/api/v2/data/llms/models, que será
   desligado em 4/nov/2026) para o contrato v2 documentado.

   Orçamento de requisições (limite free: 100/dia, reseta 00:00 UTC):
     • 1 por página de /language/models/free  (~3 páginas)
     • 1 em /language/models    → confirma o tier pelo 403 (ou 200 se Pro)
   Total esperado: 4-5 requisições.

   Uso: AA_API_KEY=... node automation/probe-aa-api.mjs
   ═══════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = 'https://artificialanalysis.ai/api/v2';

// Chaves de benchmark que o guia usa HOJE (vindas do endpoint legado).
const CHAVES_ATUAIS = [
  'artificial_analysis_intelligence_index', 'gpqa', 'hle',
  'artificial_analysis_coding_index', 'scicode', 'livecodebench',
  'aime_25', 'terminalbench_v2_1', 'tau2', 'mmlu_pro', 'ifbench', 'lcr',
];

let gastas = 0;

async function chamar(caminho) {
  gastas++;
  const url = `${BASE}${caminho}`;
  const res = await fetch(url, { headers: { 'x-api-key': process.env.AA_API_KEY } });
  const quota = {
    tier: res.headers.get('x-aa-tier'),
    limite: res.headers.get('x-ratelimit-limit'),
    restante: res.headers.get('x-ratelimit-remaining'),
  };
  let corpo = null;
  try { corpo = await res.json(); } catch { /* resposta não-JSON */ }
  return { ok: res.ok, status: res.status, quota, corpo, url };
}

// Caminhos de todos os campos, com quantos modelos têm valor não-nulo.
// Serve para separar "campo existe e vem preenchido" de "campo existe e vem null".
function inventariar(modelos) {
  const conta = new Map();
  const exemplo = new Map();
  const anda = (obj, prefixo) => {
    for (const [k, v] of Object.entries(obj || {})) {
      const caminho = prefixo ? `${prefixo}.${k}` : k;
      const ehObjeto = v !== null && typeof v === 'object' && !Array.isArray(v);
      if (ehObjeto) { anda(v, caminho); continue; }
      if (!conta.has(caminho)) conta.set(caminho, 0);
      if (v !== null && v !== undefined) {
        conta.set(caminho, conta.get(caminho) + 1);
        if (!exemplo.has(caminho)) exemplo.set(caminho, Array.isArray(v) ? `[${v.length} itens]` : v);
      }
    }
  };
  for (const m of modelos) anda(m, '');
  return { conta, exemplo };
}

function barra(n, total, largura = 20) {
  const cheio = total ? Math.round((n / total) * largura) : 0;
  return '█'.repeat(cheio) + '·'.repeat(largura - cheio);
}

async function main() {
  if (!process.env.AA_API_KEY) {
    console.error('Erro: defina AA_API_KEY.');
    process.exit(1);
  }

  console.log('═'.repeat(78));
  console.log(' SONDA — Artificial Analysis API v2');
  console.log('═'.repeat(78));

  // ── 1. Endpoint free, todas as páginas ──
  const modelos = [];
  let pagina = 1, totalPaginas = 1, envelope = null;

  while (pagina <= totalPaginas && pagina <= 10) {
    const r = await chamar(`/language/models/free?page=${pagina}`);
    if (!r.ok) {
      console.error(`\n✗ /language/models/free?page=${pagina} → HTTP ${r.status}`);
      console.error(JSON.stringify(r.corpo, null, 2).slice(0, 800));
      process.exit(1);
    }
    if (pagina === 1) {
      envelope = r;
      console.log(`\n── Envelope ──`);
      console.log(`  tier (corpo)          : ${r.corpo.tier}`);
      console.log(`  tier (header X-AA-Tier): ${r.quota.tier}`);
      console.log(`  intelligence_index_ver : ${r.corpo.intelligence_index_version}`);
      console.log(`  chaves de topo         : ${Object.keys(r.corpo).join(', ')}`);
      console.log(`  paginação              : ${JSON.stringify(r.corpo.pagination)}`);
      console.log(`  quota                  : ${r.quota.restante}/${r.quota.limite} restantes hoje`);
      totalPaginas = r.corpo.pagination?.total_pages ?? 1;
    }
    modelos.push(...(r.corpo.data || []));
    pagina++;
  }

  console.log(`\n── Cobertura ──`);
  console.log(`  modelos recebidos (free) : ${modelos.length} em ${totalPaginas} página(s)`);

  // Comparação com o que o endpoint legado entrega hoje.
  try {
    const atual = JSON.parse(await readFile(join(ROOT, 'assets', 'benchmarks.json'), 'utf8'));
    console.log(`  modelos no legado hoje   : ${atual.models_total} (fetch de ${String(atual.fetched_at).slice(0, 10)})`);
    const delta = modelos.length - atual.models_total;
    console.log(`  diferença                : ${delta >= 0 ? '+' : ''}${delta}`);
  } catch { console.log('  (benchmarks.json não lido)'); }

  // ── 2. Inventário completo de campos ──
  const { conta, exemplo } = inventariar(modelos);
  const total = modelos.length;
  const caminhos = [...conta.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  console.log(`\n── Inventário de campos (${caminhos.length} campos; preenchimento em ${total} modelos) ──`);
  for (const [caminho, n] of caminhos) {
    const pct = total ? ((n / total) * 100).toFixed(0) : '0';
    let ex = exemplo.get(caminho);
    if (typeof ex === 'string' && ex.length > 34) ex = ex.slice(0, 34) + '…';
    console.log(`  ${caminho.padEnd(52)} ${barra(n, total)} ${String(pct).padStart(3)}%  ${ex ?? ''}`);
  }

  // ── 3. As chaves de benchmark que o guia usa hoje ──
  const evalKeys = new Set();
  for (const m of modelos) for (const k of Object.keys(m.evaluations || {})) evalKeys.add(k);

  console.log(`\n── Chaves de benchmark do guia (hoje) × free ──`);
  for (const k of CHAVES_ATUAIS) {
    const tem = evalKeys.has(k);
    const n = tem ? modelos.filter(m => m.evaluations?.[k] != null).length : 0;
    console.log(`  ${tem ? '✓' : '✗'} ${k.padEnd(42)} ${tem ? `${n} modelos` : 'AUSENTE no free'}`);
  }
  console.log(`\n  evaluations disponíveis no free: ${[...evalKeys].join(', ') || '(nenhuma)'}`);

  // ── 4. Campos disponíveis que o pipeline NÃO usa hoje ──
  const JA_USADOS = new Set([
    'name', 'model_creator.name', 'release_date',
    'pricing.price_1m_blended_3_to_1', 'pricing.price_1m_input_tokens', 'pricing.price_1m_output_tokens',
    'performance.median_output_tokens_per_second',
    'evaluations.artificial_analysis_intelligence_index', 'evaluations.artificial_analysis_coding_index',
  ]);
  console.log(`\n── Campos do free que o pipeline NÃO usa (candidatos) ──`);
  for (const [caminho, n] of caminhos) {
    if (JA_USADOS.has(caminho) || n === 0) continue;
    const pct = ((n / total) * 100).toFixed(0);
    if (Number(pct) < 20) continue;   // ruído: campo quase sempre vazio
    console.log(`  ${caminho.padEnd(52)} ${String(pct).padStart(3)}% preenchido   ex.: ${exemplo.get(caminho)}`);
  }

  // ── 5. Amostra: top 12 por Intelligence Index, com o que o guia mostraria ──
  const ii = modelos
    .filter(m => m.evaluations?.artificial_analysis_intelligence_index != null)
    .sort((a, b) => b.evaluations.artificial_analysis_intelligence_index - a.evaluations.artificial_analysis_intelligence_index)
    .slice(0, 12);
  console.log(`\n── Amostra: top 12 por Intelligence Index ──`);
  console.log(`  ${'modelo'.padEnd(30)} ${'criador'.padEnd(16)} ${'II'.padStart(6)} ${'cod'.padStart(6)} ${'agt'.padStart(6)} ${'$in'.padStart(7)} ${'$out'.padStart(7)} ${'tok/s'.padStart(7)} ${'TTFT'.padStart(6)}`);
  for (const m of ii) {
    const e = m.evaluations || {}, p = m.pricing || {}, f = m.performance || {};
    const num = (v, c = 1) => (v == null ? '—' : Number(v).toFixed(c));
    console.log(`  ${String(m.name).slice(0, 30).padEnd(30)} ${String(m.model_creator?.name ?? '—').slice(0, 16).padEnd(16)} ` +
      `${num(e.artificial_analysis_intelligence_index).padStart(6)} ${num(e.artificial_analysis_coding_index).padStart(6)} ` +
      `${num(e.artificial_analysis_agentic_index).padStart(6)} ${num(p.price_1m_input_tokens, 2).padStart(7)} ` +
      `${num(p.price_1m_output_tokens, 2).padStart(7)} ${num(f.median_output_tokens_per_second, 0).padStart(7)} ` +
      `${num(f.median_time_to_first_token_seconds, 2).padStart(6)}`);
  }

  // ── 6. Saúde dos campos que as guardas do pipeline checam ──
  const comCriador = modelos.filter(m => m.model_creator?.name).length;
  const comPreco = modelos.filter(m => m.pricing?.price_1m_input_tokens != null || m.pricing?.price_1m_output_tokens != null).length;
  const comBlended = modelos.filter(m => m.pricing?.price_1m_blended_3_to_1 != null).length;
  const comVeloc = modelos.filter(m => m.performance?.median_output_tokens_per_second != null).length;
  const comData = modelos.filter(m => m.release_date).length;
  const comOW = modelos.filter(m => m.licensing?.is_open_weights != null).length;
  console.log(`\n── Saúde dos campos que o guia consome ──`);
  const linha = (rot, n) => console.log(`  ${rot.padEnd(30)} ${String(n).padStart(4)}/${total}  ${barra(n, total)}`);
  linha('criador', comCriador); linha('preço input/output', comPreco);
  linha('preço blended (Pro)', comBlended); linha('velocidade tok/s', comVeloc);
  linha('release_date', comData); linha('open weights (Pro)', comOW);

  // ── 7. Confirmação do tier: a rota Pro deve devolver 403 ──
  console.log(`\n── Rota Pro (/language/models) ──`);
  const pro = await chamar('/language/models?page=1');
  if (pro.ok) {
    const n = (pro.corpo.data || []).length;
    const ek = new Set();
    for (const m of pro.corpo.data || []) for (const k of Object.keys(m.evaluations || {})) ek.add(k);
    console.log(`  ✓ HTTP 200 — A CHAVE TEM PRO. tier=${pro.corpo.tier}, ${n} modelos nesta página.`);
    console.log(`  evaluations do Pro: ${[...ek].join(', ')}`);
  } else {
    console.log(`  ✗ HTTP ${pro.status} — sem acesso Pro (esperado).`);
    console.log(`  corpo: ${JSON.stringify(pro.corpo)?.slice(0, 300)}`);
  }

  console.log(`\n${'═'.repeat(78)}`);
  console.log(` Requisições gastas nesta execução: ${gastas} · quota restante: ${pro.quota.restante ?? '?'}/${pro.quota.limite ?? '?'}`);
  console.log('═'.repeat(78));
}

main().catch(err => { console.error(err); process.exit(1); });
