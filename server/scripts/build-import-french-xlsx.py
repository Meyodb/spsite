#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remplit le modèle Import French (colonnes POS) à partir de soupjuice.db.

SKU : uniquement des chiffres, préfixe 000 + id sur 6 positions (ex. 000000001).
Textes sans accents (ASCII lettres sans diacritiques).
"""
import io
import sqlite3
import unicodedata
import xml.sax.saxutils as saxutils
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "soupjuice.db"
TEMPLATE = ROOT / "data" / "Import French(1).xlsx"
OUT = ROOT / "data" / "Import French(1).xlsx"

COL_HEADERS = [
    "SKU *",
    "Nom",
    "SKU parent",
    "Min - Max",
    "Type *",
    "Prix par defaut",
    "Prix du supplement",
    "Instruction de production",
    "Departement",
    "Menu/Ecran",
    "Nom du bouton",
    "Couleur du bouton",
    "Style du bouton",
    "Code-barres",
    "Prix de revient",
    "Contenu (gestion des stocks)",
    "Unite du contenu (gestion des stocks)",
    "Poids",
    "Tare (grammes, vente au poids)",
    "Partage",
    "Nom du bon de commande",
    "Plat",
    "Groupe statistique",
]

DEPARTEMENT = {
    "JUS": "JUS - Click",
    "MILKSHAKES": "JUS - Click",
    "BOOSTERS": "AUTRES - Click",
    "SOUPES": "SOUPES - Click",
    "PLATS CHAUDS": "PLATS - Click",
    "SALADES": "SALADES - Click",
    "SANDWICH": "SANDWICH - Click",
    "DESSERTS": "DESSERTS - Click",
    "BOISSONS": "SOFT - Click",
    "GOODIES": "AUTRES - Click",
}

NUM_COLS = {5, 6}


def sans_accent(s) -> str:
    if s is None:
        return ""
    t = unicodedata.normalize("NFD", str(s))
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def esc(s) -> str:
    return saxutils.escape(sans_accent(s))


def col_name(i: int) -> str:
    i += 1
    name = ""
    while i > 0:
        i, rem = divmod(i - 1, 26)
        name = chr(65 + rem) + name
    return name


def cell_inline_str(col: int, row: int, text: str) -> str:
    r = f"{col_name(col)}{row}"
    return f'<c r="{r}" t="inlineStr"><is><t>{esc(text)}</t></is></c>'


def cell_number(col: int, row: int, val) -> str:
    r = f"{col_name(col)}{row}"
    if val is None or val == "":
        return f'<c r="{r}"/>'
    if isinstance(val, float):
        return f'<c r="{r}"><v>{val}</v></c>'
    return f'<c r="{r}"><v>{val}</v></c>'


def make_sku_import(product_id: int) -> str:
    return f"000{int(product_id):06d}"


def instruction(desc, volume, extra_label) -> str:
    parts = []
    if desc:
        parts.append(str(desc).strip())
    if volume:
        parts.append(f"Volume : {volume}")
    if extra_label:
        parts.append(str(extra_label).strip())
    return sans_accent(" | ".join(parts))


def row_to_cells(row_idx: int, tup: tuple) -> str:
    pid, cat, name, price, volume, extra_p, extra_lbl, desc, _vis, _sort = tup
    sku = make_sku_import(pid)
    site_ref = f"SITE_REF={pid}"
    dept = sans_accent(DEPARTEMENT.get(cat, cat))
    instr = instruction(desc, volume, extra_lbl)
    menu = sans_accent(f"Site / {cat}")
    plat = sans_accent(name)
    groupe = sans_accent(f"default/{cat.replace(' ', '_')}")

    vals = [
        sku,
        sans_accent(name),
        "",
        "",
        "article",
        price,
        extra_p,
        instr,
        dept,
        menu,
        sans_accent(name),
        "BLUE",
        "Accentuer",
        site_ref,
        "",
        "",
        "",
        "",
        "",
        "GLOBAL",
        "",
        plat,
        groupe,
    ]
    cells = []
    for j, val in enumerate(vals):
        if j in NUM_COLS:
            cells.append(cell_number(j, row_idx, val))
        else:
            cells.append(cell_inline_str(j, row_idx, val if val is not None else ""))
    return "".join(cells)


def build_sheet_data(rows: list) -> str:
    xml_rows = []
    hcells = [cell_inline_str(j, 1, COL_HEADERS[j]) for j in range(len(COL_HEADERS))]
    xml_rows.append(f'<row r="1">{"".join(hcells)}</row>')
    for i, tup in enumerate(rows, start=2):
        xml_rows.append(f'<row r="{i}">{row_to_cells(i, tup)}</row>')
    nrows = len(rows) + 1
    dim = f"A1:{col_name(len(COL_HEADERS) - 1)}{nrows}"
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<dimension ref="{dim}"/>
<sheetViews><sheetView workbookViewId="0"/></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>
<col min="1" max="1" width="28" customWidth="1"/>
<col min="2" max="2" width="36" customWidth="1"/>
<col min="6" max="8" width="14" customWidth="1"/>
</cols>
<sheetData>
{"".join(xml_rows)}
</sheetData>
</worksheet>"""


def main():
    if not TEMPLATE.is_file():
        raise SystemExit(f"Modele introuvable : {TEMPLATE}")

    conn = sqlite3.connect(DB)
    cur = conn.execute(
        """
        SELECT p.id, c.code, p.name, p.price, p.volume, p.extra_price,
               p.extra_price_label, p.description, p.visible, p.sort_order
        FROM produit p
        JOIN category c ON c.id = p.category_id
        ORDER BY c.sort_order, p.sort_order, p.id
        """
    )
    rows = cur.fetchall()
    conn.close()

    sheet_xml = build_sheet_data(rows)

    buf = io.BytesIO()
    with zipfile.ZipFile(TEMPLATE, "r") as zin:
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "xl/worksheets/sheet1.xml":
                    data = sheet_xml.encode("utf-8")
                zout.writestr(item, data)

    OUT.write_bytes(buf.getvalue())
    print(f"Ecrit {OUT} — {len(rows)} lignes (SKU 000xxxxxx, textes sans accents).")


if __name__ == "__main__":
    main()
