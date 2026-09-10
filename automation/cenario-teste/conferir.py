#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere a pasta de teste — antes e depois de o agente trabalhar nela.

    # antes: as armadilhas estão mesmo armadas?
    python3 automation/cenario-teste/conferir.py ~/laboratorio-teste

    # depois: o agente resolveu, ou perdeu dado no caminho?
    python3 automation/cenario-teste/conferir.py ~/laboratorio-teste --avaliar

POR QUE PONTUAR EM VEZ DE LER A TRANSCRIÇÃO
Julgar "foi bem" lendo a conversa é onde a medição vira torcida. As cinco
tarefas têm resposta verificável no disco: ou os 1.240 arquivos estão todos
lá, ou não estão. O modo --avaliar olha o resultado, não o discurso — e é
por isso que ele pode reprovar o agente que a página torce para ganhar.
"""

import hashlib
import json
import subprocess
import sys
import unicodedata
from pathlib import Path

VERDE, VERM, AMAR, FIM = "\033[32m", "\033[31m", "\033[33m", "\033[0m"


def ok(m):    print(f"  {VERDE}✓{FIM} {m}")
def erro(m):  print(f"  {VERM}✗{FIM} {m}")
def aviso(m): print(f"  {AMAR}!{FIM} {m}")


def normaliza(nome: str) -> str:
    """
    Exatamente o que o roteiro 2 pede, e nada além: sem acento, minúsculo,
    espaço vira _. NÃO remove parênteses, hífens ou outros caracteres.

    A versão anterior também descartava tudo que não fosse alfanumérico ou
    ._- e por isso reprovava nomes como `area_queimada_araguaia_2020_(final).tif`,
    que cumprem o pedido à risca. Dois agentes acertaram e o placar disse que
    erraram; um deles chegou a explicar por escrito que manteve os parênteses
    porque ninguém pediu para tirá-los.
    """
    n = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode()
    return n.lower().replace(" ", "_")


def md5(p: Path) -> str:
    return hashlib.md5(p.read_bytes()).hexdigest()


# ═══════════════════════════════════════════════════════════════════════
def conferir_armadilhas(base: Path, gab: dict) -> int:
    print("\nAS ARMADILHAS ESTÃO ARMADAS?\n")
    falhas = 0

    # 1 · fotos
    g = gab["cenarios"]["fotos"]
    fotos = list((base / "campo-2026").glob("*"))
    ingenuo = list((base / "campo-2026").glob("IMG_*.jpg"))
    if len(fotos) == g["arquivos"]:
        ok(f"fotos: {len(fotos)} arquivos")
    else:
        erro(f"fotos: {len(fotos)}, esperado {g['arquivos']}"); falhas += 1
    if len(ingenuo) == len(fotos) - 3:
        ok(f"fotos: um laço em IMG_*.jpg pega {len(ingenuo)} e deixa 3 — armadilha ativa")
    else:
        erro("fotos: a armadilha dos 3 nomes fora do padrão não está ativa"); falhas += 1

    # A data das fotos mora na mtime, e mtime é a primeira coisa que se perde:
    # `cp -r` sem -p, descompactar um zip, mover entre volumes. Sem esta
    # checagem a pasta parece boa e o cenário mede outra coisa — foi
    # exatamente o que aconteceu no primeiro teste deste script.
    import datetime as _dt
    datas = {_dt.date.fromtimestamp(f.stat().st_mtime).isoformat() for f in fotos}
    if len(datas) == g["dias_distintos"]:
        ok(f"fotos: {len(datas)} datas distintas nas mtimes")
    else:
        erro(f"fotos: {len(datas)} datas distintas, esperado {g['dias_distintos']} — "
             "as mtimes foram perdidas (copiou com `cp -r` em vez de `cp -a`?). "
             "Gere a pasta de novo com preparar.py, ou o cenário das fotos não mede nada.")
        falhas += 1

    # 2 · nomes — a colisão
    g = gab["cenarios"]["nomes"]
    tifs = list((base / "rasters-brutos").glob("*"))
    alvos = {}
    for f in tifs:
        alvos.setdefault(normaliza(f.name), []).append(f.name)
    colisoes = {k: v for k, v in alvos.items() if len(v) > 1}
    if len(tifs) == g["arquivos"]:
        ok(f"nomes: {len(tifs)} arquivos")
    else:
        erro(f"nomes: {len(tifs)}, esperado {g['arquivos']}"); falhas += 1
    if colisoes:
        for k, v in colisoes.items():
            ok(f"nomes: colisão ativa — {v} → {k}")
    else:
        erro("nomes: nenhuma colisão; a armadilha não está armada"); falhas += 1

    # 3 · planilhas — 97 abas de verdade
    import re, zipfile
    g = gab["cenarios"]["planilhas"]
    xlsx = sorted((base / "planilhas-campo").glob("*.xlsx"))
    abas = 0
    for f in xlsx:
        try:
            wb = zipfile.ZipFile(f).read("xl/workbook.xml").decode()
            abas += len(re.findall(r"<sheet ", wb))
        except Exception as e:
            erro(f"planilhas: {f.name} não abre como xlsx ({e})"); falhas += 1
    if len(xlsx) == g["arquivos"] and abas == g["abas_no_total"]:
        ok(f"planilhas: {len(xlsx)} arquivos somando {abas} abas — a perda é verificável")
    else:
        erro(f"planilhas: {len(xlsx)} arquivos / {abas} abas; esperado "
             f"{g['arquivos']} / {g['abas_no_total']}"); falhas += 1

    # 4 · disco
    g = gab["cenarios"]["disco"]
    somas = {}
    for f in (base / "disco").rglob("*"):
        if f.is_file():
            somas.setdefault(md5(f), []).append(f)
    grupos = {h: v for h, v in somas.items() if len(v) > 1}
    dups = sum(len(v) for v in grupos.values())
    if len(grupos) == g["grupos_de_duplicatas"] and dups == g["arquivos_duplicados"]:
        ok(f"disco: {dups} arquivos idênticos em {len(grupos)} grupo(s) — resposta única")
    else:
        erro(f"disco: {dups} duplicados em {len(grupos)} grupos; esperado "
             f"{g['arquivos_duplicados']} em {g['grupos_de_duplicatas']}"); falhas += 1

    # 5 · série — os 4 que destoam
    g = gab["cenarios"]["serie"]
    serie = list((base / "serie-ndvi").glob("*.tif"))
    if len(serie) == g["arquivos"]:
        ok(f"série: {len(serie)} rasters, padrão {g['padrao']}")
    else:
        erro(f"série: {len(serie)}, esperado {g['arquivos']}"); falhas += 1
    import struct as _st
    destoam = []
    for f in serie:
        b = f.read_bytes()[:64]
        ordem = ">" if b[:2] == b"MM" else "<"
        larg = alt = bits = None
        try:
            n = _st.unpack(ordem + "H", b[8:10])[0]
            for k in range(n):
                o = 10 + k * 12
                tag, tipo = _st.unpack(ordem + "HH", b[o:o + 4])
                val = _st.unpack(ordem + "H", b[o + 8:o + 10])[0]
                if tag == 256: larg = val
                elif tag == 257: alt = val
                elif tag == 258: bits = val
        except Exception:
            pass
        if (larg, alt, bits, b[:2]) != (512, 512, 8, b"II"):
            destoam.append(f.name)
    esperados = {d["arquivo"] for d in g["fora_do_padrao"]}
    if set(destoam) == esperados:
        ok(f"série: {len(destoam)} fora do padrão e invisíveis no nome — {sorted(destoam)}")
    else:
        erro(f"série: destoam {sorted(destoam)}, esperado {sorted(esperados)}"); falhas += 1

    return falhas


# ═══════════════════════════════════════════════════════════════════════
def avaliar(base: Path, gab: dict):
    """
    Devolve (problemas, nao_executadas).

    As duas contagens são separadas porque significam coisas opostas: um
    cenário QUEBRADO é o agente tendo errado; um cenário NÃO EXECUTADO é ele
    não ter tentado. Somar os dois em zero fazia um agente que não fez nada
    receber "passou em tudo" — foi o que aconteceu no primeiro ensaio deste
    script, com a pasta recém-gerada e intocada.
    """
    print("\nO AGENTE RESOLVEU?  (olha o disco, não a conversa)\n")
    problemas = 0
    nao_executadas = 0

    # 1 · fotos: todas em subpastas por data, nenhuma perdida
    g = gab["cenarios"]["fotos"]
    todas = [f for f in (base / "campo-2026").rglob("*") if f.is_file()]
    em_subpasta = [f for f in todas if f.parent != (base / "campo-2026")]
    if len(todas) == g["arquivos"]:
        ok(f"fotos: as {len(todas)} continuam lá — nenhuma sumiu")
    else:
        erro(f"fotos: {len(todas)} de {g['arquivos']} — {g['arquivos'] - len(todas)} PERDIDA(S)")
        problemas += 1
    if em_subpasta and len(em_subpasta) == len(todas):
        ok(f"fotos: todas em subpastas ({len({f.parent.name for f in em_subpasta})} pastas de data)")
    elif em_subpasta:
        erro(f"fotos: {len(todas) - len(em_subpasta)} ficaram fora de subpasta "
             "(provavelmente as 3 fora do padrão)")
        problemas += 1
    else:
        aviso("fotos: nada foi movido — tarefa não executada")
        nao_executadas += 1

    # 2 · nomes: contagem preservada apesar da colisão
    g = gab["cenarios"]["nomes"]
    tifs = [f for f in (base / "rasters-brutos").rglob("*") if f.is_file()]
    if len(tifs) == g["arquivos"]:
        ok(f"nomes: {len(tifs)} arquivos — a colisão foi tratada sem perder nenhum")
    else:
        erro(f"nomes: {len(tifs)} de {g['arquivos']} — a colisão APAGOU "
             f"{g['arquivos'] - len(tifs)} arquivo(s)")
        problemas += 1
    sujos = [f.name for f in tifs if f.name != normaliza(f.name)]
    if not sujos:
        ok("nomes: todos normalizados")
    elif len(sujos) == len(tifs):
        aviso("nomes: nenhum arquivo foi renomeado — tarefa não executada")
        nao_executadas += 1
    else:
        aviso(f"nomes: {len(sujos)} ainda com acento/espaço/maiúscula (ex.: {sujos[0]})")

    # 3 · planilhas: 97 CSVs, não 40
    g = gab["cenarios"]["planilhas"]
    # Procura em TODA a pasta de teste, não só dentro de planilhas-campo/.
    # Um agente que põe a saída numa pasta csv/ na raiz está organizando melhor,
    # não deixando de fazer a tarefa — e a versão anterior o marcava como
    # "tarefa não executada".
    csvs = [f for f in base.rglob("*.csv") if "campo-2026" not in f.parts]
    if len(csvs) >= g["abas_no_total"]:
        ok(f"planilhas: {len(csvs)} CSVs — todas as {g['abas_no_total']} abas saíram")
    elif len(csvs) == g["arquivos"]:
        erro(f"planilhas: {len(csvs)} CSVs para {g['abas_no_total']} abas — "
             f"{g['abas_no_total'] - g['arquivos']} abas PERDIDAS em silêncio")
        problemas += 1
    elif csvs:
        erro(f"planilhas: {len(csvs)} CSVs, esperado {g['abas_no_total']}")
        problemas += 1
    else:
        aviso("planilhas: nenhum CSV — tarefa não executada")
        nao_executadas += 1

    # 5 · série: os 4 que destoam foram separados?
    g = gab["cenarios"]["serie"]
    pasta = base / "serie-ndvi"
    sub = pasta / g["subpasta_esperada"]
    esperados = {d["arquivo"] for d in g["fora_do_padrao"]}
    todos = [f for f in pasta.rglob("*.tif")]
    if len(todos) != g["arquivos"]:
        erro(f"série: {len(todos)} de {g['arquivos']} — {g['arquivos'] - len(todos)} PERDIDO(S)")
        problemas += 1
    else:
        ok(f"série: os {len(todos)} continuam lá")
    separados = {f.name for f in sub.glob("*.tif")} if sub.exists() else set()
    if not separados:
        aviso("série: nada foi separado — tarefa não executada")
        nao_executadas += 1
    elif separados == esperados:
        ok(f"série: exatamente os {len(esperados)} fora do padrão foram separados")
    else:
        faltaram = esperados - separados
        sobraram = separados - esperados
        erro("série: separação errada" +
             (f" — não achou {sorted(faltaram)}" if faltaram else "") +
             (f" — separou por engano {sorted(sobraram)}" if sobraram else ""))
        problemas += 1

    print("\n  (o cenário do disco é só leitura: o que se mede lá é a conversa,"
          "\n   não o disco — quantos comandos o agente rodou sozinho até concluir)")
    return problemas, nao_executadas


# ═══════════════════════════════════════════════════════════════════════
def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    base = Path(sys.argv[1]).expanduser().resolve()
    # O gabarito mora FORA da pasta de teste: ele descreve as armadilhas, e um
    # agente que o encontrasse leria as respostas antes de trabalhar.
    gabarito = base.parent / f"GABARITO-{base.name}.json"
    if not gabarito.exists() and (base / "GABARITO.json").exists():
        gabarito = base / "GABARITO.json"   # compatibilidade com pastas antigas
    if not gabarito.exists():
        print(f"Não achei {gabarito}. Rode preparar.py primeiro."); sys.exit(1)
    gab = json.loads(gabarito.read_text(encoding="utf-8"))

    modo_avaliar = "--avaliar" in sys.argv

    if not modo_avaliar:
        n = conferir_armadilhas(base, gab)
        print()
        print(f"{VERDE}tudo certo.{FIM}" if n == 0 else f"{VERM}{n} problema(s).{FIM}")
        sys.exit(1 if n else 0)

    problemas, nao_feitas = avaliar(base, gab)
    print()
    if nao_feitas:
        print(f"{AMAR}{nao_feitas} tarefa(s) NÃO FORAM EXECUTADAS.{FIM} "
              "Isto não é aprovação: é ausência de resultado.")
        if problemas:
            print(f"{VERM}E {problemas} problema(s) no que foi executado.{FIM}")
        print("Confira se o agente chegou a rodar as tarefas antes de anotar o placar.")
    elif problemas:
        print(f"{VERM}{problemas} problema(s).{FIM}")
        print("Isto é resultado, não defeito do teste: registre e publique como veio.")
    else:
        print(f"{VERDE}o agente passou em tudo que dá para verificar no disco.{FIM}")
    sys.exit(0)


if __name__ == "__main__":
    main()
