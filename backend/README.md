# Backend — Multi-Livestock Marketplace API

Express + TypeScript + MongoDB REST API. Base path: `/api/v1`.

Workspace package: `@cat-marketplace/backend`.

## Run

```bash
cp .env.example .env
npm install
npm run dev --workspace=@cat-marketplace/backend
```

Health: `GET http://localhost:5000/api/v1/health`

Key env (see `.env.example`):

- `MONGODB_URI` → database `livestock_marketplace`
- `DEFAULT_CURRENCY=INR`
- `CLOUDINARY_FOLDER=livestock-marketplace`
- **No `STRIPE_*`** — payment receiver config lives in Settings (`payment`)

## Auth

Base: `/api/v1/auth`

| Endpoint                                                    | Notes                            |
| ----------------------------------------------------------- | -------------------------------- |
| `POST /register`                                            | Buyer signup + cookies           |
| `POST /login`                                               | Sets access/refresh/csrf cookies |
| `POST /refresh`                                             | Refresh rotation                 |
| `GET /me`                                                   | Current user + permissions       |
| `POST /logout` / `/logout-all`                              | Requires `X-CSRF-Token`          |
| `POST /verify-email`, `/forgot-password`, `/reset-password` | Email flows                      |
| `POST /otp/send` / `/otp/verify`                            | Email OTP                        |

Seed (`SEED_ON_BOOT=true` or CLI):

```bash
npm run seed --workspace=@cat-marketplace/backend
```

Creates roles (incl. `seller`, `buyer`), permissions, super admin, default categories/attributes/breeds, homepage sections, settings.

## Users & Profile

| Area        | Endpoints                                                           |
| ----------- | ------------------------------------------------------------------- |
| Admin users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, status + sessions |
| Profile     | `GET/PATCH /profile`, password, addresses, own sessions             |

Mutating routes require `X-CSRF-Token`. Admin routes require `users:*`.

## Catalog (dynamic)

| Resource   | Public                                      | Admin                               |
| ---------- | ------------------------------------------- | ----------------------------------- |
| Categories | `GET /categories`, slug                     | CRUD + `categories:*`               |
| Breeds     | `GET /breeds`, slug                         | CRUD + `breeds:*`                   |
| Attributes | list by category                            | CRUD + `attributes:*`               |
| Listings   | `GET /listings`, `GET /listings/slug/:slug` | CRUD, status, verify (`listings:*`) |
| Uploads    | —                                           | `POST /uploads/image(s)`, delete    |

Listing filters: `q`, category, breed, gender, featured, price, location, sort. Prices are integer **paise** (INR default).

There is no active `/cats` mount — use listings + category.

## Sellers & Enquiries

| Area         | Notes                                     |
| ------------ | ----------------------------------------- |
| `/sellers`   | Seller profiles; admin `sellers:read      | update` |
| `/enquiries` | Buyer interest / contact; `enquiries:read | update` |

## Homepage

| Area        | Notes                                      |
| ----------- | ------------------------------------------ |
| `/homepage` | Public active sections; admin `homepage:*` |

Types: hero, categories, carousel, promo, info, banner, cta.

## Commerce

| Area     | Endpoints                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------- |
| Wishlist | `GET/POST/DELETE /wishlist/:listingId`                                                            |
| Coupons  | `POST /coupons/validate`, admin CRUD                                                              |
| Orders   | `POST /orders`, `GET /orders/me`, admin status/cancel                                             |
| Payments | `GET /methods`, `POST /submit`, `GET /me`, admin list / `PATCH /:id/verify` / `PATCH /:id/refund` |
| Reviews  | `GET /reviews?listingId=`, create, moderate                                                       |

Checkout requires verified email. Payment providers: `upi`, `bank_transfer`, `cod`, `mobile`. Admin verifies proof — **no Stripe webhooks**.

## Ops

| Area          | Endpoints                              |
| ------------- | -------------------------------------- |
| Notifications | list, mark read, admin create          |
| Settings      | public keys incl. `payment`; admin put |
| CMS / Banners | public read + admin CRUD               |
| Activity logs | `GET /activity-logs`                   |
| Dashboard     | overview, sales, inventory             |

## Local MongoDB (Docker)

```bash
# Preferred: compose from monorepo root
npm run docker:up

# Or standalone
docker run -d --name livestock-mongo -p 27017:27017 mongo:7
```

Connection string example: `mongodb://127.0.0.1:27017/livestock_marketplace`
