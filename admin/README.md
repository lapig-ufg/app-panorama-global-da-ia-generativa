# Curadoria — PWA de aprovação de pendentes

App estático (PWA instalável) para **aprovar/rejeitar** os lançamentos que o pipeline
automático deixa na aba `Pendentes`, sem depender do e-mail/checkbox. Também dispara a
pesquisa de lançamentos manualmente.

Publicado pelo GitHub Pages em:
`https://lapig-ufg.github.io/app-panorama-global-da-ia-generativa/admin/`

## Como funciona
- **Lê** os pendentes ao vivo do web app do Apps Script (`GET ?action=listar`) via
  `fetch` CORS — o Apps Script responde com `Access-Control-Allow-Origin: *`, então o
  navegador lê o JSON direto, **sem cache do gviz** (que causava o "pendente reaparece ao
  recarregar"). A leitura é pública (os `Pendentes` já eram legíveis via gviz; `listar` não
  vaza nada novo).
- **Aprovar** → `POST` ao Apps Script (`action:'aprovar'`) → promove a linha para
  `Lancamentos` como `publicado` e remove de `Pendentes`. **Vai ao ar no site** (cache do
  site é de algumas horas).
- **Rejeitar** → `POST` (`action:'rejeitar'`) → remove de `Pendentes`. Não toca em `Lancamentos`.
- **Confirmação confiável:** o POST do Apps Script responde por um redirect entre domínios
  do Google que o navegador muitas vezes não consegue ler (o `fetch` pode ficar pendurado).
  Por isso a PWA **não confia na resposta do POST** — depois de aprovar/rejeitar ela re-ler o
  `listar` (ao vivo) e **só remove o card quando a linha realmente saiu de `Pendentes`**.
  Se não sair a tempo, o card fica e mostra "Não confirmado ainda (processando?). Recarregue
  e tente de novo."
- **Buscar novos lançamentos** (botão 🔍) → `POST` (`action:'rodar'`) → o Apps Script dispara a
  workflow `auto-update.yml` do GitHub Actions via API (PAT em Script Properties, **nunca na
  PWA**). Em alguns minutos chegam e-mail + novos pendentes (dê ↻ daqui a pouco).
- **Diagnóstico** (botão ⏱ no header) → `GET ?action=ping` → mostra a latência real do web app
  (rede vs. script) e quantas linhas há em `Pendentes`. Teste sem efeito colateral.
- Pega `CONFIG.SHEET_ID` e a lista de empresas conhecidas (`COMPANY_COLORS`) de
  `../assets/data.js`, então **marca "EMPRESA NOVA"** quando a empresa ainda não existe no
  `data.js` (lembrando de aplicar o snippet de logo/cor/grupo + subir o `?v=` antes de aprovar).

## Autenticação
- A **escrita** (aprovar/rejeitar/disparar pesquisa) é protegida por um **token** (o mesmo
  `SECRET` do Apps Script / `APPS_SCRIPT_TOKEN` do GitHub). Você cola uma vez no app; fica
  salvo no `localStorage` deste aparelho.
- O token **não** está no código (não vaza no repo). Cópia de referência fora do repo:
  `../../CURADORIA-token.txt`.
- A **leitura** (lista de pendentes) é pública, como o resto da planilha. A página tem `noindex`.

## Arquivos
- `index.html` — app (shell + lógica). A URL do Apps Script está hardcoded aqui (não é segredo;
  o que protege é o token). Se o web app for reimplantado com **nova** URL, atualize-a aqui.
- `manifest.json`, `sw.js`, `icon.svg` — PWA (instalável; o SW cacheia só o shell, dados e
  ações são sempre rede — `cache: "no-store"` e bypass cross-origin). O `sw.js` tem versão de
  cache (`curadoria-ia-vN`); ao mudar o shell, bump no `N` para o navegador descartar o cache velho.

## Instalar no celular
Abra a URL no Chrome/Safari → menu → "Adicionar à tela inicial". Abre em tela cheia como app.