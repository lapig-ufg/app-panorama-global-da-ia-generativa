# Como tudo funciona hoje — Panorama Global da IA Generativa

Documento de arquitetura e operação do sistema completo: o site, a planilha (banco de
dados), a automação semanal de pesquisa, o Apps Script e a PWA de curadoria.
Última atualização: **02/jul/2026**.

> **Identidades** (importante p/ não se perder):
> - Conta Google (planilha + Apps Script + clasp): **victoramaral.lapig@gmail.com**
> - Conta GitHub (repo + secrets): **VictorGit10** (admin no repo)
> - E-mail de notificação da automação: **victor.amaral@ufg.br**

---

## 0. O problema e a filosofia do sistema

Uma linha do tempo de lançamentos de IA tem um inimigo natural: ela desatualiza toda
semana. O ritmo do setor é intenso o bastante para que manter a régua em dia manualmente
exigisse alguém monitorando blogs de dezenas de laboratórios, imprensa especializada e
leaderboards — toda semana, indefinidamente.

A solução óbvia é automatizar. Mas automatizar **com um LLM** cria um segundo problema,
mais traiçoeiro que o primeiro: modelos de linguagem alucinam. Um agente que pesquisa a
web pode voltar convencido de que um laboratório "lançou" algo com base num rumor de
fórum, num artigo especulativo ou numa confusão de datas. Para um site acadêmico,
publicar um lançamento inexistente é pior do que publicar com uma semana de atraso.

O sistema inteiro nasce dessa tensão: como usar um LLM para ganhar velocidade sem
herdar sua falibilidade? A resposta tem três partes, e vale a pena guardá-la antes de
entrar nos detalhes de cada componente:

1. **O LLM faz apenas o que só ele sabe fazer** — ler a web e julgar relevância.
2. **Tudo que pode ser código determinístico, é código determinístico** — datas, URLs,
   deduplicação, limiares de confiança, escrita na planilha.
3. **Nada vai ao ar sem um humano aprovar.**

### Uma metáfora para guiar a leitura

Ajuda pensar no pipeline como uma redação de jornal com três personagens, mais um que
trabalha nos bastidores antes de todos:

| Personagem | Quem é no sistema | Papel |
|---|---|---|
| **O produtor de pauta** | `prepare.mjs` | Monta o briefing: o que procurar, em que período, o que já foi coberto, e as regras da casa. |
| **O estagiário pesquisador** | O Claude (`claude-code-action`) | Brilhante e incansável — lê a web em minutos — mas de vez em quando volta com uma "notícia" que não existe. Você quer o talento dele, mas não assinaria nada que ele escreveu sem revisar. |
| **O revisor burocrático** | `publish.mjs` | Sem criatividade nenhuma, e é por isso que é valioso: confere formato de data, exige URL de fonte, checa se a matéria já foi publicada e joga fora tudo que não passa. Implacável, nunca abre exceção. |
| **O editor-chefe** | Você (curador humano) | Dá a palavra final. Nada é impresso sem seu carimbo — via PWA, checkbox ou e-mail. |

O restante deste documento é essa redação, seção por seção, rodando sozinha toda
segunda-feira.

---

## 1. Visão geral em uma figura

```
                       ┌──────────────────────────────────────────────────────────┐
                       │                  GOOGLE SHEETS (o banco)                   │
                       │   1RsaiSCZBTUB4XTSj_mVbNgsLSHpky7wsjKltZboDaPA             │
                       │                                                            │
                       │   aba LANCAMENTOS  →  status=publicado  →  aparece no site │
                       │   aba PENDENTES    →  status=pendente   →  fila de revisão │
                       └───────▲───────────────────▲───────────────────┬───────────┘
                               │ (escreve)         │ (move/apaga)       │ (lê via gviz)
                               │                   │                    │
         ┌─────────────────────┴──┐   ┌────────────┴───────────┐   ┌────▼─────────────────┐
         │  GITHUB ACTIONS (cron) │   │   APPS SCRIPT (web app)│   │   SITE  (GitHub Pages)│
         │  1x/semana, segunda    │   │   Codigo.gs, bound à   │   │   index.html lê só    │
         │  prepare→Claude→publish│──▶│   planilha             │◀──│   LANCAMENTOS         │
         └────────────────────────┘POST└──────────▲─────────────┘   └───────────────────────┘
                                                   │ POST aprovar/rejeitar/rodar
                                       ┌───────────┴────────────┐
                                       │  PWA de curadoria      │   ← aprova/rejeita + dispara a
                                       │  /admin/ (GitHub Pages)│   ← pesquisa; LÊ pendentes via
                                       └───────────┬────────────┘   ← GET listar (fetch CORS, ao vivo)
                                                   │ GET ?action=listar/ping
```

