# Admin CRM

Vite + React back-office for Cat Marketplace.

## Stack

- Vite 6 + React 19 + TypeScript
- MUI 9 + Emotion
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
Default super admin: `superadmin@catmarketplace.local` / `SuperAdmin!23456`

## Modules

Dashboard, Reports, Cats, Categories, Breeds, Orders, Payments, Coupons, Reviews, CMS, Banners, Notifications, Users, Roles (info), Activity logs, Settings.

Sidebar items are filtered by the signed-in user's permissions.
