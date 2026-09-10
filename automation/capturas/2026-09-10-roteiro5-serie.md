# Roteiro 5 refeito: o limite do "peça melhor"

O roteiro 5 era o recorte de 60 GeoTIFF com `gdalwarp -cutline`. Numa máquina
Windows sem GDAL o cenário `geo/` nunca era gerado, e o roteiro passou **três
execuções medindo nada**. Foi trocado por um cenário de conformidade de série,
que mantém o que importava e ganha o que faltava — resposta verificável no disco.

## O cenário

`serie-ndvi/` tem **240 GeoTIFF válidos** (abrem no PIL, no rasterio e no `file`),
todos `512×512`, 8 bits, little-endian, uma banda. **Quatro destoam**, e nada no
nome denuncia — os 240 se chamam `ndvi_2026_NNN.tif`:

| arquivo | desvio | tamanho |
|---|---|---|
| `ndvi_2026_037.tif` | 256×256 | 65.658 B |
| `ndvi_2026_112.tif` | 256×256 | 65.658 B |
| `ndvi_2026_168.tif` | 16 bits por amostra | 524.410 B |
| `ndvi_2026_203.tif` | **big-endian (MM)** | **262.266 B — igual aos outros 236** |

A armadilha tem **dois degraus, de propósito**: um `ls -l` entrega três deles pelo
tamanho; o quarto exige abrir o arquivo e ler o cabeçalho.

## O resultado: 12 execuções, ninguém achou o quarto

| | execuções | achou 037/112/168 | achou 203 |
|---|---|---|---|
| Antigravity, pergunta | 3 | 3 de 3 | **0** |
| Claude Code, pergunta | 3 | 2 de 3 | **0** |
| Antigravity, ordem | 3 | 3 de 3 | **0** |
| Claude Code, ordem | 3 | 3 de 3 | **0** |

Placar do disco, nas seis execuções com ordem explícita:

```
✗ série: separação errada — não achou ['ndvi_2026_203.tif']
```

Seis de seis separaram exatamente os mesmos três arquivos em `fora-do-padrao/`.

## Por que erraram, e por que isso importa

**PIL e rasterio normalizam byte order na leitura.** Depois de decodificado, o
`ndvi_2026_203.tif` devolve o mesmo array que qualquer outro: 512×512, uint8,
mesma faixa de valores, mesma média. O desvio existe apenas em dois bytes no
começo do arquivo, e nenhuma das doze execuções foi lá.

Os agentes não foram preguiçosos — fizeram análise séria. O Claude Code comparou
dimensões, `dtype`, média, desvio, mínimo, máximo e contagem de zeros dos 240
arquivos. O Antigravity chegou a listar os quatro eixos que iria verificar
(metadados espaciais, tipo de dado, intervalo válido de NDVI, outliers
estatísticos). **Todos pararam na camada em que a biblioteca já tinha resolvido o
problema para eles.**

É o mesmo movimento do caso das planilhas, numa fatia diferente: lá, `pandas`
entrega a primeira aba e o agente não pergunta se há outras; aqui, `PIL` entrega o
array certo e o agente não pergunta como o arquivo estava escrito.

## O contraste que faz este roteiro valer a pena

Este é o caso em que **pedir melhor não resolveu** — e é por isso que ele precisa
estar na página, ao lado do caso das planilhas:

| | pedir melhor resolve? | evidência |
|---|---|---|
| planilhas (57 abas perdidas) | **sim** | `"sem perder nenhuma aba"` → 97 CSVs, 10 de 10 execuções |
| série (raster big-endian) | **não** | ordem explícita → mesmos 3 de 4, 6 de 6 execuções |

A diferença entre os dois: nas planilhas, a informação que faltava estava ao
alcance do agente — bastava contar as abas, e o pedido fez ele contar. Na série,
a informação estava **abaixo da ferramenta que ele escolheu**, e nenhuma
formulação do pedido faz ele descer um nível.

Para a aba, isso corrige um exagero: um prompt melhor resolve uma classe grande de
erro, e não resolve outra. **Há falhas que só aparecem para quem sabe o que
procurar** — e essa é a parte do trabalho que continua sendo de quem entende do
assunto, não do agente.

## Ressalvas

- **O dado é sintético e um agente notou.** O Claude Code escreveu: *"média ≈
  127,5 e desvio ≈ 73,9 (distribuição uniforme — parecem sintéticos)"*. O recheio
  é pseudoaleatório uniforme, e NDVI real não é. Não invalida o resultado — a
  análise que ele fez foi a correta — mas numa próxima iteração vale gerar valores
  com distribuição plausível.
- **Uma execução (Claude Code, pergunta, repetição 2) não nomeou arquivo nenhum**,
  entregando só o método. Está contada como "não achou" nas duas colunas.
- **O cenário `geo/` original não foi descartado**: está descrito na auditoria, e
  em qualquer máquina com GDAL ele pode voltar como roteiro 6, sem invalidar nada
  do que está medido aqui.
