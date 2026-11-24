#!/usr/bin/env python3
"""Comprueba que cada propuesta de data/propuestas.json cita una página del PDF
que contiene sus palabras clave. Requiere `pdftotext` (poppler-utils).

Uso:  python3 scripts/verificar_paginas.py
Muestra solo las propuestas cuya página citada tiene bastantes menos
coincidencias que la mejor página del programa, para revisarlas a mano.
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
STOP = set("para los las del que con por una sus mas como sin hasta este esta entre todo toda "
           "todos todas sobre cada partir segun desde ser al el la de en y a o un se su no lo e".split())


def normalizar(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"-\n\s*", "", s)


def paginas(pdf):
    txt = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
    return [normalizar(p) for p in txt.split("\f")]


def main():
    datos = json.loads((RAIZ / "data" / "propuestas.json").read_text(encoding="utf-8"))
    avisos = 0
    for p in datos["partidos"]:
        pags = paginas(RAIZ / p["pdf"])
        for tema, items in p["propuestas"].items():
            for it in items:
                palabras = {w for w in re.findall(r"[a-z0-9]{4,}", normalizar(it["texto"])) if w not in STOP}
                puntos = [sum(w in pg for w in palabras) for pg in pags]
                mejor = max(range(len(puntos)), key=puntos.__getitem__)
                citada = puntos[it["pagina"] - 1] if 0 < it["pagina"] <= len(puntos) else -1
                if citada < 0.8 * puntos[mejor]:
                    avisos += 1
                    print(f'{p["id"]:<17} {tema:<13} pág. {it["pagina"]:>3} ({citada}) · mejor pág. {mejor + 1} '
                          f'({puntos[mejor]}) · {it["texto"][:70]}')
    print(f"\n{avisos} propuestas para revisar a mano (muchas son medidas que empiezan en una página y siguen en la siguiente).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
