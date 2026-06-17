# Résumé complet du projet Soup & Juice

> Document de synthèse autonome. Il rassemble **toutes** les informations sur le projet
> (contexte, fonctionnalités, architecture, technique, mission principale) afin de pouvoir
> être fourni tel quel à un autre outil pour générer un document final mis en forme
> (mémoire, rapport, présentation). Tout le contenu factuel est issu du code réel du projet.

---

## 1. Présentation générale

**Soup & Juice** est le site web officiel d'une **chaîne parisienne de restauration rapide « healthy »**, spécialisée dans les **soupes maison** et les **jus frais pressés**. Le projet est une application **full-stack** déployée en production sur le domaine `www.soup-juice.net`.

Il se compose de quatre volets :

1. Un **site vitrine public** multilingue (français / anglais).
2. Une **API backend** (Node.js / Express).
3. Un **back-office d'administration** pour gérer le catalogue.
4. Un **espace de formation interne** pour les équipes en restaurant.

### Chiffres clés

- **~158 produits** répartis en **10 catégories** (jus, soupes, plats chauds, salades, sandwichs, milkshakes, boosters, desserts, boissons, goodies).
- **9 restaurants** parisiens cartographiés.
- **14 allergènes** réglementaires européens gérés.
- **2 langues** : français et anglais.

---

## 2. L'entreprise

- Chaîne parisienne de restauration rapide healthy.
- Spécialités : soupes maison et jus frais pressés.
- Canaux d'activité : vente en restaurant (sur place / à emporter), traiteur (catering) pour entreprises, présence digitale.
- Système de caisse interne : **JDC**, référentiel des produits réellement vendus (prix, disponibilité).
- Identité de marque déclinée sur le site (pages ADN, piliers, engagements).

---

## 3. Fonctionnalités

### Site public

| Page / route | Fonction |
|--------------|----------|
| `/` | Accueil : vidéo hero, newsletter, présentation de la marque |
| `/produits` | Menu interactif par catégories, fiches produit, photos, pictogrammes allergènes |
| `/restaurants` | Carte interactive (MapLibre), 9 restaurants, métro RATP, monuments |
| `/restaurants/:slug` | Fiche détaillée d'un restaurant |
| `/adn`, `/nos-piliers` | Identité, valeurs, engagements |
| `/catering` | Offre traiteur entreprise |
| `/contact` | Formulaire (particulier / professionnel) → API + email |
| `/allergenes` | Tableau des allergènes imprimable |
| `/faq` | Questions fréquentes |
| `/formation`, `/formation/:sectionId` | Espace formation interne (protégé par code) |
| Pages légales | CGU, mentions légales, confidentialité, cookies |

### Fonctionnalités transverses

- **Internationalisation** FR/EN (y compris les noms de produits).
- **SEO** : génération de pages statiques (SSG), balises canoniques, données structurées (JSON-LD), Open Graph, sitemap.
- **Chatbot hybride** : arbre de décision statique + mode IA (Google Gemini).
- **Consentement RGPD** (bandeau cookies).
- **Chargement différé** (lazy loading) des pages.
- **Accessibilité** : focus trap des modales, attributs ARIA.

### Back-office d'administration

- CRUD produits (nom, catégorie, prix, visibilité, image, `jdc_id`).
- Gestion des 14 allergènes réglementaires.
- Traductions FR/EN par produit.
- Fiches enrichies (ingrédients clés, bienfaits, formules, végétarien/végan).
- Mapping caisse (POS) : liaison boutons de caisse ↔ produits.
- Synchronisation JDC (import du catalogue caisse).
- Upload d'images produits.
- Diagnostic de la base, liste des messages de contact et abonnés newsletter.

---

