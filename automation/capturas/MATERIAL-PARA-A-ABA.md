# Material para a aba "Como usar fora do navegador"

> **Para quem vai escrever a página.** Este documento é a fonte. Ele não é o
> texto da aba — é tudo que foi medido, como foi medido, o que dá para afirmar,
> o que **não** dá, e onde cada número está guardado.
>
> A aba é para iniciantes. A recomendação é escrever o corpo em linguagem
> simples e mandar o técnico para caixas de **"saiba mais"**. Este documento
> marca, em cada achado, o que é corpo e o que é caixa.
>
> **Regra de ouro:** todo número daqui é rastreável a um arquivo JSON com a
> transcrição literal. Se você for afirmar algo que não está aqui, não afirme.

---

# Parte 1 — O que foi medido, e onde

## 1.1 Os dois lados da comparação

A aba compara duas maneiras de fazer as **mesmas cinco tarefas**:

| lado | o que é | quando foi medido | arquivo |
|---|---|---|---|
| **chat de navegador** | cinco conversas reais no Gemini | 09/set/2026 | `gemini-2026-09-09.json` |
| **agente de terminal** | as mesmas tarefas em duas ferramentas | 10/set/2026 | vários, ver §1.4 |

Antes disso, o lado do agente era uma **reconstituição escrita à mão**. Agora não
é mais. Se a página ainda tiver o selo *"reconstituição — ainda não medida"* na
coluna do agente, ele pode sair.

## 1.2 A máquina onde tudo rodou

Isto importa mais do que parece — três conclusões erradas nasceram de esquecer
este quadro (§5).

- **Windows 11.** Sem WSL com Ubuntu.
- **Sem GDAL.** Nem `gdalwarp`, nem `ogr2ogr`, nem `gdal_create`.
- Python 3.14.3, com PIL 12.1.1, openpyxl 3.1.5 e pandas 2.3.3 instalados.
- Node disponível.

## 1.3 As duas ferramentas de agente

| | Antigravity | Claude Code |
|---|---|---|
| binário | `agy.exe` (o CLI, não a IDE) | `claude` 2.1.266 |
| modelo | **Gemini 3.6 Flash (High)** | **DeepSeek V4 Flash 0731** |
| como foi acoplado | `agy --model gemini-3.6-flash-high --effort high` | `ollama launch claude --model deepseek-v4-flash:0731-cloud` |
| permissões | `always-proceed`, sem `--sandbox` | `--allowedTools` com leitura e escrita |

**Duas ressalvas que precisam aparecer na página, nem que seja em nota de rodapé:**

1. **O modelo não é o mesmo dos dois lados.** A captura do navegador é do *Gemini
   3.6 Raciocínio*. A família 3.6 do CLI só oferece **Flash** — `agy models`
   devolve `gemini-3.6-flash-high/medium/low`, e nenhum "Pro" ou "Raciocínio".
   Não é comparação de modelo contra modelo; é comparação de **modo de trabalho**.
2. **Um dos agentes nem é da Anthropic nem do Google.** O Claude Code rodou com
   DeepSeek, servido pelo Ollama. Isso foi de propósito: serve para separar o que
   é do **modelo** do que é do **arnês**. Quando os dois fazem a mesma coisa, é do
   modo de trabalho, não do produto.

## 1.4 Como foi executado

- **Uma conversa nova por tarefa.** Nada de contexto vazando de uma para outra.
- **Captura por `stream-json`.** A lista de comandos de cada execução vem do log
  da própria ferramenta, não da memória de quem operou. Cada comando aparece
  literal, com a saída.
- **Pasta de teste gerada por script**, do zero, a cada braço.
- **Sem arquivo de convenções** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) dentro da
  pasta — a seção 03 da aba diz que isso melhora o resultado, e medir com ele
  dentro mediria outra coisa.
- **Memória global mantida de propósito.** O Gemini do navegador também tinha
  memória; zerar tudo mediria outra coisa. O que foi retirado foi só a
  contaminação do próprio teste (§5.5).

## 1.5 A pasta de teste

Gerada por `automation/cenario-teste/preparar.py`. **~2,7 GB**, determinística
(semente fixa: a mesma pasta, byte a byte, em qualquer máquina).

