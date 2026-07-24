/* Debug temporário: imprime o schema da API da Artificial Analysis para
   descobrir os nomes atuais dos campos (criador, preço, velocidade).
   NÃO escreve nem commita nada. Remover depois de corrigir o mapeamento. */

const API_URL = 'https://artificialanalysis.ai/api/v2/data/llms/models';

const apiKey = process.env.AA_API_KEY;
if (!apiKey) { console.error('Sem AA_API_KEY'); process.exit(1); }

const res = await fetch(API_URL, { headers: { 'x-api-key': apiKey } });
if (!res.ok) { console.error(`HTTP ${res.status}`); process.exit(1); }

const payload = await res.json();
const models = Array.isArray(payload) ? payload : (payload.models || payload.data || []);

console.log('=== TOP-LEVEL KEYS DO PAYLOAD ===');
console.log(Array.isArray(payload) ? '(array direto)' : JSON.stringify(Object.keys(payload)));
console.log('total de modelos:', models.length);

const m0 = models[0] || {};
console.log('\n=== KEYS DO 1º MODELO ===');
console.log(JSON.stringify(Object.keys(m0), null, 0));

// Marca quais valores são objetos/arrays (campos aninhados) e mostra as sub-chaves.
console.log('\n=== CAMPOS ANINHADOS (objeto/array) NO 1º MODELO ===');
for (const [k, v] of Object.entries(m0)) {
  if (v && typeof v === 'object') {
    const sub = Array.isArray(v) ? `[array len=${v.length}]` : JSON.stringify(Object.keys(v));
    console.log(`  ${k} -> ${sub}`);
  }
}

// Procura chaves que "parecem" criador / preço / velocidade, em qualquer nível.
console.log('\n=== CHAVES CANDIDATAS (creator/price/speed) ===');
const wanted = /creat|organiz|provider|develop|maker|company|lab|price|cost|usd|token|tok|throughput|speed|per_sec/i;
function walk(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (wanted.test(k)) {
      const preview = (v && typeof v === 'object') ? '{…}' : JSON.stringify(v);
      console.log(`  ${p} = ${preview}`);
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, p);
  }
}
walk(m0);

console.log('\n=== 1º MODELO COMPLETO (JSON) ===');
console.log(JSON.stringify(m0, null, 2).slice(0, 6000));
