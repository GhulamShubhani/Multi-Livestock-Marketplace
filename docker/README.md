# Docker

Local / self-host images for **Multi-Livestock Marketplace**.

## Quick start

From monorepo root:

```bash
cp backend/.env.example backend/.env
npm run docker:up
```

This starts **MongoDB** (`27017`) and the **API** (`5000`).

- Container names: `livestock-mongo`, `livestock-api`
- Database: `livestock_marketplace`
- Volume: `livestock_mongo_data`

> Older Cat Marketplace compose used `cat-mongo` / `cat_marketplace` / `cat_mongo_data`. Prefer the new names; migrate data or wipe volumes if switching.

## Full stack profile

```bash
npm run docker:up:full
```

Also builds:

- Frontend → http://localhost:3000 (compose maps Next; local `npm run dev:frontend` uses **3005**)
- Admin (nginx) → http://localhost:5173

App branding build args: `Livestock Marketplace` / `Multi-Livestock Marketplace CRM`.

## Files

| File                  | Purpose            |
| --------------------- | ------------------ |
| `docker-compose.yml`  | Compose services   |
| `Dockerfile.backend`  | Express API        |
| `Dockerfile.frontend` | Next.js standalone |
| `Dockerfile.admin`    | Vite SPA + nginx   |
| `nginx.conf`          | Admin SPA routing  |

See [../docs/RUNBOOK.md](../docs/RUNBOOK.md) and [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
