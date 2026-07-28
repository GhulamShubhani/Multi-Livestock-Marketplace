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

## Phase 5 — Commerce (CURRENT)

- [x] Wishlist, Coupons, Orders
- [x] Stripe checkout / payment intent / webhook / refunds (mock mode in dev)
- [x] Reviews

**Exit criteria:** ✅ Full commerce flow: wishlist → coupon → order → payment → review.

Awaiting confirmation to start **Phase 6 — Ops modules**.

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
