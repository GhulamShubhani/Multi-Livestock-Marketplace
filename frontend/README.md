# Frontend — Multi-Livestock Marketplace Storefront

Next.js 15 App Router storefront for the Multi-Livestock Marketplace.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Material UI
- TanStack Query + Axios
- Zustand (cart / wishlist / UI)
- Framer Motion
- next-themes

## Run

```bash
# from monorepo root
cp frontend/.env.example frontend/.env.local
npm install
npm run dev:backend
npm run dev:frontend
```

App: http://localhost:3005  
API: mode switch via `NEXT_PUBLIC_API_MODE` / `NEXT_PUBLIC_API_*` (see `.env.example`)

## Routes

| Path                                                                       | Notes                                   |
| -------------------------------------------------------------------------- | --------------------------------------- |
| `/`                                                                        | Homepage (CMS sections + category grid) |
| `/animals`, `/animals/[category]`, `/animals/[category]/[slug]`            | Catalog + detail                        |
| `/cats`, `/cows`, `/buffaloes`, `/bulls`, `/goats`, `/khassi`, `/chickens` | Category shortcuts                      |
| `/livestock`                                                               | Livestock browse                        |
| `/search`, `/sell`                                                         | Search + sell CTA                       |
| `/auth/*`                                                                  | Login, register, forgot/reset, verify   |
| `/cart`, `/wishlist`, `/checkout`                                          | Commerce (UPI payment proof)            |
| `/profile`, `/orders/[id]`                                                 | Account                                 |
| `/about`, `/contact`                                                       | Static / contact                        |

Checkout creates an order, loads `GET /payments/methods`, then submits proof via `POST /payments/submit`. No Stripe client SDK.