**Princípio do gate humano:** nada vai ao ar sozinho. A automação só escreve em `PENDENTES`
(rascunho). Uma linha só vira pública quando **você aprova** (PWA, e-mail ou checkbox), o que
a move para `LANCAMENTOS` com `status=publicado` — única coisa que o site renderiza.

Não é uma política de boas maneiras — é uma **impossibilidade arquitetural**: não existe
nenhum caminho no código pelo qual a automação escreva diretamente em `LANCAMENTOS`. Voltamos
a isso na seção 5.

---

## 2. Os componentes

| Componente | Onde vive | Papel |
|---|---|---|
| **Site (timeline)** | `index.html` + `assets/` → GitHub Pages | Mostra a régua. Lê **só** `LANCAMENTOS` (status `publicado`) via gviz/JSONP. |
| **Planilha** | Google Sheets `1Rsai…DaPA` | Banco de dados. Abas `Lancamentos` (publicado) e `Pendentes` (rascunho). |
| **Automação** | `automation/` + `.github/workflows/auto-update.yml` | Toda semana pesquisa lançamentos e propõe candidatos em `Pendentes`. |
| **Apps Script** | `automation/apps-script/Codigo.gs`, bound à planilha | Recebe candidatos, move/apaga linhas, manda e-mail. Publicado como web app. |
| **PWA de curadoria** | `admin/` → GitHub Pages (`/admin/`) | Tela p/ aprovar/rejeitar pendentes e disparar a pesquisa manual. Lê `Pendentes` ao vivo via `fetch` CORS ao Apps Script (`?action=listar`); escrita via POST (token). Instalável no celular. |

---

## 3. As abas da planilha

Cabeçalho (mesmo nas duas abas; `Pendentes` tem `Aprovar?` a mais):

```
data | empresa | modelo | impacto | referencia | status | tipo | dias | origem | timestamp | data_atualizacao   [ | Aprovar? ]
```

- **`Lancamentos`** — o que o site lê. Só linhas com `status = publicado` aparecem.
- **`Pendentes`** — staging. A automação grava aqui com `status = pendente`. A coluna
  `Aprovar?` é um checkbox (criado pelo `setup()`); marcar promove a linha (caminho alternativo à PWA).

A chave de identidade de uma linha em todo o sistema é **`data | empresa | modelo`** — o "RG"
de um lançamento. É por ela que se detecta duplicata (`prepare.mjs`/`publish.mjs`) e é por
ela que o Apps Script localiza a linha certa ao aprovar/rejeitar.

---

## 4. O fluxo semanal (automação)

Workflow: `.github/workflows/auto-update.yml` — cron **`0 12 * * 1`** (segundas, 12:00 UTC) +
disparo manual (`workflow_dispatch`).

### 4.1 O palco: GitHub Actions como relógio e como máquina

O projeto não tem servidor. O GitHub Actions é toda a sua infraestrutura de automação: no
horário do cron, o GitHub liga uma máquina virtual Ubuntu do zero, baixa o repositório,
roda as três etapas abaixo em sequência, e descarta a máquina. `workflow_dispatch` permite
disparar manualmente — inclusive pela PWA, botão 🔍 (ver seção 6, `_rodarWorkflow_`).

Um detalhe que já revela a filosofia do projeto: o workflow declara
`permissions: contents: read` (mais `id-token: write`, exigido pelo `claude-code-action@v1`
para autenticação OIDC). Ou seja: **nada que rode dentro do workflow — nem o agente — tem
permissão de escrever no repositório.** O Claude não consegue commitar, abrir PR ou alterar
o site, mesmo que tentasse.

### 4.2 `prepare.mjs` — o briefing

A qualidade de um agente depende menos do modelo e mais do contexto que ele recebe. Se o
agente não sabe o que já está cadastrado, propõe duplicatas. Se não sabe a grafia oficial
das empresas, escreve "Deepseek" numa semana e "DeepSeek AI" na outra. Se não sabe o
período de interesse, traz lançamentos de meses atrás. O `prepare.mjs` existe para
eliminar essas adivinhações, montando a cada execução um briefing fresco em
`automation/_work/prompt.md`, com quatro blocos:

