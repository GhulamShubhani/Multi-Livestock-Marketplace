# Docker

Local / self-host images for Cat Marketplace.

## Quick start

From monorepo root:

```bash
cp backend/.env.example backend/.env
npm run docker:up
```

This starts **MongoDB** (`27017`) and the **API** (`5000`).

## Full stack profile

```bash
npm run docker:up:full
```

Also builds:

- Frontend → http://localhost:3000
- Admin (nginx) → http://localhost:5173

## Files

| File                  | Purpose            |
| --------------------- | ------------------ |
| `docker-compose.yml`  | Compose services   |
| `Dockerfile.backend`  | Express API        |
| `Dockerfile.frontend` | Next.js standalone |
| `Dockerfile.admin`    | Vite SPA + nginx   |
| `nginx.conf`          | Admin SPA routing  |

See [../docs/RUNBOOK.md](../docs/RUNBOOK.md) and [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
