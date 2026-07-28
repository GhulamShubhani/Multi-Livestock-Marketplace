# Frontend (Customer Website)

Next.js 15 App Router storefront for Cat Marketplace.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Material UI
- TanStack Query + Axios
- Zustand (cart / wishlist / UI)
- Framer Motion
- next-themes (dark mode)

## Run

```bash
# from monorepo root
cp frontend/.env.example frontend/.env.local
npm install
npm run dev:frontend
```

App: http://localhost:3000  
API: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`)

## Structure

```text
src/
  app/                 # routes + SEO metadata
  components/          # layout, home, providers
  lib/                 # api client, query, utils
  stores/              # zustand
  theme/               # MUI light/dark themes
  types/
```

Phase 7 = foundation. Feature pages (auth, catalog, checkout) land in Phase 8.
