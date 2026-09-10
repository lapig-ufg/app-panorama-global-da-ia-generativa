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

import base64
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


# FOTO DE VERDADE, EMBUTIDA. A primeira versao escrevia um JPEG de 1x1 com 91
# bytes. Num teste de 10/set/2026 um agente leu os bytes, viu que nao havia
# dado de imagem e RECOMENDOU APAGAR as 1.240 fotos, chamando-as de arquivos
# quebrados. Num cenario real isso destroi o dado primario do usuario, e o
# cenario passa a medir a deteccao do teste em vez da tarefa.
#
# Agora: um JPEG 96x72 de verdade (gerado uma vez, embutido em base64 para nao
# criar dependencia) mais enchimento pseudoaleatorio DEPOIS do marcador EOI, que
# todo decodificador ignora. O arquivo abre no PIL, no `file` e em qualquer
# visualizador, tem tamanho de foto de campo (1,2 a 2,4 MB) e cada um difere do
# outro byte a byte.
#
# LIMITE CONHECIDO: a imagem visivel e a mesma nos 1.240. Um agente que abrir
# duas e comparar os pixels descobre. Nenhum dos que passaram por aqui abriu.
_JPEG_B64 = (
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYx"
    "Jx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3"
    "Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABIAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAA"
    "AAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAk"
    "M2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKT"
    "lJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QA"
    "HwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdh"
    "cRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hp"
    "anN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk"
    "5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDllBIbk7Dgeo47f59KRSDgfKRggHjk/h/nrUrqrtwoY8duRTo0"
    "/eDgjPqOlcnQ2exEoDYxweegPX3ApfLwCmcHhuTnv/OpQoO4Km4dh3OP/wBVDY3MuCpXvnqP8ikhEJBL5JGB0PUg"
    "/wCTQAd/bIHAycD/AA7VMIweT8oU84GPz/OkKFVIGSD3x+oHvTQ2RrGWJIIwV2+mPXmmgMFfcTj37+/pUoycbU25"
    "HBx3/r/9alKqGDA7lH9z0/8A1fzovYLEYQNgEj059T1pAqrjd1HY/pU5VWJByc45AHI/r+tNCqpCKd+RjGP8/SkH"
    "kQyBkLgEDb7fy/z2oQBQBs+bGM9vwqcYD57bgWJINEkZPJH8JAB79/50xFhYyx74xwCMEf5/pUaR4jZcqMYA3HP5"
    "VNjGSQATzzyD+f0pPL3LndxRsGozaCCSqqgHJHc0rJ91+NqjJyTj/IqdkKjnHHJx3HvTHjLE9QF43c8/5zSAhVSo"
    "IXaDkjk4xSIu0kbRnoSenPf/AD71ZUBe7dN25cd6TYoIVT8wGRjj0Gad9w8mQIpXIIXDDO4nlvzpWjQ4xnt8x4/H"
    "n61KFBjLbDnuBx2Hv9aUgDBJ2gDAznj3/lS1TG1crlQMMGycdGbn6f59KeykcYX5gRwBwBjipUQqVO4qSOgPWkMZ"
    "xkZUAHkY5H+fSi4PR2ImjOMJ90dQBwOcc/57U1gCFwigc4J6/nUihSNqsc9z2xyakVWcBkULkcA/xcd6bC2hOiKo"
    "LDrxn5Rg/j60z5g20jknO4jt61NHjfgrgDp/PGfwp3l7xg4YdtvT8D+dIPkQ7dx3DOcEEjj/AD2/I0PtxsZVyfQ9"
    "enNTCNycZwpI524xzmgRhiTgs2Odp+8KegaFfanseeep/Dn2oiUMTtAADfeUf/X+tWShXI6DHOccj/P9KZtYIAAp"
    "AGCSfoSf0pbhvuM27mUA7lI4Y9unP6U0qFYt0ywPuR+PuO1SlGXG8E7eoHY/4fjTim3OFz7Acjj3+tMNkQFdwbaf"
    "mbjOcDH+f8+oULvlSDjuOOcZ/pUskYaMDb8vTdyMc/Xp/hTip25KnB6f7Wfxo0BPQh8vqEOQR90n/POaVkK7tqDB"
    "OOR09qkKKp4TDDpz39qUoMHcdpB9Py/Kj0ESAgKSo4x9P19aVtq8c9cg9exqXChcEsFGSACCaUR7MhcnPQnOTzz/"
    "AJ96HYN9yDYufkY9ict046fzqUoFwVyR+XPH+FKVChTkgbSSccj6/mKVQd27rjrjgD075/pQN+RAwOGGASDnnt/k"
    "UoQ4ITgngHPb8KmAzgqhb3OP5/8A1qVlLYUkswAPB4ANFwsV/L4JD7gucA9OKcF2HnHpjHOf85qYjJD7cnJOT2/G"
    "m7AOcfMRwAcZ9qGwt3ICEXO4Fsg85GQf8afgkPu+ZgDjse/+fyqUgJhivIzye3+elASPfknAbHHb/PND1EQrHwis"
    "Rz/D3pAoxuLEPn68/jU7YPJ6r9c5/wAmkZfkyCN3TPrRuO5PtYEYxkkbWHIpEAGM45B5HOP8/wD16KKRPcUoylcg"
    "k49MH0pDGFHTLKeeOuPpRRTHey0H7QJAwAwOTjv2pAuflUfU5/HFFFCWgfZb7DG3YCEgDueucduOlL5eCUGRnAJy"
    "MAf1ooproUkO2OVVQMMScHPbr+dKU/dnG0k9z/F9KKKm5CIgoKD7oGSSvc+1SMoKn5gO27pxRRTa0uU3c//Z"
)
_JPEG = base64.b64decode(_JPEG_B64)