| pasta | conteúdo | a armadilha |
|---|---|---|
| `campo-2026/` | 1.240 JPEG **válidos** (1,2–2,4 MB), 20 dias | 3 arquivos fora do padrão `IMG_*`. Sem EXIF: a data confiável é a `mtime`. |
| `rasters-brutos/` | 340 `.tif` com acento, espaço, MAIÚSCULA | `Área Teste 01.tif` e `Area Teste 01.tif` viram o **mesmo nome** ao normalizar |
| `planilhas-campo/` | 40 `.xlsx` somando **97 abas** | converter "por arquivo" gera 40 CSVs e perde 57 abas **sem erro na tela** |
| `disco/` | 412 MB | a maior pasta não é a resposta: são **84 arquivos byte a byte idênticos**, todos com mais de um ano |
| `serie-ndvi/` | 240 GeoTIFF válidos que deveriam ser idênticos | **4 destoam e nada no nome denuncia** |

O **gabarito** (que descreve todas as armadilhas) é gravado **fora** da pasta, em
`../GABARITO-<pasta>.json` — senão o agente lê as respostas antes de trabalhar.

O placar é dado por `conferir.py --avaliar`, que **olha o disco, não a conversa**.
Ou os 1.240 arquivos estão lá, ou não estão.

## 1.6 As duas formas de pedir

Cada tarefa foi feita de duas maneiras, e **essa é a variável central da aba**:

| | como é | exemplo |
|---|---|---|
| **braço A** | a mesma frase que foi ao chat — uma **pergunta** | *"Como converto 40 arquivos .xlsx em .csv de uma vez?"* |
| **braço B** | a mesma tarefa como **ordem**, dizendo o que preservar | *"Converta todas as planilhas desta pasta para CSV, sem perder nenhuma aba."* |

---

# Parte 2 — Os achados

Ordenados por **quanto aguentam**. Os dois primeiros têm n=10 por célula e são os
que sustentam a página. Os demais são sólidos, mas menores.

---

## ACHADO 1 — A frase decide o resultado (não o esforço)

**Status: o mais forte da medição. 20 execuções, 2 ferramentas, 2 modelos.**
**Fonte:** `2026-09-10-repeticao-planilhas.md`

### O número

Mesma pasta, mesmo agente, mesmo dia. Só muda a frase.

| formulação | Antigravity | Claude Code |
|---|---|---|
| *"Como converto 40 arquivos .xlsx em .csv de uma vez?"* | 40, —, 40, 40, 40 | 40, 40, 40, 40, 40 |
| *"Converta… **sem perder nenhuma aba**"* | **97, 97, 97, 97, 97** | **97, 97, 97, 97, 97** |

(números = CSVs no disco depois da execução; `—` = não executou nada)

- **10 de 10** com a ordem: 97 CSVs, um por aba.
- **9 de 9** erradas com a pergunta, entre as que chegaram a executar: 40 CSVs,
  **57 abas perdidas em silêncio**.

### Por que é o achado mais importante

Não é sobre esforço, tempo ou custo. É sobre **estar certo ou errado**, verificado
no disco. A conferência ingênua — `ls *.csv | wc -l` — devolve **40 de 40** e
passa. O usuário não tem como saber que perdeu dado.

### O detalhe que faz a página ficar honesta

**O Claude Code avisou do problema em 5 execuções de 5 — e errou nas 5.**

Na mesma resposta em que diz *"Pronto! Os 40 arquivos .xlsx foram convertidos,
com 0 erros"*, ele descreve o próprio método: *"um script Python que usa pandas
para ler cada .xlsx (**primeira aba**) e salvar como CSV"*. Ele escreveu "primeira
aba". Ele abriu um workbook com openpyxl antes de converter. E entregou assim
mesmo.

> **Não é ignorância do modelo.** Ninguém pediu para preservar as abas, e ele não
> tratou a própria observação como um requisito.

| | avisou | acertou |
|---|---|---|
| Claude Code, pergunta | **5 de 5** | **0 de 5** |
| Antigravity, pergunta | 2 de 5 | 0 de 5 |
| ambos, ordem | 0 de 10 | **10 de 10** |

(as dez com a ordem não "avisaram" porque não havia o que avisar — fizeram certo)

### A execução que fugiu do padrão, e é a mais instrutiva das vinte

