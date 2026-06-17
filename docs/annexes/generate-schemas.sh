#!/usr/bin/env bash
# Génère les PNG des schémas Mermaid pour le mémoire.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SCHEMAS="$ROOT/schemas"
OUT="$ROOT/captures"
mkdir -p "$OUT"

for mmd in "$SCHEMAS"/*.mmd; do
  base="$(basename "$mmd" .mmd)"
  echo "→ $base.png"
  curl -sS -X POST "https://kroki.io/mermaid/png" \
    -H "Content-Type: text/plain" \
    --data-binary @"$mmd" \
    -o "$OUT/$base.png"
done

echo "Terminé : $(ls -1 "$OUT"/*.png 2>/dev/null | wc -l) images dans $OUT"
