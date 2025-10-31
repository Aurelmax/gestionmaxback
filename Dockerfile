FROM node:20-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer
CMD ["npm", "run", "serve"]