## 4. Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                        Navigateur                            │
│  React SPA (hydratée depuis HTML SSG) + Chatbot + i18n + Map │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP (même origine en production)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Express 5 (port 4000)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ SPA statique│  │ API REST     │  │ Admin HTML+session  │  │
│  │ (frontend)  │  │ /api/*       │  │ /admin              │  │
│  └─────────────┘  └──────┬───────┘  └─────────────────────┘  │
└──────────────────────────┼───────────────────────────────────┘
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   SQLite (db.js)    Google Gemini      Supabase / JDC
   soupjuice.db      (chatbot)          (sync catalogue)
         │
         ▼
   Nodemailer SMTP (contact)
```

### Stack technologique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, Vite 7, React Router 7 |
| Rendu | SSG (génération statique) + hydratation, react-helmet-async |
| i18n | i18next, react-i18next |
| Cartographie | MapLibre GL, Leaflet (données métro Paris) |
| Backend | Node.js (modules ES), Express 5 |
| Base de données | SQLite via `better-sqlite3` |
| Auth admin | express-session |
| Sécurité | Helmet (CSP), CORS, redirection HTTPS |
| Email | Nodemailer (SMTP) |
| IA | Google Gemini (`gemini-2.5-flash`) |
| Upload | Multer |
| Déploiement | PM2, Nginx (reverse proxy) |

### Principaux endpoints API

| Endpoint | Rôle |
|----------|------|
| `GET /api/catalog` | Catalogue complet (produits + allergènes + fiches) |
| `GET /api/products` | Liste des produits (filtres langue, visibilité) |
| `GET /api/products/:id/sheet` | Fiche enrichie d'un produit |
| `GET /api/allergenes` | Référentiel des allergènes |
| `GET /api/stores` | Restaurants |
| `POST /api/contact` | Formulaire de contact |
| `POST /api/newsletter/subscribe` | Inscription newsletter |
| `POST /api/chat` | Chatbot IA |
| `/api/admin/*` | Routes protégées par session admin |

---

## 5. La mission principale : synchronisation du catalogue site ↔ caisse JDC

### Problématique

Comment garantir que le menu publié en ligne reste cohérent avec le catalogue réel de la caisse (JDC), sans figer les produits dont la présentation relève d'un travail éditorial propre au site ?

Avant la mission, les deux systèmes étaient désynchronisés : tout changement en caisse devait être reporté **manuellement** sur le site (chronophage et source d'erreurs).

### Concept clé : le mode de gestion par catégorie (`managed_by`)

Chaque catégorie du site porte un attribut `managed_by` :

- **`'jdc'`** : catégorie pilotée par la caisse (produits créés / réactivés / masqués automatiquement) — ex. soupes, plats chauds, salades, sandwichs.
- **`'site'`** : catégorie 100 % manuelle, jamais touchée par la synchronisation — jus, milkshakes, boosters, goodies, boissons, desserts.

### Règles de filtrage des catégories JDC

- Catégories matières premières / entretien (antipasti, sauces, pains, produits d'entretien…) : **toujours exclues**.
- Catégories produit fini gérées manuellement (boissons, goodies, desserts…) : **exclues**.
- Le reste (soupes, plats chauds, salades, sandwichs) : **synchronisable**.

### Le processus de synchronisation (cycle complet)

1. **Récupération** des produits via l'API publique JDC (fonction Edge Supabase, JSON). Validation de la réponse.
2. **Filtrage** : on ne garde que les produits des catégories synchronisables.
3. **Garde-fou anti-vidage** : si aucune catégorie n'est mappée vers une catégorie site `'jdc'`, le cycle est **entièrement sauté** (statut `no_category_mappings`).
4. **Transaction** (atomique) :
   - enregistrement des catégories JDC vues (table de mapping, sans écraser les mappings existants) ;
   - pour chaque produit JDC éligible : **ignoré** (catégorie non mappée), **créé** (inexistant), **réactivé** (existant mais masqué), ou **laissé tel quel** (existant et visible — métadonnées préservées) ;
   - **masquage** (`visible = 0`) des produits du site en catégorie `'jdc'` absents de la liste JDC (jamais supprimés).
5. **Compte rendu** : statistiques (reçus, créés, réactivés, désactivés, ignorés, visibles avant/après, durée).

### Déclencheurs

- Au **démarrage** du serveur (best-effort).
- **Périodiquement** (intervalle configurable, 30 min par défaut).
- **À la demande** depuis le back-office.

### Robustesse

- **Verrou** empêchant deux synchronisations simultanées.
- **Transaction** garantissant l'atomicité.
- **Capture et traçage** des erreurs sans interruption de service.
- Choix de **masquer plutôt que supprimer** (réversibilité).

### Résultats

- Cohérence du menu maintenue **automatiquement**.
- Suppression d'une tâche manuelle répétitive et faillible.
- Catégories éditoriales **entièrement maîtrisées**.
- Système **découvrable** (nouvelles catégories signalées à l'admin).
- Rapport de synchronisation consultable dans le back-office.

---

## 6. Analyse réflexive

### Apports théoriques mobilisés

Architecture client-serveur et API REST, modélisation de bases de données, transactions et atomicité, intégration de systèmes hétérogènes, sécurité web (CSP, sessions, HTTPS, rate limiting), SEO (SSG, JSON-LD), accessibilité (ARIA, RGPD), internationalisation.

### Atouts

- Architecture monolithique pragmatique (déploiement et maintenance simplifiés).
- Automatisation fiabilisée de la cohérence du catalogue.
- Réversibilité et prudence (masquage, garde-fous, transactions).
- Montée en compétences full-stack (du frontend au déploiement).

### Limites

- SQLite : adapté au volume actuel mais limité en forte montée en charge.
- Absence de tests automatisés.
- Dépendance à des services externes (Gemini, API JDC).
- Back-office en JavaScript « vanilla ».
- Couplage au format de l'API JDC.

### Plan d'amélioration

- Tests automatisés (unitaires et d'intégration).
- Conteneurisation (Docker) et CI/CD.
- Migration éventuelle vers une base serveur (PostgreSQL/MySQL).
- Observabilité (journalisation structurée, supervision).
- Refonte progressive du back-office.

### Apport personnel

Développement de l'autonomie (analyse, conception, réalisation, mise en production) et sensibilité aux contraintes métier : un bon outil doit s'intégrer aux usages, rester réversible et ne jamais mettre en péril les données de l'entreprise.

---

## 7. Configuration et déploiement

### Variables d'environnement principales

- `GEMINI_API_KEY`, `GEMINI_MODEL` — chatbot IA.
- `JDC_SYNC_ENABLED`, `JDC_PUBLIC_PRODUCTS_URL`, `JDC_ANON_KEY`, `JDC_SYNC_INTERVAL_MIN` — synchronisation catalogue.
- `PORT` — port serveur (4000 par défaut).
- `ADMIN_SESSION_SECRET` — secret de session admin.
- `SMTP_*`, `CONTACT_TO`, `CONTACT_FROM` — emails de contact.
- `NODE_ENV=production` — HTTPS et cookies sécurisés.

### Scripts principaux

- `npm run build` — build Vite + génération statique (SSG).
- `npm run start` — démarrage du serveur.
- `npm run deploy` — build + redémarrage PM2.
- `npm run db:migrate` — migration des données vers SQLite.
- `npm run db:diagnostic` — diagnostic de la base.

### Pipeline de build

1. `vite build` → `frontend/dist/`
2. `vite build --ssr` → `frontend/dist-ssr/`
3. Script SSG → pré-rendu de ~15 routes en HTML statique.
4. Hydratation côté client.

### Déploiement production

- Build du frontend.
- Démarrage via PM2 (`pm2 start server/server.js --name spsite`).
- Option reverse proxy Nginx (ports 80/443 → 4000).
- Redirection HTTPS automatique en production.

---

## 8. Structure du projet

```
spsite/
├── frontend/          Application React (Vite)
│   ├── src/
│   │   ├── pages/      ~20 pages/vues
│   │   ├── components/ Header, Footer, Chatbot, ProductSheet…
│   │   ├── locales/    fr.json, en.json
│   │   └── data/       Données statiques (fallback)
│   └── scripts/ssg.mjs Pré-rendu statique
├── server/            API + admin + base de données
│   ├── server.js      Point d'entrée Express
│   ├── db.js          Couche SQLite
│   ├── chat.js        Chatbot Gemini
│   ├── jdc-sync.js    Synchronisation JDC
│   ├── jdc-categories.js  Règles de catégories JDC ↔ site
│   ├── admin.html     Back-office (vanilla JS)
│   └── data/          Base SQLite, mapping POS
├── scripts/           deploy.sh, compression d'images, tunnel
└── docs/              Documentation (déploiement, allergènes, mémoire)
```
