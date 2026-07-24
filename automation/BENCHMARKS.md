# Sistema de benchmarks — Artificial Analysis → guia "Qual modelo usar"

Subsistema **independente** do pipeline de lançamentos (aquele está em
[automation/README.md](README.md) e [ARQUITETURA.md](../ARQUITETURA.md)). Aqui um
cron busca os benchmarks da **Artificial Analysis**, grava `assets/benchmarks.json`,
e a página `guia.html` (**"Qual modelo usar"**) transforma isso em rankings
interativos por tipo de tarefa.

> ⚠️ **Diferença crucial:** este pipeline **auto-publica em produção sem trava
> humana** — diferente do de lançamentos, que passa pela aba `Pendentes`. Quem
> escreve `benchmarks.json` escreve direto no site. Por isso as **guardas de
> sanidade** (abaixo) são a rede de segurança.

---

## 1. Fluxo em uma figura

```
GitHub Actions  (cron: segunda 09:00 UTC / 06:00 BRT — ou disparo manual)
  .github/workflows/update-benchmarks.yml
     └─ node automation/update-benchmarks.mjs
          1. GET https://artificialanalysis.ai/api/v2/data/llms/models  (x-api-key: AA_API_KEY)
          2. normaliza empresa (assets/data.js), colapsa variantes de esforço,
             corta top-20 por FAMÍLIA de modelo, normaliza escala dos scores
          3. GUARDAS de sanidade  ── falhou? aborta e mantém o arquivo anterior
          4. escreve assets/benchmarks.json
     └─ git commit + push  (só se o arquivo mudou)
  → GitHub Pages republica
guia.html + assets/guia.js
     └─ fetch('assets/benchmarks.json', {cache:'no-store'})  → página interativa
```

O LLM **não participa** deste pipeline — é só API → arquivo → site. A "política"
(categorias, piso de qualidade, ordenações) mora no **navegador** (`assets/guia.js`),
não no pipeline: ajustá-la não exige chave de API nem nova coleta.

---

## 2. A API da Artificial Analysis (schema **v2**, jul/2026)

Endpoint: `GET /api/v2/data/llms/models`, header `x-api-key: <AA_API_KEY>`.
Resposta: `{ status, prompt_options, data: [ …modelos… ] }` (~580 modelos).

Cada modelo (campos que usamos):

| Dado | Caminho no JSON (schema v2) | Observação |
|---|---|---|
| Nome | `name` | ex.: `GPT-5.6 Sol (max)` — o sufixo `(…)` é a variante de esforço |
| Empresa | `model_creator.name` | **objeto** `{id,name,slug}` (era string no schema antigo) |
| Preço | `pricing.price_1m_blended_3_to_1` | US$/1M tokens, blend 3:1 in/out (aninhado em `pricing`) |
| Velocidade | `median_output_tokens_per_second` | tokens/s |
| Data | `release_date` | ISO |
| Scores | `evaluations.<key>` | **percentuais vêm em fração 0–1**; índices (Intelligence/Coding) em 0–100 |

**Chaves de benchmark** consumidas (em `evaluations`): `artificial_analysis_intelligence_index`,
`artificial_analysis_coding_index`, `gpqa`, `hle`, `mmlu_pro`, `scicode`, `livecodebench`,
`aime_25`, `terminalbench_v2_1`, `tau2`, `ifbench`, `lcr`. A definição completa (rótulo,
categoria, descrição, `is_fraction`) está no array `BENCHMARKS` de `update-benchmarks.mjs`.

O `benchmarks.json` guarda tudo em **0–100** (`is_fraction` controla só o sufixo `%` na
exibição). Como o schema v2 devolve os percentuais em fração, `normalizeScore()` converte
`0–1 → 0–100` (com guard `<= 1` para não multiplicar de novo se a AA voltar ao 0–100).

---

## 3. As guardas de sanidade (por que existem)

Sem elas, uma resposta ruim da API sobrescreve em silêncio um arquivo bom e o site
publica lixo. Todas rodam **antes** de escrever o arquivo; qualquer falha → `process.exit(1)`,
o arquivo anterior continua no ar.

