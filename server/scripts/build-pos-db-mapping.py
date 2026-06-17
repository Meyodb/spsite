#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère server/data/mapping-pos-to-db.csv à partir d'export(3).csv et soupjuice.db."""
import csv
import re
import sqlite3
import unicodedata
from pathlib import Path
from typing import Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CSV_PATH = DATA / "export(3).csv"
DB_PATH = DATA / "soupjuice.db"
OUT_PATH = DATA / "mapping-pos-to-db.csv"

# Catégories JDC hors « produit fini » (matières premières, entretien, semi-finis).
JDC_SUPPLY_CATEGORIES = frozenset(
    {
        "Antipasti",
        "Produit d'entretien",
        "Fruits et pulpe",
        "Sauces",
        "Produits de la mer",
        "Pains sandwiches",
    }
)

# Catégories JDC produit fini mais gérées manuellement sur le site (pas de sync).
JDC_MANUAL_SITE_CATEGORIES = frozenset({"Boissons", "Goodies"})

DEFAULT_JDC_URL = (
    "https://kmtmwnxtnzqbynhoztks.supabase.co/functions/v1/public-products"
)

# Département caisse → catégories JDC synchronisées.
POS_DEPT_TO_JDC_SYNC = {
    "soupes": frozenset({"Soupes"}),
    "formules soupe": frozenset({"Soupes"}),
    "plats": frozenset({"Plats chauds"}),
    "salade": frozenset({"Salades"}),
    "sandwich": frozenset({"Sandwichs"}),
    "desserts": frozenset({"Desserts", "Desserts individuels", "Cakes sucrés"}),
    "dessert": frozenset({"Desserts", "Desserts individuels", "Cakes sucrés"}),
}

# Département caisse → catégorie site gérée manuellement (hors sync JDC).
POS_DEPT_TO_SITE_MANUAL = {
    "jus de fruits": "JUS",
    "jus de fruit": "JUS",
    "formules jus": "JUS",
    "soft": "BOISSONS",
    "boissons": "BOISSONS",
    "boissons à emporter": "BOISSONS",
    "biere": "BOISSONS",
    "autres": "BOISSONS",
    "divers": "GOODIES",
}

_jdc_sync_cache = None


def fetch_jdc_sync_categories():
    """Catégories JDC éligibles à la sync (produit fini − manuel site)."""
    global _jdc_sync_cache
    if _jdc_sync_cache is not None:
        return _jdc_sync_cache

    import json
    import os
    import urllib.request

    url = os.environ.get("JDC_PUBLIC_PRODUCTS_URL", DEFAULT_JDC_URL)
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as res:
        payload = json.load(res)

    products = payload.get("products") if isinstance(payload, dict) else payload
    if not isinstance(products, list):
        products = []

    sync_cats = set()
    for p in products:
        name = (p.get("category_name") or "").strip()
        if (
            name
            and name not in JDC_SUPPLY_CATEGORIES
            and name not in JDC_MANUAL_SITE_CATEGORIES
        ):
            sync_cats.add(name)

    _jdc_sync_cache = sync_cats
    return sync_cats

# Articles opérationnels / formules / emballages — hors catalogue menu.
EXCLUDE_POS = re.compile(
    r"good day|feel good|extra\s|extra\s*0[,.]|vip\b|pot/bol|"
    r"petite bouteille|grande bouteille|eat natural|"
    r"taste of nature|supersec|soup & juice|\(jus\)|"
    r"plat chaud \(menu\)|soup menu|formule\)|hors formule",
    re.I,
)

def mapping_priority(row: dict) -> tuple:
    conf = row.get("confiance") or "aucune"
    pri = {"alias_sku": 40, "alias_nom": 30, "nom_proche": 20, "fuzzy": 10}.get(conf, 0)
    note = row.get("note") or ""
    m = re.search(r"score=(\d+)", note)
    score = int(m.group(1)) if m else 0
    try:
        sku = int(row.get("sku_pos") or 0)
    except ValueError:
        sku = 0
    return (pri, score, -sku)


