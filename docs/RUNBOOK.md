# Runbook

Day-to-day commands for local development and ops.

## Prerequisites

- Node.js ≥ 20 (see `.nvmrc`)
- npm 10+
- Docker Desktop (for Mongo / compose)
- Optional: Cloudinary, Stripe, SMTP accounts

## First-time setup

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env

# Mongo only (if you already use a local cat-mongo container, skip)
docker compose -f docker/docker-compose.yml up -d mongo

npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

| App        | URL                                 |
| ---------- | ----------------------------------- |
| Storefront | http://localhost:3000               |
| Admin      | http://localhost:5173               |
| API        | http://localhost:5000/api/v1        |
| Health     | http://localhost:5000/api/v1/health |

Default super admin (seeded when `SEED_ON_BOOT=true`):

- Email: `superadmin@catmarketplace.local`
- Password: `SuperAdmin!23456`

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

## Docker

```bash
# API + Mongo
npm run docker:up

# API + Mongo + frontend + admin (profile full)
npm run docker:up:full

npm run docker:logs
npm run docker:down
```

Compose file: `docker/docker-compose.yml`  
Dockerfiles: `docker/Dockerfile.backend|frontend|admin`

## Git hooks

Husky runs `lint-staged` on commit (Prettier on staged `ts/tsx/js/jsx/json/md/css`).

```bash
# re-init hooks after clone
npm install
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Runs on PRs / pushes to `main`|`master`: format check, lint, backend/frontend/admin builds.

## Troubleshooting

### Port 5000 already in use (Windows)

Find and stop the process listening on 5000, then restart `npm run dev:backend`.

### CORS / cookies blocked

Confirm `FRONTEND_URL` and `ADMIN_URL` in `backend/.env` match the browser origin exactly.  
Mutating requests need the `csrf_token` cookie + `X-CSRF-Token` header (handled by the Axios clients).

### Admin login rejected for customer accounts

Only staff roles (`super_admin`, `admin`, `manager`, `staff`) may use the admin app.

### Empty catalog

Seed data or create breeds/categories/cats in the admin CRM after signing in as super admin.

## Production pointers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel + Railway/Render + Atlas.
