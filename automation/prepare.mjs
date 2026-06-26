#!/usr/bin/env node
/**
 * prepare.mjs — Passo 1 do pipeline.
 * Lê a lista canônica de empresas + SHEET_ID de assets/data.js e a planilha
 * pública (gviz), e monta automation/_work/prompt.md para o Claude pesquisar.
 * Sem dependências externas (Node 20+, fetch nativo).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK = join(__dirname, '_work');
mkdirSync(WORK, { recursive: true });

const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS || 21);

// ── 1. Carrega config de assets/data.js (consts não exportadas → captura via vm) ──
function loadDataJs(fields) {
  const src = readFileSync(join(ROOT, 'assets', 'data.js'), 'utf8');
  const ctx = { Date, console };
  vm.createContext(ctx);
  vm.runInContext(`${src}\n;globalThis.__X = { ${fields.join(', ')} };`, ctx, { filename: 'data.js' });
  return ctx.__X;
}
const { COMPANY_COLORS, LOGO_MAP, CONFIG } = loadDataJs(['COMPANY_COLORS', 'LOGO_MAP', 'CONFIG']);
const companies = [...new Set([...Object.keys(COMPANY_COLORS), ...Object.keys(LOGO_MAP)])].sort();

// ── 2. Lê a planilha via gviz, espelhando o parse de assets/app.js ──
function parseSheetDate(val) { // espelha app.js:54
  if (!val) return '';
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const p = val.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
    if (p) return `${p[1]}-${String(+p[2] + 1).padStart(2, '0')}-${String(p[3]).padStart(2, '0')}`;
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return String(val);
}

async function fetchTab(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
  const rows = (json.table?.rows || []).slice(1); // pula header
  const out = [];
  for (const row of rows) {
    const c = row.c;
    if (!c || !c[0] || !c[1] || !c[2]) continue;
    const date = parseSheetDate(c[0].v);
    const emp = c[1] ? String(c[1].v || '') : '';
    const mod = c[2] ? String(c[2].v || '') : '';
    if (!date || !emp || !mod) continue;
    out.push({ date, emp, mod });
  }
  return out;
}

const tabs = [...(CONFIG.SHEET_TABS || ['Lancamentos']), 'Pendentes'];
const existing = [];
for (const tab of tabs) {
  try {
    const rows = await fetchTab(tab);
    existing.push(...rows);
    console.log(`[prepare] aba "${tab}": ${rows.length} linhas`);
  } catch (e) {
    console.error(`[prepare] aviso: não li a aba "${tab}" (${e.message}) — seguindo`);
  }
}
const dedup = new Set(existing.map(r => `${r.date}|${r.emp.trim().toUpperCase()}|${r.mod.trim().toUpperCase()}`));

// ── 3. Monta a janela e o prompt ──
const iso = d => d.toISOString().slice(0, 10);
const today = new Date();
const since = new Date(today.getTime() - LOOKBACK_DAYS * 86400000);

const policy = readFileSync(join(__dirname, 'policy.md'), 'utf8');
const existingList = existing
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map(r => `- ${r.date} · ${r.emp} · ${r.mod}`)
  .join('\n');

const prompt = `${policy}

---

## Janela de datas (lançamentos ANUNCIADOS neste intervalo)
De **${iso(since)}** até **${iso(today)}** (inclusive). Foque em anúncios oficiais nesse período.

## Empresas conhecidas (use a grafia EXATA; fora desta lista → empresa_nova)
${companies.map(c => `- ${c}`).join('\n')}

## Já cadastrados (NÃO repetir — dedup por data + empresa + modelo)
${existingList || '- (nenhum)'}

## Lembrete final
Escreva apenas \`automation/_work/candidates.json\`. Se não houver nada relevante e novo, escreva \`{ "candidatos": [] }\`.
`;

writeFileSync(join(WORK, 'prompt.md'), prompt, 'utf8');
writeFileSync(
  join(WORK, 'dedup.json'),
  JSON.stringify({ keys: [...dedup], window: { since: iso(since), until: iso(today) } }, null, 2),
  'utf8'
);

console.log(`[prepare] empresas conhecidas: ${companies.length} | já cadastrados: ${existing.length} | janela ${iso(since)}..${iso(today)}`);
console.log(`[prepare] escrito: automation/_work/prompt.md e dedup.json`);
