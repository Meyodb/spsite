# Base de données Soup Juice

Schéma MySQL/MariaDB pour les produits, restaurants, promos et newsletter.

## Structure

| Table | Description |
|-------|-------------|
| `category` | Catégories de produits (JUS, SOUPES, PLATS CHAUDS, etc.) |
| `produit` | Produits avec nom, prix, description, visibilité, lien vers `category` |
| `restaurant` | Points de vente (ville, adresse, horaires) |
| `restaurant_service` | Services par restaurant (click&collect, terrasse…) |
| `promo` | Promotions (titre, description, code) |
| `newsletter_subscriber` | Inscrits à la newsletter |

## Création de la base

### Avec MySQL en ligne de commande

```bash
mysql -u VOTRE_USER -p
```

Puis :

```sql
CREATE DATABASE soup_juice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soup_juice;
SOURCE /chemin/vers/spsite/server/db/schema.sql;
SOURCE /chemin/vers/spsite/server/db/seed.sql;
```

### Avec phpMyAdmin

1. Créer une base `soup_juice` (interclassement `utf8mb4_unicode_ci`).
2. Onglet **SQL**, coller le contenu de `schema.sql` puis Exécuter.
3. Coller le contenu de `seed.sql` puis Exécuter.

## Données initiales

- **seed.sql** : catégories, 2 restaurants avec services, 2 promos, 5 produits d’exemple.
- Pour importer **tous les produits** du site : utiliser le script Node `seed-products-from-data.js` (à lancer après avoir configuré la connexion en `.env`).

## Variables d’environnement (pour le serveur)

À la racine du projet, dans `.env` :

```env
DB_HOST=localhost
DB_USER=votre_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=soup_juice
```

(Puis adapter le serveur Node pour lire ces variables et se connecter à la base à la place des fichiers JSON.)