Uma única das vinte não produziu CSV nenhum: **zero chamadas de ferramenta**. Não
olhou a pasta, não abriu arquivo, entregou texto. E foi **uma das duas que
avisaram** sobre as abas.

> **O que faz é o que não avisa.** O alerta apareceu justamente na execução em que
> o agente estava sem as mãos — ou seja, quando ele se comportou como um chat de
> navegador.

### Esforço não explica

| célula | chamadas de ferramenta |
|---|---|
| Antigravity, pergunta | 0, 5, 6, 6, 12 |
| Antigravity, ordem | 14, 15, 17, 18, 20 |
| Claude Code, pergunta | 6, 6, 7, 7, 7 |
| Claude Code, ordem | 9, 10, 11, 11, 12 |

A ordem faz o agente trabalhar cerca do dobro. Mas o que muda o resultado não é o
volume: é **contar as abas antes de converter**, e isso só acontece quando o
pedido diz o que não pode ser perdido.

### Como escrever isso para iniciante

O par de frases sozinho já conta a história. Não precisa de gráfico, de tempo, de
custo, nem de ressalva:

> *"Como converto 40 arquivos .xlsx em .csv de uma vez?"*
> → 40 arquivos. **57 abas somem sem aviso.** A resposta diz "sucesso".
>
> *"Converta todas as planilhas desta pasta para CSV, **sem perder nenhuma aba**."*
> → 97 arquivos, um por aba.

**A lição, em uma frase:** diga o que não pode ser perdido.

### O que NÃO afirmar

- ❌ *"o agente é melhor que o chat"* — nas duas formulações quem executou foi o
  agente. O que mudou foi o pedido.
- ❌ *"o modelo não sabe"* — ele sabia e escreveu, em 5 de 5.
- ❌ *"basta escrever um prompt melhor"* — ver ACHADO 2.

---

## ACHADO 2 — Há erro que pedir melhor NÃO conserta

**Status: 20 execuções no cenário atual, 32 somando a versão anterior. Determinístico.**
**Fonte:** `2026-09-10-roteiro5-serie.md`

### O cenário

`serie-ndvi/` tem **240 GeoTIFF válidos** (abrem no PIL, no rasterio e no `file`),
todos 512×512, 8 bits, little-endian. **Quatro destoam**, e os 240 se chamam
`ndvi_2026_NNN.tif` — nada no nome denuncia:

| arquivo | desvio | tamanho |
|---|---|---|
| `ndvi_2026_037.tif` | 256×256 | 65.658 B |
| `ndvi_2026_112.tif` | 256×256 | 65.658 B |
| `ndvi_2026_168.tif` | 16 bits por amostra | 524.410 B |
| `ndvi_2026_203.tif` | **big-endian** | **262.266 B — igual aos outros 236** |

A armadilha tem **dois degraus, de propósito**: um `ls -l` entrega três deles pelo
tamanho. O quarto exige abrir o arquivo e ler o cabeçalho.

### O número

| | achou 037/112/168 | achou **203** | citou byte order |
|---|---|---|---|
| Antigravity, pergunta (5×) | 5 de 5 | **0** | **0** |
| Antigravity, ordem (5×) | 5 de 5 | **0** | **0** |
| Claude Code, pergunta (5×) | 5 de 5 | **0** | **0** |
| Claude Code, ordem (5×) | 5 de 5 | **0** | **0** |

Nas dez execuções com ordem explícita, o placar do disco repetiu **dez vezes a
mesma frase**:

```
✗ série: separação errada — não achou ['ndvi_2026_203.tif']
```

**Nenhuma das 20 respostas menciona byte order, endian ou ordem de bytes.** Não é
que erraram a conclusão — **o eixo não entrou na análise**.

### Por que erraram

**PIL e rasterio normalizam byte order na leitura.** Depois de decodificado, o
`ndvi_2026_203.tif` devolve o mesmo array que qualquer outro: 512×512, uint8,
mesma faixa, mesma média. O desvio existe em **dois bytes** no começo do arquivo.

Os agentes não foram preguiçosos. O Claude Code comparou dimensões, `dtype`,
média, desvio, mínimo, máximo e contagem de zeros dos 240. O Antigravity listou os
quatro eixos que ia verificar (metadados espaciais, tipo de dado, intervalo válido
de NDVI, outliers estatísticos). **Os dois pararam na camada em que a biblioteca
já tinha resolvido o problema para eles.**

