# --- Stage 1: Builder ---
FROM node:20-slim AS builder
WORKDIR /app

# Installer PNPM directement (version compatible avec pnpm-lock.yaml)
RUN apt-get update && apt-get install -y curl ca-certificates \
  && npm install -g pnpm@10.13.1 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build Next.js avec le patch undici
RUN chmod +x build-with-fix.sh && sh build-with-fix.sh

# --- Stage 2: Runner ---
FROM node:20-slim AS runner
WORKDIR /app

# Installer pnpm pour exécuter l'application
RUN npm install -g pnpm@10.13.1

# Copier les fichiers nécessaires depuis le builder (API-only, pas de public/)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/payload.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/app ./app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Démarrer Next.js en mode production
CMD ["pnpm", "start"]
