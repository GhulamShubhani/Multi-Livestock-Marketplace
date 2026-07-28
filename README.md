# Cat Marketplace

Production-ready **Cat Marketplace** monorepo with three independent applications:

| App         | Stack                        | Role                     |
| ----------- | ---------------------------- | ------------------------ |
| `frontend/` | Next.js 15, Tailwind, MUI    | Customer storefront      |
| `admin/`    | React (Vite), MUI            | Admin CRM                |
| `backend/`  | Express, TypeScript, MongoDB | REST API                 |
| `shared/`   | TypeScript                   | Shared types & constants |

## Status

**Phases 0–11 complete.** Architecture, API, storefront, admin CRM, Docker, CI, and deploy docs are in place.

## Documentation

| Doc                                                        | Description               |
| ---------------------------------------------------------- | ------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)               | System design & decisions |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)       | Full tree                 |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)               | Packages & services       |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)         | MongoDB collections       |
| [docs/API_DESIGN.md](docs/API_DESIGN.md)                   | REST API contract         |
| [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md)                     | JWT, cookies, RBAC        |
| [docs/SECURITY.md](docs/SECURITY.md)                       | OWASP security strategy   |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Phased build plan         |
| [docs/RUNBOOK.md](docs/RUNBOOK.md)                         | Local ops commands        |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                   | Vercel + Railway/Render   |

## Prerequisites

- Node.js ≥ 20 (see `.nvmrc`)
- MongoDB (Docker Compose or Atlas)
- Optional: Cloudinary, Stripe, SMTP (mocks work without them)

## Getting started

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env

# Mongo + API via Docker (optional)
npm run docker:up

# Or run apps locally against local Mongo
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

| App        | URL                                 |
| ---------- | ----------------------------------- |
| Storefront | http://localhost:3000               |
| Admin      | http://localhost:5173               |
| API health | http://localhost:5000/api/v1/health |

Default super admin (seeded): `superadmin@catmarketplace.local` / `SuperAdmin!23456`

More detail: [docs/RUNBOOK.md](docs/RUNBOOK.md)

## Architecture (summary)

```text
Frontend (Vercel) ──┐
                    ├──► Express API ──► MongoDB Atlas
Admin CRM (Vercel) ─┘         │
                              ├── Cloudinary
                              └── Stripe
```

Layered backend: **Controller → Service → Repository → Database**.

## License

Private / UNLICENSED.