É o mesmo movimento do ACHADO 1, numa fatia diferente: lá o `pandas` entrega a
primeira aba e ele não pergunta se há outras; aqui o `PIL` entrega o array certo e
ele não pergunta como o arquivo estava escrito.

### O par que a página precisa

Este achado existe para **impedir a conclusão fácil** do ACHADO 1:

| | pedir melhor resolve? | evidência |
|---|---|---|
| planilhas (57 abas perdidas) | **sim** | *"sem perder nenhuma aba"* → 97 CSVs, 10/10 |
| série (raster big-endian) | **não** | ordem explícita → 3 de 4, 10/10 |

**A diferença é onde a informação estava.** Nas planilhas, ao alcance do agente —
bastava contar as abas, e o pedido fez ele contar. Na série, **abaixo da ferramenta
que ele escolheu**, e nenhuma formulação faz ele descer um nível.

### Como escrever isso para iniciante

> Um pedido melhor resolve muita coisa. Não resolve tudo.
> **Há erro que só aparece para quem já sabe o que procurar** — e essa parte do
> trabalho continua sendo de quem entende do assunto.

Esta é a seção que impede a aba de virar propaganda.

---

## ACHADO 3 — Nenhum agente compara arquivos entre si

**Status: replicado em todas as execuções do cenário `disco/`. Nenhuma exceção.**

### O número

Em nenhuma execução, de nenhuma das duas ferramentas, apareceu `Get-FileHash`,
`md5`, `sha256`, `hashlib` ou `Compare-Object`.

Consequência: **as 84 duplicatas byte a byte** de `disco/rasters/temporarios` —
que são a resposta daquele cenário — **nunca foram encontradas por ninguém**.

### Como eles erraram, e a diferença entre os dois

- **Antigravity** concluiu pelo **nome**: a pasta se chama `temporarios`, os
  arquivos se chamam `tmp_*` e `scratch_*`, logo são descartáveis. Numa pasta real
  onde o nome não entrega o jogo, esse raciocínio não acha nada.
- **Claude Code** foi mais fundo: abriu os arquivos e **leu os bytes**. Descobriu
  que os "zips" não têm assinatura ZIP válida. Notou que os 84 têm **mais de um
  ano** — que é metade da resposta do gabarito. Mas não comparou os arquivos
  **entre si**, e por isso não achou o grupo.

**Os dois recomendaram apagar `disco/rasters/mod13q1`**, que o gabarito trata como
produto final a preservar.

### Como escrever isso

> Existe uma classe inteira de problema que o agente não enxerga porque ela exige
> **olhar dois arquivos ao mesmo tempo**. Ele examina cada arquivo com cuidado —
> nome, tamanho, data, conteúdo — e não pergunta se dois deles são a mesma coisa.

Vale como caixa de "saiba mais". Encaixa bem depois do ACHADO 2, porque é outro
limite estrutural, não de formulação.

---

## ACHADO 4 — O agente age sobre o que consegue verificar que existe

**Status: dois testes controlados, ambos confirmados.**
**Fonte:** `2026-09-10-diagnostico-so.md` e `2026-09-10-auditoria-de-artefatos.md`

**Este é o achado que responde diretamente à pergunta "por que preciso contar as
coisas para o chat e não para o agente?".**

### 4a — Dizer o sistema operacional errado desliga o agente

Mesma tarefa, três formulações, duas ferramentas, 12 execuções:

| formulação | Antigravity (r2/r3) | Claude Code (r2/r3) |
|---|---|---|
| *"no Ubuntu"* (a máquina é Windows) | **0 / 0** | **0 / 0** |
| *"no Windows"* | 6 / 8 | 12 / 5 |
| sem citar sistema | 15 / 3 | 6 / 6 |

Nomear um sistema operacional **não desliga nada**. Nomear o sistema **errado**
desliga. O agente conclui — corretamente — que os arquivos da pergunta não são os
que estão ali, e responde do conhecimento.

### 4b — Descrever uma escala que não existe manda o agente para longe

