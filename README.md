# GestionMax Backend API

Backend Payload CMS standalone pour GestionMax.

## Setup local

\`\`\`bash
npm install
cp .env.example .env
# Editer .env avec vos valeurs
npm run dev
\`\`\`

## Déploiement Railway

1. Pousser sur GitHub
2. Connecter Railway au repo
3. Définir les variables d'environnement
4. Déployer

## Variables d'environnement

- `MONGODB_URI`: URI MongoDB Atlas
- `PAYLOAD_SECRET`: Clé secrète Payload
- `SERVER_URL`: URL publique du backend
- `FRONTEND_URL`: URL du frontend (pour CORS)
- `PORT`: Port (défaut: 3000, Railway: 8080)
