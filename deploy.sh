#!/bin/bash
# Script de déploiement pour le serveur SSH
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement du site Soup & Juice..."
echo ""

# Aller dans le répertoire du projet
cd "$(dirname "$0")"

# 1. Builder le frontend
echo "📦 Construction du frontend..."
cd frontend
npm run build
cd ..

# 2. Vérifier que le build a réussi
if [ ! -d "frontend/dist" ]; then
    echo "❌ Erreur: Le dossier frontend/dist n'existe pas après le build"
    exit 1
fi

echo "✅ Build terminé avec succès!"
echo ""

# 3. Redémarrer le serveur (si PM2 est utilisé)
if command -v pm2 &> /dev/null; then
    echo "🔄 Redémarrage du serveur avec PM2..."
    pm2 restart spsite 2>/dev/null || pm2 start server/server.js --name spsite || echo "⚠️  PM2 non configuré, démarrage manuel nécessaire"
else
    echo "ℹ️  PM2 non installé. Pour démarrer le serveur:"
    echo "   cd server && node server.js"
    echo ""
    echo "   Ou installe PM2 avec: npm install -g pm2"
    echo "   Puis: pm2 start server/server.js --name spsite"
fi

echo ""
echo "✅ Déploiement terminé!"
echo "🌐 Le site devrait être accessible sur le port configuré (défaut: 4000)"
