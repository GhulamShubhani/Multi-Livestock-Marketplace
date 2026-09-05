# Admin CRM — Multi-Livestock Marketplace

Vite + React back-office for Multi-Livestock Marketplace.

## Stack

- Vite + React + TypeScript
- MUI + Emotion
- React Router
- TanStack Query + Axios
- Zustand auth + UI
- notistack

## Run

```bash
cp admin/.env.example admin/.env
npm install
npm run dev:backend
npm run dev:admin
```

App: http://localhost:5173

Default super admin: values from backend seed / `SUPER_ADMIN_*` (example `superadmin@livestockmarketplace.local` / `SuperAdmin!23456`).

## Modules

Dashboard, Reports, **Listings**, Categories, **Attributes**, Breeds, Orders, **Payments** (verify UPI proofs), Coupons, Reviews, **Enquiries**, CMS, Banners, **Homepage**, Notifications, Users, Roles (info), Activity logs, Settings (incl. payment receiver details).

Sidebar items are filtered by the signed-in user's permissions (`listings:*`, `attributes:*`, `payments:verify`, `homepage:*`, …).
