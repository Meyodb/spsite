# Soup Juice

Projet frontend (Vite/React) + serveur Node.js.

## Versionnement Git / GitHub

Le dépôt Git est initialisé avec une branche `main` et un premier commit.

### Pousser sur GitHub

1. **Créer un nouveau dépôt sur GitHub**  
   - Va sur [github.com/new](https://github.com/new)  
   - Nom du dépôt : `soup-juice-test` (ou autre)  
   - Ne coche pas « Initialize with README » (le projet existe déjà)  
   - Crée le dépôt  

2. **Lier le dépôt local et pousser** (remplace `TON_USER` par ton identifiant GitHub) :

   ```bash
   git remote add origin https://github.com/TON_USER/soup-juice-test.git
   git push -u origin main
   ```

   Ou en SSH :

   ```bash
   git remote add origin git@github.com:TON_USER/soup-juice-test.git
   git push -u origin main
   ```

Ensuite, pour les prochains changements :

```bash
git add .
git commit -m "Description des changements"
git push
```