| Guarda | Aborta quando | Motivo |
|---|---|---|
| Poucos modelos | `< 50` modelos na resposta | API degradada / rota errada |
| Metade vazia | `> 50%` dos benchmarks sem nenhum modelo | chave global renomeada |
| **Sem criador** | maioria das linhas com `creator = "Desconhecido"` | schema do criador mudou |
| **Sem preço** | **nenhuma** linha com preço | schema de pricing mudou |

As duas últimas foram adicionadas depois do incidente de jul/2026 (§6): um benchmark
isolado vazio **não** aborta (grava com aviso; o guia mostra a categoria como
"sem dados nesta rodada").

---

## 4. Como testar uma mudança de schema com segurança (DRY_RUN)

`update-benchmarks.mjs` aceita `DRY_RUN=true`: **valida e imprime o resumo, sem escrever**
o arquivo. O resumo mostra criador/preço/velocidade/score do #1 de cada benchmark — dá
para ver na hora se algum campo voltou vazio.

Como a `AA_API_KEY` só existe nos secrets do GitHub, o teste roda por `workflow_dispatch`.
Padrão que usamos: um workflow temporário só de dispatch que roda o script em dry-run:

```yaml
# .github/workflows/debug-schema.yml (temporário — remover após validar)
name: DEBUG schema AA
on: { workflow_dispatch: {} }
jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - env: { AA_API_KEY: '${{ secrets.AA_API_KEY }}', DRY_RUN: 'true' }
        run: node automation/update-benchmarks.mjs
```

```bash
gh workflow run debug-schema.yml -R lapig-ufg/app-panorama-global-da-ia-generativa
# … ler o log do resumo:
RID=$(gh run list --workflow=debug-schema.yml -L1 --json databaseId -q '.[0].databaseId')
gh run view "$RID" --log | grep -E "#1|Modelos:"
```

Se o resumo estiver bom, dispare o real (`update-benchmarks.yml`, sem `DRY_RUN`) —
ele escreve e commita os dados frescos. **Remova o workflow de debug depois.**

Para inspecionar o schema **cru** da API (quando um campo some), o mesmo padrão serve com
um script que imprime `Object.keys(model)` e o 1º modelo em JSON.

---

## 5. Deploy

A pasta local **não é** o repositório git. Publica-se pelo clone
`panorama-llms-github/` (remote `lapig-ufg/app-panorama-global-da-ia-generativa`, push via
`gh` como VictorGit10). Edite na fonte local, **copie para o clone**, commit + push:

```bash
cp assets/guia.js assets/guia.css guia.html panorama-llms-github/assets/  # (guia.html na raiz do clone)
cp automation/update-benchmarks.mjs panorama-llms-github/automation/
cd panorama-llms-github && git add -A && git commit -m "…" && git push origin main
```

Ao mexer no front-end (`guia.*`), **suba o `?v=`** de `guia.css` e `guia.js` no
`guia.html` (cache-bust). O `benchmarks.json` não precisa de `?v=` — o guia o busca com
`cache:'no-store'`.

---

## 6. Incidente de referência — schema v2 (24/jul/2026)

**Sintoma:** a AA migrou para o schema v2 entre coletas. Nomes de modelo e scores
continuaram vindo, mas **criador, preço e velocidade viraram lixo** (`creator="Desconhecido"`,
`price=null`, `tok_per_sec=0`) porque os campos foram renomeados/aninhados. As guardas de
então só checavam ranking vazio — como os scores estavam lá, **o arquivo quebrado foi
publicado** e degradou a página (sem logos, sem preços, sem cards de custo-benefício/velocidade).

**Correção:** mapear o schema v2 (§2), normalizar a escala dos scores, e adicionar as
guardas de criador/preço (§3). Validado por DRY_RUN (§4) antes de publicar os dados frescos.
O cron ficou pausado durante o conserto e foi reativado depois. Lição: **este pipeline
auto-publica** — toda mudança de schema da AA precisa passar por DRY_RUN antes de ir ao ar.

---

## 7. Front-end — `guia.html` + `assets/guia.js` + `assets/guia.css`

Página **interativa** (reformulada em jul/2026). Tudo é renderizado por `guia.js` a partir
do `benchmarks.json`; a régua (planilha) é complementar (linka nomes e mostra cobertura).

