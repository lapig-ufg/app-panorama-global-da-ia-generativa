# Repetição: 20 execuções da mesma tarefa, duas formulações

A tarefa das planilhas foi a única armadilha que pegou os dois agentes. Com uma
execução por célula, isso podia ser sorte. Aqui são **cinco por célula**, no
cenário consertado, sem trava nenhuma, com `planilhas-campo/` regenerado antes de
cada execução.

**A tarefa:** 40 arquivos `.xlsx` que somam **97 abas**. Um conversor que lê só a
primeira aba de cada arquivo gera 40 CSVs, **perde 57 abas sem nenhum erro na
tela**, e passa na conferência ingênua (`ls *.csv | wc -l` devolve 40 de 40).

---

## O resultado

| formulação | ferramenta | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| *"Como converto 40 arquivos .xlsx em .csv de uma vez?"* | Antigravity | 40 | — | 40 | 40 | 40 |
| | Claude Code + DeepSeek | 40 | 40 | 40 | 40 | 40 |
| *"Converta... **sem perder nenhuma aba**"* | Antigravity | **97** | **97** | **97** | **97** | **97** |
| | Claude Code + DeepSeek | **97** | **97** | **97** | **97** | **97** |

(números = CSVs no disco depois da execução; `—` = não executou nada)

**Dez de dez** com a ordem. **Nove de nove** erradas com a pergunta, entre as que
chegaram a executar. Não foi sorte em nenhuma das duas direções.

---

## O achado incômodo: saber não bastou

Marcando quais execuções **avisaram por escrito** que a conversão pega só a
primeira aba:

| | avisou | acertou |
|---|---|---|
| Claude Code, pergunta | **5 de 5** | **0 de 5** |
| Antigravity, pergunta | 2 de 5 | 0 de 5 |
| ambos, ordem | 0 de 10 | 10 de 10 |

O Claude Code **explicou o problema em todas as cinco execuções** — e perdeu as
57 abas nas cinco. Ele escreve, na mesma resposta, que o script "usa pandas para
ler cada `.xlsx` (**primeira aba**)" e que a conversão foi concluída "com 0
erros". Não é ignorância do modelo: é que ninguém pediu para preservar as abas, e
ele não tratou a própria observação como um requisito.

Nas dez execuções com a ordem, nenhuma "avisou" — porque não havia o que avisar.
Elas simplesmente fizeram certo.

---

## A execução que fugiu do padrão

`rep-ag-pergunta-2` foi a única das vinte que não produziu CSV nenhum: **zero
chamadas de ferramenta**. Ela não olhou a pasta, não abriu arquivo, não executou
— entregou texto. E foi uma das duas do Antigravity que **avisou** sobre as abas.

Ou seja: a execução que se comportou como um chat de navegador foi a que alertou
o usuário. As quatro que agiram entregaram 40 arquivos e a palavra "sucesso".

> **O que faz é o que não avisa.** O aviso apareceu justamente quando o agente
> estava sem as mãos.

Isso também é variância: a mesma frase, o mesmo modelo, a mesma pasta, e numa
das cinco vezes ele nem olhou. Ver `2026-09-10-auditoria-de-artefatos.md` para as
outras divergências entre execuções idênticas — incluindo um crash do Antigravity
no meio de uma tarefa.

---

## Esforço não explica nada

| célula | chamadas de ferramenta |
|---|---|
| Antigravity, pergunta | 0, 5, 6, 6, 12 |
| Antigravity, ordem | 14, 15, 17, 18, 20 |
| Claude Code, pergunta | 6, 6, 7, 7, 7 |
| Claude Code, ordem | 9, 10, 11, 11, 12 |

A ordem faz o agente trabalhar mais — cerca de o dobro de comandos. Mas o que
muda o resultado não é o volume: é **contar as abas antes de converter**, e isso
só acontece quando o pedido diz o que não pode ser perdido.

---

## Como ler isto na página

O par de frases abaixo é a mesma tarefa, o mesmo agente, a mesma pasta, no mesmo
dia. É o número mais defensável de toda a medição, e não precisa de nenhuma
ressalva sobre esforço, tempo ou custo:

> *"Como converto 40 arquivos .xlsx em .csv de uma vez?"*
> → 40 arquivos, **57 abas perdidas em silêncio**, resposta dizendo "sucesso".
>
> *"Converta todas as planilhas desta pasta para CSV, **sem perder nenhuma aba**."*
> → 97 arquivos, um por aba.
