# Multi-Livestock Marketplace — System Architecture

## 1. Executive Summary

A production-ready **Multi-Livestock Marketplace** monorepo with three independent applications and a shared types package:

| App         | Purpose                     | Stack                                                               | Deploy                    |
| ----------- | --------------------------- | ------------------------------------------------------------------- | ------------------------- |
| `frontend/` | Customer storefront         | Next.js 15 (App Router), TS, Tailwind, MUI, TanStack Query, Zustand | Vercel                    |
| `admin/`    | Internal CRM / back-office  | React (Vite), TS, MUI, React Router, TanStack Query                 | Vercel                    |
| `backend/`  | REST API                    | Node.js, Express, TS, MongoDB/Mongoose                              | Railway / Render / Vercel |
| `shared/`   | Cross-app types & constants | TypeScript only                                                     | Consumed at build time    |

Catalog is **not** modeled as separate Cat/Cow schemas. Everything goes through a dynamic **Category → Attribute → Listing** pipeline so new animal types are data, not new collections.

Payments use **manual UPI / QR / bank / COD / mobile** proof submission with admin verification. **There is no Stripe.**

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
         │   /api/v1             │
         │   Layered modules     │
         └───────────┬───────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
   ┌─────────┐ ┌───────────┐ ┌────────────────┐
   │ MongoDB │ │ Cloudinary│ │ Settings DB    │
   │ Atlas   │ │  Media    │ │ (UPI/QR/bank)  │
   └─────────┘ └───────────┘ └────────────────┘
```

### Design principles

1. **Independent apps** — separate `package.json`, build, deploy, env. No shared runtime coupling.
2. **API-first** — Admin and Frontend are thin clients; business rules live in the backend.
3. **Layered modular backend** — Controller → Service → Repository → Database.
4. **Dynamic catalog** — Categories own attribute definitions; listings store typed attribute values.
5. **Security by default** — JWT cookies, CSRF, RBAC on every protected route, validation on every input.
6. **Manual payments** — Customer submits proof; admin verifies. Payment receiver details live in `settings` (`key: payment`), not env secrets named `STRIPE_*`.

---

## 3. Catalog domain model

```text
Category ──► Attribute[] (type, options, filterable, showOnCard)
    │
    └──► Listing (price, location, media, breed?, attributes map)
              │
              ├── Seller profile
              ├── Enquiries (buyer ↔ seller)
              └── Orders / Payments / Reviews / Wishlist
```

- **Categories** — e.g. cats, cows, buffaloes, goats, poultry (seeded + admin-managed).
- **Attributes** — dynamic fields scoped to one or more categories (`milk_yield`, `horn_status`, `vaccinated`, …).
- **Breeds** — taxonomy optionally linked to `categoryIds`.
- **Listings** — single collection for all animal types; category + attributes distinguish them.
- **Homepage** — CMS sections (`hero`, `categories`, `carousel`, `promo`, …) served from `homepageSections`.

---

## 4. Backend Layered Architecture

```text
HTTP Request
    │
    ▼
[ Global Middlewares ]  Helmet, CORS, rate-limit, compression, body parser,
                        cookie-parser, request-id, Winston logger, sanitize
    │
    ▼
[ Route ]  →  [ Validator ]  →  [ AuthN ]  →  [ AuthZ / RBAC ]  →  [ CSRF ]
    │
    ▼
[ Controller ]   Thin: parse req, call service, format ApiResponse
    │
    ▼
[ Service ]      Business rules, orchestration
    │
    ▼
[ Repository ]   Mongoose queries only
    │
    ▼
