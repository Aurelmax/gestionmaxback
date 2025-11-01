# GestionMax Backend API

**Backend API headless** pour GestionMax - Système de gestion de formations professionnelles.

Basé sur **Payload CMS 3.x** en mode headless (API-only, sans interface admin) avec **Next.js 15** et **MongoDB**.

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Technologies](#-technologies)
- [Démarrage rapide](#-démarrage-rapide)
- [Architecture](#-architecture)
- [Documentation API](#-documentation-api)
- [Collections disponibles](#-collections-disponibles)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Structure du projet](#-structure-du-projet)
- [Troubleshooting](#-troubleshooting)

---

## 🔍 Vue d'ensemble

Backend API Payload CMS 3.x configuré en mode **headless** (sans interface admin) pour servir une API REST et GraphQL complète.

### Caractéristiques principales

- ✅ **API REST complète** - Tous les endpoints CRUD pour 12 collections
- ✅ **GraphQL natif** - Endpoint GraphQL avec introspection et queries complètes
- ✅ **Authentification JWT** - Système d'auth avec cookies httpOnly
- ✅ **Mode headless** - API-only, sans interface admin Payload
- ✅ **TypeScript** - Typage complet et génération automatique des types
- ✅ **MongoDB Atlas** - Base de données cloud production-ready
- ✅ **Upload de fichiers** - Gestion des médias avec stockage local
- ✅ **Email transactionnel** - Integration Resend pour les notifications
- ✅ **Docker** - Build multi-stage optimisé pour production
- ✅ **Railway ready** - Configuration prête pour déploiement Railway

---

## 🛠 Technologies

```json
{
  "runtime": "Node.js 20",
  "packageManager": "pnpm 10.13.1",
  "framework": "Next.js 15.2.3",
  "cms": "Payload CMS 3.61",
  "database": "MongoDB 6.20",
  "graphql": "@payloadcms/graphql 3.61",
  "email": "Resend API",
  "deployment": "Railway + Docker"
}
```

### Stack technique

- **[Payload CMS 3.x](https://payloadcms.com)** - CMS headless avec API REST et GraphQL
- **[Next.js 15](https://nextjs.org)** - Framework React avec App Router
- **[MongoDB](https://www.mongodb.com)** - Base de données NoSQL
- **[TypeScript](https://www.typescriptlang.org)** - Typage statique
- **[graphql-http](https://github.com/graphql/graphql-http)** - Serveur GraphQL HTTP
- **[Resend](https://resend.com)** - Service d'envoi d'emails

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm 10+
- MongoDB Atlas account (ou instance MongoDB locale)
- Resend API key (optionnel, pour les emails)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd backend

# Installer les dépendances
pnpm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs (voir section Variables d'environnement)

# Générer les types TypeScript
pnpm payload generate:types

# Démarrer en mode développement
pnpm dev
```

Le serveur démarre sur [http://localhost:3000](http://localhost:3000)

### Premier test

```bash
# Tester l'API
curl http://localhost:3000/api

# Tester GraphQL
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

---

## ⚙️ Architecture

### Mode Headless

Ce backend est configuré en **mode headless** (`admin.disable: true`), ce qui signifie :

- ❌ **Pas d'interface admin Payload** - L'interface `/admin` est désactivée
- ✅ **API REST complète** - Tous les endpoints `/api/*` disponibles
- ✅ **GraphQL manuel** - Endpoint GraphQL configuré via route custom
- ✅ **Plus léger** - Pas de bundle admin UI
- ✅ **API-first** - Conçu pour être consommé par des frontends séparés

### Routes API

```
app/
├── api/
│   ├── [...payload]/
│   │   └── route.ts          # Handler REST API principal (Payload auto)
│   └── graphql/
│       └── route.ts          # Endpoint GraphQL custom (mode headless)
```

#### REST API - `app/api/[...payload]/route.ts`

Gère tous les endpoints REST automatiquement via Payload :

```
GET    /api/{collection}      # Lister
GET    /api/{collection}/{id} # Lire
POST   /api/{collection}      # Créer
PATCH  /api/{collection}/{id} # Modifier
DELETE /api/{collection}/{id} # Supprimer
```

#### GraphQL API - `app/api/graphql/route.ts`

**Important :** En mode headless, GraphQL n'est pas automatiquement monté par Payload. Nous utilisons une route custom qui :

1. Génère le schéma GraphQL via `configToSchema` de `@payloadcms/graphql`
2. Crée un handler HTTP avec `graphql-http`
3. Configure le contexte (user, payload, req)
4. Gère les erreurs avec messages explicites

### Base de données

MongoDB Atlas avec :
- Connexion IPv4 forcée (`family: 4`)
- Connection pooling automatique
- Retry automatique sur échec de connexion

---

## 📖 Documentation API

Documentation API complète disponible dans **[docs/API.md](docs/API.md)** :

- ✅ Endpoints REST avec exemples cURL
- ✅ GraphQL queries et mutations
- ✅ Authentification (login, logout, me)
- ✅ Schéma de toutes les collections
- ✅ Exemples de requêtes complexes
- ✅ Gestion des erreurs

**Quick links :**
- [REST API Endpoints](docs/API.md#-endpoints-rest)
- [GraphQL API](docs/API.md#-graphql-api)
- [Authentification](docs/API.md#-authentification)
- [Collections](docs/API.md#-collections-disponibles)

---

## 📚 Collections disponibles

| Collection | Slug | Description |
|-----------|------|-------------|
| **Users** | `users` | Utilisateurs et authentification |
| **Formations** | `formations` | Formations catalogue |
| **Formations personnalisées** | `formations_personnalisees` | Formations sur mesure |
| **Structures juridiques** | `structures-juridiques` | Entreprises/organisations |
| **Apprenants** | `apprenants` | Apprenants inscrits |
| **Articles** | `articles` | Articles de blog |
| **Catégories** | `categories` | Catégories d'articles |
| **Tags** | `tags` | Tags |
| **Programmes** | `programmes` | Programmes de formation |
| **Rendez-vous** | `rendez-vous` | Rendez-vous clients |
| **Contacts** | `contacts` | Messages de contact |
| **Media** | `media` | Fichiers uploadés |

### Rôles utilisateurs

- `superAdmin` - Accès complet
- `admin` - Gestion complète
- `formateur` - Gestion formations et apprenants
- `gestionnaire` - Gestion opérationnelle
- `apprenant` - Accès lectures limitées

### Permissions granulaires

23 permissions disponibles (format `entity_action`) :
- `users_read`, `users_create`, `users_update`, `users_delete`
- `formations_read`, `formations_create`, `formations_update`, `formations_delete`
- `apprenants_read`, `apprenants_create`, `apprenants_update`, `apprenants_delete`
- `rendez_vous_read`, `rendez_vous_create`, `rendez_vous_update`, `rendez_vous_delete`
- `documents_read`, `documents_create`, `documents_update`, `documents_delete`
- `admin_access`, `system_settings`, `reports_access`

---

## 💻 Développement

### Scripts disponibles

```bash
# Développement avec hot-reload
pnpm dev

# Build production
pnpm build

# Démarrer en mode production
pnpm start

# Générer les types TypeScript
pnpm payload generate:types

# Linter
pnpm lint
```

### Variables d'environnement

Créez un fichier `.env` à la racine avec :

```bash
# Base de données
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gestionmax?retryWrites=true&w=majority

# Payload CMS
PAYLOAD_SECRET=your-secret-key-minimum-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Email (optionnel)
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
RESEND_DEFAULT_EMAIL=noreply@gestionmax.fr

# Port (optionnel, défaut: 3000)
PORT=3000
```

### Workflow de développement

1. **Modifier les collections** - Editer `src/collections/*.ts`
2. **Regénérer les types** - `pnpm payload generate:types`
3. **Tester l'API** - Utiliser les scripts de test ou Postman
4. **Commit** - Git commit avec messages descriptifs

### Tests API

Scripts de test disponibles :

```bash
# Test GraphQL
./test-graphql.sh

# Test REST (exemple)
curl http://localhost:3000/api/formations
```

---

## 🚢 Déploiement

### 🐳 Docker

Build et run avec Docker :

```bash
# Build
docker build -t gestionmax-backend .

# Run
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e PAYLOAD_SECRET="your-secret" \
  -e NEXT_PUBLIC_SERVER_URL="http://localhost:3000" \
  gestionmax-backend
```

Le `Dockerfile` utilise un build multi-stage optimisé :
- Stage 1 : Installation des dependencies
- Stage 2 : Build Next.js
- Stage 3 : Image de production minimale

### 🚂 Railway

Le projet est prêt pour Railway :

1. **Connecter le repository** - Railway détecte automatiquement le `Dockerfile`
2. **Configurer les variables d'environnement** :
   ```
   MONGODB_URI=mongodb+srv://...
   PAYLOAD_SECRET=your-secret-key
   NEXT_PUBLIC_SERVER_URL=https://your-app.up.railway.app
   RESEND_API_KEY=re_xxx
   RESEND_DEFAULT_EMAIL=noreply@gestionmax.fr
   ```
3. **Déployer** - Push sur `main` déclenche le déploiement automatique

Railway configure automatiquement :
- `PORT` (variable injectée par Railway)
- Domain HTTPS
- SSL certificates

### Production checklist

- [ ] Variables d'environnement configurées
- [ ] MongoDB Atlas whitelist IP (0.0.0.0/0 pour Railway)
- [ ] `PAYLOAD_SECRET` sécurisé (32+ caractères aléatoires)
- [ ] `NEXT_PUBLIC_SERVER_URL` correcte
- [ ] Premier utilisateur admin créé
- [ ] CORS configuré si nécessaire
- [ ] Logs monitoring configuré

---

## 📁 Structure du projet

```
backend/
├── app/
│   ├── api/
│   │   ├── [...payload]/
│   │   │   └── route.ts          # REST API handler
│   │   └── graphql/
│   │       └── route.ts          # GraphQL endpoint
│   └── layout.tsx
├── src/
│   ├── collections/
│   │   ├── Users.ts              # Collection Users
│   │   ├── Formations.ts         # Collection Formations
│   │   ├── Apprenants.ts         # Collection Apprenants
│   │   ├── StructuresJuridiques.ts
│   │   ├── FormationsPersonnalisees.ts
│   │   ├── Articles.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── Programmes.ts
│   │   ├── RendezVous.ts
│   │   ├── Contacts.ts
│   │   └── Media.ts
│   └── payload-types.ts          # Types générés auto
├── docs/
│   └── API.md                    # Documentation API complète
├── public/
│   └── media/                    # Uploads de fichiers
├── payload.config.ts             # Configuration Payload principale
├── next.config.ts                # Configuration Next.js
├── tsconfig.json                 # Configuration TypeScript
├── Dockerfile                    # Build Docker multi-stage
├── .env.example                  # Template variables d'environnement
└── package.json
```

---

## 🔧 Troubleshooting

### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
PORT=3001 pnpm dev
```

### GraphQL retourne 405 Method Not Allowed

**Cause :** En mode headless, GraphQL n'est pas monté automatiquement.

**Solution :** Vérifier que `app/api/graphql/route.ts` existe et est correctement configuré.

### Erreur "Names must only contain [_a-zA-Z0-9]"

**Cause :** GraphQL n'accepte pas les `:` dans les noms de champs.

**Solution :** Les permissions utilisent `_` au lieu de `:` (ex: `users_read` au lieu de `users:read`).

### Connexion MongoDB timeout

**Vérifier :**
1. `MONGODB_URI` dans `.env` est correct
2. Whitelist IP dans MongoDB Atlas (0.0.0.0/0 pour Railway)
3. Connexion internet stable
4. Credentials MongoDB valides

### 403 Forbidden sur les endpoints

**Cause :** Authentification requise.

**Solution :**
1. Login via `POST /api/users/login`
2. Utiliser le cookie `payload-token` dans les requêtes suivantes
3. Ou vérifier les permissions de l'utilisateur

### Build Docker échoue

**Causes communes :**
- Dependencies manquantes dans `package.json`
- `package-lock.json` désynchronisé avec `pnpm-lock.yaml`
- Variables d'environnement manquantes au build

**Solution :**
```bash
# Regénérer package-lock.json
pnpm install
pnpm run build  # Tester localement

# Rebuild Docker sans cache
docker build --no-cache -t gestionmax-backend .
```

---

## 📞 Support & Documentation

- **Documentation API :** [docs/API.md](docs/API.md)
- **Payload CMS Docs :** [https://payloadcms.com/docs](https://payloadcms.com/docs)
- **Next.js Docs :** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Support :** support@gestionmax.fr

---

## 📝 Licence

Propriétaire - GestionMax © 2025

---

**Version:** 1.0.0
**Dernière mise à jour:** 1er novembre 2025