**Categorias (abas).** 5 categorias, cada uma = UMA pergunta respondida por UM benchmark
**principal** (definidas em `CATEGORIES`), mais benchmarks de **apoio** (só contexto). Não há
categoria de matemática de propósito — os testes disponíveis estão saturados (>99%) e não
separam os modelos.

| Categoria | Principal | Apoio |
|---|---|---|
| Uso geral | `artificial_analysis_intelligence_index` | `mmlu_pro` |
| Programação | `artificial_analysis_coding_index` | `scicode`, `livecodebench` |
| Agentes e automação | `terminalbench_v2_1` | `tau2` |
| Pesquisa e raciocínio | `hle` | `gpqa`, `aime_25` |
| Instruções e dados | `ifbench` | `lcr` |

**Ordenação (os "filtros").** Uma lista única por categoria, reordenável:
- **Mais capaz** (padrão) — pontuação da categoria.
- **Custo-benefício** — pontuação por dólar (não o mais barato). Como a lista já é o top-20
  dos mais capazes, o barato ruim nunca lidera (`FLOOR = 0.88` documenta o piso de qualidade).
- **Mais rápido** — tokens por segundo.

A barra de cada linha reflete o critério ativo; ao reordenar, mostra-se "Nº em capacidade".

**"Como medimos".** Botão por categoria que abre a **composição** (principal + apoio, com o
que cada teste mede + cobertura na régua). Atende ao pedido de explicar como a categoria é
formada.

**Busca + comparação.** Campo de busca com sugestões; até `MAX_COMPARE = 4` modelos numa
bandeja compacta que mostra pontuação **e posição de cada modelo em todas as categorias**,
mais preço e velocidade. `"—"` = fora do top daquela categoria; `#1` = líder (destacado).

**Identidade vs. link da régua (cuidado!).** A comparação usa `idKey()` — nome normalizado
**sem** `MODEL_ALIASES`. O link da régua usa `normModel()` — **com** aliases. Motivo: os
aliases colapsam famílias como `GPT-5.6 Sol/Terra/Luna` numa linha só da régua (correto para
o **link**), mas para **benchmark** elas são modelos distintos e comparáveis entre si. Usar
`normModel` como identidade marcaria as três ao selecionar uma. Não volte a unificar as duas.

**Degradação graciosa.** Régua fora do ar → o guia renderiza igual, sem links/cobertura.
Categoria sem dados → aparece como "sem dados nesta rodada" (não some). Aberto por
`file://` → aviso pedindo servidor HTTP (CORS bloqueia o `fetch` local).

---

## 8. Ajustes finos (onde mexer)

| Quero… | Onde |
|---|---|
| Trocar/incluir benchmark | `BENCHMARKS` em `automation/update-benchmarks.mjs` (chave = campo em `evaluations`) |
| Nº de famílias por ranking | `TOP_N` (padrão 20) no mesmo arquivo |
| Recategorizar / mudar principal-apoio | `CATEGORIES` em `assets/guia.js` |
| Piso de qualidade / máx. comparação | `FLOOR`, `MAX_COMPARE` em `assets/guia.js` |
| Ligar nome AA → nome da régua | `MODEL_ALIASES` em `assets/data.js` |
| Empresa nova sem cor/logo | `BENCH_ONLY_COLORS` / `COMPANY_ALIASES` / `LOGO_MAP` em `assets/data.js` |

---

## 9. Changelog

### 2026-07-24
- **Pipeline:** corrigido para o **schema v2** da Artificial Analysis (criador em
  `model_creator.name`, preço em `pricing.*`, velocidade em `median_output_tokens_per_second`,
  scores percentuais em fração 0–1). Adicionadas **guardas de criador/preço** e o modo
  **`DRY_RUN`**. Restaurado o `benchmarks.json` bom durante o conserto; cron reativado. (§6)
- **Front-end (`guia`):** página "Qual modelo usar" virou **interativa** — categorias como
  **abas**, mais capaz / custo-benefício / mais rápido como **ordenações** de uma lista única,
  **busca + comparação** de até 4 modelos entre categorias, e **"como medimos"** por categoria.
  Introduzido `idKey()` (identidade de benchmark ≠ link da régua). `?v=` → 19.
