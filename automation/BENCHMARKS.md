# Sistema de benchmarks — Artificial Analysis → guia "Qual modelo usar" + régua ampliada

Subsistema **independente** do pipeline de lançamentos (aquele está em
[automation/README.md](README.md) e [ARQUITETURA.md](../ARQUITETURA.md)). Aqui um
cron busca os benchmarks da **Artificial Analysis**, grava `assets/benchmarks.json`,
e a página `guia.html` (**"Qual modelo usar"**) transforma isso em rankings
interativos por tipo de tarefa.

> **Duas saídas, uma chamada.** Desde ago/2026 a mesma execução grava também
> `assets/catalogo.json` — o censo de **todos** os modelos com data de estreia, que
> alimenta a **régua ampliada** do `index.html`. Não é uma segunda coleta: são dados que
> já vinham na mesma resposta e eram descartados pelo corte do top-20. Ver §2.3.

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
          1. GET /api/v2/language/models       → 403 numa chave free
             GET /api/v2/language/models/free  → 3 páginas de 200  (x-api-key: AA_API_KEY)
          2. normaliza empresa (assets/data.js), colapsa variantes de esforço,
             corta top-20 por FAMÍLIA de modelo, normaliza escala dos scores
          3. GUARDAS de sanidade  ── falhou? aborta e mantém o arquivo anterior
          4. escreve assets/benchmarks.json   (top-20 por índice → guia)
          5. escreve assets/catalogo.json     (TODAS as famílias + data → régua ampliada)
     └─ git commit + push  (só se algum dos dois mudou)
  → GitHub Pages republica
guia.html + assets/guia.js
     └─ fetch('assets/benchmarks.json', {cache:'no-store'})  → página interativa
index.html + assets/app.js   (só quando o usuário liga a "Régua ampliada")
     └─ fetch('assets/catalogo.json')  → pílulas compactas na timeline