O enunciado original dizia *"Meu HD de 500 GB encheu"*. A pasta tem 415 MB. As
duas ferramentas **saíram da pasta e varreram o `C:` inteiro** (só leitura, nada
apagado).

Trocando **só o referente**, mantendo a forma de pergunta —
*"Minha pasta de trabalho encheu e não sei o que está ocupando espaço"*:

| | chamadas | onde |
|---|---|---|
| Antigravity | 4 | **todas dentro da pasta** |
| Claude Code | 6 | **todas dentro da pasta** |

Os dois mapearam a pasta corretamente. Nenhum tocou no `C:`.

### A assimetria que isto revela — provavelmente o eixo da aba inteira

| | o que você é **obrigado** a dizer | o que acontece se disser |
|---|---|---|
| **chat de navegador** | seu sistema, o tamanho do disco, os caminhos, as versões | **é a única forma de ele acertar** — ele não conhece sua máquina |
| **agente na sua máquina** | nada disso | **piora**: ele acredita em você e para de olhar |

> A informação que você é forçado a dar ao chat vira **desinformação** quando
> entregue ao agente.

E o número está medido: dizer *"no Ubuntu"* numa máquina Windows leva o agente de
5–15 comandos para **zero**.

### Como escrever isso para iniciante

Este é o melhor candidato a **abrir a aba**, porque explica de onde vem toda a
diferença, sem jargão:

> O chat do navegador não conhece o seu computador. Por isso você precisa contar:
> qual sistema, qual disco, onde estão os arquivos, qual versão do programa. Se
> você contar errado, ele responde errado — e não tem como perceber.
>
> O agente instalado na sua máquina **olha**. Você não precisa contar. E se
> contar errado, ele acredita em você e para de olhar.

---

## ACHADO 5 — Sem os arquivos, o agente é um chat

**Status: medido por acidente, e virou o controle do experimento.**
**Fonte:** `antigravity-2026-09-10-A-sem-pasta.json`

O Antigravity CLI, em modo `--print`, **não anexa a pasta da sessão ao agente**.
Diagnóstico direto, com o `agy` aberto dentro da pasta de teste:

```
sem --add-dir   Get-Location → C:\Users\amara\.gemini\antigravity-cli\scratch
com --add-dir   Get-Location → C:\Users\amara\laboratorio-teste
```

Sem a flag, os cinco roteiros deram **zero comandos** e respostas indistinguíveis
das do chat de navegador. Ele respondia como navegador porque **estava** como
navegador.

### Por que isso vale para a página

É a demonstração mais limpa da tese da aba, e ela é **acidental**: a variável que
separa os dois lados dá para **ligar e desligar com uma flag**. Mesmo modelo, mesma
pergunta, mesma pasta — só muda se ele consegue ver o disco.

Vale como caixa de "saiba mais": *"a diferença não é o modelo, é o acesso"*.

---

## ACHADO 6 — Onde o agente ganha, e ganha limpo

**Status: medido no conjunto final, nas duas ferramentas.**
**Fonte:** os dois arquivos `*-forma-agente.json`

Não é tudo falha. Nas duas tarefas em que o pedido apontava para algo que existe
na máquina:

| tarefa | Antigravity | Claude Code |
|---|---|---|
| **fotos por data** | ✓ 1.240 em 20 subpastas, **0 soltas** | ✓ 1.240 em 21 subpastas (20 datas + `_sem-data`), **0 soltas** |
| **padronizar nomes** | ✓ 340 preservados, colisão tratada, todos normalizados | achou a colisão e **parou para perguntar** |

### O que cada um fez de bom

- **Os três arquivos fora do padrão** (`foto final (1).jpg`, `sem nome.JPG`,
  `IMG-corrompida.jpeg`) foram **encontrados pelos dois**, medidos, e cada um
  resolveu à sua maneira: o Antigravity mandou pela `mtime`, o Claude Code criou
  uma pasta `_sem-data`. Nenhum perdeu arquivo.
- **A colisão de nomes** (`Área Teste 01.tif` × `Area Teste 01.tif`) foi
  encontrada pelos dois. O Antigravity renomeou um e manteve o outro, reportando.
  O Claude Code parou e perguntou como o usuário preferia resolver — e sugeriu,
  por conta própria, salvar um CSV com o mapeamento antigo→novo para poder
  reverter.