1. **A rubrica de curadoria** (`policy.md`) — as regras editoriais (seção 4.4).
2. **A janela de datas** — "de `LOOKBACK_DAYS` dias atrás até hoje" (padrão **7**, casando
   com a cadência semanal do cron: cada rodada cobre exatamente o intervalo desde a
   rodada anterior, sem gaps nem sobreposição).
3. **As empresas conhecidas**, com instrução de usar a grafia exata.
4. **O que já está cadastrado** (`Lancamentos` + `Pendentes`), para o agente não perder
   tempo com o que já existe.

Os blocos 3 e 4 vêm de duas fontes que o script lê ao vivo, não de config duplicada:

- **Empresas conhecidas** — `prepare.mjs` executa `assets/data.js` numa sandbox (`node:vm`)
  e captura de lá `COMPANY_COLORS`/`LOGO_MAP`. A alternativa seria manter uma segunda lista
  de empresas só para a automação — e listas duplicadas dessincronizam. Aqui, a
  configuração do site **é** a configuração do agente: adicionar uma empresa em
  `assets/data.js` já o ensina a reconhecê-la na segunda-feira seguinte.
- **Já cadastrados** — lidas das abas `Lancamentos` e `Pendentes` via gviz (mesmo endpoint
  que o site usa), com o mesmo parser de datas de `assets/app.js` (`Date(YYYY,M,D)` →
  `YYYY-MM-DD`), para que a chave de dedup bata de forma idêntica nos dois lugares. O
  conjunto de chaves vai para `dedup.json`, usado de novo (independentemente) na etapa 3.

Esse prompt não é um texto estático escrito uma vez — é gerado por código toda segunda,
sempre com o estado real do sistema. Essa prática tem nome: *context engineering*. É a
diferença entre um post-it dizendo "procura notícias de IA aí" e uma pauta com período,
critérios, lista de veículos conhecidos e arquivo do que já foi coberto.

### 4.3 O agente em ação

Um LLM comum recebe um texto e devolve um texto — uma rodada só. Um **agente** é um LLM
dentro de um laço com acesso a ferramentas: lê a tarefa, decide qual ferramenta usar (ex.:
`WebSearch` por "AI model release announcement"), observa o resultado, decide o próximo
passo, repete — até concluir ou bater um limite de rodadas.

No Panorama, o agente é o Claude, rodado pela action `anthropics/claude-code-action@v1`. A
instrução que ele recebe é deliberadamente curta — "leia `automation/_work/prompt.md` e
siga TODAS as instruções nele" — porque o briefing completo já foi montado na etapa 4.2.

A configuração de ferramentas é a jaula do agente:

```
claude_args: '--allowedTools "WebSearch,WebFetch,Read,Write" --max-turns 30 --model sonnet'
```

- `WebSearch`/`WebFetch` — pesquisar e abrir páginas específicas (para checar a fonte primária);
- `Read`/`Write` — ler o prompt e gravar o resultado;
- `--max-turns 30` — teto que impede laços infinitos;
- nada mais: sem terminal, sem git, sem rede além dessas duas ferramentas de web.

Somado ao `contents: read` do workflow (seção 4.1), isso é o princípio do **menor
privilégio**: o agente tem exatamente as capacidades que a tarefa exige, e nenhuma outra.
Se o modelo se comportar de forma inesperada — ou se alguém injetar instruções maliciosas
numa página que ele visite (*prompt injection*) — o dano possível se resume a escrever um
JSON ruim, que a etapa 4.5 vai filtrar de qualquer forma.

Autenticação: `CLAUDE_CODE_OAUTH_TOKEN` (gerado com `claude setup-token`), que vincula o
agente à assinatura do Claude — o custo marginal de cada rodada semanal é zero, sem
cobrança de API por token.

### 4.4 A rubrica (`policy.md`): transformando julgamento em protocolo

O coração editorial do sistema é `automation/policy.md` (versionado no git), que define
quem o agente é ("um curador rigoroso para uma linha do tempo acadêmica") e como decide,
em duas fases emprestadas da recuperação de informação:

- **Fase 1 — Recall amplo.** Lance a rede grande: pesquise tudo que possa ser um
  lançamento de IA generativa na janela. Errar por excesso é aceitável aqui.
