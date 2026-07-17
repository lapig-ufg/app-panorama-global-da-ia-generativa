#!/usr/bin/env node
/**
 * publish.mjs — Passo 3 do pipeline.
 * Lê automation/_work/candidates.json, valida contra automation/schema.json
 * (validação leve, sem deps), dedup, gera o snippet de data.js para empresas
 * novas, e faz POST ao Apps Script (ou só imprime, se DRY_RUN).
 * Sem dependências externas (Node 20+, fetch nativo).
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK = join(__dirname, '_work');

const DRY_RUN = String(process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
const CONF_MIN = Number(process.env.CONF_MIN || 0.55);
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || '';

// ── lista canônica de empresas (p/ detectar empresa nova) ──
function loadDataJs(fields) {
  const src = readFileSync(join(ROOT, 'assets', 'data.js'), 'utf8');
  const ctx = { Date, console };
  vm.createContext(ctx);
  vm.runInContext(`${src}\n;globalThis.__X = { ${fields.join(', ')} };`, ctx, { filename: 'data.js' });
  return ctx.__X;
}
const { COMPANY_COLORS } = loadDataJs(['COMPANY_COLORS']);
const known = new Set(Object.keys(COMPANY_COLORS).map(k => k.toUpperCase()));

// Usamos process.exitCode (não process.exit) para deixar o event loop drenar
// as conexões do fetch — evita um assert de teardown do libuv no Windows.
main().then(code => { process.exitCode = code; });

async function main() {
// ── lê candidatos ──
const candPath = join(WORK, 'candidates.json');
if (!existsSync(candPath)) {
  console.log('[publish] candidates.json não encontrado — nada a publicar.');
  return 0;
}
let parsed;
try {
  parsed = JSON.parse(readFileSync(candPath, 'utf8'));
} catch (e) {
  console.error('[publish] candidates.json inválido:', e.message);
  return 1;
}
const all = Array.isArray(parsed?.candidatos) ? parsed.candidatos : [];

// ── dedup (chaves geradas pelo prepare.mjs) ──
let dedupKeys = new Set();
const dedupPath = join(WORK, 'dedup.json');
if (existsSync(dedupPath)) {
  try { dedupKeys = new Set(JSON.parse(readFileSync(dedupPath, 'utf8')).keys || []); } catch { /* ignore */ }
}

// ── validação leve + filtragem ──
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const descartes = [];
const valid = [];
for (const [i, c] of all.entries()) {
  const tag = `#${i} (${c?.empresa || '?'} / ${c?.modelo || '?'})`;
  if (!c || typeof c !== 'object') { descartes.push(`${tag}: não é objeto`); continue; }
  if (!ISO.test(c.data || '')) { descartes.push(`${tag}: data inválida "${c.data}"`); continue; }
  if (!c.empresa || !c.modelo) { descartes.push(`${tag}: empresa/modelo vazio`); continue; }
  if (!/^https?:\/\//.test(c.referencia || '')) { descartes.push(`${tag}: referência sem URL`); continue; }
  const conf = Number(c.confianca);
  if (Number.isNaN(conf) || conf < CONF_MIN) { descartes.push(`${tag}: confiança ${c.confianca} < ${CONF_MIN}`); continue; }
  const key = `${c.data}|${String(c.empresa).trim().toUpperCase()}|${String(c.modelo).trim().toUpperCase()}`;
  if (dedupKeys.has(key)) { descartes.push(`${tag}: já cadastrado (dedup)`); continue; }
  dedupKeys.add(key);
  valid.push(c);
}

const novas = valid.filter(c => !known.has(String(c.empresa).trim().toUpperCase()));

// ── snippet de data.js para empresas novas (logo via Simple Icons) ──
function slugify(name) {
  return String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}
async function simpleIconsPath(name) {
  const slug = slugify(name);
  const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${slug}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const svg = await res.text();
    const m = svg.match(/<path\s+d="([^"]+)"/);
    return m ? m[1] : null;
  } catch { return null; }
}
async function buildSnippet(c) {
  const key = slugify(c.empresa).replace(/^./, ch => ch.toUpperCase()) || 'NovaEmpresa';
  const path = await simpleIconsPath(c.empresa);
  const grupo = c.grupo_sugerido || 'OUTROS PAÍSES';
  const empUpper = String(c.empresa).trim().toUpperCase();
  return [
    `// ── ${c.empresa} (${c.pais || 'país?'}) — adicionar em assets/data.js ──`,
    `// 1) LOGO_PATHS:`,
    path
      ? `  ${key}: '<path d="${path}"/>',`
      : `  ${key}: '<path d="..."/>', // logo não encontrado no Simple Icons — desenhar/escolher`,
    `// 2) LOGO_MAP:`,
    `  '${c.empresa}': '${key}',`,
    `// 3) COMPANY_COLORS:`,
    `  '${c.empresa}': '#888888', // <- definir a cor da marca`,
    `// 4) LAYOUT_GROUPS → grupo "${grupo}", adicionar a régua (track):`,
    `  { name: '${c.empresa}', filter: r => r.emp && r.emp.trim().toUpperCase() === '${empUpper}' },`,
    `// 5) Lembrar de subir o ?v= em index.html (cache-bust).`,
  ].join('\n');
}

const snippets = [];
for (const c of novas) snippets.push({ empresa: c.empresa, snippet: await buildSnippet(c) });

// ── resumo legível (sempre impresso) ──
console.log('\n════════ RESUMO ════════');
console.log(`Candidatos recebidos: ${all.length} | válidos/novos: ${valid.length} | descartados: ${descartes.length}`);
if (valid.length) {
  console.log('\nVÁLIDOS:');
  for (const c of valid) console.log(`  • ${c.data} · ${c.empresa} · ${c.modelo}  (conf ${c.confianca})${known.has(String(c.empresa).trim().toUpperCase()) ? '' : '  [EMPRESA NOVA]'}\n      ${c.referencia}`);
}
if (descartes.length) {
  console.log('\nDESCARTADOS:');
  for (const d of descartes) console.log(`  • ${d}`);
}
if (snippets.length) {
  console.log('\nSNIPPETS (empresa nova):');
  for (const s of snippets) console.log(`\n${s.snippet}`);
}

// ── payload p/ o Apps Script ──
const payload = {
  token: APPS_SCRIPT_TOKEN,
  generatedAt: new Date().toISOString(),
  rows: valid.map(c => ({
    data: c.data, empresa: c.empresa, modelo: c.modelo, impacto: c.impacto,
    referencia: c.referencia, tipo: c.tipo || 'modelo', origem: 'auto',
    empresa_nova: !known.has(String(c.empresa).trim().toUpperCase()),
    confianca: c.confianca, relevancia_justificativa: c.relevancia_justificativa || '',
    grupo: c.grupo_sugerido || '', pais: c.pais || '',
  })),
  novas: snippets,
};

if (!valid.length) {
  console.log('\n[publish] nada novo válido — não vou escrever na planilha.');
  return 0;
}
if (DRY_RUN) {
  console.log('\n[publish] DRY_RUN ativo — NÃO enviei nada ao Apps Script. Payload acima.');
  return 0;
}
if (!APPS_SCRIPT_URL || !APPS_SCRIPT_TOKEN) {
  console.error('[publish] APPS_SCRIPT_URL/TOKEN ausentes — não posso publicar.');
  return 1;
}
try {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  console.log(`[publish] Apps Script respondeu ${res.status}: ${txt}`);
  return res.ok ? 0 : 1;
} catch (e) {
  console.error('[publish] falha no POST ao Apps Script:', e.message);
  return 1;
}
} // fim de main()