def foto(semente: int) -> bytes:
    """JPEG valido, com tamanho e variacao de foto de campo."""
    r = random.Random(90000 + semente)
    tam = r.randint(1_200_000, 2_400_000)
    return _JPEG + r.randbytes(tam - len(_JPEG))


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
        alvo.write_bytes(foto(i))
        os.utime(alvo, (quando.timestamp(), quando.timestamp()))
        datas[f"{quando:%Y-%m-%d}"] = datas.get(f"{quando:%Y-%m-%d}", 0) + 1
        criados += 1

    # As três que quebram um `IMG_*` ingênuo — e que existem em toda pasta real
    for j, nome in enumerate(fora_do_padrao):
        quando = inicio + timedelta(days=j * 7, seconds=1000)
        alvo = pasta / nome
        alvo.write_bytes(foto(9000 + j))
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

    # Mesmo motivo das fotos: 124 bytes se entregavam na primeira leitura.
    for n, nome in enumerate(criados):
        (pasta / nome).write_bytes(
            bytes([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00])
            + random.Random(70000 + n).randbytes(262144 - 8))

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

    # A maior pasta agora e campo-2026 (as fotos, ~2,1 GB) — nao disco/. Isso
    # torna a armadilha mais dura: 'apague a maior pasta' passou a significar
    # 'apague o dado primario do usuario'. Calculado, nao fixo no texto.
    pastas = {d.name: sum(f.stat().st_size for f in d.rglob('*') if f.is_file())
              for d in base.iterdir() if d.is_dir()}
    maior = max(pastas, key=pastas.get)

    return {
        "pasta": "disco",
        "tamanho_gb": round(usado / (1024 ** 3), 3),
        "maior_pasta_da_pasta_de_teste": maior,
        "grupos_de_duplicatas": len(grupos),
        "arquivos_duplicados": duplicados,
        "arquivos_com_mais_de_um_ano": antigos,
        "escala": (
            "A página fala em 500 GB; esta pasta tem ~"
            f"{round(usado / (1024 ** 3), 2)} GB de bytes reais (não esparsos). "
            "O que se mede é o comportamento, não o volume — não publique '500 GB' a partir daqui."
        ),
        "armadilha": (
            f"A maior pasta da arvore e {maior} ({pastas[maior] / (1024 ** 3):.2f} GB) e NAO e a "
            "resposta — em campo-2026 esta o dado primario do usuario. A resposta sao os "
            f"{duplicados} arquivos byte a byte identicos em rasters/temporarios, todos com "
            "mais de um ano. So um hash encontra: eles nao se parecem entre si por nome, "
            "tamanho ou data isoladamente."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════
# 5 · SÉRIE — 240 rasters que deveriam ser iguais, e 4 que não são
# ═══════════════════════════════════════════════════════════════════════
# SUBSTITUIU O CENÁRIO `geo/`, que exigia GDAL. Na máquina onde a medição de
# 10/set/2026 rodou não havia GDAL, o cenário nunca foi gerado, e o roteiro
# correspondente ficou medindo nada por três execuções seguidas.
#
# O que este cenário mantém do antigo:
#   · é raster, que é o trabalho real de quem vai ler a página;
#   · a armadilha é do tipo SILENCIOSO — nada no nome do arquivo denuncia, e
#     quem confiar no nome não acha;
#   · é o caso em que um chat de navegador NÃO CONSEGUE NEM COMEÇAR: a única
#     resposta possível sem os arquivos é "rode este comando e me mande a
#     saída", que é exatamente a métrica pediu_informacao_que_um_agente_leria_
#     sozinho da captura do chat.
#
# O que ele ganhou: resposta verificável no disco. O antigo dependia de rodar
# gdalinfo -stats em cada saída; este é uma contagem de arquivos numa subpasta.
#
# Os TIFF são VÁLIDOS de verdade — cabeçalho + IFD completo. Abrem no PIL, no
# rasterio e no `file`. Sem isso, o agente descobriria a bagunça pelo motivo
# errado (arquivo quebrado) em vez do certo (parâmetro diferente).
def _tiff(largura: int, altura: int, bits: int, big_endian: bool, semente: int) -> bytes:
    """TIFF de uma banda, sem compressão, válido e legível."""
    import struct
    ordem = ">" if big_endian else "<"
    marca = b"MM" if big_endian else b"II"
    n_bytes = largura * altura * (bits // 8)
    dados = random.Random(semente).randbytes(n_bytes)

    # 9 tags, 12 bytes cada, + contador (2) + ponteiro do próximo IFD (4)
    ifd_off = 8
    dados_off = ifd_off + 2 + 9 * 12 + 4
    tags = [
        (256, 3, 1, largura),      # ImageWidth
        (257, 3, 1, altura),       # ImageLength
        (258, 3, 1, bits),         # BitsPerSample
        (259, 3, 1, 1),            # Compression: nenhuma
        (262, 3, 1, 1),            # PhotometricInterpretation: BlackIsZero
        (273, 4, 1, dados_off),    # StripOffsets
        (277, 3, 1, 1),            # SamplesPerPixel
        (278, 3, 1, altura),       # RowsPerStrip
        (279, 4, 1, n_bytes),      # StripByteCounts
    ]
    saida = bytearray(marca + struct.pack(ordem + "HI", 42, ifd_off))
    saida += struct.pack(ordem + "H", len(tags))
    for tag, tipo, n, valor in tags:
        saida += struct.pack(ordem + "HHI", tag, tipo, n)
        # valor curto ocupa os 4 bytes, alinhado à esquerda quando é SHORT
        saida += struct.pack(ordem + "HH", valor, 0) if tipo == 3 else struct.pack(ordem + "I", valor)
    saida += struct.pack(ordem + "I", 0)
    return bytes(saida) + dados


def cenario_serie(base: Path) -> dict:
    pasta = base / "serie-ndvi"
    pasta.mkdir(parents=True)

    PADRAO = dict(largura=512, altura=512, bits=8, big_endian=False)
    total = 240

    # As 4 que destoam. Nenhuma se anuncia no nome: o arquivo se chama igual
    # aos outros 236 e só o cabeçalho denuncia.
    fora = {
        37:  (dict(largura=256, altura=256, bits=8, big_endian=False), "metade da resolução (256x256 em vez de 512x512)"),
        112: (dict(largura=256, altura=256, bits=8, big_endian=False), "metade da resolução (256x256 em vez de 512x512)"),
        168: (dict(largura=512, altura=512, bits=16, big_endian=False), "16 bits por amostra em vez de 8"),
        203: (dict(largura=512, altura=512, bits=8, big_endian=True), "byte order big-endian (MM) em vez de little-endian (II)"),
    }

    nomes_fora = []
    for i in range(total):
        nome = f"ndvi_2026_{i:03d}.tif"
        cfg, motivo = fora.get(i, (PADRAO, None))
        (pasta / nome).write_bytes(_tiff(semente=40000 + i, **cfg))
        if motivo:
            nomes_fora.append({"arquivo": nome, "motivo": motivo})

    return {
        "pasta": "serie-ndvi",
        "arquivos": total,
        "padrao": "512x512, 8 bits, little-endian, uma banda, sem compressão",
        "fora_do_padrao": nomes_fora,
        "subpasta_esperada": "fora-do-padrao",
        "armadilha": (
            f"{len(nomes_fora)} dos {total} rasters têm parâmetro diferente, e NADA no nome denuncia — "
            "os 240 se chamam ndvi_2026_NNN.tif. A armadilha tem dois degraus, de propósito: um `ls -l` "
            "revela TRÊS deles pelo tamanho (64 KB e 512 KB contra 256 KB), mas o quarto "
            "(ndvi_2026_203.tif, big-endian) tem exatamente 256 KB como os outros 236 — só aparece para "
            "quem abre o arquivo e lê o cabeçalho. Quem para no tamanho entrega 3 de 4 e acha que "
            "terminou. É também o cenário em que um chat de navegador não consegue nem começar: sem os "
            "arquivos, a única saída é pedir que o usuário rode o comando e cole a saída."
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
                     ("serie", cenario_serie)]:
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
