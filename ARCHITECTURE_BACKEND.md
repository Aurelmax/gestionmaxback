# Architecture Backend GestionMax - Payload CMS 3.x + Next.js

## Vue d'ensemble

Backend API autonome basé sur **Payload CMS 3.61.0** intégré nativement dans **Next.js 15.2.3**, avec MongoDB Atlas comme base de données.

**Architecture moderne** : Payload CMS 3.x est Next.js-native et n'utilise plus Express standalone. Toutes les routes API sont gérées automatiquement via Next.js App Router.

## Changements architecturaux majeurs (v3.x)

### Avant (Payload 2.x) : Express Standalone
```
src/server.ts → Express.listen(3000)
payload.init() → app.use(payload.routes)
```

### Après (Payload 3.x) : Next.js Native
```
app/api/[...payload]/route.ts → handlePayloadRequest
next.config.mjs → withPayload(nextConfig)
pnpm dev → next dev (pas d'Express)
```

**Points clés** :
- ❌ Plus de `src/server.ts` ni d'Express manuel
- ❌ Plus de commande `payload serve` (n'existe pas en v3)
- ✅ Next.js App Router avec catch-all route `[...payload]`
- ✅ Configuration via `withPayload()` wrapper
- ✅ API REST, GraphQL et Admin UI gérés automatiquement

## Structure du projet

```
backend/
├── app/                                   # Next.js App Router
│   ├── api/
│   │   └── [...payload]/
│   │       └── route.ts                   # 🔥 Point d'entrée API Payload
│   ├── (payload)/
│   │   └── admin/
│   │       ├── [[...segments]]/
│   │       │   ├── page.tsx               # Admin UI page
│   │       │   └── not-found.tsx          # 404 admin
│   │       ├── layout.tsx                 # Admin layout
│   │       └── importMap.js               # Auto-généré
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Homepage API docs
│
├── src/
│   ├── collections/                       # 12 collections Payload
│   │   ├── Users.ts
│   │   ├── Formations.ts
│   │   ├── FormationsPersonnalisees.ts
│   │   ├── StructuresJuridiques.ts
│   │   ├── Apprenants.ts
│   │   ├── Articles.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── Programmes.ts
│   │   ├── RendezVous.ts
│   │   ├── Contacts.ts
│   │   └── Media.ts
│   ├── endpoints/
│   │   └── creerApprenant.ts              # Endpoint custom
│   └── payload-types.ts                   # Types auto-générés
│
├── media/                                 # Upload files
├── payload.config.ts                      # 🔥 Config Payload (root)
├── next.config.mjs                        # 🔥 Config Next.js
├── tsconfig.json                          # TypeScript bundler
├── package.json                           # Scripts Next.js
├── pnpm-lock.yaml                         # pnpm 10.13.1
│
├── Dockerfile                             # Multi-stage build
├── .dockerignore                          # Optimisation build
├── build-with-fix.sh                      # Patch undici + build
│
├── start-clean.sh                         # Script démarrage propre
├── test-api.sh                            # Tests automatisés
└── TEST-DATABASE.md                       # Guide tests MongoDB
```

## Fichiers critiques

### 🔥 [app/api/[...payload]/route.ts](app/api/[...payload]/route.ts)

**Rôle** : Point d'entrée unique pour TOUTES les routes Payload (REST, GraphQL, Admin)

```typescript
import { handlePayloadRequest } from '@payloadcms/next/routes'

export const dynamic = 'force-dynamic'

export {
  handlePayloadRequest as GET,
  handlePayloadRequest as POST,
  handlePayloadRequest as PATCH,
  handlePayloadRequest as DELETE,
}
```

**Pourquoi `[...payload]` ?**
- C'est le nom OBLIGATOIRE pour Payload 3.x
- Catch-all route : capture `/api/users`, `/api/graphql`, `/api/*`
- La fonction `handlePayloadRequest` gère automatiquement le routing

### 🔥 [next.config.mjs](next.config.mjs)

**Rôle** : Configuration Next.js + wrapper Payload

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  experimental: {
    reactCompiler: false,
    serverComponentsExternalPackages: ['@payloadcms/next'],
  },
  images: { unoptimized: true },        // Pas besoin d'optimisation images
  compress: true,                       // Gzip compression
  poweredByHeader: false,               // Sécurité
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default withPayload(nextConfig)  // 🔥 Wrapper obligatoire
```

### 🔥 [payload.config.ts](payload.config.ts) (racine, pas src/)

**Rôle** : Configuration centralisée Payload CMS

**Déplacé de `src/payload.config.ts` à `payload.config.ts`** pour Next.js.

**Composants clés** :
- **Base de données** : MongoDB Atlas via mongooseAdapter
- **Email** : Resend adapter
- **Éditeur** : Lexical rich text
- **Uploads** : Sharp pour images
- **GraphQL** : Activé avec schéma auto-généré

**Importations** : Chemins mis à jour
```typescript
import { Users } from './src/collections/Users'
import { Formations } from './src/collections/Formations'
// etc.
```

**Admin UI** :
```typescript
admin: {
  disable: false,  // Temporairement activé pour tests
  // disable: true en production (React dashboard custom frontend)
},
```

**CORS & CSRF** :
```typescript
cors: [
  'http://localhost:3000',
  'http://localhost:4200',  // Frontend local
  process.env.NEXT_PUBLIC_SERVER_URL || '',
],
csrf: [
  'http://localhost:3000',
  'http://localhost:4200',
  process.env.NEXT_PUBLIC_SERVER_URL || '',
],
```

**MongoDB Atlas** :
```typescript
db: mongooseAdapter({
  url: process.env.MONGODB_URI || '',
  connectOptions: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,  // Force IPv4
    ...(process.env.NODE_ENV === 'production' && {
      autoIndex: false,
      autoCreate: false,
    }),
  },
}),
```

### 📄 [package.json](package.json)

**Scripts Next.js** (plus de nodemon/ts-node) :

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development next dev",
    "build": "next build",
    "start": "cross-env NODE_ENV=production next start",
    "generate:types": "payload generate:types",
    "generate:importmap": "payload generate:importmap"
  }
}
```

