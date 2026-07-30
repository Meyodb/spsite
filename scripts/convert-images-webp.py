#!/usr/bin/env python3
"""
Convertit en WebP les photos volumineuses des assets du frontend.

Les logos et pictogrammes sont laissés tels quels : leur poids est faible et
la transparence PNG y est souvent mieux maîtrisée.

    python3 scripts/convert-images-webp.py [--min-ko 80] [--quality 82]
"""
import argparse
import pathlib
import sys
from typing import Tuple

from PIL import Image

ASSETS_DIR = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "src" / "assets" / "images"
EXTENSIONS = {".png", ".jpg", ".jpeg"}


def convert(path: pathlib.Path, quality: int) -> Tuple[int, int]:
    image = Image.open(path)
    target = path.with_suffix(".webp")

    # La transparence est conservée ; les JPEG sont ramenés en RGB.
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
    else:
        image = image.convert("RGB")

    image.save(target, "WEBP", quality=quality, method=6)
    return path.stat().st_size, target.stat().st_size


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--min-ko", type=int, default=80)
    parser.add_argument("--quality", type=int, default=82)
    args = parser.parse_args()

    if not ASSETS_DIR.is_dir():
        print(f"Dossier introuvable : {ASSETS_DIR}", file=sys.stderr)
        return 1

    threshold = args.min_ko * 1024
    total_before = total_after = 0

    for path in sorted(ASSETS_DIR.rglob("*")):
        if path.suffix.lower() not in EXTENSIONS or path.stat().st_size < threshold:
            continue

        before, after = convert(path, args.quality)
        total_before += before
        total_after += after
        gain = 100 * (1 - after / before)
        print(f"{before / 1024:8.1f} Ko -> {after / 1024:7.1f} Ko  (-{gain:4.1f}%)  {path.name}")

    if total_before:
        gain = 100 * (1 - total_after / total_before)
        print(f"\nTotal : {total_before / 1024:.0f} Ko -> {total_after / 1024:.0f} Ko (-{gain:.1f}%)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
