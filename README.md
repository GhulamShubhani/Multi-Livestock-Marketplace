# Cat Marketplace

Production-ready **Cat Marketplace** monorepo with three independent applications:

| App | Stack | Role |
|-----|-------|------|
| `frontend/` | Next.js 15, Tailwind, MUI | Customer storefront |
| `admin/` | React (Vite), MUI | Admin CRM |
| `backend/` | Express, TypeScript, MongoDB | REST API |
| `shared/` | TypeScript | Shared types & constants |

## Status

**Phase 0 — Architecture & scaffold.** Design docs and folder structure are ready. Implementation starts after approval.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & decisions |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Full tree |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | Packages & services |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | MongoDB collections |
| [docs/API_DESIGN.md](docs/API_DESIGN.md) | REST API contract |
| [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md) | JWT, cookies, RBAC |
| [docs/SECURITY.md](docs/SECURITY.md) | OWASP security strategy |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Phased build plan |

## Prerequisites

- Node.js ≥ 20
- MongoDB Atlas (or local MongoDB)
- Cloudinary, Stripe, SMTP accounts (later phases)

## Getting started

Implementation is phased. After Phase 0 approval:

```bash
# Phase 1 will initialize backend dependencies and start the API
npm install
npm run dev:backend
```

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
