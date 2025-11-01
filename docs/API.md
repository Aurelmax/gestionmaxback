# Documentation API Backend - GestionMax

Backend API Payload CMS 3.x en mode headless (sans interface admin).

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Configuration](#configuration)
- [Endpoints REST](#endpoints-rest)
- [GraphQL API](#graphql-api)
- [Authentification](#authentification)
- [Collections disponibles](#collections-disponibles)
- [Déploiement](#déploiement)

---

## 🔍 Vue d'ensemble

### Architecture

- **Framework:** Next.js 15.2.3 + Payload CMS 3.61
- **Base de données:** MongoDB Atlas
- **Mode:** Headless (API-only, sans admin UI)
- **Port local:** 3000
- **URL production:** https://formation-app-gestionmax-production.up.railway.app

### Technologies

```json
{
  "runtime": "Node.js 20",
  "packageManager": "pnpm 10.13.1",
  "framework": "Next.js 15.2.3",
  "cms": "Payload CMS 3.61",
  "database": "MongoDB 6.20",
  "graphql": "@payloadcms/graphql 3.61"
}
```

---

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env
PORT=3000
MONGODB_URI=mongodb+srv://...
PAYLOAD_SECRET=your-secret-key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key
RESEND_DEFAULT_EMAIL=noreply@gestionmax.fr
```

### Démarrage local

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

---

## 🌐 Endpoints REST

### Base URL

```
Local: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Collections disponibles

| Collection | Endpoint | Description |
|-----------|----------|-------------|
| Users | `/api/users` | Utilisateurs et authentification |
| Formations | `/api/formations` | Formations catalogue |
| Formations personnalisées | `/api/formations_personnalisees` | Formations sur mesure |
| Structures juridiques | `/api/structures-juridiques` | Entreprises/organisations |
| Apprenants | `/api/apprenants` | Apprenants inscrits |
| Articles | `/api/articles` | Articles de blog |
| Catégories | `/api/categories` | Catégories d'articles |
| Tags | `/api/tags` | Tags |
| Programmes | `/api/programmes` | Programmes de formation |
| Rendez-vous | `/api/rendez-vous` | Rendez-vous clients |
| Contacts | `/api/contacts` | Messages de contact |
| Media | `/api/media` | Fichiers uploadés |

### Méthodes HTTP

```http
GET    /api/{collection}      # Lister
GET    /api/{collection}/{id} # Lire un document
POST   /api/{collection}      # Créer
PATCH  /api/{collection}/{id} # Mettre à jour
DELETE /api/{collection}/{id} # Supprimer
```

### Exemples REST

#### Lister les formations

```bash
curl http://localhost:3000/api/formations \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

#### Créer une formation

```bash
curl -X POST http://localhost:3000/api/formations \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d '{
    "titre": "Formation React",
    "description": "Apprendre React",
    "duree": 35,
    "niveau": "Intermédiaire",
    "modalites": "Distanciel",
    "prix": 2500
  }'
```

---

## 🚀 GraphQL API

### Endpoint

```
POST http://localhost:3000/api/graphql
```

### Configuration spéciale (Mode Headless)

En mode headless, GraphQL nécessite une route personnalisée:

**Fichier:** `app/api/graphql/route.ts`

```typescript
import { createHandler } from 'graphql-http/lib/use/fetch'
import { configToSchema } from '@payloadcms/graphql'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

let graphqlHandler: ((req: Request) => Promise<Response>) | null = null

async function getGraphQLHandler() {
  if (!graphqlHandler) {
    const payload = await getPayloadHMR({ config })
    const { schema } = configToSchema(payload.config)

    graphqlHandler = createHandler({
      schema,
      context: async (req) => ({
        req,
        payload,
        user: req.headers.get('payload-user')
          ? JSON.parse(req.headers.get('payload-user')!)
          : null,
      }),
    })
  }
  return graphqlHandler
}

export async function POST(request: Request) {
  try {
    const handler = await getGraphQLHandler()
    return await handler(request)
  } catch (error) {
    console.error('❌ GraphQL Error:', error)
    return Response.json(
      {
        errors: [{
          message: error instanceof Error ? error.message : 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }]
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json({
    message: 'GraphQL endpoint is active',
    info: 'Send POST requests with GraphQL queries',
    example: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query: '{ __typename }' },
    },
  })
}
```

### Exemples GraphQL

#### Introspection

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

**Réponse:**
```json
{
  "data": {
    "__typename": "Query"
  }
}
```

#### Query Formations

```graphql
query {
  Formations(limit: 10) {
    docs {
      id
      titre
      description
      duree
      niveau
      modalites
      prix
    }
    totalDocs
    hasNextPage
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d '{
    "query": "{ Formations(limit: 10) { docs { id titre prix } totalDocs } }"
  }'
```

#### Mutation - Créer une formation

```graphql
mutation {
  createFormation(data: {
    titre: "Formation GraphQL"
    description: "Apprendre GraphQL"
    duree: 21
    niveau: Débutant
    modalites: Distanciel
    prix: 1500
  }) {
    id
    titre
  }
}
```

#### Query avec filtres

```graphql
query {
  Formations(
    where: {
      niveau: { equals: "Intermédiaire" }
      prix: { less_than: 3000 }
    }
    limit: 5
    sort: "-createdAt"
  ) {
    docs {
      id
      titre
      prix
    }
  }
}
```

---

## 🔐 Authentification

### Système de cookies

Payload utilise des cookies HTTP-only pour l'authentification.

### Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Réponse:**
```json
{
  "message": "Auth Passed",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGc..."
}
```

Le cookie `payload-token` est automatiquement défini.

### Utilisation du token

**Dans le navigateur:**
```typescript
fetch('http://localhost:3000/api/formations', {
  credentials: 'include', // Important!
})
```

**Avec cURL:**
```bash
curl http://localhost:3000/api/formations \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

**Avec Axios:**
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Important!
})
```

### Logout

```bash
curl -X POST http://localhost:3000/api/users/logout \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

### Me (Utilisateur actuel)

```bash
curl http://localhost:3000/api/users/me \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

---

## 📚 Collections disponibles

### Users

**Champs:**
- `email` (unique, requis)
- `password` (requis)
- `name` (requis)
- `firstName`, `lastName`
- `role` (superAdmin, admin, formateur, gestionnaire, apprenant)
- `status` (active, inactive, suspended, pending)
- `phone`, `address`, `dateOfBirth`
- `avatar` (relation vers Media)
- `permissions` (array)

**Permissions:**
- `users_read`, `users_create`, `users_update`, `users_delete`
- `formations_read`, `formations_create`, `formations_update`, `formations_delete`
- `apprenants_read`, `apprenants_create`, `apprenants_update`, `apprenants_delete`
- `rendez_vous_read`, `rendez_vous_create`, `rendez_vous_update`, `rendez_vous_delete`
- `documents_read`, `documents_create`, `documents_update`, `documents_delete`
- `admin_access`, `system_settings`, `reports_access`

### Formations

**Champs:**
- `titre` (requis)
- `description` (richText, requis)
- `duree` (number, requis)
- `niveau` (Débutant/Intermédiaire/Avancé)
- `modalites` (Présentiel/Distanciel/Hybride)
- `prix` (number, requis)
- `competences` (array)
- `codeFormation`
- `image` (relation vers Media)

### Apprenants

**Champs:**
- `nomComplet` (requis)
- `email` (requis)
- `telephone`
- `structureJuridique` (relation)
- `formations` (relation multiple vers Formations)
- `statut` (inscription/en_cours/complete/abandonne)

### Structures Juridiques

**Champs:**
- `raisonSociale` (requis)
- `siret` (unique)
- `typeStructure` (entreprise/association/auto_entrepreneur/etc.)
- `secteurActivite`
- `adresse`, `codePostal`, `ville`, `pays`
- `contact` (group: nom, email, telephone, fonction)

---

## 🚢 Déploiement

### Build Docker

```bash
# Build
docker build -t gestionmax-backend .

# Run
docker run -p 3000:3000 \
  -e MONGODB_URI="..." \
  -e PAYLOAD_SECRET="..." \
  gestionmax-backend
```

### Déploiement Railway

Le projet est configuré pour Railway avec le `Dockerfile`.

**Variables d'environnement requises:**
- `MONGODB_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `RESEND_API_KEY`
- `RESEND_DEFAULT_EMAIL`
- `PORT` (défini automatiquement par Railway)

### Build local

```bash
# Générer les types TypeScript
pnpm payload generate:types

# Build Next.js
pnpm next build

# Démarrer en production
pnpm start
```

---

## 🔧 Troubleshooting

### GraphQL retourne 405 Method Not Allowed

**Cause:** En mode headless (`admin.disable: true`), GraphQL n'est pas automatiquement monté.

**Solution:** Créer la route `app/api/graphql/route.ts` (voir section GraphQL).

### Erreur "Names must only contain [_a-zA-Z0-9]"

**Cause:** GraphQL n'accepte pas les caractères `:` dans les noms de champs.

**Solution:** Remplacer `:` par `_` dans les valeurs (ex: `users:read` → `users_read`).

### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

### Connexion MongoDB timeout

**Vérifier:**
1. `MONGODB_URI` dans `.env`
2. Whitelist IP dans MongoDB Atlas
3. Connexion internet

---

## 📞 Support

Pour toute question ou problème:
- Email: support@gestionmax.fr
- Documentation Payload: https://payloadcms.com/docs
- Repository: [Votre repo GitHub]

---

**Dernière mise à jour:** 1er novembre 2025
**Version:** 1.0.0
