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
# from monorepo root
cp admin/.env.example admin/.env
npm install
npm run dev:backend
npm run dev:admin
```

App: http://localhost:5173  
Default super admin: `superadmin@catmarketplace.local` / `SuperAdmin!23456`

## Phase 9

Foundation only: login, auth/guest guards, permission-filtered sidebar, dashboard shell, module placeholders.

Phase 10 adds full CRM modules.
