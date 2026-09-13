#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Installing dependencies ==="
bun install

echo "=== Generating Prisma Client ==="
cd packages/db
bunx prisma generate

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL detected. Synchronizing database..."
  bunx prisma db push --accept-data-loss || echo "Prisma push failed, continuing..."
  cd ../../apps/backend
  bun prisma/seed.ts || echo "Seed finished or skipped."
fi
