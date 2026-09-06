# Panorama Global da IA Generativa

Linha do tempo interativa dos lançamentos de modelos de Inteligência Artificial generativa desde o lançamento do ChatGPT (30 de novembro de 2022). Organiza os principais modelos e ferramentas em três grupos — **Ecossistema Norte-Americano** (berço do ChatGPT; modelos majoritariamente fechados, com origem nos EUA), **Ecossistema Chinês** (forte aposta em código aberto) e **Outros Países** (laboratórios de fronteira fora dos eixos EUA–China, como Japão e França).

Iniciativa do **Laboratório de Processamento de Imagens e Geoinformação — LAPIG / IESA / UFG**.

---

## 🚀 Demonstração

Acesse a versão pública em: **https://lapig-ufg.github.io/app-panorama-global-da-ia-generativa/**

---

## 🏗 Arquitetura & automação

Este repositório é **mais do que o site** — são três partes que trabalham juntas:

- **Site** (`index.html` + `assets/`) — a linha do tempo, publicada no **GitHub Pages**. Lê os dados de uma planilha Google Sheets em tempo real (sem novo deploy). Junto dela vão três abas estáticas: `guia.html`, `gratuitos.html` e `como-usar.html`.
- **Automação semanal** (`automation/` + `.github/workflows/auto-update.yml`) — um **cron do GitHub Actions** roda toda segunda: o Claude pesquisa lançamentos recentes na web e grava candidatos numa aba de **rascunho** (`Pendentes`) da planilha.
- **PWA de curadoria** (`admin/`) — app instalável onde você **aprova/rejeita** os candidatos. **Só o que você aprova vai ao ar** — nada é publicado automaticamente.