- **Fase 2 — Precisão estrita.** Peneire com critérios explícitos. Para entrar, o item
  precisa ser modelo de fundação ou release de destaque, e vir de um laboratório já
  rastreado — ou de um laboratório novo com sinal forte (cobertura ampla de imprensa
  reputada, topo de leaderboard reconhecido como LMArena/SWE-Bench, ou um "primeiro"
  claro de capacidade ou região).

Tão importante quanto os critérios de entrada é a lista negra explícita: point-releases
incrementais sem destaque real, fine-tunes e quantizações da comunidade, modelos
não-generativos, rumores, vazamentos, waitlists sem modelo disponível, reanúncios de
coisas antigas, e mudanças de preço ou SDKs sem modelo novo por trás.

E a regra de desempate mais importante do sistema: **"em caso de dúvida, prefira
excluir."** É uma decisão consciente sobre assimetria de erros. Um falso negativo (o
agente deixou passar um lançamento relevante) custa pouco — alguém percebe e adiciona
manualmente. Um falso positivo (o agente inventou ou superestimou algo) custa caro:
polui a fila de revisão e, se escapar, mancha a credibilidade de uma régua acadêmica. O
sistema inteiro está calibrado para errar para o lado barato.

### 4.5 A saída: JSON estruturado com metacognição

O agente não entrega prosa — escreve só `automation/_work/candidates.json`, e se não achou
nada relevante escreve `{ "candidatos": [] }` (resposta vazia é válida e esperada; numa
semana parada, forçar o agente a "achar alguma coisa" seria convite à alucinação).

Cada candidato carrega, além dos dados factuais (`data` ISO, `empresa`, `modelo`,
`impacto`), três campos de metacognição estruturada — o agente refletindo sobre a própria
resposta:

| Campo | O que é | Por que existe |
|---|---|---|
| `referencia` | URL de fonte primária (blog oficial do laboratório, paper, release) | Sem fonte verificável, o item é descartado (`publish.mjs`). Torna cada afirmação checável por um humano. |
| `confianca` | Autoavaliação de 0.0 a 1.0 | Vira filtro mecânico na etapa 4.6 (`CONF_MIN`); a rubrica manda dar nota baixa a itens limítrofes. |
| `relevancia_justificativa` | Por que o item passou na rubrica | Aparece para o curador humano na PWA/e-mail; torna a decisão do agente auditável. |

### 4.6 `publish.mjs` — o revisor implacável

Aqui está a decisão de arquitetura mais madura do projeto: a saída do LLM é tratada como
**entrada não confiável** — com o mesmo ceticismo que um backend bem escrito trata um
formulário preenchido por um estranho na internet.

`publish.mjs` lê `candidates.json` e submete cada candidato a seis verificações
mecânicas, descartando (e registrando no log o motivo) tudo que falha:

1. É um objeto válido? JSON quebrado ou item malformado cai fora.
2. A data bate `^\d{4}-\d{2}-\d{2}$`? "Fevereiro de 2026" não passa.
3. `empresa` e `modelo` estão preenchidos?
4. `referencia` começa com `http://` ou `https://`?
5. `confianca` ≥ `CONF_MIN` (env, padrão **0.55**)?
6. A chave `data|EMPRESA|MODELO` já existe (comparada com `dedup.json` da etapa 4.2)?

Repare na redundância proposital do item 6: o agente já recebeu a lista de cadastrados no
prompt e já foi instruído a não repetir — mas o pipeline confere de novo, mecanicamente.
Essa é a postura do sistema numa imagem: instruir o LLM é bom; verificar em código é
melhor; fazer os dois é o padrão.

**Empresas novas chegam com o código pronto.** Quando um candidato vem de uma empresa que
ainda não está em `COMPANY_COLORS`, o site não saberia renderizá-la — a pílula sairia sem
logo, sem cor, sem trilha. `publish.mjs` antecipa isso: gera automaticamente o snippet
pronto para colar em `assets/data.js` (os 5 passos: `LOGO_PATHS`, `LOGO_MAP`,
`COMPANY_COLORS`, régua em `LAYOUT_GROUPS`, lembrete do `?v=`) e ainda tenta baixar o SVG
oficial do logo em `simple-icons/simple-icons` no GitHub pelo slug do nome — se achar, já
embute o `path` vetorial no snippet. O curador recebe por e-mail um bloco de código quase
pronto, em vez de uma tarefa de pesquisa.

