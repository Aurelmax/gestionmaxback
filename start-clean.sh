#!/bin/bash

echo "🧹 Nettoyage des processus résiduels..."

# Tuer tous les processus Node.js/Next.js
killall -9 node 2>/dev/null || true
killall -9 next 2>/dev/null || true

# Tuer les processus sur les ports 3000 et 4200
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 4200/tcp 2>/dev/null || true

# Attendre que les ports soient libérés
sleep 3

echo "✅ Nettoyage terminé"
echo ""
echo "🚀 Démarrage du serveur Next.js + Payload CMS..."
echo ""

# Démarrer le serveur
pnpm dev
