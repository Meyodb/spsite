#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exporte la table produit (+ catégorie) vers un .xlsx sans dépendance externe."""
import sqlite3
import zipfile
import xml.sax.saxutils as saxutils
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "soupjuice.db"
OUT = ROOT / "data" / "produits-bdd.xlsx"

HEADERS = [
    "id",
    "categorie",
    "type",
    "nom",
    "prix",
    "volume",
    "prix_supplement",
    "libelle_supplement",
    "description",
    "visible",
    "ordre",
]

# Colonnes numériques (index 0-based dans chaque ligne exportée)
NUM_COL_IDX = {4, 6, 9, 10}  # prix, prix_supplement, visible, ordre


def esc(s) -> str:
    if s is None:
        return ""
    return saxutils.escape(str(s))


def col_name(i: int) -> str:
    """Index colonne 0 -> A, 1 -> B, …"""
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
    return f'<c r="{r}"><v>{val}</v></c>'


def build_sheet(rows) -> str:
    xml_rows = []
    # Ligne 1 : en-têtes
    cells = [cell_inline_str(j, 1, HEADERS[j]) for j in range(len(HEADERS))]
    xml_rows.append(f'<row r="1">{"".join(cells)}</row>')
    for i, tup in enumerate(rows, start=2):
        cells = []
        for j, val in enumerate(tup):
            if j in NUM_COL_IDX:
                cells.append(cell_number(j, i, val))
            else:
                cells.append(cell_inline_str(j, i, val if val is not None else ""))
        xml_rows.append(f'<row r="{i}">{"".join(cells)}</row>')
    dim = f"A1:{col_name(len(HEADERS) - 1)}{len(rows) + 1}"
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="{dim}"/>
<sheetViews><sheetView workbookViewId="0"/></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<sheetData>
{"".join(xml_rows)}
</sheetData>
</worksheet>"""


def main():
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
    raw = cur.fetchall()
    conn.close()

    rows = []
    for r in raw:
        rows.append((r[0], r[1], "article", r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]))

    sheet = build_sheet(rows)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    content_types = """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

    workbook = """<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Produits" sheetId="1" r:id="rId1"/></sheets>
</workbook>"""

    wb_rels = """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>"""

    core = f"""<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
<dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Produits BDD Soup &amp; Juice</dc:title>
<dcterms:created xmlns:dcterms="http://purl.org/dc/terms/" xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{now}</dcterms:created>
</cp:coreProperties>"""

    app = """<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<Application>export-produits-xlsx.py</Application>
</Properties>"""

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", wb_rels)
        z.writestr("xl/worksheets/sheet1.xml", sheet.encode("utf-8"))
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)

    print(f"Écrit {OUT} ({len(rows)} produits)")


if __name__ == "__main__":
    main()