```

O LLM **não participa** deste pipeline — é só API → arquivo → site. A "política"
(categorias, piso de qualidade, ordenações) mora no **navegador** (`assets/guia.js`),
não no pipeline: ajustá-la não exige chave de API nem nova coleta.

---

## 2. A API da Artificial Analysis (contrato **v2**, ago/2026)

O endpoint legado `/api/v2/data/llms/models` foi desligado em **4/nov/2026**.
Migramos em 5/ago/2026 para o contrato documentado, que tem **duas rotas por tier**:

| Rota | Tier | O que devolve |
|---|---|---|
| `/api/v2/language/models/free` | qualquer chave | só os **3 índices compostos** |
| `/api/v2/language/models` | Pro+ (US$ 417/mês) | os benchmarks individuais também |

Nossa chave é **free**. O pipeline tenta o Pro primeiro e cai para o free no `403`,
escolhendo a tabela de benchmarks pelo campo `tier` da resposta — se a assinatura
mudar, os benchmarks individuais voltam **sem tocar no código**.

Resposta: `{ tier, intelligence_index_version, pagination, data: [ …modelos… ] }`.
**Paginado**: `page_size` 200, ~591 modelos em 3 páginas — o free devolve o catálogo
inteiro, a restrição é de *campos*, não de modelos.

Cada modelo (campos que usamos):

| Dado | Caminho no JSON (contrato v2) | Observação |
|---|---|---|
| Nome | `name` | ex.: `GPT-5.6 Sol (max)` — o sufixo `(…)` é a variante de esforço |
| Empresa | `model_creator.name` | objeto `{id,name,country}` |
| Preço | `pricing.price_1m_blended_3_to_1` | **Pro-only** — no free calculamos `(3·input + output)/4` |
| Velocidade | `performance.median_output_tokens_per_second` | agora **aninhado em `performance`** |
| Data | `release_date` | ISO |
| Pesos abertos | `licensing.is_open_weights` | **Pro-only** — no free o selo fica oculto |
| Scores | `evaluations.<key>` | percentuais em fração 0–1; índices compostos em 0–100 |

**Chaves consumidas no free** (`BENCHMARKS_FREE`): `artificial_analysis_intelligence_index`,
`artificial_analysis_coding_index`, `artificial_analysis_agentic_index`.

**Chaves adicionais no Pro** (`BENCHMARKS_PRO`): `gpqa_diamond`, `hle`, `scicode`,
`terminalbench_v2_1`, `tau2_telecom`, `ifbench`, `aa_lcr`, `critpt`. Note os
**renomes** em relação ao legado: `gpqa`→`gpqa_diamond`, `lcr`→`aa_lcr`,
`tau2`→`tau2_telecom`. E `mmlu_pro`, `aime_25` e `livecodebench` foram
**aposentados pela AA** — não existem em nenhum tier.

O preço não degrada no free: o blend 3:1 é reproduzível por aritmética, conferido
contra o arquivo em produção (Opus 5 5/25 → 10,00; GPT-5.6 Sol 5/30 → 11,25).

**Limite de requisições: 100/dia no free** (500 no Pro), resetando 00:00 UTC. Uma coleta
custa 3 (uma por página) + 1 da tentativa Pro que dá 403 = **4**. Sobra folga enorme para
o cron semanal, mas convém lembrar antes de criar qualquer job que chame a API em laço.
Toda resposta traz `X-RateLimit-Limit`, `X-RateLimit-Remaining` e `X-AA-Tier`.

### 2.1 Os seis índices da AA — e os três que não temos

A AA publica **seis** índices compostos para modelos de linguagem. O free serve metade:

| Índice | Free? | O que mede |
|---|---|---|
| `artificial_analysis_intelligence_index` | ✅ | capacidade geral (composite de 9 avaliações) |
| `artificial_analysis_coding_index` | ✅ | código (subconjunto das mesmas avaliações) |
| `artificial_analysis_agentic_index` | ✅ | uso autônomo de ferramentas e terminal |
| `artificial_analysis_multilingual_index` | ❌ Pro | desempenho fora do inglês |
| `aa_omniscience_index` | ❌ Pro | conhecimento e **taxa de não-alucinação** |
| `artificial_analysis_openness_index` | ❌ Pro | abertura de pesos/licença |

> Os dois primeiros bloqueados são os mais relevantes para este site, e por motivos que
> não têm a ver com o guia atual: **multilingual** importa para um público que trabalha em
> português, e **omniscience** traz `aa_omniscience_non_hallucination_rate` — alucinação é
> provavelmente a métrica que mais pesa em uso acadêmico. Se o desconto acadêmico sair,
> considerar esses dois **antes** de repor as categorias que saíram.

Cuidado ao ler a doc da AA aqui: ela descreve o corpo do free como *"composite Artificial
Analysis indices"*, o que sugere os seis. São três. Confirmado por **quatro ângulos
independentes** (sonda de 5/ago/2026), porque "campo não apareceu no inventário" sozinho
não distingue *ausente* de *presente-porém-nulo*:

| Teste | Resultado |
|---|---|
| `Object.keys(evaluations)` em 200 modelos — pega chave declarada com valor `null` | só os 3; os outros **nem declarados** |
| **Spec OpenAPI** (`GET /api/v2/openapi`, YAML, pública e sem chave) | schema do free declara **3**; o do Pro declara **21** |
| `?fields=` / `?include=` / `?expand=` | HTTP 200, sem efeito — continuam 3 |
| `/language/models/{slug}` (detalhe) | `403 "Model detail requires a Pro subscription"` |

A spec é a prova mais forte: o cabeçalho dela diz *"Generated by pnpm generate-openapi from
the Zod contract"* — é o contrato de código, não documentação escrita à mão. **`GET /api/v2/openapi`
não pede chave**, então dá para reconferir o schema de qualquer tier a custo zero, sem gastar quota.

**Os 21 `evaluations` do Pro**, para referência caso a assinatura mude — além dos 3 índices:
`gpqa_diamond`, `hle`, `critpt`, `scicode`, `aa_lcr`, `ifbench`, `terminalbench_v2_1`,
`terminalbench_hard`, `tau2_telecom`, `tau_banking`, `aa_omniscience_index`,
`aa_omniscience_accuracy`, `aa_omniscience_non_hallucination_rate`, `gdpval_aa_elo`,
`gdpval_aa_normalized`, `mmmu_pro`, `artificial_analysis_openness_index`,
`artificial_analysis_multilingual_index`. O `BENCHMARKS_PRO` do pipeline usa 8 deles —
`gdpval_*` (tarefas de trabalho real), `tau_banking` e `mmmu_pro` (multimodal) ficaram
de fora e merecem avaliação se o Pro chegar.

### 2.2 Campos do free que ainda não usamos

Levantados pela sonda de ago/2026 (percentual = quantos dos 591 modelos têm o campo
preenchido). Nenhum exige Pro; são oportunidades paradas:

| Campo | Preenchido | Para que serviria |
|---|---|---|
| `slug` | **100%** | link direto para a ficha do modelo em artificialanalysis.ai |
| `performance.median_time_to_first_token_seconds` | 51% | latência — a outra metade da "velocidade", hoje só tok/s |
| `performance.median_end_to_end_response_time_seconds` | 51% | tempo total de espera, o número que o usuário sente |
| `artificial_analysis_intelligence_index_cost.cost_per_task.total_cost` | 23% | **custo real por tarefa** — captura o modelo de token barato que queima raciocínio, coisa que $/1M esconde |
| `..._index_cost.total_cost` | 23% | custo de rodar o Intelligence Index inteiro |
| `pricing.price_1m_cache_hit_tokens` | 35% | custo com cache de prompt |

O `cost_per_task` é o mais promissor: viraria um quarto modo de ordenação, ao lado de
"mais capaz / custo-benefício / mais rápido", respondendo "quanto custa de verdade usar
este modelo" melhor que preço por token.

O `benchmarks.json` guarda tudo em **0–100** (`is_fraction` controla só o sufixo `%` na
exibição). Como o schema v2 devolve os percentuais em fração, `normalizeScore()` converte
`0–1 → 0–100` (com guard `<= 1` para não multiplicar de novo se a AA voltar ao 0–100).

### 2.3 `assets/catalogo.json` — o censo que alimenta a régua ampliada

O guia precisa dos **melhores** de cada índice; a régua ampliada precisa de **todos**, com
a data em que apareceram. As duas coisas saem da mesma resposta, então `construirCatalogo()`
roda no mesmo `main()` e grava um segundo arquivo:

```json
{
  "source": "Artificial Analysis Data API v2",
  "fetched_at": "2026-08-05T14:15:08.273Z",
  "familias_total": 420,
  "descartados": { "entradas_sem_data": 31, "anteriores_ao_marco": 12 },
  "modelos": [
    { "mod": "Qwen3.6 Plus", "emp": "Alibaba", "date": "2026-05-12", "score": 39.6, "open_weights": null }
  ]
}
```

Três decisões que valem registro:

- **Uma família = uma pílula.** A AA lista cada nível de esforço como modelo próprio
  (`GPT-5.6 Sol (max)`, `(high)`…). Três pílulas idênticas no mesmo dia não informam nada,
  então `splitVariant()` colapsa por família — a mesma função que o `benchmarks.json` já usa.
- **Data de estreia, não a da melhor variante.** Colapsando, guardamos a **menor** data
  entre as variantes: é o dia em que aquele modelo passou a existir, que é o que uma linha
  do tempo mede.
- **Corte no marco zero.** Modelo anterior a 30/nov/2022 é descartado (`anteriores_ao_marco`):
  a régua começa ali, e um `dias` negativo seria desenhado por cima da calha de rótulos.

**Guarda própria, mais frouxa que a do `benchmarks.json`.** Se o catálogo sair com menos de
100 famílias, o arquivo **não é reescrito** (`::warning::`) e o resto do run segue normal —
a régua ampliada continua no ar com o catálogo da semana anterior, que é muito melhor do que
ficar sem nenhum.

**Aviso de país.** Empresa do catálogo que não está em `CREATOR_COUNTRY` (`assets/data.js`)
vira `::warning::` no log e cai em "Outros" de OUTROS PAÍSES na régua. O pipeline **não
chuta** a sede: errar o país de um laboratório numa régua acadêmica é o tipo de erro que
passa despercebido justamente por parecer plausível. O aviso é o gatilho para pesquisar e
cadastrar à mão.

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
| **Paginação aberta** | última página ainda com `has_more: true` | catálogo parcial |
| **Sem velocidade** | **nenhuma** linha com `tok_per_sec > 0` | `performance.*` mudou de lugar |

As duas últimas nasceram da migração de ago/2026 (§6), e existem porque falhariam
**em silêncio**: sem seguir a paginação publicaríamos 200 dos 591 modelos — número
alto o bastante para passar pela guarda de volume, e o ranking sairia plausível e
incompleto. Sem velocidade, o ordenador "mais rápido" viraria uma lista aleatória,
porque o guia trata ausência como zero.

Um benchmark isolado vazio **não** aborta (grava com aviso; o guia mostra a
categoria como "sem dados nesta rodada").

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

### 6.1 Desligamento do endpoint legado (5/ago/2026)

**Aviso:** a AA deu 3 meses para sair de `/api/v2/data/*` (desliga em 4/nov/2026).
Diferente de §6, aqui não houve quebra — foi migração planejada.

**O que quase passou batido.** A troca de rota é o menor dos problemas. Duas mudanças
do contrato v2 falhariam **em silêncio**, sem disparar nenhuma guarda existente:

1. **Paginação.** O legado devolvia 591 modelos numa tacada; o v2 pagina de 200 em 200.
   Ler só a primeira página publicaria um terço do catálogo — e 200 passa folgado pela
   guarda de `< 50`. O ranking sairia plausível e errado.
2. **`performance.*` aninhado.** `median_output_tokens_per_second` saiu da raiz. Todo
   `tok_per_sec` viraria 0, e como o guia trata ausência como zero, o ordenador
   "mais rápido" viraria lista aleatória sem nenhum sinal de erro.

Ambas ganharam guarda (§3). Também mudaram: `licensing.is_open_weights` aninhado e
Pro-only, e os renomes `gpqa`→`gpqa_diamond`, `lcr`→`aa_lcr`, `tau2`→`tau2_telecom`.

**Descoberta útil.** O blend 3:1 é Pro-only mas **reproduzível**: `(3·input + output)/4`,
conferido contra o arquivo em produção. O free não degrada o preço.

**Fonte externa avaliada e descartada.** O Epoch AI publica benchmarks de raciocínio em
CSV sob **CC BY** (`https://epoch.ai/data/benchmark_data.zip`, sem chave, sem rate limit).
O cruzamento com a AA funciona: normalizando os dois lados para a família do modelo
(remove o sufixo de esforço — `_max`/`-xhigh` — e reduz a `[a-z0-9]`, porque o Epoch
escreve `gpt-5.6-sol` e a AA `gpt-5-6-sol`), a cobertura do nosso top-20 fica em
CritPt 18/20, SciCode 18/20, ECI 17/20, GPQA 15/20 — todos frescos. **Mas o HLE não**:
2/20, parado em abr/2026. Como o GPQA não serve por saturação e redundância (§7), a
integração não se pagava — uma segunda fonte, com metodologia diferente, camada de alias
para manter e atribuição CC BY obrigatória, para uma categoria que ordenaria por ruído.
Se o cenário mudar, o caminho está medido e é viável.

**Método.** Duas sondas descartáveis (`probe-aa-api.mjs`, `probe-epoch-join.mjs`) rodadas
por `workflow_dispatch` antes de escrever qualquer código de produção — a chave vive no
secret do Actions, então o diagnóstico tinha que rodar lá. Elas mediram o tier real, a
cobertura por campo e a viabilidade de uma fonte externa, e foram removidas depois.
Custo: ~10 das 100 requisições/dia do tier free. Lição: **medir antes de migrar** — a
suposição de que o free entregaria menos *modelos* estava errada (entrega os mesmos 591);
o que ele corta são *campos*.

---

## 7. Front-end — `guia.html` + `assets/guia.js` + `assets/guia.css`

Página **interativa** (reformulada em jul/2026). Tudo é renderizado por `guia.js` a partir
do `benchmarks.json`; a régua (planilha) é complementar (linka nomes e mostra cobertura).

**Categorias (abas).** 3 categorias, cada uma = UMA pergunta respondida por UM benchmark
**principal** (definidas em `CATEGORIES`), mais benchmarks de **apoio** (só contexto, no
"como medimos" e na linha "outros testes"). Não há categoria de matemática de propósito —
os testes disponíveis estão saturados (>99%) e não separam os modelos.

| Categoria | Principal | Apoio (só com chave Pro) |
|---|---|---|
| Capacidade geral | `artificial_analysis_intelligence_index` | `gpqa_diamond`, `hle` |
| Programação | `artificial_analysis_coding_index` | `scicode` |
| Agentes e automação | `artificial_analysis_agentic_index` | `terminalbench_v2_1`, `tau2_telecom` |

Os apoios ficam listados mesmo sem existirem no tier free: `benchByKey` devolve
`undefined`, o filtro os descarta e o bloco "outros testes" some. Assim eles
**voltam sozinhos** se a chave virar Pro.

> **De 5 para 3 categorias (5/ago/2026).** Com o fim do endpoint legado, os benchmarks
> individuais viraram Pro-only e duas categorias perderam a base:
>
> - **Pesquisa e raciocínio** (era `hle`). O substituto gratuito seria o GPQA Diamond,
>   mas ele **correlaciona 0,95** com o Intelligence Index sobre 399 modelos — seria uma
>   segunda aba repetindo a ordem da primeira. E está **saturado**: spread de 3,0 pontos
>   no top-15 contra erro-padrão de 1,59, ou seja, as posições do topo são ruído.
>   O HLE era justamente o mais independente (rho 0,84, spread 24,8) e **não tem fonte
>   gratuita**: o leaderboard do Scale parou em abr/2026 (o `hle_external.csv` do Epoch AI
>   é um espelho dele, com 2/20 de cobertura do nosso top-20), e os agregadores que cobrem
>   a fronteira publicam número **auto-reportado** pelos fabricantes — 64,7% onde a AA,
>   medindo por conta própria, apura 53,3%.
> - **Instruções e dados** (era `ifbench` + `lcr`). Sem equivalente no free.
>
> A ausência virou conteúdo: o campo `note` da categoria Capacidade geral diz ao leitor
> que, para trabalho de pesquisa, **o mesmo ranking vale** — não há lista separada a
> consultar. Melhor que uma aba ordenando modelos por ruído. **Atenção ao argumento:**
> a versão original dessa nota citava a correlação de 0,95 com o GPQA como se fosse
> evidência externa. Era circular — o GPQA é 6% do próprio índice. A nota atual usa o
> motivo verdadeiro: o bloco de raciocínio científico **já pesa 24% da nota**.
>
> **Agentes** trocou `terminalbench_v2_1` pelo `artificial_analysis_agentic_index`: o
> composto da própria AA para a mesma pergunta, com cobertura maior (138 famílias contra
> 143 do benchmark único, mas sem depender de um teste só).

> **Apoios estagnados foram removidos (24/jul/2026).** MMLU-Pro, LiveCodeBench e AIME 2025
> não avaliaram os modelos atuais do topo (casavam 0/20 com o ranking principal) e só
> geravam "—" na linha "outros testes". Uso geral trocou MMLU-Pro por **GPQA** (casa 20/20).
> Em runtime, `renderPanel` ainda **oculta apoios que casam < 5/20** do principal — rede
> contra envelhecimento futuro da fonte (se a AA parar de avaliar um teste, ele some sozinho).

> **⚠️ Composição real dos três índices — leia antes de mexer em categoria.**
> Pela [metodologia da AA](https://artificialanalysis.ai/methodology/intelligence-benchmarking),
> o `artificial_analysis_intelligence_index` **v4.1** é a média ponderada de quatro blocos:
>
> | Bloco | Peso | Componentes |
> |---|---|---|
> | Agentes | 34% | GDPval-AA v2 (20%), τ³-Banking (14%) |
> | Código | 24% | Terminal-Bench v2.1 (16%), SciCode (8%) |
> | Raciocínio científico | 24% | HLE (12%), GPQA Diamond (6%), CritPt (6%) |
> | Geral | 18% | AA-Omniscience (12%), AA-LCR (6%) |
>
> E os outros dois índices do tier free **são dois desses blocos**: `coding_index` = bloco
> Código, `agentic_index` = bloco Agentes. Ou seja, **58% da nota da primeira aba é o
> conteúdo das outras duas**. Consequências:
>
> - **Peso zero em conversa, escrita e resumo.** Por isso a primeira aba deixou de se
>   chamar "Uso geral" com a pergunta "conversar, escrever, resumir, tirar dúvidas do dia
>   a dia" — prometia exatamente o que o índice não mede. Virou **"Capacidade geral"**,
>   com o campo `caveat` dizendo o que ficou de fora. **Não volte a descrevê-la como "o
>   modelo do dia a dia".**
> - **As três abas ordenam quase igual** (rho medido no `benchmarks.json` de 5/ago/2026:
>   geral×código 0,96 com 20/20 de sobreposição no top-20; geral×agentes 0,96 com 18/20;
>   código×agentes 0,94). O mesmo critério que matou "Pesquisa e raciocínio" (rho 0,95 =
>   "aba repetindo a ordem da primeira") vale aqui. As abas ficam porque respondem
>   perguntas diferentes e as **magnitudes** diferem — não porque sejam independentes.
>   Isso está **declarado no site**, via `overlapLine()`, com o número calculado em runtime
>   (`spearman()`): se a AA mudar a composição, o texto acompanha em vez de envelhecer.
> - Um apoio que é ingrediente do primário (ex.: GPQA na Capacidade geral) **não é
>   enganoso**: o "como medimos" diz que o apoio "não entra na posição do ranking".
>   Mas **não use essa correlação como argumento** — ver a nota sobre circularidade acima.
>
> Se um dia quiser categorias mais independentes, os únicos benchmarks **fora** do
> Intelligence Index são: IFBench, TAU-bench, MMLU-Pro (estagnado), LiveCodeBench
> (estagnado) e AIME (saturado). **A AA não avalia front-end** — declarado no `caveat`
> da categoria Programação.

**Ordenação (os "filtros").** Uma lista única por categoria, reordenável. Os três botões
(`Mais capaz` / `Custo-benefício` / `Mais rápido`) formam um **controle segmentado** com
contorno, a ativa preenchida na cor de destaque — mesmo idioma visual das abas de categoria.
- **Mais capaz** (padrão) — pontuação da categoria.
- **Custo-benefício** — pontuação por dólar (não o mais barato). Como a lista já é o top-20
  dos mais capazes, o barato ruim nunca lidera (`FLOOR = 0.88` documenta o piso de qualidade).
- **Mais rápido** — tokens por segundo.

A barra de cada linha reflete o critério ativo; ao reordenar, mostra-se "Nº em capacidade".

**"Como medimos" + "outros testes".** Botão por categoria que abre, nesta ordem:
`o número` (que índice é, escala) → `composição` (**os pesos**, via `cat.composition`) →
`não mede` (`cat.caveat`, a ressalva) → `sobreposição` (`overlapLine()`, o rho medido) →
`apoio` (só com chave Pro) → `nota` (`cat.note`) → rodapé com quem mede, cobertura na
régua e **link para a metodologia da AA** (`AA_METHOD_URL`).

Os pesos moram em `cat.composition` no `guia.js`, **não** no `description` do
`benchmarks.json` — o JSON só traz a lista de siglas, e é o peso que muda a leitura da nota.
Se a AA publicar um v4.2 com pesos novos, é aqui que se mexe.

Um segundo botão, **"ver outros testes desta categoria"**, revela uma linha por modelo com a
nota dele em cada benchmark de apoio + uma **barrinha** relativa ao líder daquele apoio (cor
da empresa). Sem nota, a linha é **omitida** (não mostra "—"). O painel ganha a classe
`is-show-extras` para alternar. **Com a chave free esse botão não aparece em nenhuma aba** —
todos os apoios são Pro-only e o filtro os descarta. É esperado.

**Busca + comparação.** Campo de busca com sugestões; até `MAX_COMPARE = 4` modelos num
acordeão `<details>` ("Quer comparar modelos?") que abre sozinho ao adicionar o 1º. A tabela
mostra pontuação **e posição de cada modelo em todas as categorias**, mais preço e velocidade.

**Quem vence (24/jul/2026).** Em cada linha (categoria, preço, velocidade) a célula do modelo
que **vence entre os comparados** ganha destaque (fundo accent-soft + negrito) — não só o
`#1` global (`is-lead` virou secundário). O cabeçalho de cada modelo mostra o **placar**
("N vitórias") e uma **coroa ★** para quem vence em mais categorias. **Preço = menor vence;
velocidade = maior vence.** O placar conta só as categorias de capacidade (preço/velocidade
só ganham destaque na própria linha). `bestScoreAmong()` decide o vencedor por nota (empate
de nota = vitória para ambos); `wins`/`maxWins` montam o placar e a coroa.

**Campo `full` do `benchmarks.json` (24/jul/2026).** Além do `top` (top-20, campos ricos:
preço/velocidade/variante), cada benchmark traz um `full` = **todas as famílias avaliadas**,
em campos mínimos (`model`, `creator`, `score`; posto implícito pela posição). Sem custo
extra de API — a chamada única já devolve todos os modelos; antes o `slice(TOP_N)` descartava
o resto. `buildModelIndex`/`rankMap` usam `full` (fallback `top`) para a comparação e os
"outros testes": assim um modelo aparece com nota e posto em todas as categorias onde foi
avaliado, **mesmo fora do top-20** (ex.: GLM 5.1 fora dos 20 em código ainda mostra a nota
dele lá). `"—"` na tabela = o modelo não foi avaliado naquele teste.

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
| Pesos/composição de um índice (v4.2 etc.) | `composition` da categoria em `assets/guia.js` |
| Ressalva do "não mede" / link da metodologia | `caveat` da categoria / `AA_METHOD_URL` em `assets/guia.js` |
| Piso de qualidade / máx. comparação | `FLOOR`, `MAX_COMPARE` em `assets/guia.js` |
| Ligar nome AA → nome da régua | `MODEL_ALIASES` em `assets/data.js` |
| Empresa nova sem cor/logo | `BENCH_ONLY_COLORS` / `COMPANY_ALIASES` / `LOGO_MAP` em `assets/data.js` |

---

## 9. Changelog

### 2026-08-05 — `catalogo.json`: o censo da régua ampliada
Segunda saída do mesmo pipeline, sem nenhuma chamada extra de API. O corte do top-20
jogava fora 400 famílias que já tinham chegado na resposta; agora elas viram
`assets/catalogo.json` (nome, empresa canônica, **data de estreia**, score, pesos abertos) e
alimentam o modo "Régua ampliada" do `index.html`. (§2.3)

- `construirCatalogo()` colapsa variantes de esforço por família e guarda a **menor** data
  entre elas (estreia), descartando o que não tem data ou é anterior ao marco zero.
- Guarda própria: < 100 famílias → não reescreve o arquivo, mantém o anterior, e o
  `benchmarks.json` publica normalmente.
- `::warning::` para empresa sem país em `CREATOR_COUNTRY` — o pipeline nunca chuta a sede.
- O workflow passou a commitar os **dois** arquivos juntos (saem da mesma resposta; separá-los
  os deixaria dessincronizados).

### 2026-08-05 — honestidade do "Uso geral" + referência da fonte
Revisão de conteúdo depois do corte de 5→3 categorias. O gatilho foi a pergunta "'uso geral'
é o melhor termo pra isso?" — não era, e a auditoria achou mais coisa junto.

- **"Uso geral" → "Capacidade geral".** A pergunta de apoio dizia *"conversar, escrever,
  resumir, tirar dúvidas do dia a dia"*, e **nenhum dos nove testes do Intelligence Index
  mede isso** (Agentes 34% · Código 24% · Raciocínio científico 24% · Geral 18%). Agora:
  *"Raciocínio, conhecimento e tarefas difíceis — o teto de capacidade do modelo"*, com um
  bloco `não mede` explícito. (§7)
- **Pesos no "como medimos".** Novo campo `composition` por categoria: o que compõe o índice
  e **quanto cada parte pesa**. Antes o site despejava o `description` cru do JSON — nove
  siglas, nenhum peso, nada explicado. (§7)
- **Sobreposição declarada.** `spearman()` + `topOverlap()` + `overlapLine()` calculam **em
  runtime** o quanto as três abas repetem a mesma ordem e mostram o número no "como
  medimos" (geral×código 0,96, 20/20 no top-20; geral×agentes 0,96, 18/20; código×agentes
  0,94). O site passa a dizer que Programação e Agentes **são blocos** do índice geral
  (24% e 34% — 58% somados), em vez de sugerir que são medidas independentes. (§7)
- **Nota circular corrigida.** A categoria geral justificava a ausência de uma aba de
  pesquisa citando a correlação de 0,95 com o GPQA — que é **6% do próprio índice**.
  Trocado pelo motivo real: o bloco de raciocínio científico já pesa 24% da nota. (§7)
- **Referência da fonte.** Link para a metodologia da AA no rodapé de todo "como medimos"
  (`AA_METHOD_URL`) e no bloco "Como ler estes números", que agora também diz que **a AA
  roda os testes por conta própria** — o diferencial contra número auto-reportado pelo
  fabricante estava só nesta documentação, nunca no site. (§7)
- **Ressalva de front-end.** `caveat` da categoria Programação declara que a AA não avalia
  front-end. Antes isso também só existia aqui. (§7)
- **Textos órfãos do corte 5→3 limpos** no `guia.html`: o bloco "Como ler estes números"
  citava um botão *"ver outros testes"* que não renderiza mais (todo apoio é Pro-only),
  dizia "às vezes um índice composto" (são os três, sempre) e omitia o motivo da saída de
  *Pesquisa* e *Instruções*; a `meta description` ainda vendia as categorias mortas.
- `?v=` → 24.

### 2026-07-24 — schema v2 + refactor interativo
- **Pipeline:** corrigido para o **schema v2** da Artificial Analysis (criador em
  `model_creator.name`, preço em `pricing.*`, velocidade em `median_output_tokens_per_second`,
  scores percentuais em fração 0–1). Adicionadas **guardas de criador/preço** e o modo
  **`DRY_RUN`**. Restaurado o `benchmarks.json` bom durante o conserto; cron reativado. (§6)
- **Front-end (`guia`):** página "Qual modelo usar" virou **interativa** — categorias como
  **abas**, mais capaz / custo-benefício / mais rápido como **ordenações** de uma lista única,
  **busca + comparação** de até 4 modelos entre categorias, e **"como medimos"** por categoria.
  Introduzido `idKey()` (identidade de benchmark ≠ link da régua). `?v=` → 19.

### 2026-07-24 — UX: comunicação, comparação e dados completos
- **Pipeline:** adicionado o campo **`full`** por benchmark (todas as famílias, campos
  mínimos) para lookup — a comparação e os "outros testes" passam a mostrar nota/posto de
  um modelo mesmo fora do top-20. Sem custo extra de API. (§7)
- **Apoios curateados:** removidos MMLU-Pro, LiveCodeBench e AIME 2025 (estagnados, 0/20 de
  casamento); Uso geral trocou MMLU-Pro por **GPQA**. Filtro de runtime oculta apoios < 5/20
  (rede contra envelhecimento futuro). (§7)
- **"Outros testes":** cada apoio agora tem **barrinha** (relativa ao líder, cor da empresa)
  + nota; sem nota, **omite** em vez de "—". (§7)
- **Controles segmentados:** abas de categoria e "Ordenar por" viraram pills com contorno,
  ativas preenchidas na cor de destaque. Rótulo **"Selecione um uso"** acima das abas. (§7)
- **Comparação "quem vence":** destaque por linha do modelo que vence **entre os comparados**
  (não só `#1` global) + placar "N vitórias" + coroa **★**. Preço = menor; velocidade = maior. (§7)
- **Verificação de categorias:** confirmados os 5 primários como tematicamente corretos;
  documentado o nuance de que o Intelligence Index v4.1 é composite e inclui GPQA/HLE/SciCode/
  Terminal-Bench/LCR. **A AA não tem benchmark de front-end** — não há como adicionar um de
  programação pelo pipeline. (§7)
- `?v=` → 22.