A ideia por trás da automação: um LLM pesquisa a web (rápido, mas falível), um script
determinístico valida tudo mecanicamente (lento de pensar, mas implacável), e nenhuma
linha chega ao público sem aprovação humana. Ver o porquê completo em
[ARQUITETURA.md § 0](ARQUITETURA.md#0-o-problema-e-a-filosofia-do-sistema).

Há ainda um **quarto subsistema, independente**: o cron de **benchmarks** busca dados da
Artificial Analysis, grava `assets/benchmarks.json` e alimenta a página **"Qual modelo usar"**
(`guia.html`). Esse **auto-publica** (sem a trava de curadoria) — documentado à parte em
[automation/BENCHMARKS.md](automation/BENCHMARKS.md).

📖 **Como tudo funciona em detalhe (inclusive como roda no GitHub e por quê): [ARQUITETURA.md](ARQUITETURA.md).**
Docs específicas: [automation/README.md](automation/README.md) (pipeline de lançamentos) · [automation/BENCHMARKS.md](automation/BENCHMARKS.md) (benchmarks + guia) · [admin/README.md](admin/README.md) (PWA).

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
├── index.html              # Página principal do site (timeline)
├── guia.html               # "Qual modelo usar" — rankings de benchmarks (interativa)
├── gratuitos.html          # Catálogo de IAs gratuitas
├── como-usar.html          # "Como usar fora do navegador" — IA no terminal (interativa)
├── assets/
│   ├── styles.css          # Estilos da timeline
│   ├── data.js             # Logos, bandeiras, cores, grupos, aliases + SHEET_ID
│   ├── render.js           # Lógica de construção do SVG (timeline)
│   ├── app.js              # Carregamento de dados, tooltip, drag, exportação
│   ├── benchmarks.json     # Dados da Artificial Analysis (gerado pelo cron)
│   ├── guia.js / guia.css  # Página "Qual modelo usar" (abas, ordenação, comparação)
│   ├── gratuitos.*         # Página de IAs gratuitas
│   └── como-usar.*         # Página "Como usar fora do navegador" (dados, lógica, estilos)
├── admin/                  # PWA de curadoria (aprovar/rejeitar pendentes)
├── automation/             # Pipelines: lançamentos (prepare/publish) + benchmarks (update-benchmarks.mjs)
│   ├── README.md           # Pipeline de lançamentos
│   └── BENCHMARKS.md       # Pipeline de benchmarks + página "Qual modelo usar"
├── .github/workflows/      # auto-update.yml (lançamentos) · update-benchmarks.yml (benchmarks)
├── .nojekyll               # Desabilita o Jekyll no GitHub Pages
├── ARQUITETURA.md          # Como o sistema de lançamentos funciona (comece por aqui)
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
| F      | `status`          | Texto     | **`publicado`** = marco, aparece sempre. **`secundario`** = só na *régua ampliada*. Qualquer outro valor: oculta. |
| G      | `tipo`            | Texto     | Categoria (ex.: `modelo`). Informativo — não afeta a renderização.         |
| H      | `dias`            | Número    | Deixe **vazia** — o JS calcula sozinho a partir de 30/nov/2022.            |
| I      | `origem`          | Texto     | `manual` ou `auto` (preenchido pela automação). Informativo.               |
| J      | `timestamp`       | Data/hora | Quando a linha foi criada. Informativo.                                    |
| K      | `data_atualizacao`| Data      | (Opcional) Data da última edição da linha — usada no rodapé do header      |
| L      | `grupo`           | Texto     | (Automação) Grupo sugerido p/ empresa **desconhecida**: `ECOSSISTEMA NORTE-AMERICANO`, `ECOSSISTEMA CHINÊS` ou `OUTROS PAÍSES`. Roteia o lançamento p/ a régua "Outros" desse grupo. |
| M      | `pais`            | Texto     | (Automação) País de origem da empresa. Informativo.                        |

### Empresas suportadas

`OpenAI`, `Anthropic`, `Google`, `Microsoft`, `IBM`, `Meta`, `xAI`, `NVIDIA`, `Cursor`, `OpenClaw`, `Sakana AI`, `Mistral`, `Baidu`, `Alibaba`, `DeepSeek`, `MiniMax`, `Moonshot AI`, `Zhipu AI`, `Xiaomi`.

Empresas **fora** dessa lista não somem da timeline: o lançamento aparece (em cinza, com a inicial da empresa no lugar do logo) na régua **"Outros"** do grupo indicado na coluna `grupo` da planilha — ou em **Outros Países › Outros** quando a coluna está vazia.

Para adicionar uma nova empresa com identidade própria, edite `assets/data.js`:
- Adicione cor em `COMPANY_COLORS`
- Adicione mapeamento de logo em `LOGO_MAP` e o path SVG em `LOGO_PATHS`
- Inclua a empresa em uma das tracks de `LAYOUT_GROUPS`
- Cadastre o país em `CREATOR_COUNTRY` (é o que posiciona a empresa na **régua ampliada**)

### Régua ampliada

O botão **"Régua ampliada"** troca o recorte da timeline sem sair da página. Além dos
marcos, ela desenha — em pílulas compactas tracejadas — os lançamentos `secundario` da
planilha e o catálogo completo da Artificial Analysis (`assets/catalogo.json`, ~420 modelos
com data de estreia, gerado pelo cron de benchmarks). A distinção entre curadoria humana e
censo automático aparece na pílula, na legenda do SVG, no tooltip e nas colunas
`Nível`/`Fonte` do CSV. Detalhes em [ARQUITETURA.md §15](ARQUITETURA.md).

---

## 🖥 A aba "Como usar fora do navegador"

Página **estática e autocontida** (`como-usar.html` + `assets/como-usar*.js|css`): não lê
planilha, não depende de cron e não tem pipeline. Todo o conteúdo mora em
`assets/como-usar-data.js` — é o único arquivo a editar para atualizar a aba.

Ela responde ao "como" que faltava no painel: a diferença entre conversar com a IA numa
aba do navegador e dar a ela acesso ao terminal da máquina. Seis seções (a 05 termina com um
bloco extra, "a ponte"):

1. **O nome disso** — por que "navegador × computador" é um par de nomes errado (o navegador
   está no computador) e cinco pares candidatos em julgamento, com uma proposta marcada.
2. **A diferença, em comandos** — cinco tarefas de laboratório resolvidas dos dois jeitos,
   lado a lado, com os comandos que o agente realmente digita e o custo de cada caminho.
3. **O cinto de ferramentas** — Bash, ler, escrever, buscar, rodar código, web, MCP.
4. **Instalar, passo a passo** — um simulador de área de trabalho estilo anos 2000 com dois
   tutoriais interativos: **Ollama Cloud + `ollama launch`** (assinar, rodar um modelo grande
   sem baixar nada e usá-lo para dirigir Claude Code, Pi ou OpenCode) e **Antigravity**.
5. **O catálogo** — três famílias: harnesses de terminal (Claude Code, Codex CLI, OpenCode,
   Pi, Gemini CLI), aplicativos de desktop (Claude Desktop, ChatGPT Desktop, Antigravity) e
   motores (Ollama local e na nuvem, LM Studio, llama.cpp). Fecha com **a ponte**: o quadro do
   `ollama launch`, com as 18 integrações que ele conhece e os planos do Ollama Cloud.
6. **O que você está autorizando** — as seis regras de segurança ao dar mãos a um agente.

### Regras de manutenção

- **Todo comando publicado foi rodado antes.** As transcrições assumem bash/GNU coreutils
  (Linux); onde o comportamento muda no macOS ou no Windows, isso está dito na própria
  transcrição, e não num rodapé. Ao editar um comando, rode-o antes de commitar.
- **Prosa aceita crases** (`` `mv -n` ``) e o renderizador as converte em `<code>` — a
  conversão acontece depois do escape de HTML.
- **O simulador nunca é o único caminho.** Os mesmos passos saem em texto corrido dentro do
  `<details>` "Ver os tutoriais como texto", para leitor de tela, celular e copiar-colar.
  Se você acrescentar um passo, ele aparece nos dois lugares automaticamente.
- **Instaladores e planos** foram conferidos nas páginas oficiais (última checagem em
  `updatedAt`). Revalide antes de citar cotas — elas mudam com frequência.
- **A lista do `ollama launch` cresce a cada versão do Ollama.** A tabela em `ponte.integracoes`
  é uma cópia verbatim do `ollama launch --help` (nomes, aliases e descrições vêm de
  `cmd/launch/registry.go` no repositório do Ollama). O texto ao lado dela manda o leitor rodar
  o comando sem argumento para ver a lista da versão dele — mantenha esse aviso ao atualizar,
  porque é o que impede a tabela de envelhecer virando mentira.
- **Cuidado com o sufixo dos modelos.** `gemma4:cloud` e `gpt-oss:120b-cloud` rodam no servidor
  da Ollama; `qwen3.5:4b` roda no disco de quem executou. Mesmo comando, mesma porta 11434,
  destinos opostos — é o exemplo que a seção 01 usa e a regra 06 repete. Não misture os dois em
  exemplos sobre dado sensível.

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
- Google Apps Script para manipulação dos dados
- Google Fonts (Inter + DM Mono)

---

## 📄 Licença

Este projeto é distribuído sob a licença **Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)**.

Você é livre para compartilhar e adaptar o material, desde que dê o crédito apropriado ao **LAPIG / IESA / UFG**.

Veja [LICENSE](LICENSE) para o texto completo.

---
