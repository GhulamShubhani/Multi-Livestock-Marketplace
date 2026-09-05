# Deployment Guide

Target topology for **Multi-Livestock Marketplace**:

| App         | Host                           | Notes                                |
| ----------- | ------------------------------ | ------------------------------------ |
| `frontend/` | **Vercel**                     | Next.js App Router (local port 3005) |
| `admin/`    | **Vercel**                     | Vite static SPA                      |
| `backend/`  | **Vercel**, Railway, or Render | Express API `/api/v1`                |
| MongoDB     | **MongoDB Atlas**              | DB name e.g. `livestock_marketplace` |

Local Docker Compose covers Mongo + API (and optional frontend/admin). Prefer managed hosts for production.

**Payments:** configure UPI/QR/bank in admin Settings (`payment` key). No Stripe webhook setup.

---

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Allow network access from your API host.
3. Copy the SRV URI into `MONGODB_URI` (path/db: `livestock_marketplace` recommended).

---

## 2. Backend (Railway, Render, or Vercel)

### Environment

Copy from `backend/.env.example` and set at least:

```text
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
MONGODB_URI=mongodb+srv://.../livestock_marketplace
FRONTEND_URL=http://localhost:3005,https://your-storefront.vercel.app
ADMIN_URL=http://localhost:5173,https://your-admin.vercel.app
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=.yourdomain.com   # optional
DEFAULT_CURRENCY=INR
CLOUDINARY_FOLDER=livestock-marketplace
SEED_ON_BOOT=false              # run seed once manually
SUPER_ADMIN_EMAIL=...
SUPER_ADMIN_PASSWORD=...
```

Also set Cloudinary when leaving mock upload mode. **Do not set `STRIPE_*`.**

`FRONTEND_URL` / `ADMIN_URL` accept **comma-separated** origins.

### Vercel (API)

1. New project → Root Directory = `backend` (or monorepo root with backend build).
2. Framework: Other. `vercel.json` / `api/index.ts` if using serverless entry.
3. Env vars above. Cross-site cookies need `COOKIE_SECURE=true` + `COOKIE_SAME_SITE=none`.
4. Health: `https://your-api.vercel.app/api/v1/health`

### Railway

1. Deploy from GitHub.
2. Build: `npm ci && npm run build:backend`  
   Start: `npm start`
3. Or Dockerfile: `docker/Dockerfile.backend` with context = monorepo root.

### Render

Prefer repo root `render.yaml` (API blueprint), or:

1. Web Service from monorepo root.
2. Build: `npm ci && npm run build:backend`  
   Start: `npm start`  
   Health: `/api/v1/health`
3. Set `NODE_ENV=production`, `HUSKY=0`.

### Post-deploy

```bash
MONGODB_URI=... npm run seed --workspace=@cat-marketplace/backend
```

Then in Admin → Settings, fill **payment** receiver details (UPI, QR, bank, instructions).

---

## 3. Frontend (Vercel)

1. Root Directory `frontend` (or monorepo workspace build).
2. Framework: Next.js. Set `HUSKY=0` if install hits husky.
3. Environment:

```text
NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1
NEXT_PUBLIC_APP_URL=https://shop.yourdomain.com
NEXT_PUBLIC_APP_NAME=Livestock Marketplace
```

Local mode switching (see `frontend/.env.example`):

```text
NEXT_PUBLIC_API_MODE=local
NEXT_PUBLIC_API_LOCAL_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_REMOTE_URL=https://your-api.example.com/api/v1
```

4. Ensure API `FRONTEND_URL` matches the Vercel URL exactly.

---

## 4. Admin (Vercel)

1. Root Directory `admin`.
2. Framework: Vite.
3. Environment:

```text
VITE_API_URL=https://your-api.example.com/api/v1
VITE_APP_NAME=Multi-Livestock Marketplace CRM
```

4. Build: `npm run build --workspace=@cat-marketplace/admin`  
   Output: `admin/dist` (from repo root) or `dist` (root=`admin`).
5. SPA rewrite → `index.html`.

---

## 5. Cookies & CORS checklist

- API `FRONTEND_URL` / `ADMIN_URL` match browser origins.
- Production: `COOKIE_SECURE=true`. Cross-site usually `SameSite=none`.
- Prefer shared parent domain + `COOKIE_DOMAIN=.yourdomain.com` with `SameSite=Lax` when possible.

---

## 6. Docker (local / self-host)

```bash
cp backend/.env.example backend/.env
npm run docker:up          # mongo + api → livestock_marketplace
npm run docker:up:full     # + frontend + admin
```

See [RUNBOOK.md](./RUNBOOK.md).

---

## 7. Cutover from Cat Marketplace / Stripe

1. Point `MONGODB_URI` at `livestock_marketplace` (or migrate collections: cats → listings, drop Stripe payment fields).
2. Remove `STRIPE_*` from host env.
3. Seed attributes/categories; recreate listings.
4. Configure `settings.payment`.
5. Update Vercel app names / `NEXT_PUBLIC_APP_NAME` / `VITE_APP_NAME`.
6. Confirm health + login + listing browse + payment submit/verify in staging before DNS cutover.