### 4.7 Dry-run: o ensaio geral

| Disparo | Escreve? |
|---|---|
| Manual (`workflow_dispatch`) com `dry_run` **desmarcado** | Sim |
| Agendado (segunda) **e** variável `AUTO_PUBLISH == 'true'` | Sim |
| Qualquer outro caso | Não (dry-run) |

- **Dry-run** (padrão de segurança): roda tudo — validação, dedup, snippets, resumo no
  log — mas não escreve na planilha. Serve para calibrar a rubrica e os limiares
  observando o que o agente teria proposto.
- **Real:** os candidatos sobreviventes são enviados num `POST` autenticado (token em
  GitHub Secrets, nunca no código) para o Apps Script.

> **`AUTO_PUBLISH = true`** (definida em 01/jul/2026) → o cron semanal **escreve** nos `Pendentes` sozinho.
> Para desligar (voltar a dry-run): Settings → Secrets and variables → Actions → **Variables** → apagar ou pôr `AUTO_PUBLISH` ≠ `true`.

O LLM faz **só** a pesquisa → JSON. Validação, dedup, escrita e e-mail são determinísticos
(Node + Apps Script) — de novo, os três pilares da seção 0.

---

## 5. Aprovar / rejeitar — 3 caminhos (todos equivalentes)

Todos terminam no Apps Script, que faz a mesma coisa:

- **Aprovar** → copia a linha p/ `Lancamentos` com `status=publicado` e remove de `Pendentes`
  → aparece no site (cache do site é de algumas horas).
- **Rejeitar** → remove a linha de `Pendentes` (nunca toca em `Lancamentos`).

| Caminho | Como |
|---|---|
| **PWA** (recomendado) | `https://lapig-ufg.github.io/app-panorama-global-da-ia-generativa/admin/` — botões Aprovar/Rejeitar. |
| **Checkbox** | Na aba `Pendentes`, marcar `Aprovar?` (gatilho `onEdit` promove). |
| **E-mail** | O e-mail lista os candidatos e aponta p/ a PWA/planilha (não aprova sozinho). |

Como mencionado na seção 1: isso não é uma convenção que alguém poderia esquecer de
seguir — é estrutural. O site só renderiza `Lancamentos` com `status=publicado`; a
automação só tem caminho de escrita até `Pendentes`. A promoção de pendente a publicado
exige, sempre, um gesto humano por um destes três caminhos.

---

## 6. O Apps Script (`Codigo.gs`)

Projeto **bound** à planilha (Script ID `1zzUFteO3ICqyv66Agw7zSFZKHoDtvFDA2c2IT3MqWLdvyC_SVBoIZE_t`,
título "Panorama LLMs"). Gerenciado por **clasp** a partir de `automation/apps-script/`.

| Função | Papel |
|---|---|
| `doGet(e)` | Roteador de leitura. `?action=listar` → `{candidatos:[…]}`; `?action=ping` → latência/estado. Devolve **JSON puro** via `_json` (lido pela PWA via `fetch` CORS). |
| `doPost(e)` | Roteador de escrita. `action`=`aprovar`/`rejeitar` → admin (PWA); `rodar` → dispara a workflow; senão → ingestão (Actions). |
| `_listarData_` | Devolve os `Pendentes` (`status=pendente`) como `{candidatos:[…]}`. Lê a aba de uma vez (batch) e pula linhas vazias (checkboxes sem dados). |
| `_pingData_` | Devolve `{ok, serverTime, pendentesRows, execMs, ghToken}` — diagnóstico de latência do web app (botão ⏱ da PWA). |
| `_handleIngestao_` | Recebe `rows[]` do `publish.mjs`, grava em `Pendentes` (dedup), manda e-mail. |
| `_handleAdmin_` | Aprovar/rejeitar uma linha (casa pela chave `data\|empresa\|modelo`). Lê a aba de uma vez (batch), tem **idempotência** (se já em `Lancamentos`, só remove) e `SpreadsheetApp.flush()`. |
| `_rodarWorkflow_` | Dispara `auto-update.yml` via API do GitHub (POST `/actions/workflows/.../dispatch`). Requer `GH_TOKEN` em Script Properties. |
| `onEdit(e)` | Checkbox `Aprovar?` → promove a linha. |
| `_promoverLinha_` | Helper: copia p/ `Lancamentos` como `publicado`. |
| `setup()` | **Rodar 1x:** cria a aba `Pendentes`+checkbox e o gatilho instalável `onEdit`. |

