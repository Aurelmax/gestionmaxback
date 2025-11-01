#!/bin/sh
set -e

echo "🔧 Patching undici to fix CacheStorage issue..."

# Trouver le fichier undici/index.js (fonctionne avec npm et pnpm)
UNDICI_FILE=$(find node_modules -name "index.js" -path "*/undici/index.js" | head -n 1)

if [ -n "$UNDICI_FILE" ]; then
  echo "📍 Found undici at: $UNDICI_FILE"
  sed -i 's/module\.exports\.caches = new CacheStorage(kConstruct)/module.exports.caches = undefined/' "$UNDICI_FILE"
  echo "✅ undici patched successfully"
else
  echo "⚠️ undici/index.js not found, skipping patch"
fi

echo "🏗️ Generating Payload types..."
npx payload generate:types

echo "🏗️ Generating Payload importmap..."
npx payload generate:importmap

echo "🏗️ Building Next.js application..."
npx next build

echo "✅ Build completed successfully"
