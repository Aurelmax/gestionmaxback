#!/bin/bash
set -e

echo "🔧 Patching undici to fix CacheStorage issue..."
UNDICI_PATH=$(find node_modules/.pnpm -path "*/undici@*/node_modules/undici/index.js" | head -n 1)
if [ -f "$UNDICI_PATH" ]; then
  echo "📍 Found undici at: $UNDICI_PATH"
  sed -i 's/globalThis\.CacheStorage = undefined;//' "$UNDICI_PATH"
  echo "✅ undici patched successfully"
else
  echo "⚠️ undici not found, skipping patch"
fi

echo "🏗️ Generating Payload types..."
pnpm payload generate:types

echo "🏗️ Skipping Payload importmap (headless mode)..."

echo "🏗️ Building Next.js application..."
pnpm next build
