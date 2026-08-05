/* ═══════════════════════════════════════════════════════════════
   Sonda 3 — os outros 3 índices da AA são MESMO só Pro?

   A afirmação anterior ("só 3 índices no free") veio de um inventário
   que contava campos preenchidos. Isso deixa uma dúvida legítima: um
   campo que existe mas vem `null` em todos os modelos apareceria como
   ausente? E existe alguma outra forma de pedi-lo?

   Aqui a pergunta é atacada de quatro ângulos independentes:
     1. Object.keys() no evaluations — pega chave presente-com-null
     2. A spec OpenAPI oficial — o que ela DECLARA para o corpo do free
     3. Parâmetros de expansão de campo (?fields=, ?include=)
     4. A rota de detalhe por slug

   ~4 requisições. Limite free: 100/dia.
   ═══════════════════════════════════════════════════════════════ */

const BASE = 'https://artificialanalysis.ai/api/v2';
const ALVOS = [
  'artificial_analysis_multilingual_index',
  'aa_omniscience_index',
  'aa_omniscience_accuracy',
  'aa_omniscience_non_hallucination_rate',
  'artificial_analysis_openness_index',
];

let gastas = 0;
async function chamar(caminho) {
  gastas++;
  const res = await fetch(`${BASE}${caminho}`, { headers: { 'x-api-key': process.env.AA_API_KEY } });
  let corpo = null;
  try { corpo = await res.json(); } catch { /* não-JSON */ }
  return { ok: res.ok, status: res.status, corpo, quota: res.headers.get('x-ratelimit-remaining') };
}

async function main() {
  if (!process.env.AA_API_KEY) { console.error('Erro: defina AA_API_KEY.'); process.exit(1); }
  console.log('═'.repeat(74));
  console.log(' SONDA 3 — os outros índices vêm no free?');
  console.log('═'.repeat(74));

  // ── Ângulo 1: chaves presentes, INCLUSIVE as que vêm null ──
  const r1 = await chamar('/language/models/free?page=1');
  if (!r1.ok) { console.error(`HTTP ${r1.status}`); process.exit(1); }
  const modelos = r1.corpo.data || [];

  const chaves = new Map();   // chave → quantos modelos a DECLARAM
  const naoNulo = new Map();  // chave → quantos com valor não-nulo
  for (const m of modelos) {
    for (const [k, v] of Object.entries(m.evaluations || {})) {
      chaves.set(k, (chaves.get(k) ?? 0) + 1);
      if (v !== null && v !== undefined) naoNulo.set(k, (naoNulo.get(k) ?? 0) + 1);
    }
  }
  console.log(`\n1) evaluations declarados em ${modelos.length} modelos (Object.keys, pega null):`);
  for (const [k, n] of [...chaves].sort()) {
    console.log(`   ${k.padEnd(46)} declarado em ${String(n).padStart(3)} · com valor ${String(naoNulo.get(k) ?? 0).padStart(3)}`);
  }
  console.log('\n   Procurando os índices ausentes:');
  for (const a of ALVOS) {
    console.log(`   ${chaves.has(a) ? '✓ PRESENTE' : '✗ ausente '} ${a}`);
  }

  // ── Ângulo 2: a spec OpenAPI oficial ──
  const r2 = await chamar('/openapi');
  if (r2.ok && r2.corpo) {
    const spec = JSON.stringify(r2.corpo);
    const rota = r2.corpo?.paths?.['/language/models/free']?.get;
    const schema = JSON.stringify(rota?.responses?.['200'] ?? {});
    console.log('\n2) Spec OpenAPI — o que o schema do /language/models/free DECLARA:');
    const declara = ALVOS.filter(a => schema.includes(a));
    const noSpecGeral = ALVOS.filter(a => spec.includes(a));
    console.log(`   no schema da resposta free : ${declara.length ? declara.join(', ') : 'NENHUM dos três'}`);
    console.log(`   citados na spec inteira    : ${noSpecGeral.join(', ') || '—'}`);
    const evs = schema.match(/artificial_analysis_[a-z_]*index|aa_[a-z_]*index/g);
    console.log(`   índices no schema do free  : ${[...new Set(evs || [])].join(', ') || '—'}`);
  } else {
    console.log(`\n2) Spec OpenAPI: HTTP ${r2.status} — indisponível`);
  }

  // ── Ângulo 3: parâmetros de expansão de campo ──
  console.log('\n3) Tentando pedir os campos explicitamente:');
  for (const q of ['fields=evaluations', 'include=all', 'expand=evaluations']) {
    const r = await chamar(`/language/models/free?page=1&${q}`);
    const m0 = (r.corpo?.data || [])[0];
    const n = m0 ? Object.keys(m0.evaluations || {}).length : 0;
    const ganhou = m0 ? ALVOS.filter(a => a in (m0.evaluations || {})) : [];
    console.log(`   ?${q.padEnd(22)} → HTTP ${r.status} · ${n} evaluations · ${ganhou.length ? 'GANHOU ' + ganhou.join(',') : 'sem mudança'}`);
  }

  // ── Ângulo 4: rota de detalhe por slug ──
  const slug = modelos[0]?.slug;
  const r4 = await chamar(`/language/models/${slug}`);
  console.log(`\n4) Rota de detalhe /language/models/${slug} → HTTP ${r4.status}`);
  if (!r4.ok) console.log(`   ${JSON.stringify(r4.corpo)?.slice(0, 160)}`);
  else console.log(`   evaluations: ${Object.keys(r4.corpo?.data?.evaluations || {}).join(', ')}`);

  console.log(`\n${'═'.repeat(74)}`);
  console.log(` Requisições: ${gastas} · quota restante: ${r4.quota ?? '?'}`);
  console.log('═'.repeat(74));
}

main().catch(e => { console.error(e); process.exit(1); });
