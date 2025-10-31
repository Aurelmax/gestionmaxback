# Architecture Backend GestionMax - Payload CMS

## Vue d'ensemble

Backend API autonome basé sur **Payload CMS 3.61.0**, fonctionnant comme un serveur Express standalone avec MongoDB comme base de données.

## Structure du projet

```
backend/
├── src/
│   ├── server.ts                    # Point d'entrée principal
│   ├── payload.config.ts            # Configuration centralisée Payload
│   ├── collections/
│   │   ├── StructuresJuridiques.ts  # Collection entreprises B2B
│   │   └── Apprenants.ts            # Collection apprenants
│   └── endpoints/
│       └── creerApprenant.ts        # Endpoint custom création apprenant
├── media/                           # Stockage fichiers uploadés
├── package.json
├── tsconfig.json
├── Dockerfile                       # Multi-stage build pour Railway
└── nodemon.json
```

## Fichiers principaux

### 📄 [src/server.ts](src/server.ts)

**Rôle** : Bootstrap du serveur Express + Payload

```typescript
- Initialise Payload CMS avec la config
- Démarre Express sur PORT (défaut: 3000)
- Expose 3 points d'accès :
  • /admin    - Interface d'administration
  • /api      - API REST complète
  • /api/graphql - API GraphQL
```

### 📄 [src/payload.config.ts](src/payload.config.ts:1-1150)

**Rôle** : Configuration centralisée de Payload CMS

**Composants clés** :
- **Base de données** : MongoDB via mongooseAdapter (ligne 1134)
- **Email** : Resend adapter pour notifications (ligne 14)
- **Editeur** : Lexical pour rich text (ligne 62)
- **Uploads** : Sharp pour traitement images (ligne 12)
- **GraphQL** : Activé avec schéma auto-généré (ligne 16)

**Sécurité** :
- CORS configuré pour localhost + domaines production (lignes 51-59)
- CSRF protection (lignes 42-50)
- Cookie prefix "payload" pour éviter collisions (ligne 61)

**Admin UI** :
- Interface native désactivée (ligne 22)
- Route admin accessible via `/admin` (ligne 37)

## Collections (15 au total)

### 1. **users** (lignes 64-287)
- **Authentification** intégrée avec reset password
- **5 rôles** : superAdmin, admin, formateur, gestionnaire, apprenant
- **Contrôle d'accès** granulaire par rôle
- **Champs** : name, email, role, status, phone, permissions, avatar, metadata
- **Email reset password** personnalisé avec template HTML (lignes 68-109)

### 2. **formations** (lignes 289-352)
Formations standards du catalogue
- titre, description, durée, niveau, modalités, prix
- compétences (array)
- image, codeFormation

### 3. **formations_personnalisees** (lignes 354-604)
Formations sur mesure complètes
- Programme détaillé par jour/module (ligne 378)
- Modalités d'accès (prérequis, public, tarif)
- Contact formateur
- Modalités pédagogiques et d'évaluation
- Accessibilité handicap
- Statut : EN_COURS, FINALISEE, LIVREE, ARCHIVE

### 4. **[structures-juridiques](src/collections/StructuresJuridiques.ts)** (ligne 606)
Entreprises clientes B2B
- SIRET (unique), code APE
- Adresse complète
- Contact principal (groupe)
- Groupé sous "Gestion B2B"

### 5. **[apprenants](src/collections/Apprenants.ts)** (ligne 607)
Gestion des apprenants
- Informations personnelles (nom, prénom, email, téléphone)
- Informations administratives (dateNaissance, numéro sécu)
- **Relation** vers structures-juridiques (ligne 100)
- Programme, statut, progression (%)
- Groupé sous "Gestion Formation"

### 6. **articles** (lignes 609-717)
Système de blog
- Contenu rich text, slug unique
- Relation vers categories/tags
- Images multiples
- Meta SEO (description, keywords)
- Vue, temps lecture, featured
- Statut : brouillon, publié, archivé

### 7. **categories** (lignes 720-753)
- nom, slug, description
- couleur, icône

### 8. **tags** (lignes 756-780)
- nom, slug, couleur

### 9. **programmes** (lignes 783-902)
Programmes de formation détaillés
- codeFormation unique
- Objectifs, prérequis, programme, évaluation
- Certification, éligibilité CPF
- Rating, nombre d'étudiants
- Statut : actif, inactif, en_developpement

