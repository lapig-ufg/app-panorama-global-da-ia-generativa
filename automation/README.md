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

### 1. Planilha
- Crie a aba **`Pendentes`** com o **mesmo cabeçalho** de `Lancamentos` (`data, empresa, modelo, impacto, referencia, status, tipo, dias, origem, timestamp, data_atualizacao`) **+ uma coluna `Aprovar?`** (formato → caixa de seleção).

### 2. Apps Script (na própria planilha)
- Extensões → Apps Script → cole `automation/apps-script/Codigo.gs`.
- Edite no topo: `SECRET` (um token aleatório — anote) e `EMAIL` (destinatário).
- Gatilhos (ícone de relógio) → Adicionar gatilho → função **`onEdit`**, origem "Da planilha", evento **"Ao editar"** (gatilho **instalável**, necessário para o checkbox promover entre abas).
- Implantar → Nova implantação → **App da Web** → Executar como **eu**, Acesso **qualquer pessoa** → copie a **URL**.

### 3. Secrets do repositório (Settings → Secrets and variables → Actions)
| Secret | Valor |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Gere com `claude setup-token` (usa sua assinatura Pro/Max; token ~1 ano, **sem cobrança de API**) |
| `APPS_SCRIPT_URL` | A URL do App da Web do passo 2 |
| `APPS_SCRIPT_TOKEN` | O mesmo valor de `SECRET` do passo 2 |

### 4. Variável de segurança (opcional, recomendado)
- Em **Variables** (não Secrets): `AUTO_PUBLISH`.
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
- **Janela de busca:** `LOOKBACK_DAYS` (env, padrão 21) em `prepare.mjs`.
- **Limiar de confiança:** `CONF_MIN` (env, padrão 0.55) em `publish.mjs`.
- **Rubrica de relevância:** edite `policy.md` (versionado).
- **Empresa nova:** o e-mail traz um snippet de `data.js` pronto (logo via Simple Icons, cor placeholder, régua no grupo sugerido). Aplique o snippet + suba o `?v=` do `index.html` **antes** de aprovar a linha.

## Rodar local (debug)
```bash
node automation/prepare.mjs                 # lê a planilha pública, gera _work/prompt.md
# (preencha _work/candidates.json à mão para testar o publish)
DRY_RUN=true node automation/publish.mjs    # valida e imprime, sem POST
```
