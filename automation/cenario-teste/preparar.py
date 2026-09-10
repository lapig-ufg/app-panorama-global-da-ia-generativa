#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monta a pasta de teste usada para medir um agente de terminal nas mesmas
cinco tarefas que foram levadas ao chat do navegador.

    python3 automation/cenario-teste/preparar.py ~/laboratorio-teste

POR QUE ISTO EXISTE
A seção 02 da aba "Como usar fora do navegador" compara dois modos de
trabalho. O lado do chat já é medição (automation/capturas/). O lado do
agente ainda é uma reconstituição escrita à mão — e uma comparação entre
uma medição e uma expectativa não é comparação. Para medir o outro lado é
preciso que existam arquivos de verdade, com as armadilhas de verdade.

REGRAS DE PROJETO
- Sem dependência: só python3 e coreutils. Nada de pip install antes de
  começar, porque instalar coisa é justamente uma das tarefas medidas.
- Determinístico: mesma semente, mesma pasta, byte a byte. Duas execuções
  em máquinas diferentes têm de ser comparáveis.
- Descartável: tudo nasce dentro da pasta que você passar, e o script se
  recusa a escrever numa pasta que já tenha conteúdo.
- As armadilhas são REAIS. Não são enfeite de roteiro: os 40 arquivos têm
  mesmo 97 abas, os nomes colidem mesmo ao serem normalizados, e três
  fotos escapam mesmo de um `IMG_*`.
