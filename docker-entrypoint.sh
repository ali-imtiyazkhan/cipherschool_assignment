#!/bin/sh
set -e

echo "=== LLD Arena Backend Starting ==="

# If DATABASE_URL is set, run Prisma db push and seed
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL detected. Synchronizing Prisma schema..."
  cd /app/packages/db
  bunx prisma db push --accept-data-loss || echo "Warning: Prisma db push failed, continuing..."
  
  echo "Checking database seeds..."
  cd /app/apps/backend
  bun prisma/seed.ts || echo "Seed skipped or already executed."
else
  echo "DATABASE_URL not set. Running with built-in in-memory storage."
fi

cd /app/apps/backend
echo "Starting server on port ${PORT:-3001}..."
exec bun src/main.ts
