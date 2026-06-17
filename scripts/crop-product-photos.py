#!/usr/bin/env python3
"""Recadre les photos produits au format 4:3 (cartes menu) avec point focal sur le plat."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "public" / "images" / "products"
TARGET_RATIO = 4 / 3
TOLERANCE = 0.05

# Point focal (x, y) en fraction de l'image source — ajusté par produit si besoin.
FOCAL_OVERRIDES: dict[str, tuple[float, float]] = {
    # Soupes portrait : bol dans le tiers inférieur
    "71": (0.5, 0.50),
    "73": (0.5, 0.54),
    "74": (0.5, 0.54),
    "185": (0.5, 0.52),
    "189": (0.5, 0.54),
    "190": (0.5, 0.54),
    "195": (0.5, 0.54),
    "199": (0.5, 0.54),
    "200": (0.5, 0.54),
    "211": (0.5, 0.52),
    "213": (0.5, 0.54),
    "254": (0.5, 0.54),
    # Salades : mains + bol, cadrage un peu plus bas
    "30": (0.5, 0.46),
    "31": (0.5, 0.46),
    "32": (0.5, 0.46),
    "99": (0.5, 0.46),
    "146": (0.5, 0.46),
    "225": (0.48, 0.56),
    "251": (0.5, 0.40),
    "108": (0.5, 0.40),
    # Plats chauds
    "86": (0.5, 0.44),
    "248": (0.5, 0.44),
    "253": (0.5, 0.42),
    "26": (0.5, 0.46),
    "27": (0.5, 0.46),
    # Milkshakes : verre centré
    "15": (0.5, 0.52),
    "17": (0.5, 0.52),
    "18": (0.5, 0.52),
    "19": (0.5, 0.52),
    # Soupe carottes courgettes panais
    "183": (0.5, 0.54),
    "255": (0.5, 0.54),
    # Sandwichs / wraps
    "34": (0.5, 0.48),
    "35": (0.5, 0.48),
    "109": (0.5, 0.48),
    "114": (0.5, 0.48),
    "249": (0.5, 0.48),
    "252": (0.5, 0.48),
    "117": (0.5, 0.48),
    "119": (0.5, 0.48),
    "142": (0.5, 0.48),
}


def default_focal(w: int, h: int) -> tuple[float, float]:
    ratio = w / h
    if ratio < 0.95:
        return (0.5, 0.44)
    if ratio > 1.05:
        return (0.5, 0.50)
    return (0.5, 0.48)


def crop_box(w: int, h: int, focal: tuple[float, float]) -> tuple[int, int, int, int]:
    ratio = w / h
    fx, fy = focal

    if ratio > TARGET_RATIO:
        crop_h = h
        crop_w = int(round(crop_h * TARGET_RATIO))
    else:
        crop_w = w
        crop_h = int(round(crop_w / TARGET_RATIO))

    cx = fx * w
    cy = fy * h
    left = int(round(cx - crop_w / 2))
    top = int(round(cy - crop_h / 2))
    left = max(0, min(left, w - crop_w))
    top = max(0, min(top, h - crop_h))
    return left, top, left + crop_w, top + crop_h


def process_file(path: Path) -> str | None:
    stem = path.stem.split("_")[0]
    with Image.open(path) as im:
        w, h = im.size
        ratio = w / h
        if abs(ratio - TARGET_RATIO) <= TOLERANCE:
            return None

        focal = FOCAL_OVERRIDES.get(stem, default_focal(w, h))
        box = crop_box(w, h, focal)
        cropped = im.crop(box)
        if cropped.mode not in ("RGB", "L"):
            cropped = cropped.convert("RGB")
        cropped.save(path, format="JPEG", quality=92, optimize=True)
        nw, nh = cropped.size
        return f"{path.name}: {w}x{h} -> {nw}x{nh} (focal {focal})"


def main() -> None:
    changed = 0
    for path in sorted(ROOT.glob("*.png")):
        if "_" in path.stem and not path.stem.endswith("_2"):
            # variantes carrousel (_2, _3…) : même logique
            pass
        result = process_file(path)
        if result:
            print(result)
            changed += 1
    print(f"\n{changed} photo(s) recadrée(s) au format 4:3.")


if __name__ == "__main__":
    main()