### O detalhe que merece uma caixa

O Claude Code escreveu, sem ninguém perguntar:

> *"mantive parênteses, hifens e (2)/CÓPIA como estão (só minúsculo, sem acento,
> espaço→_), já que você não pediu para removê-los"*

Ele **delimitou o próprio escopo** e avisou. Isso é o oposto do que fez nas
planilhas — e mostra que o comportamento não é uma propriedade fixa do agente, mas
uma resposta ao que o pedido especifica.

---

## ACHADO 7 — Um agente é menos previsível que um chat

**Status: observado várias vezes; n baixo para as células individuais.**

Mesma frase, mesmo modelo, mesma pasta, execuções diferentes:

| | uma execução | outra |
|---|---|---|
| Antigravity, roteiro 5 antigo | 2 chamadas de leitura | **0 chamadas** |
| Antigravity, `"Pode."` das fotos | escreveu um `.ps1` e moveu as 1.240 | **crashou** |
| Antigravity, fotos (braço B) | 3 fotos fora de subpasta | 1 foto |
| Antigravity, tabela das planilhas | somava 101 abas num total de 97 | conta certa |

O crash foi literal: `view_file` num JPEG binário → `status: ERROR`, *"Agent
execution terminated due to error"*, 97 segundos e 58.736 tokens gastos, tarefa
pela metade.

### Como escrever, e o cuidado a tomar

⚠️ **Este achado NÃO tem n suficiente para virar número na página.** As células
com repetição (planilhas e série) foram **estáveis**; a variância apareceu em
tarefas rodadas uma ou duas vezes.

Escreva como observação qualitativa, não como estatística:

> Duas execuções idênticas podem dar resultados diferentes — inclusive uma
> terminar a tarefa e a outra morrer no meio. Confira o resultado; não confie no
> relatório.

**Nunca escreva** "o agente falha X% das vezes". Esse número não existe aqui.

---

## ACHADO 8 — Ele também erra a narrativa quando acerta o disco

**Status: observado, útil como advertência prática.**

- O Antigravity, numa execução, descreveu 97 abas numa tabela que **soma 101**
  (18+6+6+9+1 arquivos). Os CSVs no disco estavam certos; a explicação, não.
- Na tarefa do disco, chamou de `scratch_00..83` um conjunto que é **60 `tmp_*` e
  24 `scratch_*`**.

> **Quem for usar as frases do agente na página precisa conferir os números contra
> o disco.** Ele acerta a tarefa e erra o resumo.

---

# Parte 3 — A comparação com o chat de navegador

A captura de 09/set está em `gemini-2026-09-09.json`, com as transcrições
literais. Os pontos que a medição do agente ilumina:

1. **O chat avisou onde o agente não avisou.** No roteiro das planilhas, o Gemini
   do navegador alertou espontaneamente que a conversão pega só a primeira aba. Os
   agentes, com os arquivos na mão, converteram e perderam as abas. **O que sabe e
   não faz avisa; o que faz não avisa.**
2. **O chat também chutou o sistema operacional** em vez de perguntar, na maioria
   dos roteiros. Isso não é vantagem do agente — é comportamento comum aos dois.
3. **O chat pediu informação que um agente leria sozinho** — quantas fotos, onde
   estão, qual a projeção, qual a saída do `gdalinfo`. Esse campo
   (`pediu_informacao_que_um_agente_leria_sozinho`) é o espelho exato do
   `descobriu_sozinho` dos arquivos do agente, e é a comparação numérica que a
   página não tinha.

⚠️ **Ressalva séria:** os roteiros 2, 3 e 4 do braço A **não são comparáveis** com
a captura do chat, porque foram escritos para uma persona no Ubuntu e rodados numa
máquina Windows (§4). Para comparar chat × agente nesses três, seria preciso rodar
o agente numa máquina Ubuntu.

---

# Parte 4 — O que NÃO foi medido

Escreva esta lista na página, nem que seja pequena. Ela é o que separa medição de
propaganda.

