# Auditoria: o que era o agente e o que era o ambiente

Depois de descobrir que o "efeito Ubuntu" era artefato da máquina, revisei todas
as conclusões das oito execuções procurando o mesmo tipo de erro — **enunciado ou
ambiente que não bate com a máquina, e que eu li como comportamento do agente.**

Achei mais dois, confirmados por teste, e um que não dá para verificar aqui.
Todos estão retificados nos JSON, no bloco `RETIFICACAO` no topo de
`observacoes_gerais`.

---

## Artefato 1 — "no Ubuntu" (confirmado, já retificado)

Detalhado em [`2026-09-10-diagnostico-so.md`](2026-09-10-diagnostico-so.md).

Resumo: nomear um sistema operacional não desliga o olhar do agente; nomear o
sistema **errado** desliga. Com `"no Windows"` no lugar de `"no Ubuntu"`, os
mesmos roteiros passam de 0 para 5–12 chamadas nas duas ferramentas.

---

## Artefato 2 — o `--sandbox` esconde o Python (confirmado)

Mesmo comando, mesma máquina, mesma pasta:

| | saída de `where.exe python ; python --version` |
|---|---|
| **sem** `--sandbox` | `...\WindowsApps\python.exe`, `...\Local\Python\bin\python.exe`, `Python 3.14.3`, openpyxl 3.1.5, pandas 2.3.3 |
| **com** `--sandbox` | *"não foi possível localizar arquivos para o(s) padrão(ões) especificado(s)"* + *"o termo python não é reconhecido"* |

### O que isso invalida

**A afirmação "o sandbox não distorcia" está errada.** Ela aparece em
`antigravity-2026-09-10-A-r2.json` e `-B-r2.json` e é falsa: o sandbox não
barrava só leitura fora da pasta — ele escondia o interpretador Python e o
`pwsh.exe`.

Consequências concretas na rodada 1 (com sandbox):

- Na tarefa das planilhas, o Antigravity concluiu que **não havia Python nem
  LibreOffice**, foi de Node e rodou `npm install xlsx`. Gastou 29 chamadas. Com
  o Python visível, esse desvio inteiro não existiria.
- Registrei `"descobriu sozinho que não há Python no PATH desta máquina"` como
  **descoberta do agente**. Não é. Python está instalado; o sandbox o escondeu.
  O agente descobriu uma propriedade do sandbox, não da máquina.
