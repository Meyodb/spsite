#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère server/data/mapping-pos-to-db.csv à partir d'export(3).csv et soupjuice.db."""
import csv
import re
import sqlite3
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CSV_PATH = DATA / "export(3).csv"
DB_PATH = DATA / "soupjuice.db"
OUT_PATH = DATA / "mapping-pos-to-db.csv"

# Correspondances explicites (SKU POS → id site), lorsque le libellé seul est ambigu.
SKU_ALIASES = {
    41: 60,
    42: 61,
    43: 24,
    2171: 62,
    2172: 63,
    2147: 75,
    2153: 75,
    2159: 75,
    2160: 75,
    2201: 221,
    2204: 2,
    2205: 3,
    2423: 141,
    1460: 37,
    1459: 115,
    2328: 117,
    2008: 109,
    3000: 33,
    1461: 35,
    1462: 34,
    1801: 99,
    824: 30,
    2986: 146,
    3007: 32,
    1807: 27,
    1809: 26,
    1810: 42,
    2939: 43,
    2002: 93,
    2894: 85,
    237: 28,
    242: 94,
    1465: 105,
    1466: 97,
    1467: 31,
    1469: 85,
    2253: 88,
    2081: 111,
    2322: 118,
    2896: 114,
    821: 100,
    1463: 106,
    2341: 104,
    2347: 95,
    2353: 102,
    2404: 96,
    2923: 95,
    1795: 106,
    1789: 98,
    3035: 105,
    3028: 100,
    3014: 108,
    2189: 108,
    2922: 108,
    2316: 113,
    1967: 74,
    1968: 73,
    1969: 73,
    2017: 195,
    2014: 45,
    1833: 47,
    2054: 49,
    114: 48,
    97: 50,
    1955: 51,
    1956: 51,
    94: 45,
    98: 45,
    100: 65,
    106: 44,
    117: 68,
    123: 67,
    127: 47,
    1130: 47,
    2364: 123,
    3042: 9,
    3049: 25,
    2936: 25,
    2946: 23,
    3056: 15,
    71: 128,
    130: 29,
    131: 31,
    825: 187,
    2015: 183,
    2016: 210,
    2036: 217,
    2037: 214,
    2048: 202,
    2111: 215,
    2117: 191,
    2118: 201,
    2129: 209,
    2135: 186,
    2141: 81,
    2237: 194,
    2243: 72,
    2260: 73,
    2266: 203,
    2292: 190,
    2293: 185,
    2304: 200,
    2310: 199,
    2370: 188,
    2376: 213,
    2395: 196,
    2195: 219,
    2465: 205,
    2937: 89,
    1996: 42,
    1808: 84,
}

# Même id POS pour plusieurs lignes site (on prend le représentant le plus parlant)
# Mots trop génériques pour un rapprochement par sous-chaîne seul (ex. bouton « Salade » → SALADE FRUIT).
GENERIC_TOKENS = frozenset(
    "salade soupe jus cake sandwich menu dessert plat fruit boisson cookie chips extra".split()
)

NAME_ALIASES = [
    (re.compile(r"^evian$", re.I), 60),
    (re.compile(r"san pellegrino", re.I), 61),
    (re.compile(r"^cafe$", re.I), 24),
    (re.compile(r"^tea$", re.I), 23),
    (re.compile(r"coca cola zero", re.I), 63),
    (re.compile(r"coca cola", re.I), 62),
    (re.compile(r"vitamin water", re.I), 75),
    (re.compile(r"vita coco", re.I), 76),
    (re.compile(r"perle de chia", re.I), 123),
    (re.compile(r"chia mangue", re.I), 124),
    (re.compile(r"tote bag", re.I), 141),
    (re.compile(r"shot collagen|booster.*colag", re.I), 25),
    (re.compile(r"booster.*spiruline", re.I), 9),
]


def norm(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def tokens(s: str) -> set:
    return {t for t in norm(s).split() if len(t) > 1}


def score_match(csv_text: str, db_name: str) -> float:
    a, b = norm(csv_text), norm(db_name)
    if not a or not b:
        return 0.0
    if a == b:
        return 100.0
    # Éviter les faux positifs (ex. "c" de "C++" dans "carottes")
    if len(a) >= 4 and len(b) >= 4 and (a in b or b in a):
        sa, sb = set(a.split()), set(b.split())
        if (len(sa) == 1 and next(iter(sa)) in GENERIC_TOKENS) or (
            len(sb) == 1 and next(iter(sb)) in GENERIC_TOKENS
        ):
            pass
        else:
            return 90.0 - min(abs(len(a) - len(b)), 20) * 0.2
    ta, tb = tokens(csv_text), tokens(db_name)
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    union = len(ta | tb)
    j = inter / union
    if j >= 0.55:
        return 55 + 35 * j
    if inter >= 3 and j >= 0.35:
        return 40 + 20 * j
    return 0.0


def main():
    conn = sqlite3.connect(DB_PATH)
    db_products = list(conn.execute("SELECT id, name FROM produit ORDER BY id"))
    id_to_name = {r[0]: r[1] for r in db_products}

    rows_out = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        r = csv.reader(f, delimiter=";")
        header = next(r)
        for parts in r:
            parts = list(parts) + [""] * 25
            sku_s = parts[0]
            nom = (parts[1] or "").strip()
            typ = (parts[4] or "").strip()
            prix = parts[5] or ""
            bouton = (parts[9] or "").strip()
            try:
                sku = int(sku_s)
            except ValueError:
                continue
            nom_aff = nom if nom else "(sans nom)"
            combined = f"{nom} {bouton}".strip()
            if not combined and typ in ("article",):
                continue

            site_id = None
            conf = ""
            note = ""

            if sku in SKU_ALIASES:
                site_id = SKU_ALIASES[sku]
                conf = "alias_sku"
                note = "mapping manuel scripts/build-pos-db-mapping.py"

            if site_id is None and nom:
                for rx, pid in NAME_ALIASES:
                    if rx.search(nom) or (bouton and rx.search(bouton)):
                        site_id = pid
                        conf = "alias_nom"
                        break

            if site_id is None and combined:
                best, best_s = None, 0.0
                for pid, pname in db_products:
                    s1 = score_match(nom, pname) if nom else 0
                    s2 = score_match(bouton, pname) if bouton else 0
                    s = max(s1, s2)
                    if s > best_s:
                        best_s, best = s, (pid, pname)
                if best and best_s >= 45:
                    site_id, _ = best
                    conf = "fuzzy" if best_s < 88 else "nom_proche"
                    note = f"score={best_s:.0f}"

            if typ in ("groupe", "formule"):
                note = (note + "; " if note else "") + f"type_csv={typ}"

            rows_out.append(
                {
                    "sku_pos": sku,
                    "nom_pos": nom_aff,
                    "nom_bouton_pos": bouton,
                    "type_csv": typ,
                    "prix_pos": prix,
                    "id_site": site_id if site_id is not None else "",
                    "nom_site": id_to_name.get(site_id, "") if site_id else "",
                    "confiance": conf or ("aucune" if not site_id else ""),
                    "note": note.strip("; "),
                }
            )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "sku_pos",
        "nom_pos",
        "nom_bouton_pos",
        "type_csv",
        "prix_pos",
        "id_site",
        "nom_site",
        "confiance",
        "note",
    ]
    with OUT_PATH.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        w.writeheader()
        w.writerows(rows_out)

    n_ok = sum(1 for x in rows_out if x["id_site"] != "")
    print(f"Écrit {OUT_PATH} ({len(rows_out)} lignes, {n_ok} avec id_site)")


if __name__ == "__main__":
    main()
