# Exposer le site en local sur Internet

Ce guide permet d’accéder à votre site (frontend + API) depuis n’importe où via une URL publique, sans hébergement.

## Prérequis

- **Node.js** installé
- Le **frontend** (Vite) et le **serveur** (Express) tournent en local

## Méthode 1 : localtunnel (gratuit, sans compte)

### 1. Démarrer le backend et le frontend

Dans **deux terminaux** :

```bash
# Terminal 1 – API (port 4000)
cd server && npm run dev
```

```bash
# Terminal 2 – Frontend (port 5173)
cd frontend && npm run dev
```

### 2. Créer les tunnels

Dans **deux autres terminaux** :

```bash
# Tunnel vers l’API (port 4000)
npx localtunnel --port 4000
# Notez l’URL affichée, ex: https://xxxx-xx-xx-xx-xx.loca.lt
```

```bash
# Tunnel vers le frontend (port 5173)
npx localtunnel --port 5173
# Notez l’URL affichée, ex: https://yyyy-yy-yy-yy-yy.loca.lt
```

### 3. Relancer le frontend avec l’URL publique de l’API

Arrêtez le frontend (Ctrl+C), puis relancez-le en indiquant l’URL du tunnel **backend** :

```bash
cd frontend
VITE_API_URL=https://VOTRE-URL-BACKEND.loca.lt npm run dev
```

Remplacez `VOTRE-URL-BACKEND.loca.lt` par l’URL donnée par localtunnel pour le port 4000 (sans slash final).

### 4. Accéder au site

- **Site (interface)** : ouvrez dans le navigateur l’URL du tunnel **frontend** (port 5173).
- La newsletter et les appels API utiliseront automatiquement l’URL du tunnel backend.

**Note :** Avec localtunnel, la première visite peut demander votre adresse IP pour vérification.

---

## Méthode 2 : ngrok (gratuit avec compte)

1. Créez un compte sur [ngrok.com](https://ngrok.com) et installez la CLI.
2. Démarrez backend et frontend comme ci-dessus.
3. Dans deux terminaux :

```bash
ngrok http 4000   # tunnel API
ngrok http 5173   # tunnel frontend
```

4. Relancez le frontend avec l’URL HTTPS ngrok du backend :

```bash
cd frontend
VITE_API_URL=https://xxxx.ngrok-free.app npm run dev
```

5. Ouvrez l’URL ngrok du frontend dans le navigateur.

---

## Méthode 3 : accès direct par l’IP de la box (un seul port)

Avec cette méthode, tout tourne sur **un seul port** (ex. 4000). Vous ouvrez ce port sur votre box (redirection de ports) et vous accédez au site via `http://VOTRE_IP_PUBLIQUE:4000`.

### 1. Build du frontend

Le frontend est servi par le même serveur que l’API, il faut d’abord le builder :

```bash
cd frontend
npm run build
```

### 2. Démarrer le serveur

Le serveur écoute sur toutes les interfaces (`0.0.0.0`), donc accessible depuis le réseau et Internet une fois la box configurée :

```bash
cd server
npm run dev
```

Le site est alors dispo en local sur : `http://localhost:4000` (et sur `http://VOTRE_IP_LOCALE:4000` depuis un autre appareil du même réseau).

### 3. Redirection de ports sur la box

1. Trouvez l’**IP publique** de votre box (ex. sur [whatismyip.com](https://www.whatismyip.com/) ou dans l’interface de la box).
2. Connectez-vous à l’**interface d’administration** de votre box (souvent `192.168.1.1` ou `192.168.0.1`).
3. Allez dans la section **NAT / Redirection de ports / Port forwarding**.
4. Créez une règle :
   - **Port externe** : 4000 (ou 80 si vous voulez éviter de mettre `:4000` dans l’URL).  
     **Certaines box (ex. Free) n’acceptent que les ports > 32768** : mettez alors **Port externe** = **40000** (ou 32769–65535), **Port interne/destination** = **4000**. Vous accéderez au site via `http://VOTRE_IP:40000/`.
   - **Port interne / destination** : 4000.
   - **IP interne (IP Destination)** : l’IP de votre PC sur le réseau local (ex. `192.168.1.137`). À vérifier avec `ip addr` (Linux) ou `ipconfig` (Windows).
   - **Protocole** : TCP (parfois TCP/UDP).

### 4. Firewall sur votre PC

Autorisez les connexions entrantes sur le port utilisé (4000 ou 40000) :

- **Linux (ufw)** : `sudo ufw allow 4000/tcp && sudo ufw reload` (ou 40000 si vous utilisez ce port).
- **Windows** : Règle entrante dans « Pare-feu Windows » pour le port concerné.

### 4b. Si le serveur tourne dans WSL (Windows)

La box envoie le trafic vers **Windows** (192.168.1.137), pas vers WSL. Il faut rediriger le port Windows → WSL :

1. **Ouvrez PowerShell en tant qu’administrateur** (clic droit → « Exécuter en tant qu’administrateur »).
2. Allez dans le dossier du projet (ex. `cd C:\Users\MEYO\...\soup-juice-test` si le projet est sur Windows, ou copiez le script ci-dessous).
3. Exécutez :  
   `powershell -ExecutionPolicy Bypass -File .\rediriger-port-windows.ps1`  
   (ou exécutez directement `rediriger-port-windows.ps1` depuis l’explorateur après un clic droit « Exécuter avec PowerShell » en admin.)

Le script configure le transfert de port Windows → WSL et ouvre le pare-feu. **À relancer après chaque redémarrage de WSL** (l’IP de WSL peut changer).

### 5. Accéder au site depuis Internet

Ouvrez dans un navigateur : `http://VOTRE_IP_PUBLIQUE:4000` (en remplaçant par l’IP affichée sur whatismyip ou par la box).

**Adresse de ce projet :** `http://88.160.27.73:4000/` (ou `http://88.160.27.73:40000/` si la box impose un port externe > 32768).

**Mise en ligne en une commande** (depuis la racine du projet) :

```bash
./mettre-en-ligne.sh
```

**À savoir :**

- L’**IP publique** peut changer (box redémarrée, FAI) : à vérifier si le lien ne marche plus.
- Pas de **HTTPS** : le trafic est en HTTP. Pour du HTTPS il faudrait un reverse proxy (ex. Caddy, Nginx) ou un tunnel (ngrok, Cloudflare).
- Certains FAI bloquent les ports entrants (80, 443, parfois d’autres) : le port 4000 fonctionne souvent.

---

## Résumé des ports

| Service   | Port local | Usage                    |
|----------|------------|--------------------------|
| Backend  | 4000       | API (menu, newsletter…)  |
| Frontend | 5173       | Interface React (Vite) — méthodes 1 et 2 uniquement |

**Méthode 3 (IP de la box)** : un seul port (4000) pour le site et l’API.

L’URL d’API est pilotée par **`VITE_API_URL`** (voir `frontend/src/pages/Home.jsx`). En dev elle pointe sur `http://localhost:4000` ; quand le front est servi par le même serveur (méthode 3), les appels sont en relatif (`/api/...`).
