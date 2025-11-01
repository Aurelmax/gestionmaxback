#!/bin/bash

# 🧪 Script de test GraphQL pour backend Payload CMS
# Usage: ./test-graphql.sh [URL]
# Default URL: http://localhost:3000

URL="${1:-http://localhost:3000}"
GRAPHQL_ENDPOINT="$URL/api/graphql"

echo "🧪 Test de l'API GraphQL"
echo "📍 Endpoint: $GRAPHQL_ENDPOINT"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Introspection basique
echo "1️⃣  Test: Introspection de base (__typename)"
response=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}')

if echo "$response" | grep -q '"__typename"'; then
    echo -e "${GREEN}✅ API GraphQL répond correctement${NC}"
    echo "   Response: $response"
else
    echo -e "${RED}❌ API GraphQL ne répond pas${NC}"
    echo "   Response: $response"
fi

echo ""

# Test 2: Query Users
echo "2️⃣  Test: Query Users"
response=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ Users { docs { id email } } }"}')

if echo "$response" | grep -q "Users"; then
    echo -e "${GREEN}✅ Query Users fonctionne${NC}"
    echo "   Response: ${response:0:200}..."
else
    echo -e "${RED}❌ Query Users échoue${NC}"
    echo "   Response: $response"
fi

echo ""

# Test 3: Query Formations
echo "3️⃣  Test: Query Formations"
response=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ Formations { docs { id titre } } }"}')

if echo "$response" | grep -q "Formations"; then
    echo -e "${GREEN}✅ Query Formations fonctionne${NC}"
    echo "   Response: ${response:0:200}..."
else
    echo -e "${RED}❌ Query Formations échoue${NC}"
    echo "   Response: $response"
fi

echo ""
echo "📊 Résumé"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pour tester l'API GraphQL manuellement:"
echo ""
echo "1️⃣  Avec cURL:"
echo "   curl -X POST $GRAPHQL_ENDPOINT \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\":\"{ Users { docs { id email } } }\"}'"
echo ""
echo "2️⃣  Avec Postman/Insomnia:"
echo "   Method: POST"
echo "   URL: $GRAPHQL_ENDPOINT"
echo "   Headers: Content-Type: application/json"
echo "   Body: {\"query\":\"{ Users { docs { id email } } }\"}"
echo ""
echo "3️⃣  GraphQL Playground (dev only):"
echo "   http://localhost:3000/api/graphql"
echo "   (Si playground activé dans payload.config.ts)"
echo ""
