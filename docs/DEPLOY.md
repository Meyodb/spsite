# Guide de déploiement sur ton serveur SSH

## Déploiement rapide

Quand tu fais une modification sur le site, pour mettre à jour la version en ligne :

```bash
cd /home/soupandjuice/spsite
./scripts/deploy.sh
```

Ou avec npm :

```bash
npm run deploy:server
```

## Étapes du déploiement

1. **Build du frontend** : Compile le code React/Vite dans `frontend/dist`
2. **Redémarrage du serveur** : Le serveur Node.js sert automatiquement le nouveau build

## Configuration du serveur

### Option 1 : Démarrage simple (pour tester)

```bash
cd /home/soupandjuice/spsite/server
node server.js
```

Le site sera accessible sur `http://ton-serveur:4000` (ou le port configuré dans `PORT`)

### Option 2 : Avec PM2 (recommandé pour la production)

PM2 garde le serveur actif même après déconnexion SSH et redémarre automatiquement en cas de crash.

**Installation :**
```bash
npm install -g pm2
```

**Démarrage :**
```bash
cd /home/soupandjuice/spsite
pm2 start server/server.js --name spsite
```

**Commandes PM2 utiles :**
```bash
pm2 list              # Voir les processus
pm2 restart spsite     # Redémarrer
pm2 stop spsite       # Arrêter
pm2 logs spsite       # Voir les logs
pm2 save              # Sauvegarder la configuration
pm2 startup           # Démarrer au boot du serveur
```

## Configuration du port

Le serveur utilise le port 4000 par défaut. Pour changer :

```bash
export PORT=8080
npm run start
```

Ou dans un fichier `.env` :
```
PORT=8080
```

## Configuration Nginx (optionnel)

Si tu veux exposer le site sur le port 80/443 avec un nom de domaine :

```nginx
server {
    listen 80;
    server_name ton-domaine.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Mise à jour automatique (optionnel)

Pour déployer automatiquement à chaque `git push`, tu peux configurer un webhook GitHub ou utiliser un cron job :

```bash
# Vérifier les mises à jour toutes les heures
0 * * * * cd /home/soupandjuice/spsite && git pull && ./scripts/deploy.sh
```