Detalhes importantes:
- O **token** (`SECRET`) **não** fica no código — vem de **Script Properties** (Project Settings).
  Mesmo valor do secret `APPS_SCRIPT_TOKEN` do GitHub e do token da PWA.
- O `GH_TOKEN` (fine-grained PAT com `Actions: write` no repo) também fica em **Script Properties**,
  só usado por `_rodarWorkflow_` no servidor — **nunca** vá pra PWA ou pro repo.
- O acesso do web app (`executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`) vem do
  `appsscript.json` — por isso o `clasp create-deployment` já sai com o acesso certo. As
  respostas do `doGet`/`doPost` trazem `Access-Control-Allow-Origin: *` (inclusive no `302` que
  redireciona p/ `script.googleusercontent.com`), o que permite à PWA ler via `fetch` CORS.
- Web app atual: implantação **@7** (mesma URL desde @2), URL
  `https://script.google.com/macros/s/AKfycbyKKRVZ38ThBgdtSqpjz0aJiBHAAsipP3M7KWumZw9aOm7eaRmsInt06fld92VN7Too/exec`.
  Mudar o `Codigo.gs` → `clasp push --force` + `clasp create-deployment -i <deploymentId>` (mantém a URL).

---

## 7. Segredos e tokens (onde cada um vive)

> Nenhum valor de segredo está neste repositório. O token de curadoria fica fora do repo em
> `../CURADORIA-token.txt` (na pasta `Regua/`).

| Segredo | Onde está | Para quê |
|---|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | GitHub → Secrets (Actions) | Autentica o Claude na sua assinatura (sem API paga). Gerado com `claude setup-token`. |
| `APPS_SCRIPT_URL` | GitHub → Secrets (Actions) | URL `/exec` do web app (destino do POST do `publish.mjs`). |
| `APPS_SCRIPT_TOKEN` | GitHub → Secrets (Actions) | **= Script Property `SECRET` = token da PWA.** Protege o web app. |
| `SECRET` | Apps Script → Script Properties | O mesmo valor acima, lado servidor. |
| `GH_TOKEN` | Apps Script → Script Properties | Fine-grained PAT (com `Actions: write` no repo) usado por `_rodarWorkflow_` p/ disparar a workflow a partir da PWA (botão 🔍). Fica só no servidor — **não** vá pra PWA nem pro repo. |
| token de curadoria | `localStorage` da PWA (você cola 1x) + `Regua/CURADORIA-token.txt` | Mesmo valor; libera aprovar/rejeitar/disparar pesquisa na PWA. |
| `AUTO_PUBLISH` (variável, não secret) | GitHub → Variables (Actions) | `true` liga a escrita do cron semanal. Hoje: **`true`** (cron escreve nos Pendentes toda segunda). |

Os três (`APPS_SCRIPT_TOKEN`, `SECRET`, token da PWA) **têm que ser o mesmo valor**. Para trocar:
gere um novo e atualize nos três lugares (e cole o novo na PWA).

---

## 8. Como atualizar cada parte

| Quero mudar… | Faço… |
|---|---|
| **Site** (visual, empresas, cores) | Editar `index.html`/`assets/*` → commit na `main` → Pages publica (~1 min). **Subir o `?v=`** dos scripts no `index.html` (cache-bust). |
| **PWA** (`admin/`) | Editar `admin/*` → commit na `main` → Pages publica. |
| **Apps Script** (`Codigo.gs`) | Editar em `automation/apps-script/` → `clasp push --force` → `clasp create-deployment -i <deploymentId>` (mantém a MESMA URL). |
| **Rubrica de relevância** | Editar `automation/policy.md` (versionado) — é literalmente a "personalidade" do curador, e recalibrá-la é um commit com diff revisável, não um retreinamento. |
| **Janela / limiar** | `LOOKBACK_DAYS` (env, `prepare.mjs`) · `CONF_MIN` (env, `publish.mjs`). |

> **clasp:** logado como `victoramaral.lapig@gmail.com`. Projeto em `automation/apps-script/`
> (`.clasp.json` aponta pro script bound). **Não** use a pasta antiga `Regua/apps-script/`
> (é de tentativas velhas; o `.clasp.json` dela foi desativado de propósito).

