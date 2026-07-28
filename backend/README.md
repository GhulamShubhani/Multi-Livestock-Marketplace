# Backend

## Run

```bash
cp .env.example .env
npm install
npm run dev --workspace=@cat-marketplace/backend
```

Health: `GET http://localhost:5000/api/v1/health`

## Auth (Phase 2)

Base: `/api/v1/auth`

| Endpoint | Notes |
|----------|-------|
| `POST /register` | Customer signup + cookies |
| `POST /login` | Sets access/refresh/csrf cookies |
| `POST /refresh` | Refresh rotation |
| `GET /me` | Current user + permissions |
| `POST /logout` | Requires `X-CSRF-Token` |
| `POST /logout-all` | Requires `X-CSRF-Token` |
| `POST /verify-email` | Body: `{ token }` |
| `POST /forgot-password` | Always 200 |
| `POST /reset-password` | Body: `{ token, password }` |
| `POST /otp/send` / `/otp/verify` | Email OTP |

Seed on boot (`SEED_ON_BOOT=true`) creates roles, permissions, and super admin from env.

```bash
npm run seed --workspace=@cat-marketplace/backend
```

Default super admin (change in `.env`):

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Users & Profile (Phase 3)

| Area | Endpoints |
|------|-----------|
| Admin users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `PATCH /users/:id/status` |
| Admin sessions | `GET/DELETE /users/:id/sessions`, `DELETE /users/:id/sessions/:sessionId` |
| Profile | `GET/PATCH /profile`, `PATCH /profile/password` |
| Addresses | `GET/POST /profile/addresses`, `PATCH/DELETE /profile/addresses/:addressId` |
| Own sessions | `GET/DELETE /profile/sessions`, `DELETE /profile/sessions/:sessionId` |

Mutating routes require `X-CSRF-Token`. Admin user routes require `users:*` permissions.

## Catalog & Uploads (Phase 4)

| Resource | Public | Admin |
|----------|--------|-------|
| Categories | `GET /categories`, `GET /categories/slug/:slug` | CRUD + `/categories/admin` |
| Breeds | `GET /breeds`, `GET /breeds/slug/:slug` | CRUD + `/breeds/admin` |
| Cats | `GET /cats` (filters), `GET /cats/slug/:slug` | CRUD + status + `/cats/admin` |
| Uploads | — | `POST /uploads/image`, `POST /uploads/images`, `DELETE /uploads` |

Cat filters: `q`, `breed`, `category`, `gender`, `featured`, `minPrice`, `maxPrice`, `sort`.  
Prices are integer **cents**. Cloudinary is optional in development (mock URLs if unset).

## Commerce (Phase 5)

| Area | Endpoints |
|------|-----------|
| Wishlist | `GET/POST/DELETE /wishlist/:catId` |
| Coupons | `POST /coupons/validate`, admin CRUD `/coupons` |
| Orders | `POST /orders`, `GET /orders/me`, admin list/status/cancel |
| Payments | `POST /payments/checkout-session`, `/payment-intent`, webhook, refunds |
| Reviews | `GET /reviews?catId=`, `POST /reviews`, moderate `/reviews/:id/status` |

Checkout requires verified email. Without Stripe keys, use `POST /payments/mock-complete` in development.  
Webhook: `POST /api/v1/payments/webhook` (raw body + Stripe signature).

## Ops (Phase 6)

| Area | Endpoints |
|------|-----------|
| Notifications | `GET /notifications`, mark read, admin create/broadcast |
| Settings | `GET /settings/public/:key`, admin list/get/put |
| CMS | Public `GET /cms/:slug`, admin CRUD under `/cms` + `/cms/admin/:id` |
| Banners | Public `GET /banners`, admin CRUD |
| Activity logs | `GET /activity-logs` |
| Dashboard | `GET /dashboard/overview`, `/sales`, `/inventory` |

Public settings keys: `general`, `seo`, `storefront`.

## Local MongoDB (Docker)

```bash
docker run -d --name cat-mongo -p 27017:27017 mongo:7
```
