# Frontend (Customer Website)

Next.js 15 App Router storefront for Cat Marketplace.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Material UI
- TanStack Query + Axios
- Zustand (cart / wishlist / auth / UI)
- Framer Motion
- next-themes (dark mode)

## Run

```bash
# from monorepo root
cp frontend/.env.example frontend/.env.local
npm install
npm run dev:backend
npm run dev:frontend
```

App: http://localhost:3000  
API: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`)

## Routes

| Path | Notes |
|------|-------|
| `/` | Hero + featured cats |
| `/cats`, `/cats/[slug]` | Catalog + detail |
| `/auth/*` | Login, register, forgot/reset, verify |
| `/cart`, `/wishlist`, `/checkout` | Commerce |
| `/profile`, `/orders/[id]` | Account |

Checkout requires a verified email. Dev mock payment is available on the checkout page.
