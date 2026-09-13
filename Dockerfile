FROM oven/bun:1 AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Install Node.js, npm, and OpenSSL (required by Prisma engines on Linux)
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and workspace configuration
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Install workspace dependencies
RUN bun install

# Generate Prisma Client
WORKDIR /app/packages/db
RUN bunx prisma generate

# Configure entrypoint
WORKDIR /app
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]