def dedupe_unique_targets(rows: list) -> int:
    """Un produit site = une seule ligne mappée. Retourne le nb de doublons retirés."""
    ranked = sorted(rows, key=mapping_priority, reverse=True)
    used = set()
    cleared = 0
    for row in ranked:
        raw = row.get("id_site")
        if not raw:
            continue
        try:
            sid = int(raw)
        except (TypeError, ValueError):
            continue
        if sid in used:
            row["id_site"] = ""
            row["nom_site"] = ""
            row["confiance"] = "aucune"
            note = (row.get("note") or "").strip()
            row["note"] = (note + "; doublon produit cible retiré").strip("; ")
            cleared += 1
        else:
            used.add(sid)
    return cleared


def dedupe_sku_aliases(raw: dict) -> dict:
    """Une entrée SKU_ALIASES par produit cible maximum."""
    out = {}
    used_pids = set()
    for sku in sorted(raw.keys()):
        pid = raw[sku]
        if pid in used_pids:
            continue
        used_pids.add(pid)
        out[sku] = pid
    return out


# Correspondances explicites (SKU POS → id site), lorsque le libellé seul est ambigu.
_RAW_SKU_ALIASES = {
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
SKU_ALIASES = dedupe_sku_aliases(_RAW_SKU_ALIASES)

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


def dept_key(raw: str) -> str:
    return (raw or "").strip().lower()


def pos_row_site_category(parts: list) -> Optional[str]:
    """Retourne la catégorie (JDC sync ou site manuel), ou None si hors scope."""
    typ = (parts[4] or "").strip().lower()
    if typ != "article":
        return None
    dept = dept_key(parts[7])
    if not dept:
        return None

    nom = (parts[1] or "").strip()
    bouton = (parts[9] or "").strip()
    combined = f"{nom} {bouton}".strip()
    if combined and EXCLUDE_POS.search(combined):
        return None

    site_manual = POS_DEPT_TO_SITE_MANUAL.get(dept)
    if site_manual:
        return site_manual

    jdc_groups = POS_DEPT_TO_JDC_SYNC.get(dept)
    if not jdc_groups:
        return None
    sync_cats = fetch_jdc_sync_categories()
    matched = jdc_groups & sync_cats
    if not matched:
        return None
    return next(iter(sorted(matched)))


def prune_pos_export() -> Tuple[int, int]:
    """Supprime du CSV caisse les lignes hors catégories menu site/JDC."""
    if not CSV_PATH.exists():
        raise FileNotFoundError(CSV_PATH)

    kept_rows = []
    removed = 0
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
        kept_rows.append(header)
        for parts in reader:
            parts = list(parts)
            if pos_row_site_category(parts + [""] * max(0, 25 - len(parts))):
                kept_rows.append(parts)
            else:
                removed += 1

    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerows(kept_rows)

    return len(kept_rows) - 1, removed


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
    kept, removed = prune_pos_export()
    print(f"Export caisse filtré : {kept} conservés, {removed} supprimés → {CSV_PATH}")

    conn = sqlite3.connect(DB_PATH)
    db_products = list(conn.execute("SELECT id, name FROM produit ORDER BY id"))
    id_to_name = {r[0]: r[1] for r in db_products}

    rows_out = []
    assigned_produit_ids = set()
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        r = csv.reader(f, delimiter=";")
        header = next(r)
        for parts in r:
            parts = list(parts) + [""] * 25
            if not pos_row_site_category(parts):
                continue
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

            if site_id is not None and site_id in assigned_produit_ids:
                site_id = None
                conf = ""
                note = (note + "; " if note else "") + "produit cible déjà mappé"

            if site_id is not None:
                assigned_produit_ids.add(site_id)

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

    removed = dedupe_unique_targets(rows_out)
    if removed:
        print(f"Doublons produit cible retirés : {removed}")

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