---

## 9. Operação do dia a dia

1. Toda segunda o cron roda e, com `AUTO_PUBLISH = true`, **escreve nos Pendentes** sozinho
   (olhando os últimos 7 dias). Nada vai à régua sem você aprovar na PWA.
2. Para uma rodada que escreve de verdade agora:
   `gh workflow run auto-update.yml -f dry_run=false` (ou pela aba Actions, desmarcando "Dry run").
3. Abra a **PWA** → aprove o que for relevante, rejeite o resto. ⚠️ Sempre confira a **fonte**:
   a pesquisa pode trazer item duvidoso/alucinado (ex.: nome de modelo que não existe).
4. **Empresa nova:** a PWA marca "EMPRESA NOVA" e o e-mail traz um snippet de `data.js`.
   Aplique o snippet (logo/cor/grupo) + suba o `?v=` **antes** de aprovar, senão a pílula sai sem logo.
5. O cron já escreve sozinho (`AUTO_PUBLISH = true`). Se quiser recalibrar sem escrever,
   volte a variável p/ dry-run temporariamente.

---

## 10. Testar / disparar manualmente

```bash
# dry-run (só mostra no log, não escreve)
gh workflow run auto-update.yml --repo lapig-ufg/app-panorama-global-da-ia-generativa -f dry_run=true

# real (escreve em Pendentes + e-mail)
gh workflow run auto-update.yml --repo lapig-ufg/app-panorama-global-da-ia-generativa -f dry_run=false

# acompanhar o run e ler o log do passo "Validar e publicar"
gh run watch <run-id> --repo lapig-ufg/app-panorama-global-da-ia-generativa
```

Local (debug do pipeline, sem escrever): `node automation/prepare.mjs` e
`DRY_RUN=true node automation/publish.mjs`.

---

## 11. Troubleshooting (gotchas já resolvidos)