**Dépendances Payload 3.x** :
```json
{
  "dependencies": {
    "@payloadcms/next": "^3.62.0",        // 🔥 Adapter Next.js
    "@payloadcms/richtext-lexical": "^3.62.0",
    "@payloadcms/db-mongodb": "^3.62.0",
    "@payloadcms/email-resend": "^3.62.0",
    "@payloadcms/graphql": "^3.62.0",
    "payload": "^3.61.0",
    "next": "15.2.3",                      // 🔥 Next.js
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "sharp": "^0.34.4"
  }
}
```

**Package manager** : pnpm 10.13.1 (recommandé par Payload v3+)

### 📄 [tsconfig.json](tsconfig.json)

**Configuration TypeScript pour Next.js** :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom"],
    "module": "esnext",
    "moduleResolution": "bundler",        // 🔥 Next.js bundler
    "jsx": "preserve",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }],      // 🔥 Next.js plugin
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

### 📄 [Dockerfile](Dockerfile)

**Multi-stage build optimisé pour Next.js** :

```dockerfile
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Patch undici + build Next.js
RUN chmod +x build-with-fix.sh && sh build-with-fix.sh

# --- Runner ---
FROM node:20-alpine AS runner

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/payload.config.ts ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/app ./app
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["pnpm", "start"]
```

### 📄 [build-with-fix.sh](build-with-fix.sh)

**Script de build avec patch undici** :

```bash
#!/bin/sh

# Patch undici CacheStorage bug
echo "🔧 Patching undici to fix CacheStorage issue..."
UNDICI_FILE=$(find node_modules -name "index.js" -path "*/undici/index.js" | head -n 1)
sed -i 's/module\.exports\.caches = new CacheStorage(kConstruct)/module.exports.caches = undefined/' "$UNDICI_FILE"
echo "✅ undici patched successfully"

# Générer types Payload
echo "🏗️ Generating Payload types..."
npx payload generate:types

# Générer importmap admin
echo "🏗️ Generating Payload importmap..."
npx payload generate:importmap

# Build Next.js
echo "🏗️ Building Next.js application..."
npx next build
```

## Collections (12 au total)

### 1. **users** - Authentification & Rôles
- **5 rôles** : superAdmin, admin, formateur, gestionnaire, apprenant
- **Contrôle d'accès** granulaire par rôle
- **Champs** : name, email, role, status, phone, permissions, avatar, metadata
- **Email reset password** personnalisé avec template HTML

### 2. **formations** - Formations Catalogue
- Formations standards du catalogue
- titre, description, durée, niveau, modalités, prix
- compétences (array), image, codeFormation

### 3. **formations_personnalisees** - Formations Sur Mesure
- Formations sur mesure complètes
- Programme détaillé par jour/module
- Modalités d'accès, contact formateur, accessibilité
- Statut : EN_COURS, FINALISEE, LIVREE, ARCHIVE

### 4. **structures-juridiques** - Entreprises B2B
- SIRET (unique), code APE
- Adresse complète, contact principal
- Groupé sous "Gestion B2B"