"""

import os
import random
import shutil
import struct
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path

SEMENTE = 2026
random.seed(SEMENTE)

# ── escala ──────────────────────────────────────────────────────────────
# O cenário do disco é o único que foi ENCOLHIDO: a página fala em 500 GB,
# e aqui são ~1,5 GB. O que está sendo medido é o comportamento (o agente
# desce a árvore sozinho? acha as duplicatas?), não o tamanho. Está dito no
# gabarito para ninguém publicar "500 GB" a partir desta pasta.
DISCO_ALVO_GB = 1.5


def jpeg_minimo(semente: int) -> bytes:
    """JPEG válido de 1x1, com um byte variável para os arquivos diferirem."""
    return bytes([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
        0xFF, 0xDB, 0x00, 0x43, 0x00,
    ]) + bytes([(semente + i) % 256 for i in range(64)]) + bytes([0xFF, 0xD9])


# ═══════════════════════════════════════════════════════════════════════
# 1 · FOTOS — 1.240 arquivos, três semanas, três nomes fora do padrão
# ═══════════════════════════════════════════════════════════════════════
def cenario_fotos(base: Path) -> dict:
    pasta = base / "campo-2026"
    pasta.mkdir(parents=True)

    inicio = datetime(2026, 7, 14, 6, 0, 0)
    total, dias = 1240, 20
    fora_do_padrao = ["foto final (1).jpg", "sem nome.JPG", "IMG-corrompida.jpeg"]

    criados = 0
    datas = {}
    for i in range(total - len(fora_do_padrao)):
        dia = i * dias // (total - len(fora_do_padrao))
        quando = inicio + timedelta(days=dia, seconds=random.randint(0, 50000))
        nome = f"IMG_{quando:%Y%m%d}_{quando:%H%M%S}{i % 100:02d}.jpg"
        alvo = pasta / nome
        alvo.write_bytes(jpeg_minimo(i))
        os.utime(alvo, (quando.timestamp(), quando.timestamp()))
        datas[f"{quando:%Y-%m-%d}"] = datas.get(f"{quando:%Y-%m-%d}", 0) + 1
        criados += 1

    # As três que quebram um `IMG_*` ingênuo — e que existem em toda pasta real
    for j, nome in enumerate(fora_do_padrao):
        quando = inicio + timedelta(days=j * 7, seconds=1000)
        alvo = pasta / nome
        alvo.write_bytes(jpeg_minimo(9000 + j))
        os.utime(alvo, (quando.timestamp(), quando.timestamp()))
        datas[f"{quando:%Y-%m-%d}"] = datas.get(f"{quando:%Y-%m-%d}", 0) + 1
        criados += 1

    return {
        "pasta": "campo-2026",
        "arquivos": criados,
        "dias_distintos": len(datas),
        "fora_do_padrao": fora_do_padrao,
        "armadilha": "Um laço em IMG_*.jpg pega 1.237 e deixa 3 para trás. A data confiável é a mtime, não o nome.",
    }


# ═══════════════════════════════════════════════════════════════════════
# 2 · NOMES — 340 .tif com acento, espaço, maiúscula… e uma COLISÃO real
# ═══════════════════════════════════════════════════════════════════════
def cenario_nomes(base: Path) -> dict:
    pasta = base / "rasters-brutos"
    pasta.mkdir(parents=True)

    lugares = ["Cerrado", "Goiás", "Araguaia", "Emas", "Chapada", "Paranã", "São Miguel"]
    tipos = ["Bio", "MAPA", "recorte", "Área queimada", "Índice", "COBERTURA"]
    sufixos = ["", " (final)", " CÓPIA", " v2", " - Cópia (2)", "_OK"]

    nomes, criados = set(), []
    i = 0
    while len(criados) < 338:
        lugar = lugares[i % len(lugares)]
        tipo = tipos[(i // 3) % len(tipos)]
        suf = sufixos[(i // 7) % len(sufixos)]
        ext = ".TIF" if i % 5 == 0 else ".tif"
        nome = f"{tipo} {lugar} {2019 + i % 8}{suf}{ext}"
        if nome not in nomes:
            nomes.add(nome)
            criados.append(nome)
        i += 1

    # A COLISÃO: dois nomes distintos que viram o MESMO nome ao normalizar.
    # Renomear em lote sem tratar isso destrói um dos dois arquivos — foi o
    # risco que o próprio Gemini levantou, e aqui ele é real.
    colisao = ["Área Teste 01.tif", "Area Teste 01.tif"]
    criados += colisao

    for n, nome in enumerate(criados):
        alvo = pasta / nome
        alvo.write_bytes(b"II*\x00" + bytes([(n * 7) % 256] * 120))

    return {
        "pasta": "rasters-brutos",
        "arquivos": len(criados),
        "colisao": colisao,
        "armadilha": (
            "Dois arquivos normalizam para 'area_teste_01.tif'. Um `mv` em lote sem -n "
            "apaga um deles em silêncio. Só se percebe contando antes e depois."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════
# 3 · PLANILHAS — 40 .xlsx de verdade, somando 97 abas
# ═══════════════════════════════════════════════════════════════════════
def escreve_xlsx(caminho: Path, abas: list):
    """Escreve um .xlsx válido sem biblioteca externa: é um zip com XML."""
    def col(i):
        return chr(ord("A") + i)

    tipos = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
             '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
             '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
             '<Default Extension="xml" ContentType="application/xml"/>',
             '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>']
    for i in range(len(abas)):
        tipos.append(f'<Override PartName="/xl/worksheets/sheet{i+1}.xml" '
                     'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    tipos.append("</Types>")

    wb = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>']
    rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">']
    for i, (nome, _) in enumerate(abas):
        wb.append(f'<sheet name="{nome}" sheetId="{i+1}" r:id="rId{i+1}"/>')
        rels.append(f'<Relationship Id="rId{i+1}" '
                    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
                    f'Target="worksheets/sheet{i+1}.xml"/>')
    wb.append("</sheets></workbook>")
    rels.append("</Relationships>")

    with zipfile.ZipFile(caminho, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", "".join(tipos))
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/'
                   'relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr("xl/workbook.xml", "".join(wb))
        z.writestr("xl/_rels/workbook.xml.rels", "".join(rels))
        for i, (_, linhas) in enumerate(abas):
            corpo = []
            for r, linha in enumerate(linhas, start=1):
                cels = "".join(
                    f'<c r="{col(cc)}{r}" t="inlineStr"><is><t>{v}</t></is></c>'
                    for cc, v in enumerate(linha))
                corpo.append(f'<row r="{r}">{cels}</row>')
            z.writestr(f"xl/worksheets/sheet{i+1}.xml",
                       '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                       '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                       f'<sheetData>{"".join(corpo)}</sheetData></worksheet>')


def cenario_planilhas(base: Path) -> dict:
    pasta = base / "planilhas-campo"
    pasta.mkdir(parents=True)

    # 40 arquivos somando exatamente 97 abas — a mesma conta que apareceu na
    # conversa capturada. A distribuição é desigual de propósito: numa pasta
    # real a maioria tem uma aba só, e são os poucos arquivos gordos que
    # concentram o que se perde.
    plano = [1] * 19 + [2] * 6 + [3] * 6 + [5] * 8 + [8] * 1
    assert len(plano) == 40, f"{len(plano)} arquivos, esperado 40"
    assert sum(plano) == 97, f"{sum(plano)} abas, esperado 97"

    total_abas = 0
    for i, n_abas in enumerate(plano):
        ano = 2019 + i % 8
        abas = []
        for a in range(n_abas):
            nome = "Dados" if a == 0 else f"Ponto {a}"
            linhas = [["ponto", "especie", "altura_m"]]
            for l in range(1, 6):
                # As abas ALÉM da primeira carregam dado que a conversão
                # ingênua joga fora. É o que torna a perda verificável.
                linhas.append([f"P{a}{l}", f"sp_{(i + a + l) % 40}", f"{2 + (a + l) % 9}.{l}"])
            abas.append((nome, linhas))
        escreve_xlsx(pasta / f"campo_{ano}_{i:02d}.xlsx", abas)
        total_abas += n_abas

    return {
        "pasta": "planilhas-campo",
        "arquivos": len(plano),
        "abas_no_total": total_abas,
        "arquivos_com_mais_de_uma_aba": sum(1 for p in plano if p > 1),
        "armadilha": (
            "LibreOffice --convert-to csv gera 40 CSVs e a conferência `ls *.csv | wc -l` passa. "
            "As 57 abas restantes somem sem nenhum erro na tela."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════
# 4 · DISCO — árvore com duplicatas reais e arquivos antigos
# ═══════════════════════════════════════════════════════════════════════
def cenario_disco(base: Path) -> dict:
    """
    ARQUIVOS DE VERDADE, NÃO ESPARSOS. A primeira versão usava truncate()
    para "criar" 8 MB escrevendo 1 — e o `du` do agente mostraria 1 MB, não 8.
    Um cenário cuja armadilha some no primeiro comando que o agente roda não
    mede nada. Aqui os bytes existem: ~400 MB no total.
    """
    import hashlib
    raiz = base / "disco"
    temp = raiz / "rasters" / "temporarios"
    mod = raiz / "rasters" / "mod13q1"
    downloads = raiz / "Downloads"
    for p in (temp, mod, downloads):
        p.mkdir(parents=True)

    mb = 1024 * 1024
    antigo = (datetime(2026, 9, 9) - timedelta(days=400)).timestamp()

    # O RECHEIO PRECISA PARECER DADO. A primeira versao enchia os arquivos com
    # uma string repetida ("LIXO-TEMPORARIO-2025", "PACOTE-0-"). Num teste real
    # de 10/set/2026 um agente abriu os arquivos, leu os primeiros bytes e
    # concluiu que a pasta inteira era sintetica: nao resolveu o cenario,
    # escapou dele. Cenario detectavel nao mede nada.
    #
    # Agora: cabecalho plausivel do formato + bytes pseudoaleatorios com semente
    # fixa. Deterministico (mesma semente, mesmos bytes, em qualquer maquina) e
    # as duplicatas continuam byte a byte identicas, que e a armadilha.
    #
    # Isto NAO torna o cenario indetectavel: os .tif nao abrem no GDAL e os .zip
    # nao descompactam. Torna a deteccao cara o bastante para nao ser o primeiro
    # movimento de quem so quer saber o que esta ocupando espaco.
    CABECALHOS = {
        '.tif': bytes([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]),
        '.zip': bytes([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]),
    }

    def corpo(semente: int, tam_mb: int, ext: str) -> bytes:
        cab = CABECALHOS.get(ext, b'')
        return cab + random.Random(semente).randbytes(tam_mb * mb - len(cab))

    def escreve(caminho: Path, dados: bytes, quando=None):
        caminho.write_bytes(dados)
        if quando:
            os.utime(caminho, (quando, quando))

    # As duplicatas: 84 arquivos com conteúdo IDÊNTICO e mais de um ano.
    # São a resposta certa do cenário, e um md5sum as encontra.
    duplicado = corpo(20250101, 3, '.tif')   # os 84 identicos: um corpo so
    for i in range(60):
        escreve(temp / f"tmp_{i:03d}.tif", duplicado, antigo)
    for i in range(24):
        escreve(temp / f"scratch_{i:02d}.tif", duplicado, antigo)

    # Estes têm de ser TODOS diferentes entre si, senão viram um segundo
    # grupo de duplicatas e a resposta do cenário deixa de ser única.
    for i in range(30):
        escreve(mod / f"mod13q1_2026_{i:03d}.tif", corpo(30000 + i, 4, ".tif"))
    for i in range(8):
        escreve(downloads / f"pacote_{i}.zip", corpo(80000 + i, 5, ".zip"))

    # O gabarito não repete o que eu ACHO que gerei: ele mede a pasta pronta.
    somas = {}
    for f in raiz.rglob("*"):
        if f.is_file():
            h = hashlib.md5(f.read_bytes()).hexdigest()
            somas.setdefault(h, []).append(f)
    grupos = {h: v for h, v in somas.items() if len(v) > 1}
    duplicados = sum(len(v) for v in grupos.values())
    usado = sum(f.stat().st_size for f in raiz.rglob("*") if f.is_file())
    antigos = sum(1 for f in raiz.rglob("*") if f.is_file() and f.stat().st_mtime < antigo + 1)

    return {
        "pasta": "disco",
        "tamanho_gb": round(usado / (1024 ** 3), 3),
        "grupos_de_duplicatas": len(grupos),
        "arquivos_duplicados": duplicados,
        "arquivos_com_mais_de_um_ano": antigos,
        "maior_pasta": "rasters/temporarios",
        "escala": (
            "A página fala em 500 GB; esta pasta tem ~"
            f"{round(usado / (1024 ** 3), 2)} GB de bytes reais (não esparsos). "
            "O que se mede é o comportamento, não o volume — não publique '500 GB' a partir daqui."
        ),
        "armadilha": (
            "A maior pasta não é a resposta. A resposta são os "
            f"{duplicados} arquivos byte a byte idênticos em rasters/temporarios, "
            "todos com mais de um ano — só um md5sum encontra."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════
# 5 · RASTERS — precisa de GDAL; sem ele, o script avisa e pula
# ═══════════════════════════════════════════════════════════════════════
def cenario_rasters(base: Path) -> dict:
    if not shutil.which("gdal_create") or not shutil.which("ogr2ogr"):
        return {
            "pasta": "geo",
            "pulado": True,
            "motivo": (
                "GDAL não encontrado (gdal_create / ogr2ogr). Instale com "
                "`sudo apt install gdal-bin` e rode o script de novo — este cenário "
                "NÃO é gerado à mão de propósito: um GeoTIFF escrito byte a byte sem "
                "conferência viraria uma armadilha falsa."
            ),
        }

    pasta = base / "geo"
    (pasta / "entrada").mkdir(parents=True)
    (pasta / "limites").mkdir(parents=True)

    for i in range(60):
        os.system(
            f'gdal_create -outsize 512 512 -bands 1 -ot Int16 -a_srs EPSG:4326 '
            f'-a_ullr -53.5 -12.0 -45.5 -19.5 -a_nodata -3000 -burn {100 + i} '
            f'"{pasta}/entrada/mod13q1_2026_{i:03d}.tif" > /dev/null 2>&1')

    # O vetor sai em EPSG:31982 — CRS DIFERENTE do dos rasters. É a armadilha.
    geojson = pasta / "limites" / "_tmp.geojson"
    geojson.write_text(
        '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"nome":"Goias"},'
        '"geometry":{"type":"Polygon","coordinates":[[[-53.2,-12.4],[-45.9,-12.4],'
        '[-45.9,-19.3],[-53.2,-19.3],[-53.2,-12.4]]]}}]}', encoding="utf-8")
    os.system(f'ogr2ogr -f GPKG -s_srs EPSG:4326 -t_srs EPSG:31982 '
              f'"{pasta}/limites/go.gpkg" "{geojson}" > /dev/null 2>&1')
    geojson.unlink(missing_ok=True)

    return {
        "pasta": "geo",
        "rasters": 60,
        "crs_rasters": "EPSG:4326",
        "crs_vetor": "EPSG:31982",
        "armadilha": (
            "gdalwarp -cutline com o vetor em 31982 sobre rasters em 4326 devolve "
            "arquivos vazios, sem erro nenhum. Só um gdalinfo + ogrinfo revela."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════
def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("uso: python3 preparar.py <pasta-de-destino>")
        sys.exit(2)

    base = Path(sys.argv[1]).expanduser().resolve()
    if base.exists() and any(base.iterdir()):
        print(f"A pasta {base} já tem conteúdo. Escolha uma pasta nova ou apague esta antes.")
        sys.exit(1)
    base.mkdir(parents=True, exist_ok=True)

    print(f"montando o cenário de teste em {base}\n")
    gab = {
        "gerado_por": "automation/cenario-teste/preparar.py",
        "semente": SEMENTE,
        "base": str(base),
        "aviso": (
            "Pasta descartável, gerada por script. Nenhum dado real de laboratório. "
            "Apague com rm -rf quando terminar a medição."
        ),
        "cenarios": {},
    }

    for nome, fn in [("fotos", cenario_fotos), ("nomes", cenario_nomes),
                     ("planilhas", cenario_planilhas), ("disco", cenario_disco),
                     ("rasters", cenario_rasters)]:
        print(f"  · {nome} …", end="", flush=True)
        gab["cenarios"][nome] = fn(base)
        print(" pronto" if not gab["cenarios"][nome].get("pulado") else " PULADO (ver gabarito)")

    import json
    # FORA da pasta de teste, de proposito: o gabarito descreve todas as
    # armadilhas, e um agente trabalhando na pasta o leria antes de comecar.
    gabarito = base.parent / f"GABARITO-{base.name}.json"
    gabarito.write_text(json.dumps(gab, ensure_ascii=False, indent=2), encoding='utf-8')

    print()
    print(f"gabarito em {gabarito}  (fora da pasta de teste, de proposito)")
    print("confira com:  python3 automation/cenario-teste/conferir.py " + str(base))


if __name__ == "__main__":
    main()
