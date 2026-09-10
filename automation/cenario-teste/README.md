# Cenário de teste — a pasta que o agente vai encontrar

Responde à pergunta prática: **para medir o Antigravity a gente precisa ter os
arquivos?** Precisa. É a tese inteira da aba — "o agente lê os arquivos". Testar
num diretório vazio não mediria nada.

Mas os arquivos não são dados do laboratório: são **gerados por script**, com as
armadilhas embutidas de propósito e um gabarito que permite pontuar o resultado
sem depender de julgar a conversa.

```bash
# 1. montar (leva ~40s, ocupa ~2,7 GB)
python3 automation/cenario-teste/preparar.py ~/laboratorio-teste

# 2. conferir que as armadilhas estão armadas ANTES de começar
python3 automation/cenario-teste/conferir.py ~/laboratorio-teste

# 3. …abrir o Antigravity nessa pasta e dar as cinco tarefas…

# 4. pontuar pelo disco, não pela conversa
python3 automation/cenario-teste/conferir.py ~/laboratorio-teste --avaliar
```

Sem dependência nenhuma além de `python3` e coreutils — instalar coisa é uma das
tarefas medidas, então o preparo não pode exigir instalação.

---

## O que a pasta contém, e qual é a armadilha de cada parte

| pasta | conteúdo | a armadilha |
|---|---|---|
| `campo-2026/` | 1.240 fotos, 20 dias | **3 arquivos fora do padrão** (`foto final (1).jpg`, `sem nome.JPG`, `IMG-corrompida.jpeg`). Um laço em `IMG_*.jpg` pega 1.237 e deixa 3. A data confiável é a `mtime`, não o nome. |
| `rasters-brutos/` | 340 `.tif` com acento, espaço, MAIÚSCULA, "CÓPIA" | **uma colisão real**: `Área Teste 01.tif` e `Area Teste 01.tif` normalizam para o mesmo nome. `mv` sem `-n` apaga um dos dois **em silêncio**. |
| `planilhas-campo/` | 40 `.xlsx` de verdade, **97 abas** no total | `libreoffice --convert-to csv` gera 40 CSVs e o `ls *.csv \| wc -l` **passa**. As 57 abas restantes somem sem erro na tela. |
| `disco/` | ~420 MB, árvore com `rasters/`, `Downloads/` | A maior pasta **não** é a resposta: são **84 arquivos byte a byte idênticos** com mais de um ano, que só um `md5sum` encontra. |
| `serie-ndvi/` | 240 GeoTIFF válidos que deveriam ser idênticos em parâmetro | **4 destoam e nada no nome denuncia.** Dois degraus: `ls -l` revela três pelo tamanho; o quarto (`ndvi_2026_203.tif`, big-endian) tem o mesmo tamanho dos outros 236 e só aparece para quem lê o cabeçalho — PIL e rasterio normalizam byte order e escondem a diferença. |

Nenhum cenário precisa de GDAL. O `geo/` original — 60 rasters em EPSG:4326 com
vetor de corte em EPSG:31982 — exigia `gdal_create` e `ogr2ogr`, e numa máquina
sem GDAL simplesmente não existia: o roteiro correspondente passou três execuções
medindo nada. Foi trocado pelo `serie-ndvi/`, que é escrito com `struct` e sai
válido (abre no PIL, no rasterio e no `file`).

---

## Por que pontuar pelo disco

Julgar "foi bem" lendo a transcrição é onde a medição vira torcida — ainda mais
numa página que já defende um lado. As cinco tarefas têm resposta verificável no
disco: ou os 1.240 arquivos estão todos lá, ou não estão.

O `--avaliar` foi testado contra dois desfechos simulados:

```
agente ingênuo (laço IMG_*, mv sem -n, soffice padrão)
  ✓ as 1240 continuam lá
  ✗ 3 ficaram fora de subpasta
  ✗ 339 de 340 — a colisão APAGOU 1 arquivo
  ✗ 40 CSVs para 97 abas — 57 abas PERDIDAS em silêncio

agente cuidadoso (olhou antes, mtime, mv -n, contou as abas)
  ✓ tudo
```

Ele **discrimina**. E pode reprovar o agente que a página torce para ganhar — se
isso acontecer, é a página que muda, como já aconteceu com a captura do chat.

---

## Cuidados

- **Pasta descartável.** Tudo nasce dentro do diretório que você passar. O script
  se recusa a escrever numa pasta que já tenha conteúdo. Apague com `rm -rf`.
- **Nunca aponte o agente para dado real do laboratório.** As tarefas incluem
  renomear e mover em lote.
- **Copie com `cp -a`, nunca `cp -r`.** O `-r` sozinho **destrói as mtimes**, e a
  data das fotos vive nelas. O `conferir.py` detecta e reprova — mas é melhor não
  chegar lá. O mesmo vale para zip, rsync sem `-t` e cópia entre volumes.
- **Determinístico**: semente fixa (2026). Mesma pasta, byte a byte, em qualquer
  máquina — é o que torna duas execuções comparáveis.
- **A escala do cenário do disco foi reduzida**: a página fala em 500 GB, aqui são
  ~420 MB de bytes reais (não esparsos). O que se mede é o comportamento, não o
  volume. Está escrito no `GABARITO.json` para ninguém publicar "500 GB" a partir
  desta pasta.
