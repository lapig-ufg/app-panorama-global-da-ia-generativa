# Como tudo funciona hoje — Panorama Global da IA Generativa

Documento de arquitetura e operação do sistema completo: o site, a planilha (banco de
dados), a automação semanal de pesquisa, o Apps Script e a PWA de curadoria.
Última atualização: **01/jul/2026**.

> **Identidades** (papéis, não credenciais — os valores concretos ficam fora deste repo):
> - **Conta Google** — dona da planilha + Apps Script + clasp (a mesma em todos os passos).
> - **Conta GitHub** — admin do repo; dona dos Secrets/Variables do Actions.
> - **E-mail de notificação** da automação — definido em `automation/apps-script/Codigo.gs` (`var EMAIL`).

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
                                                   │ POST aprovar/rejeitar
                                       ┌───────────┴────────────┐
                                       │  PWA de curadoria      │
                                       │  /admin/ (GitHub Pages)│   ← você aprova/rejeita aqui
                                       └────────────────────────┘
```

**Princípio do gate humano:** nada vai ao ar sozinho. A automação só escreve em `PENDENTES`
(rascunho). Uma linha só vira pública quando **você aprova** (PWA, e-mail ou checkbox), o que
a move para `LANCAMENTOS` com `status=publicado` — única coisa que o site renderiza.

---

## 2. Os componentes

| Componente | Onde vive | Papel |
|---|---|---|
| **Site (timeline)** | `index.html` + `assets/` → GitHub Pages | Mostra a régua. Lê **só** `LANCAMENTOS` (status `publicado`) via gviz/JSONP. |
| **Planilha** | Google Sheets `1Rsai…DaPA` | Banco de dados. Abas `Lancamentos` (publicado) e `Pendentes` (rascunho). |
| **Automação** | `automation/` + `.github/workflows/auto-update.yml` | Toda semana pesquisa lançamentos e propõe candidatos em `Pendentes`. |
| **Apps Script** | `automation/apps-script/Codigo.gs`, bound à planilha | Recebe candidatos, move/apaga linhas, manda e-mail. Publicado como web app. |
| **PWA de curadoria** | `admin/` → GitHub Pages (`/admin/`) | Tela p/ aprovar/rejeitar pendentes de qualquer lugar (instalável no celular). |

---

## 3. As abas da planilha

Cabeçalho (mesmo nas duas abas; `Pendentes` tem `Aprovar?` a mais):

```
data | empresa | modelo | impacto | referencia | status | tipo | dias | origem | timestamp | data_atualizacao   [ | Aprovar? ]
```

- **`Lancamentos`** — o que o site lê. Só linhas com `status = publicado` aparecem.
- **`Pendentes`** — staging. A automação grava aqui com `status = pendente`. A coluna
  `Aprovar?` é um checkbox (criado pelo `setup()`); marcar promove a linha (caminho alternativo à PWA).

A chave de identidade de uma linha em todo o sistema é **`data | empresa | modelo`** (usada p/
dedup e p/ a PWA/Apps Script localizarem a linha certa).

---

## 4. O fluxo semanal (automação)

Workflow: `.github/workflows/auto-update.yml` — cron **`0 12 * * 1`** (segundas, 12:00 UTC) +
disparo manual (`workflow_dispatch`).

1. **`prepare.mjs`** — lê `assets/data.js` (empresas conhecidas + `SHEET_ID`) e as abas
   `Lancamentos`+`Pendentes` (gviz). Monta `automation/_work/prompt.md` com a rubrica
   (`policy.md`), a janela de datas (`LOOKBACK_DAYS`, padrão 7 dias — casa com o cron semanal) e a lista de já-cadastrados.
2. **`anthropics/claude-code-action@v1`** — o Claude lê o prompt, **pesquisa na web**
   (WebSearch/WebFetch) e escreve `automation/_work/candidates.json`.
   Autenticação: **`CLAUDE_CODE_OAUTH_TOKEN`** (sua assinatura — **sem cobrança de API**).
3. **`publish.mjs`** — valida (data ISO, URL, confiança ≥ `CONF_MIN`=0.55), dedup, gera o
   snippet de `data.js` p/ empresa nova, e faz **POST ao Apps Script**.
   - Em **dry-run** apenas imprime no log (não escreve).
   - Real (`DRY_RUN=false`) → POST de verdade → Apps Script grava em `Pendentes` + manda e-mail.
4. Você recebe e-mail e/ou abre a PWA → **aprova/rejeita**.

O LLM faz **só** a pesquisa → JSON. Validação, dedup, escrita e e-mail são determinísticos
(Node + Apps Script).

### Quando ele escreve de verdade vs. dry-run
| Disparo | Escreve? |
|---|---|
| Manual (`workflow_dispatch`) com `dry_run` **desmarcado** | Sim |
| Agendado (segunda) **e** variável `AUTO_PUBLISH == 'true'` | Sim |
| Qualquer outro caso | Não (dry-run) |

> **`AUTO_PUBLISH = true`** (definida em 01/jul/2026) → o cron semanal **escreve** nos `Pendentes` sozinho.
> Para desligar (voltar a dry-run): Settings → Secrets and variables → Actions → **Variables** → apagar ou pôr `AUTO_PUBLISH` ≠ `true`.

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

---

## 6. O Apps Script (`Codigo.gs`)

Projeto **bound** à planilha (Script ID em `automation/apps-script/.clasp.json`,
título "Panorama LLMs"). Gerenciado por **clasp** a partir de `automation/apps-script/`.

| Função | Papel |
|---|---|
| `doPost(e)` | Roteador. Se `action` = `aprovar`/`rejeitar` → admin (PWA); senão → ingestão (Actions). |
| `_handleIngestao_` | Recebe `rows[]` do `publish.mjs`, grava em `Pendentes` (dedup), manda e-mail. |
| `_handleAdmin_` | Aprovar/rejeitar uma linha (casa pela chave `data\|empresa\|modelo`). |
| `onEdit(e)` | Checkbox `Aprovar?` → promove a linha. |
| `_promoverLinha_` | Helper: copia p/ `Lancamentos` como `publicado`. |
| `setup()` | **Rodar 1x:** cria a aba `Pendentes`+checkbox e o gatilho instalável `onEdit`. |

Detalhes importantes:
- O **token** (`SECRET`) **não** fica no código — vem de **Script Properties** (Project Settings).
  Mesmo valor do secret `APPS_SCRIPT_TOKEN` do GitHub e do token da PWA.
- O acesso do web app (`executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`) vem do
  `appsscript.json` — por isso o `clasp create-deployment` já sai com o acesso certo.
- Web app atual: implantação **@2**, URL
  `https://script.google.com/macros/s/AKfycbyKKRVZ38ThBgdtSqpjz0aJiBHAAsipP3M7KWumZw9aOm7eaRmsInt06fld92VN7Too/exec`.

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
| token de curadoria | `localStorage` da PWA (você cola 1x) + `Regua/CURADORIA-token.txt` | Mesmo valor; libera aprovar/rejeitar na PWA. |
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
| **Rubrica de relevância** | Editar `automation/policy.md` (versionado). |
| **Janela / limiar** | `LOOKBACK_DAYS` (env, `prepare.mjs`) · `CONF_MIN` (env, `publish.mjs`). |

> **clasp:** logado na **conta Google dona da planilha**. Projeto em `automation/apps-script/`
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
| Pendente aprovado não sai da PWA | A PWA recarrega após a ação; se persistir, é cache do gviz (alguns minutos). |

---

## 12. Inventário de arquivos (o que cada um é)

```
panorama-llms/
├── index.html, assets/{app,render,data}.js, styles.css   # o site (timeline)
├── admin/                         # PWA de curadoria
│   ├── index.html                 #   app (shell + lógica); URL do web app hardcoded aqui
│   ├── manifest.json, sw.js, icon.svg   # PWA instalável (SW cacheia só o shell)
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
```
