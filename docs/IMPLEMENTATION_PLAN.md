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

## Phase 3 — Users & profile (CURRENT)

- [x] Admin user management APIs
- [x] Customer profile + addresses + password change
- [x] Session list/revoke

**Exit criteria:** ✅ Admin can manage users; customers can manage profile/addresses/sessions; RBAC enforced.

Awaiting confirmation to start **Phase 4 — Catalog & uploads**.
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
