# Implementation Plan

Work proceeds **one module/phase at a time**. After each phase, wait for your confirmation.

---

## Phase 0 — Architecture & scaffold (CURRENT)

- [x] Architecture documentation
- [x] Folder structure created
- [ ] Root `package.json`, `.gitignore`, `README.md`
- [ ] Awaiting your approval of the design

---

## Phase 1 — Backend foundation

Create:

- `backend` package init + TypeScript strict
- Env config validation
- MongoDB connection
- Logger (Winston)
- `ApiResponse`, `AppError`, `asyncHandler`
- Global middlewares (Helmet, CORS, rate limit, sanitize, compression)
- Error + 404 handlers
- Health route `GET /api/v1/health`
- `.env.example`

**Exit criteria:** Server boots, connects to Mongo, health returns 200, security headers present.

---

## Phase 2 — Auth + RBAC

- User / Role / Permission / RefreshToken models
- Auth service (register, login, refresh, logout, verify, forgot/reset, OTP)
- JWT + cookie helpers
- `authenticate` + `authorize` middlewares
- Seed roles/permissions + super admin
- Auth activity logging

**Exit criteria:** Full auth flow works via HTTP cookies; RBAC blocks unauthorized routes.

---

## Phase 3 — Users & profile

- Admin user management APIs
- Customer profile + addresses + password change
- Session list/revoke

---

## Phase 4 — Catalog & uploads

- Category, Breed, Cat modules
- Cloudinary upload module
- Public list/detail with filters + indexes

---

## Phase 5 — Commerce

- Wishlist, Coupons, Orders
- Stripe checkout / payment intent / webhook / refunds
- Reviews

---

## Phase 6 — Ops modules

- Notifications, CMS, Banners, Settings
- Activity logs, Dashboard/analytics endpoints

---

## Phase 7 — Frontend foundation

- Next.js 15 scaffold + Tailwind + MUI + providers
- Axios + React Query + Zustand theme/cart
- Layout, dark mode, SEO defaults

---

## Phase 8 — Frontend features (sub-steps)

Landing → About/Contact → Catalog → Auth → Wishlist/Cart → Checkout → Profile/Orders

---

## Phase 9 — Admin foundation

- Vite React + MUI dashboard shell
- Auth guard, sidebar by permissions, theme

---

## Phase 10 — Admin modules (sub-steps)

Dashboard → Users → Cats → … → Reports/Settings

---

## Phase 11 — Tooling & deploy

- Docker compose
- Husky + lint-staged
- Deploy docs (Vercel + Railway/Render)
- README runbooks

---

## How to confirm

Reply with one of:

- `Approve Phase 0` — finalize root files if needed, then start **Phase 1**
- `Revise: …` — request design changes
- `Skip to Phase N` — only if you explicitly want to jump ahead
