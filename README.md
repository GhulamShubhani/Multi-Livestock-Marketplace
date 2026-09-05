# Multi-Livestock Marketplace

Production-ready **Multi-Livestock Marketplace** monorepo with three independent applications:

| App         | Stack                        | Role                     |
| ----------- | ---------------------------- | ------------------------ |
| `frontend/` | Next.js 15, Tailwind, MUI    | Customer storefront      |
| `admin/`    | React (Vite), MUI            | Admin CRM                |
| `backend/`  | Express, TypeScript, MongoDB | REST API (`/api/v1`)     |
| `shared/`   | TypeScript                   | Shared types & constants |

Catalog uses a dynamic **Category → Attribute → Listing** model (cats, cows, buffaloes, goats, poultry, … share one listing collection). Payments are **manual UPI / QR / bank / COD / mobile** with admin verification — **no Stripe**.

## Status

Architecture, API, storefront, admin CRM, Docker, CI, and deploy docs are in place for the livestock upgrade.

## Documentation

| Doc                                                        | Description                  |
| ---------------------------------------------------------- | ---------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)               | System design & decisions    |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)       | Full tree                    |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)               | Packages & services          |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)         | MongoDB collections          |
| [docs/API_DESIGN.md](docs/API_DESIGN.md)                   | REST API contract            |
| [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md)                     | JWT, cookies, RBAC           |
| [docs/SECURITY.md](docs/SECURITY.md)                       | OWASP security strategy      |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Phased build + upgrade notes |
| [docs/RUNBOOK.md](docs/RUNBOOK.md)                         | Local ops commands           |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                   | Vercel + Railway/Render      |

## Prerequisites

- Node.js ≥ 20 (see `.nvmrc`)
- MongoDB (Docker Compose or Atlas)
- Optional: Cloudinary, SMTP (mocks work without them)

## Getting started

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env

# Mongo + API via Docker (optional)
npm run docker:up

# Or run apps locally
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

| App        | URL                                 |
| ---------- | ----------------------------------- |
| Storefront | http://localhost:3005               |
| Admin      | http://localhost:5173               |
| API health | http://localhost:5000/api/v1/health |

Default super admin (seeded; override in `backend/.env`): see `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` (example `superadmin@livestockmarketplace.local` / `SuperAdmin!23456`).

More detail: [docs/RUNBOOK.md](docs/RUNBOOK.md)

## Architecture (summary)

```text
Frontend (Vercel) ──┐
                    ├──► Express API ──► MongoDB Atlas
Admin CRM (Vercel) ─┘         │
                              ├── Cloudinary
                              └── Settings (UPI / QR / bank)
```

Layered backend: **Controller → Service → Repository → Database**.

## License

Private / UNLICENSED.
