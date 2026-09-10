# Diagnóstico: a formulação do enunciado e o sistema operacional

Doze execuções, 10/set/2026, depois das oito da manhã/tarde. Mesma tarefa, três formulações, duas ferramentas.
Máquina: **Windows 11**. Pasta anexada, sem sandbox, sem read-only.
`rasters-brutos/` e `planilhas-campo/` regenerados entre cada execução.

| formulação | ferramenta | roteiro 2 (nomes) | roteiro 3 (planilhas) |
|---|---|---|---|
| *"no Ubuntu"* | Antigravity | **0** | **0** |
| *"no Ubuntu"* | Claude Code + DeepSeek | **0** | **0** |
| *"no Windows"* | Antigravity | 6 | 8 |
| *"no Windows"* | Claude Code + DeepSeek | 12 | 5 |
| sem citar SO | Antigravity | 15 | 3 |
| sem citar SO | Claude Code + DeepSeek | 6 | 6 |

(números = chamadas de ferramenta; **0** = respondeu sem abrir um arquivo)

## O que isso corrige

As oito execuções anteriores do mesmo dia concluíram que *"a palavra Ubuntu no enunciado desliga o olhar do agente"*.
**Estava errado.** Nomear um sistema operacional não desliga nada — nomear o sistema **errado** desliga.
Esta máquina é Windows; os roteiros 2 e 3 dizem *"no Ubuntu"*. O agente conclui, com razão, que os
arquivos da pergunta não são os que estão aqui, e responde do conhecimento. Numa máquina Ubuntu isso
não aconteceria.

Os resultados dos roteiros 2 e 3 no braço A, nos arquivos daquelas execuções, **não medem comportamento de**
**agente** — medem esse artefato. Não servem para comparar com a captura do chat.

## O que sobrevive, e é mais nítido

Com o sistema corrigido no enunciado, os dois agentes **olham** (6 a 12 chamadas) e **nenhum dos dois**
**executa**: entregam script ou plano e param. No braço B, mesma tarefa em forma de ordem, os dois
executam e concluem. São dois eixos independentes, que a medição original confundia num só:

- **Olhar** depende de o pedido se referir a *esta* máquina.
- **Agir** depende de ser pergunta ou ordem.

A comparação chat × agente da seção 02 depende do segundo eixo, não do primeiro. E ela precisa ser feita
com enunciados que batam com a máquina onde o teste roda — ou numa máquina Ubuntu, como a persona da
captura de 09/set.

## Detalhe que vale registrar

Na variante *"no Windows"* do roteiro 2, os dois olharam e **os dois trataram a colisão** sem executar:
o Antigravity entregou um PowerShell que *"garante que arquivos duplicados após a remoção dos acentos
não sejam sobrescritos"*, e o Claude Code montou o plano com o mapa de `De → Para` e apontou o par que
colide. Ver a armadilha não dependeu de agir sobre ela.
