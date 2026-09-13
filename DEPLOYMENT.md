# Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide provides step-by-step instructions to deploy the **LLD Practice Platform** with the backend hosted on **Render** and the frontend hosted on **Vercel**.

---

## Architecture Overview

| Service | Platform | Environment / Runtime | Key Environment Variables |
| :--- | :--- | :--- | :--- |
| **Backend** (`apps/backend`) | **Render** | Docker (`oven/bun:1`) | `PORT=3001`<br>`DATABASE_URL` (optional/Postgres)<br>`OPENAI_API_KEY` or `GEMINI_API_KEY`<br>`CORS_ORIGIN=*` |
| **Frontend** (`apps/web`) | **Vercel** | Next.js 16 + Bun / Node.js | `NEXT_PUBLIC_API_URL` (points to Render backend URL) |

---

## Step 1: Deploy Backend to Render

### Option A: Using Render Blueprint (`render.yaml`) — Recommended

1. Push your latest code to your GitHub / GitLab repository.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml).
5. Review the service configuration:
   - **Service Name**: `lld-arena-backend`
   - **Runtime**: `Docker`
   - **Health Check Path**: `/health`
6. Fill in the required environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (Render PostgreSQL, Neon, Supabase, or Railway). *If left blank, backend automatically falls back to built-in in-memory store with seeded problems.*
   - `OPENAI_API_KEY` or `GEMINI_API_KEY`: Your AI evaluation API key.
7. Click **Apply**. Render will build the Docker container and start your backend service.
8. Once deployed, copy your backend service URL (e.g. `https://lld-arena-backend.onrender.com`).
9. Verify by opening `https://lld-arena-backend.onrender.com/health` in your browser. You should see:
   ```json
   { "status": "ok", "timestamp": "..." }
   ```

---

### Option B: Manual Web Service on Render

If you prefer setting up the Web Service manually:
1. In the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Choose:
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.` (root of repo)
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<your_postgres_connection_string>`
   - `OPENAI_API_KEY` = `<your_openai_or_gemini_key>`
   - `CORS_ORIGIN` = `*`
5. Click **Create Web Service**.

> [!TIP]
> The included [`docker-entrypoint.sh`](./docker-entrypoint.sh) will automatically run `prisma db push` and `bun prisma/seed.ts` on startup whenever `DATABASE_URL` is set!

---

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Git Integration) — Recommended

1. Log in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`apps/web`** (or keep as `./` because root [`vercel.json`](./vercel.json) is configured).
   - **Build and Output Settings**:
     - If Root Directory is `apps/web`: Vercel auto-detects `next build`.
     - If Root Directory is root `./`: Build Command is `turbo run build --filter=web...` and Output Directory is `apps/web/.next`.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-backend-name>.onrender.com`
     *(Example: `https://lld-arena-backend.onrender.com`)*
5. Click **Deploy**.
6. Vercel will run the Turborepo build and deploy your Next.js application.

---

### Option B: Using Vercel CLI

From your local machine or terminal:
```powershell
# Install Vercel CLI if not already installed
npm i -g vercel

# Link and deploy from root
vercel
```
When prompted:
- Set up and deploy: **Y**
- Which scope: Select your team or account
- Link to existing project: **N**
- Project name: `lld-arena-web`
- In which directory is your code located: `./` or `apps/web`
- Add environment variable:
  ```powershell
  vercel env add NEXT_PUBLIC_API_URL
  # Enter your Render URL: https://lld-arena-backend.onrender.com
  ```
- Deploy to production:
  ```powershell
  vercel --prod
  ```

---

## Step 3: Verification & Health Checks

1. **Backend Health Check**:
   ```bash
   curl https://<your-backend>.onrender.com/health
   # Response: {"status":"ok","timestamp":"..."}
   ```
2. **Backend Problems API**:
   ```bash
   curl https://<your-backend>.onrender.com/api/problems
   # Response: List of seed problems
   ```
3. **Frontend Connectivity**:
   - Open your Vercel deployment URL (e.g., `https://lld-arena-web.vercel.app`).
   - The problems list (Parking Lot System, Elevator Control System, etc.) should load seamlessly.
   - Start an attempt, type your solution, and click Submit to verify real-time deterministic and AI evaluation.

---

## Configuration Files Reference

- [`Dockerfile`](./Dockerfile): Production Docker build with Bun 1, Node/OpenSSL for Prisma engine support, and automated entrypoint execution.
- [`docker-entrypoint.sh`](./docker-entrypoint.sh): Automated runtime script that runs Prisma DB schema push and problem seeding if `DATABASE_URL` is configured.
- [`render.yaml`](./render.yaml): Render Blueprint for single-click infrastructure deployment.
- [`vercel.json`](./vercel.json): Root Vercel configuration for Turborepo monorepo build targeting `apps/web`.
- [`apps/web/vercel.json`](./apps/web/vercel.json): Sub-package Vercel configuration when deploying with Root Directory = `apps/web`.
- [`.vercelignore`](./.vercelignore): Excludes backend code and Docker files from frontend Vercel builds.
- [`.dockerignore`](./.dockerignore): Excludes web frontend build and git files from backend Docker container context.
- [`apps/web/next.config.js`](./apps/web/next.config.js): Dynamic `/api/:path*` rewrites resolving to `NEXT_PUBLIC_API_URL` or `BACKEND_URL`.