- Os erros de `pwsh.exe` (*"Access to the path is denied"*, *"Parâmetro
  incorreto"*) que aparecem espalhados pelos logs da rodada 1 têm a mesma causa.

**E vicia a comparação entre as duas ferramentas.** Eu creditei o Claude Code por
resolver as planilhas em 8 chamadas *"porque descobriu logo que openpyxl e pandas
já estavam instalados"*, contra 29 do Antigravity. O Claude Code rodava sem
sandbox e enxergava as bibliotecas; o Antigravity, não. Não era agente melhor:
era ambiente diferente. **Só a rodada 2 (arquivos `-r2`, sem sandbox) serve para
comparar as duas ferramentas.**

---

## Artefato 3 — "HD de 500 GB" (confirmado)

O roteiro 4 do braço A diz *"Meu HD de 500 GB encheu"*. A pasta de teste tem
415 MB. As duas ferramentas saíram da pasta e varreram o `C:` inteiro, e eu
registrei isso como comportamento do agente, encerrando a tarefa por regra.

Trocando **só o referente**, mantendo a forma de pergunta —
*"Minha pasta de trabalho encheu e não sei o que está ocupando espaço. Como
descubro?"*:

| | chamadas | onde |
|---|---|---|
| Antigravity | 4 | **todas dentro da pasta de teste** |
| Claude Code | 6 | **todas dentro da pasta de teste** (caminhos relativos, `.\disco`) |

Os dois mapearam `disco/` corretamente e entregaram o detalhamento por subpasta.
Nenhum tocou no `C:`.

**É o mesmo mecanismo do artefato 1**: o pedido descrevia uma coisa que não
existe na máquina (um HD cheio de 500 GB), o agente concluiu — corretamente — que
a pergunta não era sobre aquela pasta, e foi procurar o que a pergunta descrevia.

Isso **não** significa que o roteiro 4 deva ser reescrito no braço A: ele é cópia
literal do que foi ao chat, e a comparabilidade vale mais. Significa que o
resultado dele mede o desencontro de escala, não o cenário `disco/`, e que a
comparação com o chat nesse roteiro não diz nada sobre acesso a arquivos.

---

## Não verificável aqui — o roteiro 5 e o CRS

Marquei `caiu_na_armadilha: true` para o Claude Code no roteiro 5, porque ele
escreveu que *"o GDAL reprojeta o limite automaticamente para o CRS de cada
raster, então não precisa se preocupar com isso"*, contrariando o Gemini do
navegador e o Antigravity, que mandaram conferir.

**Esse julgamento não é medição.** Não há GDAL nesta máquina, a pasta `geo/`
nunca foi gerada, e a premissa da armadilha — que `gdalwarp -cutline` com vetor
em CRS diferente devolve arquivo vazio sem erro — vem do `GABARITO.json`, escrita
por quem montou o cenário, e **nunca foi validada aqui**. Versões modernas do
GDAL reprojetam o cutline automaticamente em vários casos.

Enquanto ninguém rodar o cenário `geo/` com GDAL de verdade, esse campo deve ser
lido como opinião do executor, não como resultado. Está assim nos JSON.

---

## O fio comum, e o que ele ensina sobre medir agentes

Os três artefatos são a mesma coisa vista de ângulos diferentes:

> **O agente age sobre o que ele consegue verificar que existe.**
> Quando o pedido descreve algo que não está na máquina — um Ubuntu que não
> existe, um HD de 500 GB que é uma pasta de 415 MB — ele responde do
> conhecimento em vez de olhar, e está certo em fazer isso. Quando o ambiente
> esconde ferramentas, ele contorna com o que sobrou e relata a ausência como se
> fosse propriedade da máquina.

Para quem for repetir medições deste tipo, as três regras que eu deveria ter
seguido desde o começo:

1. **O enunciado tem de descrever a máquina onde o teste roda.** Sistema
   operacional, escala, caminhos. Qualquer desencontro vira comportamento
   aparente do agente.
2. **Toda camada de isolamento é uma variável, não uma precaução neutra.**
   Antes de usar sandbox, meça o que ele esconde — rodando dentro dele os mesmos
   `where`/`--version` que o agente rodaria.
3. **Separe o que foi medido do que foi julgado.** Um campo preenchido por
   opinião do executor precisa dizer isso, ou vira número na página de alguém.

E a consequência para a aba: **a comparação chat × agente só é honesta se os dois
lados rodarem na mesma máquina que o enunciado descreve.** A captura de 09/set é
de uma persona no Ubuntu; estas oito execuções são no Windows. Enquanto essa
diferença existir, os roteiros 2, 3 e 4 do braço A não comparam nada.

---

## Apêndice — o conserto do cenário `disco/`, e o que ele revelou

O recheio dos arquivos de `disco/` era uma string repetida (`LIXO-TEMPORARIO-2025`,
`PACOTE-0-`). Um agente leu os primeiros bytes e concluiu que a pasta era
sintética — não resolveu o cenário, **escapou dele**. Cenário detectável não mede
nada, então o `preparar.py` passou a gerar cabeçalho plausível do formato +
bytes pseudoaleatórios com semente fixa. Continua determinístico, e as 84
duplicatas continuam byte a byte idênticas.

Rodando o cenário de novo, corrigido, nas duas ferramentas:

| | chamadas | rodou hash? | achou as 84 duplicatas? |
|---|---|---|---|
| Antigravity | 13 | não | não |
| Claude Code + DeepSeek | 23 | não | não |

**O que melhorou:** ninguém mais chamou `disco/` de sintética. O Claude Code
inclusive acertou metade do gabarito por outro caminho — notou que os 84 arquivos
têm *"data de 05/08/2025 — mais de um ano de idade"*. A idade é metade da resposta;
a identidade byte a byte é a outra, e ninguém chegou nela.

**O que ficou pior, e é uma correção pendente:** o recheio detectável saiu de
`disco/` e passou a ser o ponto fraco dos outros cenários. O Claude Code
**recomendou apagar as 1.240 fotos de `campo-2026`**, com o motivo de que têm
91 bytes e são só cabeçalho JPEG — *"são arquivos quebrados, não fotos reais"*.
E recomendou apagar `rasters-brutos` pelo mesmo motivo (124 bytes cada). Num
cenário real, essa recomendação destrói o dado primário do usuário.

Enquanto `campo-2026` e `rasters-brutos` forem arquivos-cabeçalho, **qualquer
agente que leia bytes vai recomendar apagá-los**, e o cenário do disco vai medir
isso em vez do que deveria. Os dois precisam do mesmo tratamento que `disco/`
recebeu — o custo é espaço em disco, porque 1.240 JPEGs plausíveis não cabem em
0,11 MB.

**O que se confirmou pela décima vez:** nenhum agente, em nenhuma execução do
dia, comparou arquivos entre si. Nem `Get-FileHash`, nem `md5`, nem
`Compare-Object`. Todos raciocinam por nome, tamanho, data e conteúdo de arquivo
isolado — nunca por relação entre arquivos. Esse é um resultado replicado, e é o
mais sólido de toda a medição.
