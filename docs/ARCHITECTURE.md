# Cat Marketplace — System Architecture

## 1. Executive Summary

A production-ready **Cat Marketplace** monorepo with three independent applications:

| App | Purpose | Stack | Deploy |
|-----|---------|-------|--------|
| `frontend/` | Customer storefront | Next.js 15 (App Router), TS, Tailwind, MUI, TanStack Query, Zustand | Vercel |
| `admin/` | Internal CRM / back-office | React (Vite), TS, MUI, React Router, TanStack Query | Vercel |
| `backend/` | REST API | Node.js, Express, TS, MongoDB/Mongoose | Railway / Render |

Optional `shared/` holds cross-app TypeScript types and constants only — **no runtime business logic**.

---

## 2. High-Level Architecture

```text
┌─────────────────┐     ┌─────────────────┐
│  Customer Web   │     │   Admin CRM     │
│  (Next.js 15)   │     │  (React + MUI)  │
│  Vercel         │     │  Vercel         │
└────────┬────────┘     └────────┬────────┘
         │  HTTPS / JSON REST    │
         │  HttpOnly cookies     │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Express API (TS)    │
         │   Railway / Render    │
         │   Layered modules     │
         └───────────┬───────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌────────────┐
│ MongoDB │   │ Cloudinary│   │   Stripe   │
│ Atlas   │   │  Images   │   │  Payments  │
└─────────┘   └───────────┘   └────────────┘
```

### Design principles

1. **Independent apps** — separate `package.json`, build, deploy, env. No shared runtime coupling.
2. **API-first** — Admin and Frontend are thin clients; all business rules live in the backend.
3. **Layered modular backend** — Controller → Service → Repository → Database.
4. **Security by default** — authz on every route, validation on every input, never trust the client.
5. **Monorepo for DX** — npm/pnpm workspaces for scripts and shared types; apps remain deployable alone.

---

## 3. Backend Layered Architecture

```text
HTTP Request
    │
    ▼
[ Global Middlewares ]  Helmet, CORS, rate-limit, compression, body parser,
                        cookie-parser, request-id, morgan/winston logger
    │
    ▼
[ Route ]  →  [ Validator ]  →  [ AuthN ]  →  [ AuthZ / RBAC ]
    │
    ▼
[ Controller ]   Thin: parse req, call service, format ApiResponse
    │
    ▼
[ Service ]      Business rules, orchestration, transactions
    │
    ▼
[ Repository ]   Mongoose queries only — no business logic
    │
    ▼
[ MongoDB ]
```

### Why this pattern?

- Controllers stay thin and testable.
- Services are the single place for domain rules (pricing, stock, refunds).
- Repositories isolate persistence — easier to index, mock, and swap query strategies.
- Module folders keep features cohesive (auth, cat, order, …) without a god-layer.

### Cross-cutting

| Concern | Location |
|---------|----------|
| Auth JWT / cookies | `modules/auth` + global `middlewares` |
| RBAC | `modules/role`, `modules/permission` + `authorize` middleware |
| Errors | `utils/AppError` + global exception handler |
| Logging / audit | Winston + `modules/activity-log` |
| Uploads | `modules/upload` → Cloudinary |
| Payments | `modules/payment` → Stripe + webhooks |

---

## 4. Frontend Architecture (Customer)

```text
frontend/
├── app/                    # App Router (pages + layouts + metadata)
├── components/             # UI only (presentational + composed)
├── features/               # Domain slices (cats, cart, auth, checkout)
├── hooks/                  # Reusable React hooks
├── lib/                    # axios client, query client, stripe
├── stores/                 # Zustand (cart, UI theme, wishlist draft)
├── schemas/                # Zod forms
├── types/
└── styles/
```

**Data flow**

- Server Components for SEO landing/catalog where possible.
- Client components for cart, wishlist, checkout, auth forms.
- TanStack Query for server state; Zustand for ephemeral UI/cart.
- Axios instance with credentials (`withCredentials: true`) for cookie auth.

---

## 5. Admin CRM Architecture

```text
admin/
├── src/
│   ├── app/                # Router + providers
│   ├── layouts/            # Dashboard shell (sidebar, navbar)
│   ├── pages/              # Route-level screens
│   ├── features/           # Feature folders (users, cats, orders…)
│   ├── components/         # Tables, filters, charts, dialogs
│   ├── hooks/
│   ├── services/           # Axios API wrappers (no business logic)
│   ├── schemas/
│   ├── theme/              # MUI theme + dark mode
│   └── types/
```

CRM is a **pure presentation + API consumer**. Permissions from JWT/`/me` drive menu visibility; the API still enforces every action.

---

## 6. Shared Package

```text
shared/
└── src/
    ├── types/         # UserRole, ApiResponse, Pagination, etc.
    ├── constants/     # Role names, order statuses, permission keys
    └── validators/    # Optional Zod schemas mirrored for FE (not Express)
```

Published as a workspace package `@cat-marketplace/shared`. Keep it **types/constants only** to avoid coupling builds.

---

## 7. Implementation Phases (proposed)

| Phase | Module | Deliverable |
|-------|--------|-------------|
| 0 | Scaffold | Structure, docs, root tooling ← **current** |
| 1 | Backend foundation | Config, DB, errors, logger, response helpers, security middlewares |
| 2 | Auth + RBAC | JWT, cookies, OTP, refresh rotation, roles/permissions |
| 3 | User + Profile | CRUD, lockout, sessions |
| 4 | Catalog | Category, Breed, Cat, Upload |
| 5 | Commerce | Cart/Order, Coupon, Payment (Stripe), Reviews |
| 6 | Ops | Notifications, CMS, Banners, Settings, Activity Logs, Dashboard |
| 7 | Frontend scaffold | Next.js app, theme, layout, API client |
| 8 | Frontend features | Landing → Catalog → Auth → Cart → Checkout |
| 9 | Admin scaffold | Vite React, MUI dashboard shell |
| 10 | Admin modules | Each CRM screen wired to APIs |
| 11 | Docker + CI | Compose, Husky, lint-staged, deploy docs |

**Rule:** Implement one phase/module at a time; wait for confirmation before the next.

---

## 8. Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | npm/pnpm workspaces | Shared types + unified scripts; independent deploys |
| Admin vs Next | Separate Vite React app | CRM doesn't need SSR/SEO; smaller admin bundle |
| Auth storage | HttpOnly Secure cookies | Mitigate XSS token theft |
| RBAC | Roles + granular permissions | Configurable Staff/Manager without code changes |
| Payments | Stripe Checkout + webhooks | PCI burden stays with Stripe; webhook is source of truth |
| Images | Cloudinary | CDN, transforms, MIME validation at upload |
| Validation | Zod (FE) + express-validator (BE) | Defense in depth; BE never trusts FE |
| ORM | Mongoose | Mature Mongo ODM with schema indexes & middleware |

---

## 9. Non-Goals (v1)

- Native mobile apps
- Real-time chat / WebSockets (can add later via Socket.io)
- Multi-tenant SaaS
- GraphQL

---

## Next

See companion docs:

- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
- [DEPENDENCIES.md](./DEPENDENCIES.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [AUTH_FLOW.md](./AUTH_FLOW.md)
- [SECURITY.md](./SECURITY.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
