# Panorama Global da IA Generativa

Linha do tempo interativa dos lançamentos de modelos de Inteligência Artificial generativa desde o lançamento do ChatGPT (30 de novembro de 2022). Organiza os principais modelos e ferramentas em três grupos — **Ecossistema Norte-Americano** (berço do ChatGPT; modelos majoritariamente fechados, com origem nos EUA), **Ecossistema Chinês** (forte aposta em código aberto) e **Outros Países** (laboratórios de fronteira fora dos eixos EUA–China, como Japão e França).

Iniciativa do **Laboratório de Processamento de Imagens e Geoinformação — LAPIG / IESA / UFG**.

---

## 🚀 Demonstração

Acesse a versão pública em: **https://lapig-ufg.github.io/app-panorama-global-da-ia-generativa/**

---

## 🏗 Arquitetura & automação

Este repositório é **mais do que o site** — são três partes que trabalham juntas:

- **Site** (`index.html` + `assets/`) — a linha do tempo, publicada no **GitHub Pages**. Lê os dados de uma planilha Google Sheets em tempo real (sem novo deploy). Junto dela vão as abas `guia.html` (interativa — os benchmarks caem de `benchmarks.json`, regenerado pelo pipeline), `gratuitos.html` e `como-usar.html` (interativa — duelo navegador × máquina e simulador de terminal).
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
├── como-usar.html          # "Como usar fora do navegador" — IA instalada na máquina (interativa)
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
aba do navegador e instalá-la na máquina, com acesso aos arquivos. A ordem das seções é a
narrativa: **entender → ver a prova → o que sobra → o que você autoriza → instalar →
referência → procedência.**

Antes da seção 01 vem **"Comece por aqui"**: a premissa em duas frases (existem dois jeitos
de usar IA, e este é o que muda), as três conclusões que a medição sustenta, e a procedência
(5 tarefas · 60+ execuções · 3 programas). É a única parte da página escrita para quem
**não** vai ler a página.

> **Regra ao editar este bloco:** cada frase tem de fazer sentido para quem nunca leu o
> resto. A primeira versão abria em *"No navegador, descreva a sua máquina"* e citava
> *"dizer no Ubuntu numa máquina Windows"* — conclusões escritas da cadeira de quem já
> conhece os testes, e portanto frases soltas para qualquer outra pessoa. Nada de
> vocabulário que só existe dentro da medição. Se uma frase precisa de contexto, o contexto
> vem antes dela, não depois.

1. **A diferença, explicada** — abre em texto corrido, para quem nunca instalou nada.
   Explica duas ideias, uma de cada vez: se a IA consegue **olhar** os seus arquivos e se
   ela pode **mexer** neles. Cada uma traz o que foi medido (dizer "no Ubuntu" numa máquina
   Windows leva os dois programas a **zero comandos**; o sistema certo, ou nenhum, leva a
   3–15) e a regra prática que sai dali. Fecha com **"o que você ganha com isso"** — três
   situações concretas e o custo ao lado, porque vantagem sem preço é propaganda.
   A palavra *terminal* é explicada num glossário em linha, na primeira vez que aparece;
   antes ela era usada cem blocos antes de ser definida. A discussão de como **chamar** as
   duas coisas virou a última caixa fechada da seção.
2. **As duas telas, lado a lado** — cinco tarefas, cada uma em **três etapas, uma por
   clique**: a PERGUNTA, o que CADA UM DEVOLVEU (tópicos curtos, desfecho em destaque,
   placar do disco) e só então a EXPLICAÇÃO. A conversa na íntegra é o quarto nível, atrás
   de um botão. Abre com o **diagrama do ciclo** e fecha com o **balanço** do que a medição
   mudou na própria página e a contra-seção **"onde a aba ganha"**.

   > O quinto exemplo — a série de 244 imagens — é honestamente diferente e a tela diz isso:
   > as duas colunas são **duas formas de pedir**, não navegador × instalado. Não havia
   > conversa de navegador equivalente, e ele não tem transcrição por execução (só o
   > agregado das 20). O validador exige que uma cena sem transcrição **declare o motivo**
   > em texto que vai para a tela.
3. **O que fica depois** — o segundo eixo: `git log` como registro, a estrutura de pastas
   como metade da documentação, o `AGENTS.md` como a única memória que sobrevive ao fim da
   conversa, e a reprodutibilidade.
4. **Antes de instalar: o que você está autorizando** — sete regras. Vem **antes** do
   tutorial de propósito; estava depois, o que é a ordem errada. Duas regras vieram de
   coisas medidas: *confira o resultado, não o relatório* (ele disse "0 erros" e o disco
   tinha 57 abas a menos) e *diga a pasta* (sem âncora, um programa reorganizou 154
   arquivos reais do OneDrive de quem testava).