| Sintoma | Causa / correção |
|---|---|
| Action falha: *"Could not fetch an OIDC token… id-token: write"* | O workflow precisa de `permissions: id-token: write` (já corrigido). |
| Action falha: *"Claude Code is not installed on this repository"* | Instalar o GitHub App **Claude** (https://github.com/apps/claude) no repo (já feito). |
| Web app responde HTML/404 logo após implantar | Propagação da implantação nova (~minutos). Assenta sozinho; não afeta o cron. |
| PWA: *"token invalido"* ao aprovar | O token da PWA ≠ Script Property `SECRET`. Recolar o token certo. |
| Empresa aparece sem logo/cor no site | Empresa nova aprovada sem aplicar o snippet de `data.js` + `?v=`. |
| Site não mostra mudança | Cache do navegador/Pages. Aba anônima e/ou subir o `?v=`. |
| Pendente aprovado não sai da PWA | A PWA agora **confirma** o commit re-lendo `listar` (ao vivo, sem cache do gviz): o card só some quando a linha realmente saiu de `Pendentes`. Se o POST ainda está processando (cold start) ou falhou, o card fica com toast "Não confirmado ainda — recarregue ↻ e tente de novo". |
| PWA mostra "Falha ao ler pendentes (load failed)" | A leitura foi trocada de JSONP-via-`<script>` p/ `fetch` CORS. O JSONP falhava no `302 → script.googleusercontent.com` (a tag `<script>` em `no-cors` não executa o redirect). Solução: `doGet` devolve JSON puro, lido via `fetch` CORS (`Access-Control-Allow-Origin: *`). |
| PWA instalada mostra código velho depois de atualizar | O service worker cacheia o shell. Faça reload forte (Ctrl+Shift+R) ou bump no `CACHE` do `sw.js` (`curadoria-ia-vN`). |

---

## 12. Uma segunda-feira imaginária, de ponta a ponta

Para amarrar tudo, um exemplo **fictício e ilustrativo** (não são dados reais do sistema):

- **12:00 UTC.** O GitHub liga a máquina. `prepare.mjs` lê `data.js` (dezenas de empresas
  conhecidas), as duas abas da planilha, e escreve o briefing: "procure anúncios entre
  25/06 e 02/07; eis as empresas; eis o que já temos".
- **12:01.** O Claude lê o briefing e pesquisa. Encontra quatro coisas: (a) um modelo novo
  de um laboratório já rastreado, com post oficial no blog; (b) um rumor em fórum de que
  outro laboratório "lançaria algo na próxima semana"; (c) um fine-tune comunitário de um
  modelo existente no Hugging Face; (d) um laboratório desconhecido anunciando um modelo
  que liderou um leaderboard reconhecido.
- Aplicando a rubrica: o rumor (b) cai pela regra "rumor/em breve → excluir"; o fine-tune
  (c) cai pela lista negra. Sobram (a), com `confianca: 0.9`, e (d), marcado
  `empresa_nova: true`, com `pais` e `grupo_sugerido` preenchidos e `confianca: 0.7`. O
  agente escreve `candidates.json` com dois candidatos e encerra.
- **12:07.** `publish.mjs` valida os dois (datas ISO ✓, URLs ✓, confiança acima de
  `CONF_MIN` ✓, chaves inéditas ✓), nota que (d) é empresa nova, busca o logo no Simple
  Icons, monta o snippet de `data.js` e — como `AUTO_PUBLISH=true` — envia o `POST` ao
  Apps Script.
- **12:08.** O Apps Script grava as duas linhas em `Pendentes` e dispara o e-mail.
- **Mais tarde, no celular.** O curador abre a PWA, vê os dois cards com as justificativas
  do agente, confere a fonte do candidato (a), aprova. No card (d), vê o aviso "EMPRESA
  NOVA", aplica antes o snippet em `assets/data.js` (um commit no site), e então aprova.
  Horas depois, as duas pílulas estão na régua pública.

Nenhum servidor foi mantido, nenhuma API paga foi chamada, e nenhum byte chegou ao público
sem passar por um par de olhos humanos.

---

## 13. Cinco princípios de design

O que este pipeline ensina sobre construir com LLMs em produção:

1. **LLM como função, não como sistema.** O agente recebe entrada estruturada (o
   briefing) e devolve saída estruturada (o JSON). É uma peça substituível dentro de um
   pipeline — não o pipeline. Se surgir um modelo melhor, troca-se uma linha do workflow.
2. **Defesa em profundidade contra alucinação.** Quatro camadas independentes — fonte
   primária obrigatória, autoavaliação de confiança com limiar, validação determinística,
   revisão humana — de modo que um erro precisa furar todas para chegar ao público.
3. **Comportamento versionado.** A "personalidade" do agente é um arquivo markdown no git
   (`policy.md`); os limiares são variáveis de ambiente. Recalibrar o curador é um commit
   com diff revisável — não um retreinamento, não uma mexida em código.
4. **Menor privilégio, sempre.** Quatro ferramentas, trinta turnos, repositório
   somente-leitura, escrita restrita a uma aba de rascunho. O raio de dano possível do
   agente foi desenhado **antes** de o agente existir.
5. **Infraestrutura zero.** GitHub Actions como relógio, Google Sheets como banco, Apps
   Script como API, GitHub Pages como hosting, assinatura do Claude como motor.

---

## 14. Inventário de arquivos (o que cada um é)

```
panorama-llms/
├── index.html, assets/{app,render,data}.js, styles.css   # o site (timeline)
├── admin/                         # PWA de curadoria
│   ├── index.html                 #   app (shell + lógica): lê via fetch CORS (?action=listar),
│   │                              #   aprova/rejeita (POST + reconcile via listar), botão 🔍 (rodar)
│   │                              #   e botão ⏱ (ping). URL do web app hardcoded aqui.
│   ├── manifest.json, sw.js, icon.svg   # PWA instalável (SW cacheia só o shell; cache "curadoria-ia-vN")
│   └── README.md
├── automation/
│   ├── prepare.mjs                # passo 1: monta o prompt
│   ├── publish.mjs                # passo 3: valida/dedup/POST
│   ├── policy.md                  # rubrica de relevância (editável)
│   ├── schema.json                # forma esperada do candidates.json
│   ├── README.md                  # setup da automação
│   └── apps-script/               # projeto clasp (bound à planilha)
│       ├── Codigo.gs              #   o Apps Script
│       ├── appsscript.json        #   manifest (timezone + acesso do web app)
│       ├── .clasp.json            #   scriptId (não é segredo)
│       └── .claspignore
├── .github/workflows/auto-update.yml   # o cron semanal
├── README.md                      # doc do site
└── ARQUITETURA.md                 # este arquivo
```

(Fora do repo, na pasta `Regua/`: `CURADORIA-token.txt` com o token — não publicar.)
