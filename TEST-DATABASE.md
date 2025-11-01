# Test de Connexion MongoDB Atlas

## 🚀 Démarrage du Serveur

### Option 1: Script de démarrage propre

```bash
cd /home/gestionmax-aur-lien/CascadeProjects/gestionmaxopps/backend
./start-clean.sh
```

### Option 2: Démarrage manuel

```bash
# Nettoyer les processus résiduels
killall -9 node
fuser -k 3000/tcp
sleep 2

# Démarrer le serveur
pnpm dev
```

## ✅ Vérifications au Démarrage

Une fois le serveur lancé, vous devriez voir dans les logs:

```
✓ Starting...
🔍 [Payload Config] MongoDB URI configurée: ✅ mongodb+srv://aurelien_db_user:Formation2025Al@clu...
✓ Ready in XXXXms
```

Si vous voyez des erreurs MongoDB, vérifiez:
- La chaîne de connexion `MONGODB_URI` dans `.env`
- Que votre IP est autorisée dans MongoDB Atlas
- Que l'utilisateur `aurelien_db_user` a les bonnes permissions

## 🧪 Tests de l'API

### 1. Test Homepage
```bash
curl http://localhost:3000/
```
Devrait afficher la page d'accueil HTML.

### 2. Test API Users (avec authentification)
```bash
curl http://localhost:3000/api/users
```
**Résultat attendu:**
```json
{
  "docs": [],
  "totalDocs": 0,
  "limit": 10,
  "totalPages": 0,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```

### 3. Test Interface Admin
Ouvrez dans votre navigateur:
```
http://localhost:3000/admin
```
Vous devriez voir l'interface de connexion Payload CMS.

### 4. Test GraphQL Playground
```
http://localhost:3000/api/graphql
```
Interface interactive GraphQL.

### 5. Test Custom Endpoint
```bash
curl -X POST http://localhost:3000/api/creer-apprenant \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@test.com",
    "siret": "12345678901234",
    "structureNom": "Test SARL",
    "telephone": "0601020304"
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Apprenant et structure créés avec succès",
  "data": {
    "apprenant": {
      "id": "...",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@test.com"
    },
    "structureId": "..."
  }
}
```

## ❌ Problèmes Courants

### Erreur: "Cannot GET /api/users"

**Cause:** Les routes Payload ne sont pas initialisées correctement.

**Solution:**
1. Vérifiez que le fichier `app/api/[...payload]/route.ts` existe
2. Vérifiez que `app/(payload)/admin/importMap.js` a été généré:
   ```bash
   pnpm generate:importmap
   ```
3. Redémarrez le serveur

### Erreur: Connection timeout MongoDB

**Cause:** La connexion à MongoDB Atlas échoue.

**Solutions:**
1. Vérifiez votre connexion Internet
2. Vérifiez que votre IP est dans la liste blanche MongoDB Atlas
3. Testez la connexion directement:
   ```bash
   node -e "const {MongoClient}=require('mongodb');new MongoClient(process.env.MONGODB_URI).connect().then(()=>console.log('✅ Connected')).catch(e=>console.log('❌',e.message))"
   ```

### Erreur: EADDRINUSE port 3000

**Cause:** Un autre processus utilise le port 3000.

**Solution:**
```bash
# Trouver le processus
lsof -i:3000

# Le tuer
fuser -k 3000/tcp
```

## 📊 Vérification des Collections MongoDB

Pour vérifier que les collections sont bien créées dans MongoDB Atlas:

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Allez dans votre cluster `Clustergestionmaxformation`
3. Cliquez sur "Browse Collections"
4. Vous devriez voir la base `formation-app-gestionmax` avec les collections:
   - users
   - formations
   - formations_personnalisees
   - structures-juridiques
   - apprenants
   - articles
   - categories
   - tags
   - programmes
   - rendez-vous
   - contacts
   - media
   - payload-migrations
   - payload-preferences

## 🎯 Test Complet de Bout en Bout

```bash
#!/bin/bash

echo "🧪 Test de connexion complète..."

# 1. Tester la homepage
echo "1️⃣ Test homepage..."
curl -s http://localhost:3000/ | grep -q "GestionMax" && echo "✅ Homepage OK" || echo "❌ Homepage FAIL"

# 2. Tester l'API Users
echo "2️⃣ Test API users..."
curl -s http://localhost:3000/api/users | grep -q "docs" && echo "✅ API Users OK" || echo "❌ API Users FAIL"

# 3. Tester GraphQL
echo "3️⃣ Test GraphQL..."
curl -s http://localhost:3000/api/graphql | grep -q "graphql" && echo "✅ GraphQL OK" || echo "❌ GraphQL FAIL"

echo ""
echo "✅ Tests terminés!"
```

Sauvegardez ce script dans `test-api.sh`, rendez-le exécutable avec `chmod +x test-api.sh`, et lancez-le:
```bash
./test-api.sh
```
