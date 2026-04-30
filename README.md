# Panorama Global da IA Generativa

Linha do tempo interativa dos lançamentos de modelos de Inteligência Artificial generativa desde o lançamento do ChatGPT (30 de novembro de 2022). Organiza os principais modelos e ferramentas em três grupos — **OpenAI** (pioneira), **Ecossistema Ocidental** (modelos majoritariamente fechados, com origem nos EUA) e **Ecossistema Chinês** (forte aposta em código aberto).

Iniciativa do **Laboratório de Processamento de Imagens e Geoinformação — LAPIG / IESA / UFG**.

---

## 🚀 Demonstração

Acesse a versão pública em: `https://<usuário>.github.io/<repositório>/`

(substitua pelo endereço final no GitHub Pages do LAPIG após a publicação)

---

## 📋 Características

- **Timeline horizontal** com escala temporal proporcional ao número de dias desde o marco zero
- **Swimlanes regionais** com cores distintas e identidade visual por empresa
- **Atualização contínua** via planilha Google Sheets pública (sem necessidade de novo deploy)
- **Cache local** via `sessionStorage` para carregamento instantâneo após primeira visita
- **Linha do dia atual** indicando o "agora" no contexto temporal
- **Exportação em PNG (HD 2×) e SVG** vetorial para publicações
- **Tooltip detalhado** com data, empresa, descrição de impacto e link para a fonte original
- **Acessibilidade**: navegação por teclado, ARIA labels, suporte a `prefers-reduced-motion`
- **Responsivo** com adaptações para telas móveis
- **Zero dependências em runtime** (apenas Google Fonts via CDN)

---

## 🗂 Estrutura do projeto

```
panorama-llms/
├── index.html              # Página principal (estrutura HTML)
├── assets/
│   ├── styles.css          # Todos os estilos
│   ├── data.js             # Logos, bandeiras, cores, configuração de grupos
│   ├── render.js           # Lógica de construção do SVG (timeline)
│   └── app.js              # Carregamento de dados, tooltip, drag, exportação
├── .nojekyll               # Desabilita o Jekyll no GitHub Pages
├── README.md               # Este arquivo
└── LICENSE                 # CC BY 4.0
```

---

## 📊 Estrutura da planilha de dados

A planilha do Google Sheets deve conter uma aba chamada **`Lancamentos`** com as seguintes colunas (na ordem):

| Coluna | Nome              | Tipo      | Descrição                                                                  |
| ------ | ----------------- | --------- | -------------------------------------------------------------------------- |
| A      | `data`            | Data      | Data de lançamento do modelo (formato ISO ou nativo do Sheets)             |
| B      | `empresa`         | Texto     | Nome da empresa (deve corresponder a uma chave em `COMPANY_COLORS`)        |
| C      | `modelo`          | Texto     | Nome do modelo/produto lançado                                             |
| D      | `impacto`         | Texto     | Breve descrição do impacto (exibida no tooltip)                            |
| E      | `referencia`      | URL       | Link para a fonte oficial ou cobertura de imprensa                         |
| F      | `status`          | Texto     | Use **`publicado`** para que a linha apareça (qualquer outro valor: oculta)|
| K      | `data_atualizacao`| Data      | (Opcional) Data da última edição da linha — usada no rodapé do header     |

### Empresas suportadas

`OpenAI`, `Anthropic`, `Google`, `Meta`, `xAI`, `NVIDIA`, `Cursor`, `OpenClaw`, `Baidu`, `Alibaba`, `DeepSeek`, `MiniMax`, `Moonshot AI`, `Zhipu AI`.

Para adicionar uma nova empresa, edite `assets/data.js`:
- Adicione cor em `COMPANY_COLORS`
- Adicione mapeamento de logo em `LOGO_MAP` e o path SVG em `LOGO_PATHS`
- Inclua a empresa em uma das tracks de `LAYOUT_GROUPS`

---

## 🔧 Configuração

### Trocar a planilha de dados

Em `assets/data.js`, altere o campo `SHEET_ID` em `CONFIG`:

```js
const CONFIG = {
  // ...
  SHEET_ID: 'SEU_ID_AQUI',
  // ...
};
```

A planilha precisa estar **publicada na web** ou com acesso configurado como "Qualquer pessoa com o link pode visualizar".

### Ajustar cache

O cache de sessão dura **6 horas** por padrão. Para alterar:

```js
const CONFIG = {
  // ...
  CACHE_TTL_MS: 6 * 60 * 60 * 1000,  // em milissegundos
};
```

---

## 🌐 Deploy no GitHub Pages

1. Crie um repositório no GitHub (ex: `panorama-llms`)
2. Faça commit/push de todos os arquivos
3. Vá em **Settings → Pages**
4. Em **Source**, selecione **Deploy from a branch**
5. Escolha a branch `main` (ou `master`) e a pasta `/ (root)`
6. Salve. Em poucos minutos o site estará disponível em `https://<usuário>.github.io/<repositório>/`

O arquivo `.nojekyll` na raiz garante que o GitHub Pages não tente processar os arquivos com Jekyll.

---

## ♿ Acessibilidade

- Pílulas com `role="button"` e `aria-label` descritivo
- Navegação por **Tab** entre as pílulas; **Enter** ou **Espaço** abre o tooltip; **Esc** fecha
- Cores com contraste AA para texto secundário
- Suporte a `prefers-reduced-motion`
- Bandeiras com `<title>` para leitores de tela

---

## 🛠 Tecnologias

- HTML, CSS e JavaScript puros (sem frameworks)
- SVG construído programaticamente
- Google Sheets via [gviz/tq](https://developers.google.com/chart/interactive/docs/dev/implementing_data_source) (JSONP)
- Google Fonts (Inter + DM Mono)

---

## 📄 Licença

Este projeto é distribuído sob a licença **Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)**.

Você é livre para compartilhar e adaptar o material, desde que dê o crédito apropriado ao **LAPIG / IESA / UFG**.

Veja [LICENSE](LICENSE) para o texto completo.