5. **Instalar, passo a passo** — dois tutoriais no simulador de área de trabalho, cada um
   com **objetivo declarado** e **três atos**: Ollama Cloud + `ollama launch` e
   **Antigravity CLI** (o `agy`, que é o programa medido na seção 02 — não o aplicativo de
   janela). O do Antigravity termina no achado da própria medição: o mesmo comando com e
   sem `--add-dir`, e as duas saídas lado a lado.
6. **O catálogo** — três famílias, **fechadas por padrão**, com os nomes numa linha só no
   resumo. Sozinho ele era 27% das palavras visíveis da página e não é leitura: é
   referência. O **cinto de ferramentas** (o que a IA pode fazer na máquina) era uma seção
   inteira entre o argumento e o tutorial; virou caixa fechada aqui. Fecha com **a ponte**:
   o quadro do `ollama launch`, com as 18 integrações e os planos do Ollama Cloud.
7. **Como isto foi medido** — o método em três passos, a lista do que **não** foi medido, e
   a caixa com as três conclusões que estavam erradas e como foram descobertas.

### Regras de manutenção

- **Todo comando publicado foi rodado antes.** As transcrições assumem bash/GNU coreutils
  (Linux); onde o comportamento muda no macOS ou no Windows, isso está dito na própria
  transcrição, e não num rodapé. Ao editar um comando, rode-o antes de commitar.
- **Prosa aceita crases e asteriscos** (`` `mv -n` ``, `**assim**`) e o renderizador os
  converte em `<code>` e `<strong>` — a conversão acontece depois do escape de HTML. Por isso
  **não escreva tags HTML nesses campos**: elas aparecem escritas na tela. Os campos que
  aceitam HTML de verdade são outros — `tese`, `licao`, `lede`, `fecho` — e vão para a página
  crus, de propósito.
- **Os artefatos da seção 03 são conteúdo literal.** As crases dentro do bloco `AGENTS.md` são
  o texto do arquivo, não marcação: o renderizador não as toca (ver `.cu-art`). Se elas
  virarem `<code>`, o exemplo deixa de mostrar como o arquivo é de verdade.
- **O simulador nunca é o único caminho.** Os mesmos passos saem em texto corrido dentro do
  `<details>` "Ver os tutoriais como texto", para leitor de tela, celular e copiar-colar.
  Se você acrescentar um passo, ele aparece nos dois lugares automaticamente. Há quatro tipos
  de janela — `terminal`, `navegador`, `dialogo` e `diff` —, declarados no campo `janela` de
  cada passo.

### Como o simulador funciona por dentro

A pessoa **digita os comandos de verdade**. Três peças sustentam isso, e mexer numa sem
olhar as outras quebra o conjunto:

- **A linha viva** (`linhaViva`) é um `<input>` real com `color: transparent`, sobreposto a
  um "espelho" (`atualizarEspelho`) que redesenha o texto em três faixas: o prefixo que bate
  com o comando esperado, o trecho que divergiu, e o resto do comando em cinza à frente do
  cursor — a sugestão que permite digitar um `curl -fsSL …` sem decorar. **Input e espelho
  precisam ter fonte, tamanho e espaçamento idênticos**, senão o cursor descola do caractere.
- **Errar é parte do roteiro.** `submeter()` responde como um shell responderia
  (`bash: <cmd>: command not found`) e insere a tentativa **antes** da linha viva — não na
  área de saída. Se inserir depois, o comando certo aparece no histórico antes do erro que
  veio primeiro, e a sessão conta a história ao contrário.
- **O balão** (`pintarBalao`) é o guia dentro da cena, ancorado ao que explica. Ele adiciona
  `cu-guia-esq`/`cu-guia-dir` à tela, e é o CSS dessas classes que faz a **janela recuar**
  para o lado oposto. No celular o balão vira faixa no rodapé e a tela **cresce** em vez de
  espremer a janela: `medirBalao()` publica a altura em `--cu-balao-h` a cada passo, e a
  regra que consome essa variável mora **no fim do `como-usar.css`** de propósito — os blocos
  responsivos anteriores escrevem `padding` no atalho e apagariam um `padding-bottom`
  declarado antes deles.

Três superfícies disparam as mesmas ações (`acao()`): o balão, os botões simulados dentro das
janelas (`.cu-alvo`) e o painel abaixo da moldura. O painel é o caminho de teclado e de leitor
de tela — não o elimine ao mexer no balão.
- **Meça o peso antes de acrescentar conteúdo, e meça certo.** A página tem ~5.000 palavras
  visíveis (≈25 min) e ~23 telas em 390px. O catálogo era a maior fatia e agora abre fechado
  em **todas** as larguras (`colapsarCatalogo`), com os nomes das ferramentas no resumo —
  antes isso valia só no celular, e era no computador que ele mais atrapalhava a leitura.

  > **Armadilha de medição:** dentro de um `<details>` fechado o Chromium **não** aplica
  > `display: none`, então `offsetParent` continua resolvendo e um contador baseado nele
  > soma o texto escondido — foi assim que eu cheguei a "43 minutos" quando eram 25. Meça
  > com `innerText`, que respeita o `<details>`. E não some `querySelectorAll('p, li, dd')`
  > ingenuamente: um `<p>` dentro de um `<li>` entra duas vezes.
