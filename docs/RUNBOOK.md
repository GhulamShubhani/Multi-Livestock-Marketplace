# Runbook

Day-to-day commands for local development and ops — **Multi-Livestock Marketplace**.

## Prerequisites

- Node.js ≥ 20 (see `.nvmrc`)
- npm 10+
- Docker Desktop (for Mongo / compose)
- Optional: Cloudinary, SMTP (mocks work without them)

**Not required:** Stripe accounts or `STRIPE_*` env vars.

## First-time setup

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env

# Mongo only
docker compose -f docker/docker-compose.yml up -d mongo

npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

| App        | URL                                 |
| ---------- | ----------------------------------- |
| Storefront | http://localhost:3005               |
| Admin      | http://localhost:5173               |
| API        | http://localhost:5000/api/v1        |
| Health     | http://localhost:5000/api/v1/health |

Default super admin (when `SEED_ON_BOOT=true`; override via env):

- Email: value of `SUPER_ADMIN_EMAIL` (example: `superadmin@livestockmarketplace.local`)
- Password: value of `SUPER_ADMIN_PASSWORD` (example: `SuperAdmin!23456`)

## Common scripts

```bash
npm run build                 # backend only (safe for API hosts)
npm run build:all             # backend + frontend + admin
npm run build:backend
npm run build:frontend
npm run build:admin
npm run lint
npm run format
npm run format:check
```

Backend seed (manual):

```bash
npm run seed --workspace=@cat-marketplace/backend
```

Seeds roles, permissions, super admin, default categories/breeds/attributes, homepage sections, and settings (including payment placeholders).

## Docker

```bash
# API + Mongo (DB name: livestock_marketplace)
npm run docker:up

# API + Mongo + frontend + admin (profile full)
npm run docker:up:full

npm run docker:logs
npm run docker:down
```

Compose file: `docker/docker-compose.yml`  
Dockerfiles: `docker/Dockerfile.backend|frontend|admin`

> Older installs may still have volume `cat_mongo_data` / DB `cat_marketplace`. New compose uses `livestock_mongo_data` / `livestock_marketplace`. Migrate or reset volumes if switching.

## Git hooks

Husky runs `lint-staged` on commit (Prettier on staged `ts/tsx/js/jsx/json/md/css`).

```bash
npm install   # re-init hooks after clone
```

## CI

GitHub Actions: `.github/workflows/ci.yml` — format check, lint, builds on PRs / pushes to `main`|`master`.

## Troubleshooting

### Port 5000 / 3005 already in use

Stop the process bound to the port, then restart the matching `npm run dev:*` script.

### CORS / cookies blocked

Confirm `FRONTEND_URL` and `ADMIN_URL` in `backend/.env` match browser origins exactly (comma-separated lists allowed).  
Mutating requests need `csrf_token` cookie + `X-CSRF-Token` (Axios clients handle this).

### Admin login rejected for buyer accounts

Only staff roles (`super_admin`, `admin`, `manager`, `staff`) may use the admin app.

### Empty catalog

Seed data or create categories / attributes / listings in admin after signing in as super admin.

### Payment methods empty on checkout

Configure Settings → payment (UPI ID, QR, bank, instructions) in admin, or set the `payment` settings document. Storefront reads `GET /payments/methods`.

### Still seeing Stripe / cats APIs

Product API mounts **listings** and **manual payments** only. Remove stale `STRIPE_*` from local `.env`. Prefer docs and `.env.example` as source of truth.

## Production pointers

See [DEPLOYMENT.md](./DEPLOYMENT.md).
