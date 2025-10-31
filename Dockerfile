FROM node:20-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# Copier le code source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/payload.config.ts ./src/payload.config.ts

# Exposer le port
EXPOSE 3000

ENV NODE_ENV=production

# Démarrer
CMD ["node", "dist/server.js"]