- **Instaladores e planos** foram conferidos nas páginas oficiais (última checagem em
  `updatedAt`). Revalide antes de citar cotas — elas mudam com frequência.
- **As duas colunas do duelo são captura, e o validador é quem garante isso.** Em
  `assets/como-usar-cenas.js`, todo bloco `voce`, `ia`, `sandbox`, `chips` e `cmd` é trecho
  LITERAL — falas contra a transcrição, comandos contra a lista de comandos. `node
  automation/valida-cenas.mjs` **falha** se qualquer um divergir; rode antes de commitar. Ele
  já pegou duas citações minhas copiadas do resumo em vez do original.

  Os blocos `marca` são a única voz do site ali dentro, e a tela os desenha diferente por
  isso. Capturas de OUTRAS execuções (`fontes.extras`) ficam num palheiro separado e só podem
  aparecer em `saibaMais`, dizendo no texto que vieram de outra execução — senão a página
  passa a misturar o conjunto final com rodadas que a auditoria retificou.

- **O placar não vem da conversa.** Os números de `cena.placar` saem de
  `conferir.py --avaliar`, que conta arquivos no disco depois que o programa termina. Se
  algum dia o relatório da IA e o disco discordarem, a página publica o disco — é literalmente
  o que a seção 07 manda o leitor fazer.
- **Como a página mede os dois lados.** Existe um pipeline de medição, e ele é o que
  separa esta aba de um texto de opinião:

  | passo | onde | o que faz |
  |---|---|---|
  | 1 | [`automation/CAPTURA-GEMINI.md`](automation/CAPTURA-GEMINI.md) | briefing das 5 conversas no chat do navegador. **Feito** → `capturas/gemini-2026-09-09.json` |
  | 2 | [`automation/cenario-teste/`](automation/cenario-teste/README.md) | gera a pasta com as armadilhas reais e **pontua** o programa pelo disco |
  | 3 | [`automation/CAPTURA-ANTIGRAVITY.md`](automation/CAPTURA-ANTIGRAVITY.md) | briefing das mesmas tarefas dentro do programa instalado. **Feito** → `capturas/*-forma-agente.json` |
  | 4 | `automation/valida-cenas.mjs` | impede que uma citação da página divirja da captura |

  **Comece por [`capturas/MATERIAL-PARA-A-ABA.md`](automation/capturas/MATERIAL-PARA-A-ABA.md).**
  Ele traz os oito achados em ordem de solidez, com a evidência de cada um, como escrever
  para iniciante e — a parte que mais importa — **o que não afirmar**. O índice de
  procedência está em `capturas/2026-09-10-leia-me.md`: ele diz quais arquivos servem para
  tirar número e quais não servem. Os JSON afetados por artefato de teste têm um bloco
  `RETIFICACAO` no topo em vez de terem sido reescritos; leia-o antes de citar qualquer
  número daquele arquivo.

  Os dois briefings foram escritos para serem executados por uma IA, não só por uma
  pessoa: trazem as regras de não-condução, as respostas condicionais em tabela e a
  condição de parada. Um executor prestativo estraga a medição sem perceber, e essa é a
  falha que os dois documentos existem para evitar.

  As saídas são validadas por `capturas/schema.json` (chat) e
  `capturas/schema-antigravity.json` (programa instalado). Ao incorporar qualquer captura,
  **preserve a distinção entre o que foi medido e o que foi julgado** — campo preenchido por
  opinião do executor precisa dizer isso, ou vira número na página de alguém.
- **A lista do `ollama launch` cresce a cada versão do Ollama.** A tabela em `ponte.integracoes`
  é uma cópia verbatim do `ollama launch --help` (nomes, aliases e descrições vêm de
  `cmd/launch/registry.go` no repositório do Ollama). O texto ao lado dela manda o leitor rodar
  o comando sem argumento para ver a lista da versão dele — mantenha esse aviso ao atualizar,
  porque é o que impede a tabela de envelhecer virando mentira.
- **As cores do gráfico e do diagrama foram validadas, não escolhidas a olho.** O par é
  `#5B53A8` (a aba) e `#10a37f` (o terminal), e ele passa os seis testes do validador de
  paleta. O par "natural" — o cinza quente `--ink-muted` contra o verde `--accent` — foi
  **reprovado**: ΔE 1,9 em protanopia, ou seja, indistinguível para parte dos leitores.
  Ao mexer nessas cores, rode o validador de novo em vez de confiar no olho. As mesmas duas
  cores marcam a etiqueta de cada coluna da comparação, a seta de volta de cada diagrama e as
  duas marcas do gráfico — se uma mudar, mudam as três.
- **O gráfico mostra uma derrota de propósito.** Na linha das planilhas o terminal é mais
  lento. Não "corrija" isso: é o dado que impede a figura de virar propaganda, e a nota ao
  lado dela existe para explicar por que a derrota é o caso mais forte da página.
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
