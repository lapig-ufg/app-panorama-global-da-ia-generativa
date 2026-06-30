# Curadoria — PWA de aprovação de pendentes

App estático (PWA instalável) para **aprovar/rejeitar** os lançamentos que o pipeline
automático deixa na aba `Pendentes`, sem depender do e-mail/checkbox.

Publicado pelo GitHub Pages em:
`https://lapig-ufg.github.io/app-panorama-global-da-ia-generativa/admin/`

## Como funciona
- **Lê** os pendentes direto da planilha via gviz/JSONP (mesmo método do site; leitura é pública).
- **Aprovar** → POST ao Apps Script (`action:'aprovar'`) → promove a linha para `Lancamentos`
  como `publicado` e remove de `Pendentes`. **Vai ao ar no site** (cache de algumas horas).
- **Rejeitar** → POST (`action:'rejeitar'`) → remove de `Pendentes`. Não toca em `Lancamentos`.
- Pega `CONFIG.SHEET_ID` e a lista de empresas conhecidas (`COMPANY_COLORS`) de
  `../assets/data.js`, então **marca "EMPRESA NOVA"** quando a empresa ainda não existe no
  `data.js` (lembrando de aplicar o snippet de logo/cor/grupo + subir o `?v=` antes de aprovar).

## Autenticação
- A escrita é protegida por um **token** (o mesmo `SECRET` do Apps Script / `APPS_SCRIPT_TOKEN`
  do GitHub). Você cola uma vez no app; fica salvo no `localStorage` deste aparelho.
- O token **não** está no código (não vaza no repo). Cópia de referência fora do repo:
  `../../CURADORIA-token.txt`.
- A leitura (lista de pendentes) é pública, como o resto da planilha. A página tem `noindex`.

## Arquivos
- `index.html` — app (shell + lógica). A URL do Apps Script está hardcoded aqui (não é segredo;
  o que protege é o token). Se o web app for reimplantado com **nova** URL, atualize-a aqui.
- `manifest.json`, `sw.js`, `icon.svg` — PWA (instalável; o SW cacheia só o shell, dados são sempre rede).

## Instalar no celular
Abra a URL no Chrome/Safari → menu → "Adicionar à tela inicial". Abre em tela cheia como app.