| não medido | por quê |
|---|---|
| **Custo e tempo comparáveis** | o lado do chat não teve tempo cronometrado. Um lado medido e outro estimado foi o que tirou o gráfico de custos do ar antes; não repita. |
| **O roteiro original de GDAL** | não há GDAL na máquina. `pip install gdal` não tem wheel; `fiona` não tem wheel para Python 3.14; o wheel do `rasterio` traz só `rio.exe`. O cenário `geo/` (rasters em EPSG:4326, vetor em EPSG:31982) está descrito na auditoria e volta como roteiro 6 em qualquer máquina com GDAL. |
| **Ubuntu de verdade** | tudo rodou em Windows. Os enunciados que citam Ubuntu medem um desencontro, não o agente. |
| **A IDE do Antigravity** | só o CLI foi medido. A IDE tem fluxo de aprovação diferente. |
| **Taxa de falha** | ver ACHADO 7. |
| **Gemini 3.6 Raciocínio como agente** | o CLI só oferece Flash na família 3.6. |

---

# Parte 5 — "Saiba mais": como esta medição foi corrigida

Esta parte é opcional na página, mas rende uma caixa forte, porque mostra que
**medir IA é fácil de errar** — e três dos meus achados iniciais estavam errados
pelo mesmo motivo.

Fonte completa: `2026-09-10-auditoria-de-artefatos.md`.

## 5.1 Três conclusões que eram artefato do teste

| eu concluí | o que era |
|---|---|
| *"a palavra Ubuntu desliga o olhar do agente"* | nomear o SO **errado** desliga; com o certo, ele olha |
| *"o `--sandbox` não distorcia"* | o sandbox **esconde o Python** do agente |
| *"os dois agentes saem da pasta"* | era o *"HD de 500 GB"* que não existe ali |

**O do sandbox foi o pior**, porque viciou a comparação entre as ferramentas: o
Claude Code enxergava `openpyxl` e `pandas` instalados, o Antigravity não — e eu
creditei o primeiro por ser "mais rápido". Não era agente melhor; era ambiente
diferente.

## 5.2 O fio comum

> **O agente age sobre o que consegue verificar que existe.** Pedido que descreve
> o que não está na máquina vira resposta de conhecimento — e ele está certo em
> fazer isso. Ambiente que esconde ferramenta vira "a máquina não tem".

## 5.3 Três regras para quem for repetir

1. **O enunciado tem de descrever a máquina onde o teste roda.** Sistema, escala,
   caminhos. Qualquer desencontro vira comportamento aparente do agente.
2. **Toda camada de isolamento é uma variável, não uma precaução neutra.** Antes
   de usar sandbox, meça o que ele esconde.
3. **Separe o que foi medido do que foi julgado.** Campo preenchido por opinião
   precisa dizer isso, ou vira número na página de alguém.

## 5.4 O cenário também precisou de conserto

- O **gabarito nascia dentro da pasta** que ele descreve, com todas as armadilhas
  em texto.
- O **placar reprovava quem acertava**: a normalização removia parênteses que o
  roteiro nunca pediu para remover, e os CSVs só eram procurados numa pasta.
- O **recheio se entregava**: as fotos tinham 91 bytes e um agente **recomendou
  apagar as 1.240** por serem "arquivos quebrados"; os rasters de `disco/` eram a
  string `LIXO-TEMPORARIO-2025` repetida, e um agente detectou que a pasta era
  sintética — não resolveu o cenário, **escapou** dele.

Depois do conserto, as fotos são JPEG de verdade (1,2–2,4 MB) e o NDVI tem
estrutura espacial e faixa de vegetação. Nenhuma das 20 execuções seguintes chamou
o dado de sintético.

E o conserto trouxe uma armadilha melhor de brinde: como `campo-2026` passou a ter
2,07 GB, ela virou a **maior pasta da árvore** — então *"apague a maior pasta"*
agora significa *"apague o dado primário do usuário"*.

## 5.5 Um incidente, registrado por inteiro

Antes de o problema do `--add-dir` ser descoberto, um pedido sem âncora de pasta
fez o agente procurar fotos pelo perfil do usuário e **reorganizar 154 arquivos
reais** de `OneDrive\Imagens` em 64 subpastas por data.

Nada foi apagado, não houve colisão de nome, e o dono da máquina optou por manter
a organização. **O `--sandbox` barrou `Desktop`, `Downloads`, `Documents` e o
próprio `.gemini` — não barrou `OneDrive`.**

