#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copie les photos produit (frontend/public/images/products/) vers un dossier d’export,
classées par catégorie, fichiers renommés avec le titre du produit.

Alias d’image alignés sur frontend/src/components/ProductImage.jsx
"""
import shutil
import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
DB = ROOT / "server" / "data" / "soupjuice.db"
IMG_SRC = ROOT / "frontend" / "public" / "images" / "products"
DEFAULT_OUT = ROOT / "server" / "data" / "product-photos-export"

# Même logique que ProductImage.jsx (IMAGE_ID_ALIAS)
IMAGE_ID_ALIAS = {
    1: 222,
    42: 90,
    186: 185,
    191: 190,
    212: 211,
}

EXT_FIRST = ("png", "jpg", "jpeg")
EXT_EXTRA = ("png", "jpg", "jpeg")

SQL = """
SELECT p.id, p.name, c.code, c.sort_order, p.sort_order
FROM produit p
JOIN category c ON c.id = p.category_id
ORDER BY c.sort_order, p.sort_order, p.id
"""


def resolve_image_product_id(product_id: int) -> int:
    return IMAGE_ID_ALIAS.get(product_id, product_id)


def sanitize_filename(title: str, max_len: int = 180) -> str:
    t = (title or "").strip()
    for ch in '\\/:*?"<>|':
        t = t.replace(ch, "_")
    t = t.strip().rstrip(".")
    if len(t) > max_len:
        t = t[:max_len].rstrip()
    return t or "sans_nom"


def sanitize_category_folder(code: str) -> str:
    c = (code or "AUTRES").strip().replace(" ", "_")
    return sanitize_filename(c, max_len=80)


def collect_images_for_id(image_id: int) -> List[Tuple[int, Path]]:
    """Retourne [(index_slide, path), ...] — slide 0 = fichier principal."""
    out: List[Tuple[int, Path]] = []
    found_first = False
    for ext in EXT_FIRST:
        p = IMG_SRC / f"{image_id}.{ext}"
        if p.is_file():
            out.append((0, p))
            found_first = True
            break
    if not found_first:
        return []
    n = 2
    while n <= 50:
        found = False
        for ext in EXT_EXTRA:
            p = IMG_SRC / f"{image_id}_{n}.{ext}"
            if p.is_file():
                out.append((n - 1, p))
                found = True
                break
        if not found:
            break
        n += 1
    return out


def main():
    import argparse

    ap = argparse.ArgumentParser(description="Export photos produits par catégorie")
    ap.add_argument(
        "-o",
        "--out",
        type=Path,
        default=DEFAULT_OUT,
        help=f"Dossier de sortie (défaut: {DEFAULT_OUT})",
    )
    ap.add_argument(
        "--clean",
        action="store_true",
        help="Vider le dossier de sortie avant copie",
    )
    args = ap.parse_args()
    out_root: Path = args.out

    if not DB.is_file():
        raise SystemExit(f"Base introuvable : {DB}")
    if not IMG_SRC.is_dir():
        raise SystemExit(f"Dossier images introuvable : {IMG_SRC}")

    if args.clean and out_root.exists():
        shutil.rmtree(out_root)
    out_root.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB)
    rows = conn.execute(SQL).fetchall()
    conn.close()

    occupied: Dict[str, set] = defaultdict(set)
    copied = 0
    skipped = 0
    missing: List[int] = []

    for pid, name, cat_code, _, _ in rows:
        img_id = resolve_image_product_id(pid)
        sources = collect_images_for_id(img_id)
        if not sources:
            skipped += 1
            missing.append(pid)
            continue

        cat_key = sanitize_category_folder(cat_code)
        cat_dir = out_root / cat_key
        cat_dir.mkdir(parents=True, exist_ok=True)

        base_title = sanitize_filename(name)
        for slide_idx, src in sources:
            ext = src.suffix.lower() or ".png"
            if slide_idx == 0:
                stem = base_title
            else:
                stem = f"{base_title}_{slide_idx + 1}"
            if stem in occupied[cat_key]:
                stem = (
                    f"{base_title}_{pid}"
                    if slide_idx == 0
                    else f"{base_title}_{slide_idx + 1}_{pid}"
                )
            while stem in occupied[cat_key]:
                stem = f"{stem}_{pid}"
            occupied[cat_key].add(stem)
            dest = cat_dir / f"{stem}{ext}"
            shutil.copy2(src, dest)
            copied += 1

    print(f"Export : {out_root}")
    print(f"Fichiers copiés : {copied}")
    print(f"Produits sans image sur disque : {skipped}")
    if missing and len(missing) <= 30:
        print(f"Ids sans fichier : {missing}")


if __name__ == "__main__":
    main()
