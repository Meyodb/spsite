# Annexes du mémoire

## Contenu

| Dossier / fichier | Description |
|-------------------|-------------|
| `schemas/*.mmd` | Sources Mermaid (7 schémas) |
| `captures/*.png` | Images PNG générées |
| `generate-schemas.sh` | Génère les PNG via [Kroki](https://kroki.io) |

## Régénérer les schémas (PNG)

```bash
./docs/annexes/generate-schemas.sh
```

Produit : `captures/01-chaine-sync.png` … `07-deploiement.png`.

## Captures d'écran (annexes 1 et 2)

```bash
# Serveur local sur le port 4000
npm run start

# Dans un autre terminal (Chrome / Puppeteer requis)
node scripts/capture-annexes-screenshots.mjs
```

Fichiers attendus :

- `site-01-accueil.png`, `site-02-menu-produits.png`, `site-03-restaurants.png`, `site-04-allergenes.png`
- `admin-01-login.png`, `admin-02-tableau-de-bord.png`

## Intégration dans le PDF

Le fichier `docs/memoire.md` référence les images en chemin relatif `annexes/captures/…`. Lors de l'export Word/PDF, conserver ce dossier à côté du mémoire ou incorporer les PNG dans le document final.
