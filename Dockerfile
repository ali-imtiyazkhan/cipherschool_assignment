FROM oven/bun:1.1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install Node.js and npm because Prisma may invoke npm
RUN apt-get update \
    && apt-get install -y nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and lockfile
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install dependencies
RUN bun install

# Generate Prisma Client
WORKDIR /app/packages/db
RUN bunx prisma@5 generate

# Run backend
WORKDIR /app/apps/backend
EXPOSE 3001

CMD ["bun", "src/main.ts"]