### 10. **rendez-vous** (lignes 905-1017)
Gestion des RDV
- **Relation** vers programmes
- Informations client (groupe)
- **Types** : positionnement, information, inscription, suivi
- **Statuts** : enAttente, confirmé, terminé, annulé, reporté
- Date, heure, durée, lieu (visio/présentiel/téléphone)
- Lien visio, notes, rappel envoyé

### 11. **contacts** (lignes 1020-1089)
Formulaires de contact
- Types : question, réclamation, formation, devis
- Statuts : nouveau, enCours, traité, fermé
- Priorités : basse, normale, haute, urgente
- Réponse et date de réponse

### 12. **media** (lignes 1092-1118)
Upload de fichiers
- Stockage dans `/media`
- 2 tailles générées : thumbnail (400x300), card (768x1024)
- Champ alt pour accessibilité
- MIME types : images uniquement

## Endpoints personnalisés

### POST [/api/creer-apprenant](src/endpoints/creerApprenant.ts)

**Fonction** : Création atomique apprenant + structure juridique

**Flux** :
1. Validation des données (nom, prenom, email, siret requis)
2. Recherche structure existante par SIRET (lignes 18-26)
3. Si inexistante : création nouvelle structure (lignes 34-50)
4. Vérification doublon apprenant par email (lignes 57-73)
5. Création apprenant avec liaison structure (lignes 78-94)

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

## Configuration base de données

### MongoDB (lignes 1134-1149)

**Connexion** :
- URI depuis variable `MONGODB_URI`
- Adapter : mongooseAdapter de `@payloadcms/db-mongodb`

**Options optimisées** :
- `serverSelectionTimeoutMS: 5000` - Timeout connexion rapide
- `socketTimeoutMS: 45000` - Timeout socket 45s
- `family: 4` - Force IPv4 (évite problèmes IPv6)
- `autoIndex: false` en production - Performance
- `autoCreate: false` en production - Sécurité

## Contrôle d'accès

### Logique par collection

**users** (lignes 113-156) :
- Read : Admins voient tout, autres utilisateurs leur propre profil
- Create : Admins et superAdmins uniquement
- Update : Admins voient tout, autres leur profil
- Delete : SuperAdmins uniquement
- Admin access : Tout le monde (pour connexion)