### 5. **apprenants** - Gestion Apprenants
- Informations personnelles et administratives
- **Relation** vers structures-juridiques
- Programme, statut, progression (%)
- Groupé sous "Gestion Formation"

### 6. **articles** - Blog
- Contenu rich text, slug unique
- Relation vers categories/tags
- Images multiples, meta SEO
- Statut : brouillon, publié, archivé

### 7. **categories** - Catégories Blog
- nom, slug, description, couleur, icône

### 8. **tags** - Tags Blog
- nom, slug, couleur

### 9. **programmes** - Programmes Détaillés
- codeFormation unique
- Objectifs, prérequis, programme, évaluation
- Certification, éligibilité CPF
- Statut : actif, inactif, en_developpement

### 10. **rendez-vous** - Gestion RDV
- **Relation** vers programmes
- **Types** : positionnement, information, inscription, suivi
- **Statuts** : enAttente, confirmé, terminé, annulé, reporté
- Date, heure, durée, lieu (visio/présentiel/téléphone)

### 11. **contacts** - Formulaires Contact
- Types : question, réclamation, formation, devis
- Statuts : nouveau, enCours, traité, fermé
- Priorités : basse, normale, haute, urgente

### 12. **media** - Upload Fichiers
- Stockage dans `/media`
- 2 tailles générées : thumbnail (400x300), card (768x1024)
- Champ alt pour accessibilité

## Endpoints personnalisés

### POST [/api/creer-apprenant](src/endpoints/creerApprenant.ts)

**Fonction** : Création atomique apprenant + structure juridique

**Flux** :
1. Validation des données (nom, prenom, email, siret requis)
2. Recherche structure existante par SIRET
3. Si inexistante : création nouvelle structure
4. Vérification doublon apprenant par email
5. Création apprenant avec liaison structure

**Réponses** :
- ✅ 200 : Succès avec IDs créés
- ❌ 400 : Données manquantes
- ❌ 409 : Email déjà existant
- ❌ 500 : Erreur serveur

**Données requises** :
```json
{
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "siret": "string (14 chiffres)",
  "structureNom": "string",
  "telephone": "string (optionnel)",
  "programme": "string (optionnel)"
}
```

## Points d'accès API

### REST API (automatique via Payload)

**Base URL** : `http://localhost:3000/api`

**Collections disponibles** :
- `/api/users` - Utilisateurs
- `/api/formations` - Formations catalogue
- `/api/formations_personnalisees` - Formations sur mesure
- `/api/structures-juridiques` - Entreprises
- `/api/apprenants` - Apprenants
- `/api/articles` - Blog
- `/api/categories` - Catégories
- `/api/tags` - Tags
- `/api/programmes` - Programmes
- `/api/rendez-vous` - RDV
- `/api/contacts` - Contacts
- `/api/media` - Médias

**Opérations standard** (auto-générées) :
- `GET /api/{collection}` - Liste paginée
- `GET /api/{collection}/:id` - Détail
- `POST /api/{collection}` - Création
- `PATCH /api/{collection}/:id` - Modification
- `DELETE /api/{collection}/:id` - Suppression

**Endpoints custom** :
- `POST /api/creer-apprenant` - Création apprenant + structure

### GraphQL API

**Endpoint** : `http://localhost:3000/api/graphql`

Schéma auto-généré pour toutes les collections.

**Playground** : Interface interactive disponible sur l'endpoint.

### Admin UI

**Endpoint** : `http://localhost:3000/admin`

Interface Payload CMS native.

**Status** :
- Temporairement activé (`disable: false`) pour tests
- À désactiver en production (`disable: true`) car dashboard custom React dans frontend

## Workflow de développement

### Démarrage du serveur

**Option 1 : Script propre** (recommandé)
```bash
./start-clean.sh
```
Nettoie les processus zombies et démarre Next.js.

**Option 2 : Manuel**
```bash
killall -9 node
fuser -k 3000/tcp
sleep 2
pnpm dev
```

### Au démarrage, vérifiez

```
✓ Starting...
🔍 [Payload Config] MongoDB URI configurée: ✅ mongodb+srv://...
✓ Ready in 2500ms
```

### Tests automatisés

```bash
./test-api.sh
```

Teste :
- Homepage
- API Collections (users, formations, etc.)
- GraphQL endpoint
- Custom endpoint creer-apprenant

### Génération types TypeScript

```bash
pnpm generate:types
```
Génère `src/payload-types.ts` depuis les collections.

### Génération importmap admin

