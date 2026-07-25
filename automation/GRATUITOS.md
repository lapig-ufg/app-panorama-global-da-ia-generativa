# IAs Gratuitas — fonte de dados e coleta

A página `gratuitos.html` é um catálogo client-side de ferramentas de IA com
plano gratuito. Os dados vivem em `assets/gratuitos-data.js` (JS, não JSON)
e são renderizados por `assets/gratuitos.js`.

## Fonte

**The AI Rankings — Best Free AI Tools**
URL: https://theairankings.com/best-free-ai-tools/

Por que esta fonte: é atualizada ~mensalmente e cobre, num só lugar,
chatbots, imagens, vídeo, música, código, pesquisa, escrita e
transcrição — cada um com cota, limite, "best for", plano pago e "the catch".

Limitação: **não há API/JSON público**. A única fonte é a página HTML
renderizada, então qualquer automação é **scraping** — frágil por natureza.
Se mudarem o HTML, o parser quebra. Os guardas em `update-gratuitos.mjs`
abortam em vez de publicar lixo, igual ao `update-benchmarks.mjs`.

## Estado atual (24/Jul/2026)

- **Coleta: manual.** Revisamos a página da fonte e transcrevemos as
  cotas/limites para `gratuitos-data.js`.
- **Schema: v2, scrape-friendly.** O objeto `GRATUITOS_DATA` já tem
  proveniência (`source`) e campos mapeados 1:1 da fonte por item
  (`freeModel`, `paidStepUp`, `theCatch`, `rank`, `sourceUrl`), pensados
  para que um scraper regenere o arquivo sem retrabalho de modelagem.
- **Stub de automação:** `automation/update-gratuitos.mjs` faz o fetch,
  valida guardas e escreve em `DRY_RUN`. Falta o parser real
  (`parsePage()`, marcado com `TODO(scraping)`). **Não há workflow ativo.**

## Mapeamento de campos (fonte → nosso item)

| The AI Rankings        | `gratuitos-data.js` |
|-----------------------|---------------------|
| Rank (1–11)            | `rank`              |
| Tool name              | `name`              |
| Free model             | `freeModel`         |
| Free-tier limit        | `freeQuota` (pt-BR) |
| Best free for          | `bestFor` (pt-BR)   |
| Paid step-up           | `paidStepUp`        |
| The catch              | `theCatch` (pt-BR)  |
| (seção da categoria)   | `category` (via `CATEGORY_MAP`) |

Campos **nossos** (não vindos da fonte) — preservados por merge por `id`
quando o item já existe: `company`, `badge`, `highlight`, `howToAccess`,
`link`, `tags`. São curadoria nossa (tradução, acesso, marca).

## Categorias

`todos`, `assistentes-dev`, `modelos-llm`, `apis-inferencia`,
`pesquisa-busca`, `imagem-design`, `midia-av` (Vídeo, Voz & Música).

`CATEGORY_MAP` no scraper mapeia as seções da fonte para estes ids.

## Como atualizar (hoje, manual)

1. Abra https://theairankings.com/best-free-ai-tools/ e confira mudanças.
2. Em `assets/gratuitos-data.js`, atualize `source.lastChecked`,
   `updatedAt` e `updatedText`.
3. Edite os `items` (cotas, limites, modelos). Adicione entradas novas
   seguindo o mesmo schema. Bump `?v=` em `gratuitos.html` se mudar
   cache relevante (já v2 nesta revisão).

## Roadmap de coleta automatizada

1. **Implementar `parsePage(html)`** em `update-gratuitos.mjs`.
   - Sem dependências (igual ao `update-benchmarks.mjs`): regex sobre
     o HTML cru, ou avaliar se vale adicionar `cheerio`.
   - Tabela de chatbots: rank, nome, modelo free, limite, "best for".
   - Seções por categoria: título → `CATEGORY_MAP`; pick + alternativas.
2. **Testar com `DRY_RUN=true`** via workflow_dispatch antes de
   habilitar o cron (mesmo ritual usado p/ o schema v2 da AA).
3. **Criar `.github/workflows/update-gratuitos.yml`** espelhando
   `update-benchmarks.yml`: cron semanal (ex.: `0 9 * * 1`),
   `workflow_dispatch` com `dry_run`, commit/push só de
   `assets/gratuitos-data.js` se houver mudança. **Só ativar depois
   que o parser estiver validado** — publicação em prod sem trava,
   igual ao pipeline de benchmarks.
4. **Revisar guardas:** ajustar o limite mínimo de itens (`< 8`) e
   quaisquer checagens de schema conforme a fonte evoluir.

## Riscos e mitigação

- **Scraping frágil:** mudança de HTML quebra o parser → guarda aborta
  e mantém o catálogo anterior no ar (não publica vazio).
- **Licenciamento:** a fonte é editorial. Transcrevemos **fatos**
  (cotas, limites, preços) e traduzimos/reescrevemos; **não** copiamos
  prosa verbatim. Atribuição visível fica na página (`qm-source`).
- **Cadência:** a fonte atualiza ~mensalmente; cron semanal é
  suficiente e evita rodar à toa.