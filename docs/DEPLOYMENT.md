# Deployment Guide

Target topology (from architecture):

| App         | Host                      | Notes              |
| ----------- | ------------------------- | ------------------ |
| `frontend/` | **Vercel**                | Next.js App Router |
| `admin/`    | **Vercel**                | Vite static SPA    |
| `backend/`  | **Railway** or **Render** | Express API        |
| MongoDB     | **MongoDB Atlas**         | Managed cluster    |

Local Docker compose covers Mongo + API (and optional frontend/admin). Prefer managed hosts for production.

---

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Allow network access from your API host (or `0.0.0.0/0` only if you accept the risk).
3. Copy the SRV connection string into `MONGODB_URI`.

---

## 2. Backend (Railway or Render)

### Environment

Copy from `backend/.env.example` and set at least:

```text
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-storefront.vercel.app
ADMIN_URL=https://your-admin.vercel.app
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=.yourdomain.com   # optional; needed for shared parent domain
SEED_ON_BOOT=false              # run seed once manually
```

Also configure Cloudinary + Stripe when leaving mock mode.

### Railway

1. New project → Deploy from GitHub repo.
2. Set root / build:
   - **Build command:** `npm ci && npm run build:backend`
   - **Start command:** `npm start`
3. Or use `docker/Dockerfile.backend` as the Dockerfile path with context = monorepo root.
4. Attach the public URL (e.g. `https://api.yourdomain.com`).

### Render

Prefer the repo root `render.yaml` blueprint (API only), or configure manually:

1. New **Web Service** from the repo (root = monorepo root, not `frontend/`).
2. **Dockerfile** path: `docker/Dockerfile.backend` (root context), **or** native Node:
   - **Build:** `npm ci && npm run build:backend` (preferred — avoids `--workspace` typos)
   - **Start:** `npm start` (runs `node backend/dist/server.js` — avoid long `--workspace=...` commands that Render may wrap/break)
   - Avoid `npm run build -- workspace=...` (space after `--`). Root `npm run build` only compiles the API; use `npm run build:all` for every app.
3. Health check path: `/api/v1/health`
4. Set `NODE_ENV=production` (not `development`). Set `HUSKY=0` so install skips git hooks.

### Post-deploy

```bash
# one-time seed against production DB (from a trusted machine)
MONGODB_URI=... npm run seed --workspace=@cat-marketplace/backend
```

Update Stripe webhook endpoint to `https://api.../api/v1/payments/webhook` and set `STRIPE_WEBHOOK_SECRET`.

---

## 3. Frontend (Vercel)

1. Import monorepo → set **Root Directory** to `frontend` (single Next.js project — not the multi-service preset unless you intend to host the API on Vercel too).
2. Framework: Next.js.
3. If install fails on `husky: command not found`, set env `HUSKY=0` (repo `prepare` is also CI-safe).
4. Environment:

```text
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://shop.yourdomain.com
NEXT_PUBLIC_APP_NAME=Cat Marketplace
```

4. Install command (monorepo): `npm install --prefix ..` can be flaky; prefer:

```text
cd ../.. && npm ci
```

Or enable Vercel “Include source files outside root” / use Turborepo-style root install:

```text
Install Command: cd ../.. && npm ci
Build Command: cd ../.. && npm run build --workspace=@cat-marketplace/frontend
Output Directory: .next   (auto for Next when root=frontend)
```

Simpler approach many teams use: set Vercel project root to monorepo root and:

```text
Build Command: npm run build --workspace=@cat-marketplace/frontend
Output: frontend/.next
```

5. CORS: ensure `FRONTEND_URL` on the API matches the Vercel URL exactly (including `https://`).

---

## 4. Admin (Vercel)

1. New Vercel project → Root Directory `admin` (or monorepo root with workspace build).
2. Framework preset: Vite.
3. Environment:

```text
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Cat Marketplace Admin
```

4. Build:

```text
npm run build --workspace=@cat-marketplace/admin
```

5. Output directory: `admin/dist` (if building from repo root) or `dist` (if root=`admin`).
6. SPA rewrites: all routes → `index.html` (Vercel Vite preset usually handles this).

---

## 5. Cookies & CORS checklist

- API `FRONTEND_URL` / `ADMIN_URL` must match browser origins.
- Production cookies: `COOKIE_SECURE=true`. Cross-site SPA → API usually needs `COOKIE_SAME_SITE=none` plus HTTPS.
- Prefer putting storefront, admin, and API under one parent domain (`shop.`, `admin.`, `api.`) and set `COOKIE_DOMAIN=.yourdomain.com` with `SameSite=Lax` when possible.

---

## 6. Docker (local / self-host)

```bash
# Mongo + API
cp backend/.env.example backend/.env
npm run docker:up

# Optional: also build frontend + admin
npm run docker:up:full
```

See [RUNBOOK.md](./RUNBOOK.md) for day-to-day commands.
