#!/bin/bash

echo "🧪 Test de connexion MongoDB Atlas et API Payload..."
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Testing $name... "
    response=$(curl -s "$url" 2>&1)

    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Response: ${response:0:200}"
        return 1
    fi
}

# Vérifier que le serveur écoute
echo "🔍 Vérification que le serveur écoute sur le port 3000..."
if lsof -i:3000 -P -n > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur actif sur le port 3000${NC}"
else
    echo -e "${RED}❌ Aucun serveur n'écoute sur le port 3000${NC}"
    echo ""
    echo "Lancez d'abord le serveur avec:"
    echo "  ./start-clean.sh"
    echo ""
    exit 1
fi

echo ""
echo "📊 Tests des endpoints..."
echo ""

# Tests
test_endpoint "Homepage" "http://localhost:3000/" "GestionMax"
test_endpoint "API Users" "http://localhost:3000/api/users" "docs"
test_endpoint "API Formations" "http://localhost:3000/api/formations" "docs"
test_endpoint "API Programmes" "http://localhost:3000/api/programmes" "docs"
test_endpoint "API Apprenants" "http://localhost:3000/api/apprenants" "docs"
test_endpoint "API Structures" "http://localhost:3000/api/structures-juridiques" "docs"
test_endpoint "GraphQL" "http://localhost:3000/api/graphql" "graphql"

echo ""
echo "🧪 Test de création d'apprenant..."
response=$(curl -s -X POST http://localhost:3000/api/creer-apprenant \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "TestScript",
    "prenom": "Automatique",
    "email": "test-'$(date +%s)'@example.com",
    "siret": "12345678901234",
    "structureNom": "Test Auto SARL",
    "telephone": "0601020304"
  }')

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ Création d'apprenant OK${NC}"
    echo "  Response: $response"
else
    echo -e "${RED}❌ Création d'apprenant FAIL${NC}"
    echo "  Response: $response"
fi

echo ""
echo "📈 Résumé:"
echo ""
echo "Tous les tests devraient être verts (✅)"
echo ""
echo "Si vous voyez des erreurs (❌):"
echo "  1. Vérifiez les logs du serveur"
echo "  2. Vérifiez la connexion MongoDB Atlas"
echo "  3. Consultez TEST-DATABASE.md pour plus d'infos"
echo ""
echo "✨ Tests terminés!"
