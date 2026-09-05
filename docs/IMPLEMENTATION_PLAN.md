# Implementation Plan

Phases 0–11 delivered the original Cat Marketplace foundation. This plan records that history and the **Multi-Livestock Marketplace** upgrade that replaced species-specific catalogs and Stripe with a dynamic listing model and manual payments.

Work historically proceeded one module/phase at a time.

---

## Phase 0 — Architecture & scaffold

- [x] Architecture documentation
- [x] Folder structure / root tooling
- [x] Design approved

---

## Phase 1 — Backend foundation

- [x] Config, DB, errors, logger, response helpers, security middlewares

---

## Phase 2 — Auth + RBAC

- [x] JWT cookies, CSRF, OTP, refresh rotation, roles/permissions

---

## Phase 3 — Users & profile

- [x] Admin users, profile, addresses, sessions

---

## Phase 4 — Catalog & uploads

- [x] Originally: categories, breeds, cats, Cloudinary uploads
- [x] **Upgraded:** categories, breeds, **attributes**, **listings** (dynamic), uploads

---

## Phase 5 — Commerce

- [x] Wishlist, coupons, orders, reviews
- [x] **Upgraded:** payments = UPI/QR/bank/COD/mobile proof + admin verify (**Stripe removed**)

---

## Phase 6 — Ops modules

- [x] Notifications, CMS, banners, settings, activity logs, dashboard
- [x] **Upgraded:** homepage CMS sections; `payment` settings key; sellers & enquiries modules

---

## Phase 7 — Frontend foundation

- [x] Next.js 15 + Tailwind + MUI + App Router + API client + stores

---

## Phase 8 — Frontend features

- [x] Multi-livestock homepage, category browse (`/animals`, shortcuts), listing detail
- [x] Auth, wishlist, cart, checkout with **payment proof submit**
- [x] Profile / orders, search, sell CTA

---

## Phase 9 — Admin foundation

- [x] Vite React + MUI shell, auth guards, permission-filtered nav

---

## Phase 10 — Admin modules

- [x] Dashboard, reports, users
- [x] Catalog: **listings**, categories, **attributes**, breeds
- [x] Commerce: orders, **payment verification**, coupons, reviews
- [x] Content: CMS, banners, **homepage**, notifications
- [x] Enquiries; system: settings, activity logs, roles info

---

## Phase 11 — Tooling & deploy

- [x] Docker compose + Dockerfiles
- [x] Husky + lint-staged + Prettier
- [x] CI + deploy docs (Vercel + Railway/Render)

---

## Multi-Livestock upgrade checklist

- [x] Remove Stripe from product architecture (env, payments API, docs)
- [x] Replace cat-only schema with Category → Attribute → Listing
- [x] Add sellers, enquiries, homepage sections
- [x] Permissions for listings/attributes/enquiries/sellers/homepage/payments:verify
- [x] Roles: seller, buyer (+ legacy customer)
- [x] Default currency INR; Cloudinary folder `livestock-marketplace`
- [x] Documentation rewrite (this docs set)

---

## Status

**Platform is production-capable** for Multi-Livestock Marketplace ops. Further work is iterative feature enhancement, not greenfield phases.

See [RUNBOOK.md](./RUNBOOK.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for day-to-day and release operations.
