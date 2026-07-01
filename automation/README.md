# Automação — busca semanal de lançamentos

Pipeline que, toda semana, **pesquisa lançamentos relevantes de IA generativa**, filtra por relevância, e grava os candidatos numa aba de **staging** da planilha como rascunho — você aprova com um **checkbox** e só então eles vão ao ar no site.

## Como funciona

```
GitHub Actions (cron semanal / disparo manual)
  1. prepare.mjs  → lê a planilha (gviz) + assets/data.js; monta _work/prompt.md
  2. claude-code-action (token da assinatura) → pesquisa na web; escreve _work/candidates.json
  3. publish.mjs  → valida, dedup, gera snippet de empresa nova; POST ao Apps Script
        → Apps Script grava na aba "Pendentes" + manda e-mail
  4. Você marca "Aprovar?" → Apps Script copia a linha p/ "Lancamentos" (status=publicado)
```

O LLM faz **só** a pesquisa → JSON. Validação, dedup, escrita e e-mail são determinísticos (Node + Apps Script).

## Princípio do gate

Nada vai ao ar sem você. O site só renderiza linhas de `Lancamentos` com `status === 'publicado'`; os candidatos entram em `Pendentes` como `pendente`. Aprovar = marcar o checkbox.

## Setup (uma vez)

O Apps Script é gerenciado via **clasp** (CLI). A pasta `automation/apps-script/` já é um projeto
clasp (`.clasp.json` → script vinculado à planilha de produção). O `SECRET` **não** fica no
código (fica em Script Properties), para nunca vazar neste repositório público.

### 1. Subir o código (clasp)
```bash
cd automation/apps-script
clasp login            # uma vez, na conta dona da planilha
clasp push --force     # envia Codigo.gs + appsscript.json
```

### 2. Configurar e autorizar (na UI do Apps Script — `clasp open-script`)
- **Project Settings → Script Properties** → adicione a propriedade **`SECRET`** com um token
  aleatório (anote — é o mesmo valor do secret `APPS_SCRIPT_TOKEN` no GitHub).
- Rode a função **`setup()`** uma vez (autorize quando o Google pedir). Ela cria a aba
  **`Pendentes`** (cabeçalho de `Lancamentos` + coluna `Aprovar?` como checkbox) e instala o
  gatilho **instalável** `onEdit` (removendo gatilhos antigos).

### 3. Implantar como App da Web
```bash
clasp create-deployment    # acesso já vem do appsscript.json (executar como eu / anônimo)
```
Copie a URL `/exec` (`clasp open-web-app` ou o painel de implantações). É o secret `APPS_SCRIPT_URL`.

### 4. Secrets do repositório (Settings → Secrets and variables → Actions)
| Secret | Valor |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Gere com `claude setup-token` (usa sua assinatura Pro/Max; token ~1 ano, **sem cobrança de API**) |
| `APPS_SCRIPT_URL` | A URL `/exec` do App da Web do passo 3 |
| `APPS_SCRIPT_TOKEN` | O mesmo valor da Script Property `SECRET` do passo 2 |

### 4. Variável de segurança (opcional, recomendado)
- Em **Variables** (não Secrets): `AUTO_PUBLISH`. **Estado atual: `true`** (o cron de segunda escreve nos `Pendentes` sozinho; o site continua só publicando o que você aprovar na PWA).
  - **Deixe sem criar / diferente de `true`** → as rodadas agendadas ficam em **dry-run** (não escrevem). Use isto enquanto calibra o filtro.
  - Defina `AUTO_PUBLISH = true` quando estiver confiante → o cron semanal passa a escrever em `Pendentes` de verdade.

## Como testar (recomendado antes de ligar o cron)

1. Actions → "Atualização automática de lançamentos" → **Run workflow** com **dry_run = true**.
2. Veja no log do passo "Validar e publicar" os candidatos e a justificativa de relevância.
3. **Ajuste `policy.md`** se entrar lixo ou faltar coisa, e repita.
4. Rode de novo com **dry_run = false** → confira a aba `Pendentes` e o e-mail.
5. Marque **`Aprovar?`** numa linha → ela aparece em `Lancamentos` como `publicado` → confira no site (aba anônima; o cache do site é de algumas horas).
6. Quando confiar, defina `AUTO_PUBLISH = true` para o agendamento semanal.

## Ajustes finos
- **Janela de busca:** `LOOKBACK_DAYS` (env, padrão **7**) em `prepare.mjs` — casa com o cron semanal (segundas), sem gaps.
- **Limiar de confiança:** `CONF_MIN` (env, padrão 0.55) em `publish.mjs`.
- **Rubrica de relevância:** edite `policy.md` (versionado).
- **Empresa nova:** o e-mail traz um snippet de `data.js` pronto (logo via Simple Icons, cor placeholder, régua no grupo sugerido). Aplique o snippet + suba o `?v=` do `index.html` **antes** de aprovar a linha.

## Rodar local (debug)
```bash
node automation/prepare.mjs                 # lê a planilha pública, gera _work/prompt.md
# (preencha _work/candidates.json à mão para testar o publish)
DRY_RUN=true node automation/publish.mjs    # valida e imprime, sem POST
```
