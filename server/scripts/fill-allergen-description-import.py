#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remplit le modèle Import Allergène_Description (FR) à partir de soupjuice.db,
pour les mêmes produits que Import French (ORDER BY c.sort_order, p.sort_order, p.id),
hors PRODUCT_IDS_EXCLUS_POS (SKU inconnus du POS).

Feuille Allergene : laissée vide (seulement en-têtes + lignes modèle sans SKU ni allergènes).
Feuille Descriptions : lignes 1–6 = modèle d’instructions ; lignes 7+ = une ligne
par produit, B=Français, E=SKU, F=nom, G=description.
"""
import io
import re
import sqlite3
import xml.sax.saxutils as saxutils
import zipfile
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "soupjuice.db"
TEMPLATE = ROOT / "data" / "Import Allergène_Description - FR_FR(1).xlsx"
OUT = TEMPLATE

# Liste latérale B6:B31 (validation Allergene!$B$6:$B$31) : B6 = SST 2 (Amandes), B7:B31 = 13–37.
_SIDE_LIST_SST_INDEX_B7 = 13
assert _SIDE_LIST_SST_INDEX_B7 + (31 - 7) == 37

# Produits absents du catalogue POS (erreur « Le code SKU n’existe pas ») — non exportés.
PRODUCT_IDS_EXCLUS_POS = frozenset(
    {
        2,
        4,
        11,
        23,
        24,
        26,
        30,
        31,
        32,
        37,
        47,
        48,
        50,
        60,
        61,
        62,
        63,
        78,
        81,
        84,
        86,
        94,
        115,
        118,
        141,
        221,
    }
)

SQL_PRODUCTS = """
SELECT p.id, p.name, COALESCE(p.description, '')
FROM produit p
JOIN category c ON c.id = p.category_id
ORDER BY c.sort_order, p.sort_order, p.id
"""

DESC_FIRST_DATA_ROW = 7

# Gabarit vide feuille Allergene (comme le modèle) : pas de données E–N
_EMPTY_ALLERGEN_LAST_ROW = 34


def esc(s: str) -> str:
    return saxutils.escape(s or "")


def make_sku_import(product_id: int) -> str:
    return f"000{int(product_id):06d}"


def inline_cell(col: str, row: int, style: str, text: str) -> str:
    r = f"{col}{row}"
    if not text:
        return f'<c r="{r}" s="{style}"/>'
    return f'<c r="{r}" s="{style}" t="inlineStr"><is><t>{esc(text)}</t></is></c>'


def row_allergene_empty(r: int) -> str:
    """Ligne sans SKU ni allergènes ; B7:B31 = libellés liste (source validation)."""
    if 7 <= r <= 31:
        b_cell = f'<c r="B{r}" s="4" t="s"><v>{_SIDE_LIST_SST_INDEX_B7 + (r - 7)}</v></c>'
    else:
        b_cell = f'<c r="B{r}" s="1"/>'
    empty_en = "".join(f'<c r="{c}{r}" s="6"/>' for c in "EFGHIJKLMN")
    return (
        f'<row r="{r}">'
        f'<c r="A{r}" s="1"/>'
        f"{b_cell}"
        f'<c r="C{r}" s="1"/>'
        f"{empty_en}"
        "</row>"
    )


def row_description(r: int, sku: str, name: str, description: str) -> str:
    return (
        f'<row r="{r}">'
        f'<c r="A{r}" s="1"/>'
        f'<c r="B{r}" s="4" t="s"><v>45</v></c>'
        f'<c r="C{r}" s="1"/>'
        f'{inline_cell("E", r, "12", sku)}'
        f'{inline_cell("F", r, "12", name)}'
        f'{inline_cell("G", r, "12", description)}'
        f'<c r="H{r}" s="12"/>'
        f'<c r="I{r}" s="12"/>'
        f'<c r="J{r}" s="12"/>'
        f'<c r="K{r}" s="12"/>'
        "</row>"
    )


def rebuild_sheet1_empty_template(xml: str) -> str:
    m = re.search(r"<sheetData>(.*)</sheetData>", xml, re.DOTALL)
    if not m:
        raise ValueError("sheet1: sheetData introuvable")
    body = m.group(1)
    row_re = re.compile(r'<row r="(\d+)"[^>]*>.*?</row>', re.DOTALL)
    kept = [mo.group(0) for mo in row_re.finditer(body) if int(mo.group(1)) <= 6]
    tail = "".join(row_allergene_empty(r) for r in range(7, _EMPTY_ALLERGEN_LAST_ROW + 1))
    new_body = "".join(kept) + tail
    xml = xml[: m.start(1)] + new_body + xml[m.end(1) :]
    xml = re.sub(
        r'sqref="F7:N\d+"',
        f"sqref=\"F7:N{_EMPTY_ALLERGEN_LAST_ROW}\"",
        xml,
        count=1,
    )
    return xml


def rebuild_sheet2_descriptions(xml: str, desc_rows_xml: str) -> str:
    m = re.search(r"<sheetData>(.*)</sheetData>", xml, re.DOTALL)
    if not m:
        raise ValueError("sheet2: sheetData introuvable")
    body = m.group(1)
    row_re = re.compile(r'<row r="(\d+)"[^>]*>.*?</row>', re.DOTALL)
    kept = [mo.group(0) for mo in row_re.finditer(body) if int(mo.group(1)) <= 6]
    new_body = "".join(kept) + desc_rows_xml
    return xml[: m.start(1)] + new_body + xml[m.end(1) :]


def main():
    if not TEMPLATE.is_file():
        raise SystemExit(f"Modèle introuvable : {TEMPLATE}")

    conn = sqlite3.connect(DB)
    cur = conn.execute(SQL_PRODUCTS)
    products = [
        row for row in cur.fetchall() if row[0] not in PRODUCT_IDS_EXCLUS_POS
    ]
    conn.close()

    n = len(products)

    buf = io.BytesIO()
    with zipfile.ZipFile(TEMPLATE, "r") as zin:
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "xl/worksheets/sheet1.xml":
                    s1 = data.decode("utf-8")
                    s1 = rebuild_sheet1_empty_template(s1)
                    data = s1.encode("utf-8")
                elif item.filename == "xl/worksheets/sheet2.xml":
                    s2 = data.decode("utf-8")
                    desc_xml = "".join(
                        row_description(
                            DESC_FIRST_DATA_ROW + i,
                            make_sku_import(pid),
                            name or "",
                            desc or "",
                        )
                        for i, (pid, name, desc) in enumerate(products)
                    )
                    s2 = rebuild_sheet2_descriptions(s2, desc_xml)
                    data = s2.encode("utf-8")
                zout.writestr(item, data)

    OUT.write_bytes(buf.getvalue())
    last_desc = DESC_FIRST_DATA_ROW + n - 1
    print(
        f"Écrit {OUT} — {n} produits (Allergene vide, modèle seul ; "
        f"Descriptions {DESC_FIRST_DATA_ROW}–{last_desc})."
    )


if __name__ == "__main__":
    main()
