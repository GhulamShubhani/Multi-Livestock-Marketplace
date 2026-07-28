# Implementation Plan

Work proceeds **one module/phase at a time**. After each phase, wait for your confirmation.

---

## Phase 0 — Architecture & scaffold

- [x] Architecture documentation
- [x] Folder structure created
- [x] Root `package.json`, `.gitignore`, `README.md`
- [x] Design approved

---

## Phase 1 — Backend foundation

- [x] Complete (verified)

---

## Phase 2 — Auth + RBAC

- [x] Complete (verified)

---

## Phase 3 — Users & profile

- [x] Complete (verified)

---

## Phase 4 — Catalog & uploads

- [x] Complete (verified)

---

## Phase 5 — Commerce

- [x] Complete (verified)

---

## Phase 6 — Ops modules (CURRENT)

- [x] Notifications, CMS, Banners, Settings
- [x] Activity logs list API
- [x] Dashboard/analytics endpoints

**Exit criteria:** ✅ Ops APIs live; dashboard cards/sales/inventory; RBAC on admin routes.

---

## Phase 7 — Frontend foundation

- [x] Next.js 15 scaffold + Tailwind v4 + MUI + App Router
- [x] Axios API client + React Query + Zustand (cart/wishlist/ui)
- [x] Theme (forest + amber), dark mode, layout shell, SEO defaults
- [x] Landing hero + placeholder About / Contact / Cats routes

**Exit criteria:** ✅ Storefront foundation builds; providers and brand shell ready for feature wiring.

---

## Phase 8 — Frontend features (sub-steps)

- [x] Landing polish (featured cats) + About / Contact
- [x] Catalog list + filters + cat detail + reviews
- [x] Auth (login / register / forgot / reset / verify) + session bootstrap
- [x] Wishlist (local + API sync) + cart
- [x] Checkout (order + mock payment) + profile / orders

**Exit criteria:** ✅ Customer storefront flows wired to `/api/v1`.

Awaiting confirmation to start **Phase 9 — Admin foundation**.

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
