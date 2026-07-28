# Cat Marketplace

Production-ready **Cat Marketplace** monorepo with three independent applications:

| App | Stack | Role |
|-----|-------|------|
| `frontend/` | Next.js 15, Tailwind, MUI | Customer storefront |
| `admin/` | React (Vite), MUI | Admin CRM |
| `backend/` | Express, TypeScript, MongoDB | REST API |
| `shared/` | TypeScript | Shared types & constants |

## Status

**Phases 0–9 complete.** Backend, customer storefront, and admin CRM foundation are in place. Next: **Phase 10 — Admin modules**.

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
- MongoDB (local Docker `cat-mongo` or Atlas)
- Optional: Cloudinary, Stripe, SMTP (mocks work without them)

## Getting started

```bash
npm install

# API (port 5000)
npm run dev:backend

# Storefront (port 3000)
npm run dev:frontend
```

Default super admin (seeded): `superadmin@catmarketplace.local` / `SuperAdmin!23456`

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