**articles/categories/tags** :
- Read : Public (pas d'authentification)
- Create/Update/Delete : Utilisateurs authentifiés uniquement

**Autres collections** : Contrôle par défaut de Payload

## Email & Notifications

### Resend adapter (lignes 14-18)

**Configuration** :
- `RESEND_API_KEY` : Clé API
- `RESEND_DEFAULT_EMAIL` : Expéditeur (noreply@gestionmax.fr)
- defaultFromName : "GestionMax Formation"

**Template reset password** (lignes 68-109) :
- Email HTML personnalisé
- Lien de réinitialisation avec token
- Expiration 1 heure
- Branding GestionMax

## Scripts NPM

```bash
# Développement
npm run dev                  # Nodemon avec hot-reload
                            # → cross-env NODE_ENV=development nodemon

# Build
npm run build               # payload build && tsc
                            # → Compile admin UI + TypeScript

# Production
npm run serve               # node dist/server.js
                            # → Exécute version compilée

# Payload CLI
npm run payload             # Accès CLI Payload
npm run generate:types      # Génère payload-types.ts
```

## Déploiement

### Railway (production)

**Fichier** : [Dockerfile](Dockerfile)
- Build multi-stage pour optimiser taille image
- devDependencies incluses (nodemon, typescript)
- Variables d'environnement requises :
  - `MONGODB_URI`
  - `PAYLOAD_SECRET`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_SERVER_URL`
  - `PORT`

**Commits récents** :
```
c1694c7 - chore: trigger Railway deployment
929a8e2 - fix: Dockerfile multi-stage build avec devDependencies
456f3b2 - feat: add package-lock.json for Railway deployment
```

## Variables d'environnement

### Requises

```env
# Base de données
MONGODB_URI=mongodb+srv://...

# Sécurité
PAYLOAD_SECRET=your-secret-key-change-this

# Email
RESEND_API_KEY=re_...
RESEND_DEFAULT_EMAIL=noreply@gestionmax.fr

# Serveur
PORT=3000
NEXT_PUBLIC_SERVER_URL=https://votre-domaine.com
NODE_ENV=production
```

## Dépendances principales

### Production
- `payload@3.61.0` - CMS headless
- `express@4.19.2` - Serveur HTTP
- `@payloadcms/db-mongodb@3.61.0` - Adapter MongoDB
- `@payloadcms/email-resend@3.61.0` - Envoi emails
- `@payloadcms/richtext-lexical@3.61.0` - Éditeur riche
- `@payloadcms/graphql@3.61.0` - API GraphQL
- `mongodb@6.20.0` - Driver MongoDB
- `sharp@0.34.4` - Traitement images
- `bcrypt@6.0.0` - Hachage mots de passe
- `cors@2.8.5` - CORS middleware

### Développement
- `typescript@5` - Langage
- `nodemon@3.1.10` - Hot reload
- `ts-node@10.9.2` - Exécution TypeScript
- `cross-env@7.0.3` - Variables env cross-platform

## Points d'accès API

### REST API

**Base URL** : `http://localhost:3000/api`

**Collections disponibles** :
- GET/POST `/api/users`
- GET/POST `/api/formations`
- GET/POST `/api/formations_personnalisees`
- GET/POST `/api/structures-juridiques`
- GET/POST `/api/apprenants`
- GET/POST `/api/articles`
- GET/POST `/api/categories`
- GET/POST `/api/tags`
- GET/POST `/api/programmes`
- GET/POST `/api/rendez-vous`
- GET/POST `/api/contacts`
- GET/POST `/api/media`

**Opérations standard** :
- `GET /api/{collection}` - Liste
- `GET /api/{collection}/:id` - Détail
- `POST /api/{collection}` - Création
- `PATCH /api/{collection}/:id` - Modification
- `DELETE /api/{collection}/:id` - Suppression

**Endpoints custom** :
- `POST /api/creer-apprenant` - Création apprenant + structure

### GraphQL API

**Endpoint** : `http://localhost:3000/api/graphql`

Schéma auto-généré dans `generated-schema.graphql`

### Admin UI

**Endpoint** : `http://localhost:3000/admin`

Interface désactivée par défaut (ligne 22), mais route accessible si réactivée.

## Types TypeScript

**Fichier généré** : `payload-types.ts`

Génération automatique lors du build ou via :
```bash
npm run generate:types
```

Contient les interfaces TypeScript pour toutes les collections.

## Sécurité

### Mesures implémentées

1. **Authentication** : Système intégré Payload avec JWT
2. **CSRF Protection** : Whitelist domaines autorisés (ligne 42)
3. **CORS** : Configuration stricte (ligne 51)
4. **Passwords** : Hachage bcrypt automatique
5. **Roles** : Contrôle d'accès basé sur rôles (RBAC)
6. **Unique constraints** : Email, SIRET, slug uniques
7. **Validation** : Champs requis, formats email

### À améliorer

- Rate limiting sur endpoints publics
- Validation SIRET format (14 chiffres)
- Validation numéro sécurité sociale (15 chiffres)
- Sanitization des entrées riches (richText)
- Logs d'audit pour actions sensibles

## Monitoring & Logs

### Logs actuels

Console logs dans :
- Connexion MongoDB (ligne 1137)
- Création apprenant (lignes 7, 31, 50, 53, 76, 96)
- Erreurs création apprenant (ligne 112)
- Démarrage serveur (lignes 19-22)

### Recommandations

- Intégrer Winston ou Pino pour logs structurés
- Ajouter Sentry pour tracking erreurs production
- Métriques avec Prometheus/Grafana

## Performance

### Optimisations actuelles

- Images redimensionnées automatiquement (thumbnail, card)
- Index MongoDB désactivés en production
- Build multi-stage Docker

### À optimiser

- Pagination par défaut (actuellement illimitée)
- Cache Redis pour requêtes fréquentes
- CDN pour media uploads
- Lazy loading des relations

## Maintenance

### Backup

**Base de données** :
- Snapshot MongoDB régulier via MongoDB Atlas
- Backup collections critiques : users, apprenants, structures-juridiques

**Médias** :
- Backup du dossier `/media` vers S3/Cloud Storage

### Migrations

Payload gère les migrations automatiquement via MongoDB.

Pour changements de schéma :
1. Modifier collections dans `src/collections/`
2. Redémarrer serveur (auto-migration)
3. Régénérer types : `npm run generate:types`

---

**Dernière mise à jour** : 2025-10-31
**Version Payload** : 3.61.0
**Version Node** : 20+