```bash
pnpm generate:importmap
```
Génère `app/(payload)/admin/importMap.js`.

## Déploiement

### Railway (production)

**Variables d'environnement requises** :
```env
MONGODB_URI=mongodb+srv://...
PAYLOAD_SECRET=your-secret-key-change-this
RESEND_API_KEY=re_...
RESEND_DEFAULT_EMAIL=noreply@gestionmax.fr
NEXT_PUBLIC_SERVER_URL=https://backend.gestionmax.fr
PORT=3000
NODE_ENV=production
```

**Process** :
1. Push vers GitHub (main branch)
2. Railway détecte Dockerfile
3. Build multi-stage avec patch undici
4. Déploiement automatique

**Commits récents** :
```
43721bf - feat: migrate Payload CMS 3.x to Next.js architecture
660018c - docs: add complete backend architecture documentation
c1694c7 - chore: trigger Railway deployment
```

## Configuration base de données

### MongoDB Atlas

**Cluster** : `Clustergestionmaxformation`
**Database** : `formation-app-gestionmax`

**Collections créées automatiquement** :
- users
- formations
- formations_personnalisees
- structures-juridiques
- apprenants
- articles, categories, tags
- programmes
- rendez-vous
- contacts
- media
- payload-migrations
- payload-preferences

**Options optimisées** :
```typescript
{
  serverSelectionTimeoutMS: 5000,   // Timeout connexion rapide
  socketTimeoutMS: 45000,           // Timeout socket 45s
  family: 4,                        // Force IPv4
  autoIndex: false,                 // Production : désactivé
  autoCreate: false,                // Production : désactivé
}
```

## Contrôle d'accès

### Logique par collection

**users** :
- Read : Admins voient tout, autres utilisateurs leur propre profil
- Create : Admins et superAdmins uniquement
- Update : Admins voient tout, autres leur profil
- Delete : SuperAdmins uniquement
- Admin access : Tout le monde (pour connexion)

**articles/categories/tags** :
- Read : Public (pas d'authentification)
- Create/Update/Delete : Utilisateurs authentifiés uniquement

**Autres collections** : Contrôle par défaut de Payload

## Sécurité

### Mesures implémentées

1. **Authentication** : JWT via Payload (cookies httpOnly)
2. **CSRF Protection** : Whitelist domaines autorisés
3. **CORS** : Configuration stricte
4. **Passwords** : Hachage bcrypt automatique
5. **Roles** : RBAC (Role-Based Access Control)
6. **Unique constraints** : Email, SIRET, slug uniques
7. **Validation** : Champs requis, formats email

### À améliorer

- Rate limiting sur endpoints publics
- Validation SIRET format (14 chiffres)
- Validation numéro sécurité sociale (15 chiffres)
- Sanitization des entrées riches (richText)
- Logs d'audit pour actions sensibles

## Performance

### Optimisations actuelles

- Images redimensionnées automatiquement (thumbnail, card)
- Index MongoDB désactivés en production (performance)
- Build multi-stage Docker (image optimisée)
- Gzip compression activée
- `.dockerignore` optimisé (645MB → 502KB build context)

### À optimiser

- Cache Redis pour requêtes fréquentes
- CDN pour media uploads (S3/Cloudflare)
- Lazy loading des relations
- Database connection pooling

## Dépendances principales

### Production
- `payload@3.61.0` - CMS headless
- `@payloadcms/next@3.62.0` - Adapter Next.js
- `@payloadcms/db-mongodb@3.62.0` - Adapter MongoDB
- `@payloadcms/email-resend@3.62.0` - Envoi emails
- `@payloadcms/richtext-lexical@3.62.0` - Éditeur riche
- `@payloadcms/graphql@3.62.0` - API GraphQL
- `next@15.2.3` - Framework Next.js
- `react@19.2.0` - UI library
- `mongodb@6.20.0` - Driver MongoDB
- `sharp@0.34.4` - Traitement images

### Développement
- `typescript@5` - Langage
- `cross-env@7.0.3` - Variables env cross-platform

**Package manager** : pnpm 10.13.1

## Troubleshooting

### Erreur : Cannot GET /api/users

**Cause** : Routes Payload non initialisées.

**Solution** :
1. Vérifier que `app/api/[...payload]/route.ts` existe (PAS `[...slug]`)
2. Vérifier que `withPayload()` wrapper est dans `next.config.mjs`
3. Régénérer importmap : `pnpm generate:importmap`
4. Redémarrer serveur

### Erreur : EADDRINUSE port 3000

**Cause** : Processus Node.js zombie.

**Solution** :
```bash
./start-clean.sh
```
ou
```bash
killall -9 node
fuser -k 3000/tcp
```

### Erreur : MongoDB connection timeout

**Cause** : IP non autorisée dans MongoDB Atlas.

**Solutions** :
1. Vérifier connexion Internet
2. Ajouter IP dans MongoDB Atlas Network Access
3. Tester connexion directement :
```bash
node -e "const {MongoClient}=require('mongodb');new MongoClient(process.env.MONGODB_URI).connect().then(()=>console.log('✅')).catch(e=>console.log('❌',e.message))"
```

### Erreur : undici CacheStorage

**Cause** : Bug undici v7.10.0 avec Docker.

**Solution** : Déjà patché dans `build-with-fix.sh`.

### Erreur : Unknown command "serve"

**Cause** : Tentative d'utiliser `payload serve` (n'existe pas en v3).