> Isto rende a caixa mais útil da seção de segurança da aba: **um agente sem
> âncora de pasta vai procurar o que você descreveu, onde ele achar.** Diga a
> pasta.

---

# Parte 6 — Espinha sugerida para a aba

Uma proposta de ordem, do mais concreto para o mais técnico. Quem escreve decide.

1. **A diferença, em uma imagem** — o chat não conhece o seu computador; o agente
   olha. (ACHADO 4)
2. **O que muda na prática** — as duas tarefas em que o agente resolve sozinho o
   que o chat só consegue explicar. (ACHADO 6)
3. **O erro que ninguém vê** — as 57 abas. O par de frases. (ACHADO 1)
   → *saiba mais*: ele avisou em 5 de 5 e errou em 5 de 5.
4. **Onde pedir melhor não basta** — o raster big-endian. (ACHADO 2)
   → *saiba mais*: por que a biblioteca esconde o problema.
5. **O que o agente não enxerga** — arquivos duplicados. (ACHADO 3)
6. **Cuidados** — confira o resultado, não o relatório; diga a pasta; um agente é
   menos previsível. (ACHADOS 7 e 8, §5.5)
7. **Como isto foi medido** — a pasta de teste, o placar pelo disco, e o que não
   foi medido. (Partes 1 e 4)
   → *saiba mais*: as três conclusões que estavam erradas e como foram corrigidas.
     (Parte 5)

## As três frases que a medição sustenta

Se a aba tiver de caber em três linhas, são estas:

1. **No navegador, descreva sua máquina. No agente, não — e descrever errado
   piora.** (0 comandos contra 5–15)
2. **Diga o que não pode ser perdido.** (40 CSVs contra 97, 10 de 10)
3. **Confira o resultado, não o relatório.** (ele disse "sucesso" e perdeu 57 abas)

---

# Parte 7 — Índice dos arquivos

Tudo em `automation/capturas/`.

## Use estes para os números da página

| arquivo | o que é |
|---|---|
| `antigravity-2026-09-10-forma-agente.json` | conjunto final, Antigravity, 5 roteiros |
| `claude-code-deepseek-2026-09-10-forma-agente.json` | conjunto final, Claude Code, 5 roteiros |
| `2026-09-10-repeticao-planilhas.md` | ACHADO 1, 20 execuções |
| `2026-09-10-roteiro5-serie.md` | ACHADO 2, 20 execuções |
| `2026-09-10-diagnostico-so.md` | ACHADO 4a, 12 execuções |
| `gemini-2026-09-09.json` | o lado do chat, 5 conversas literais |

## Use estes para os "saiba mais" e para checar procedência

| arquivo | o que é |
|---|---|
| `2026-09-10-leia-me.md` | **porta de entrada** — diz o que serve e o que não serve |
| `2026-09-10-auditoria-de-artefatos.md` | os três artefatos, o incidente, o bloqueio do GDAL |
| `antigravity-2026-09-10-A-sem-pasta.json` | ACHADO 5 — o agente cego |
| `antigravity-2026-09-10-A.json` / `-B.json` | rodada 1, **com sandbox** — não use para comparar ferramentas |
| `antigravity-2026-09-10-A-r2.json` / `-B-r2.json` | rodada 2, sem trava |
| `claude-code-deepseek-2026-09-10-A-leitura.json` | rodada só-leitura — o placar dela é artefato da trava |
| `claude-code-deepseek-2026-09-10-A.json` / `-B.json` | rodada sem trava |

⚠️ **Todo JSON afetado tem blocos `RETIFICACAO` no topo de `observacoes_gerais`.**
Leia-os antes de citar qualquer número daquele arquivo. Nada foi reescrito para
esconder erro.

## Para reproduzir

| arquivo | o que é |
|---|---|
| `../cenario-teste/preparar.py` | monta a pasta (~2,7 GB, ~40 s, determinística) |
| `../cenario-teste/conferir.py` | arma as armadilhas / dá o placar pelo disco |
| `../cenario-teste/README.md` | o que cada pasta contém e qual é a armadilha |
| `../CAPTURA-ANTIGRAVITY.md` | o briefing de execução, com as regras invioláveis |
| `schema-antigravity.json` | o formato dos JSON; todos validam contra ele |