[ MongoDB ]
```

### Cross-cutting

| Concern            | Location                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| Auth JWT / cookies | `modules/auth` + middlewares                                              |
| RBAC               | `modules/role`, `modules/permission` + `authorize`                        |
| Errors             | `utils/AppError` + global exception handler                               |
| Logging / audit    | Winston + `modules/activity-log`                                          |
| Uploads            | `modules/upload` → Cloudinary (`CLOUDINARY_FOLDER=livestock-marketplace`) |
| Payments           | `modules/payment` → settings + admin verify (no Stripe)                   |
| Homepage CMS       | `modules/homepage`                                                        |

---

## 5. Frontend Architecture (Customer)

```text
frontend/
├── src/app/                 # App Router (pages, layouts, metadata)
├── src/components/          # UI (home, catalog, cart, checkout, auth, layout)
├── src/lib/                 # API clients, listing helpers, site contact
├── src/stores/              # Zustand (cart, wishlist, …)
├── src/types/
└── …
```

**Data flow**

- Server Components where useful for SEO; client components for cart, wishlist, checkout, auth.
- TanStack Query for server state; Zustand for cart/wishlist UI state.
- Axios with `withCredentials: true` for cookie auth + CSRF header on mutations.
- Checkout: create order → `GET /payments/methods` → `POST /payments/submit` (proof).

Storefront routes include `/animals/[category]/[slug]`, category shortcuts (`/cats`, `/cows`, …), `/search`, `/sell`, commerce, and account pages. Default local port: **3005**.

---

## 6. Admin CRM Architecture

```text
admin/
└── src/
    ├── App.tsx / router
    ├── layouts/              # Dashboard shell
    ├── pages/                # Listings, Attributes, Enquiries, Homepage, Payments, …
    ├── config/nav.ts         # Permission-filtered sidebar
    ├── lib/api/              # Axios wrappers
    └── …
```

CRM is presentation + API consumer. Permissions from `/auth/me` drive menu visibility; the API still enforces every action.

Key CRM surfaces: listings, categories, attributes, breeds, enquiries, sellers-related ops, homepage sections, UPI payment verification, orders, coupons, reviews, CMS, banners, settings, activity logs.

---

## 7. Shared Package

Workspace package `@cat-marketplace/shared` (legacy npm scope name; product is Multi-Livestock Marketplace).

Keep it **types/constants only** — no runtime business logic — so apps stay independently deployable.

---

## 8. Payment architecture (manual)

```text
Buyer creates Order
    → GET /payments/methods   (UPI ID, QR, bank, instructions from settings)
    → Pays offline / UPI / COD agreement
    → POST /payments/submit   (UTR, screenshot, provider)
    → Admin PATCH /payments/:id/verify  (payments:verify)
    → Order marked paid  OR  reject / refund
```

Providers: `upi` | `bank_transfer` | `cod` | `mobile`.  
Currency default: **INR** (`DEFAULT_CURRENCY`). Amounts stored as integer minor units (paise).

---

## 9. Key Architectural Decisions

| Decision      | Choice                                 | Why                                                 |
| ------------- | -------------------------------------- | --------------------------------------------------- |
| Catalog       | Single `listings` + dynamic attributes | Add animal types without schema forks               |
| Monorepo      | npm workspaces                         | Shared types + unified scripts; independent deploys |
| Admin vs Next | Separate Vite React app                | CRM doesn't need SSR/SEO                            |
| Auth storage  | HttpOnly Secure cookies                | Mitigate XSS token theft                            |
| RBAC          | Roles + granular permissions           | Staff/seller/buyer without code changes             |
| Payments      | Manual UPI proof + admin verify        | Fits local livestock commerce; no PCI/Stripe        |
| Images        | Cloudinary                             | CDN, transforms, MIME validation at upload          |
| Validation    | Zod (env/FE) + express-validator (BE)  | Defense in depth                                    |
| ORM           | Mongoose                               | Indexes, middleware, Atlas-friendly                 |

---

## 10. Non-Goals (current)

- Stripe / card gateway checkout
- Separate Mongo collections per animal species
- Native mobile apps
- Real-time chat / WebSockets
- Multi-tenant SaaS
- GraphQL

---

## Companion docs

- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
- [DEPENDENCIES.md](./DEPENDENCIES.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [AUTH_FLOW.md](./AUTH_FLOW.md)
- [SECURITY.md](./SECURITY.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [RUNBOOK.md](./RUNBOOK.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