**Solution** : Utiliser `pnpm dev` (Next.js), pas de commande serve.

## Tests

### Test complet

```bash
./test-api.sh
```

Tests effectués :
1. ✅ Homepage - Vérifie page d'accueil
2. ✅ API Users - Vérifie endpoint REST
3. ✅ API Formations - Vérifie collections
4. ✅ GraphQL - Vérifie endpoint GraphQL
5. ✅ Custom endpoint - Teste création apprenant

### Tests manuels

**1. Homepage**
```bash
curl http://localhost:3000/
```

**2. API Collection**
```bash
curl http://localhost:3000/api/users
```

**3. GraphQL**
```bash
curl http://localhost:3000/api/graphql
```

**4. Admin UI**
```
http://localhost:3000/admin
```

**5. Custom endpoint**
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

## Maintenance

### Backup

**Base de données** :
- Snapshot MongoDB automatique via MongoDB Atlas
- Collections critiques : users, apprenants, structures-juridiques

**Médias** :
- Backup du dossier `/media` vers S3/Cloud Storage

### Migrations

Payload gère les migrations automatiquement via MongoDB.

Pour changements de schéma :
1. Modifier collections dans `src/collections/`
2. Redémarrer serveur (auto-migration)
3. Régénérer types : `pnpm generate:types`

### Monitoring

**Logs actuels** :
- Console logs MongoDB, Payload, Next.js

**Recommandations** :
- Intégrer Winston/Pino pour logs structurés
- Sentry pour tracking erreurs production
- Prometheus/Grafana pour métriques

## Différences avec Payload 2.x

| Aspect | Payload 2.x | Payload 3.x |
|--------|-------------|-------------|
| **Architecture** | Express standalone | Next.js native |
| **Serveur** | `src/server.ts` + Express | `app/api/[...payload]/route.ts` |
| **Config** | `src/payload.config.ts` | `payload.config.ts` (root) |
| **Scripts** | `payload serve`, `nodemon` | `next dev`, `next build` |
| **Route handler** | `payload.routes` middleware | `handlePayloadRequest` |
| **Admin UI** | Express routes | Next.js App Router |
| **Build** | `payload build` + `tsc` | `next build` |
| **Start** | `node dist/server.js` | `next start` |
| **Package manager** | npm/yarn | pnpm (recommandé) |

## Guides

### Ajouter une nouvelle collection

1. Créer `src/collections/MaCollection.ts` :
```typescript
import { CollectionConfig } from 'payload'

export const MaCollection: CollectionConfig = {
  slug: 'ma-collection',
  fields: [
    { name: 'titre', type: 'text', required: true },
  ],
}
```

2. Importer dans `payload.config.ts` :
```typescript
import { MaCollection } from './src/collections/MaCollection'

export default buildConfig({
  collections: [
    // ... autres collections
    MaCollection,
  ],
})
```

3. Redémarrer serveur (auto-migration)

4. Régénérer types :
```bash
pnpm generate:types
```

### Ajouter un endpoint custom

1. Créer `src/endpoints/monEndpoint.ts` :
```typescript
import { PayloadHandler } from 'payload'

export const monEndpoint: PayloadHandler = async (req, res) => {
  try {
    const data = await req.payload.find({ collection: 'users' })
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
```

2. Ajouter dans `payload.config.ts` :
```typescript
endpoints: [
  {
    path: '/mon-endpoint',
    method: 'get',
    handler: monEndpoint,
  },
],
```

3. Accès : `http://localhost:3000/api/mon-endpoint`

---

**Dernière mise à jour** : 2025-11-01
**Version Payload** : 3.61.0
**Version Next.js** : 15.2.3
**Version Node** : 20+
**Architecture** : Next.js App Router + Payload 3.x native
