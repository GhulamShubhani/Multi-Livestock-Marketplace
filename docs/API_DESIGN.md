# API Design

**Base URL:** `https://api.example.com/api/v1`  
**Local:** `http://localhost:5000/api/v1`

**Standard envelope**

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "errors": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

`meta` is present on paginated list endpoints only.

**Auth:** HttpOnly cookies (`access_token`, `refresh_token`) + CSRF cookie/header (`csrf_token` / `X-CSRF-Token`) for state-changing browser requests. Admin SPA and Frontend both use `credentials: 'include'`.

---

## Auth — `/auth`

| Method | Path                        | Access      | Description                      |
| ------ | --------------------------- | ----------- | -------------------------------- |
| POST   | `/auth/register`            | Public      | Buyer/customer registration      |
| POST   | `/auth/login`               | Public      | Login (rate limited)             |
| POST   | `/auth/logout`              | Auth + CSRF | Revoke current refresh           |
| POST   | `/auth/logout-all`          | Auth + CSRF | Revoke all sessions              |
| POST   | `/auth/refresh`             | Cookie      | Rotate refresh, issue new access |
| POST   | `/auth/verify-email`        | Public      | Email token verify               |
| POST   | `/auth/resend-verification` | Public      | Resend email                     |
| POST   | `/auth/forgot-password`     | Public      | Send reset (always 200)          |
| POST   | `/auth/reset-password`      | Public      | Reset with token                 |
| POST   | `/auth/otp/send`            | Public/Auth | Send OTP                         |
| POST   | `/auth/otp/verify`          | Public/Auth | Verify OTP                       |
| GET    | `/auth/me`                  | Auth        | Current user + permissions       |

---

## Users — `/users` (Admin CRM)

| Method | Path                  | Permission     |
| ------ | --------------------- | -------------- |
| GET    | `/users`              | `users:read`   |
| GET    | `/users/:id`          | `users:read`   |
| POST   | `/users`              | `users:create` |
| PATCH  | `/users/:id`          | `users:update` |
| PATCH  | `/users/:id/status`   | `users:update` |
| DELETE | `/users/:id`          | `users:delete` |
| GET    | `/users/:id/sessions` | `users:read`   |
| DELETE | `/users/:id/sessions` | `users:update` |

## Profile — `/profile`

| Method                | Path                 | Access      |
| --------------------- | -------------------- | ----------- |
| GET                   | `/profile`           | Auth        |
| PATCH                 | `/profile`           | Auth + CSRF |
| PATCH                 | `/profile/password`  | Auth + CSRF |
| GET/POST/PATCH/DELETE | `/profile/addresses` | Auth        |
| GET/DELETE            | `/profile/sessions`  | Auth        |

---

## Roles & Permissions

Seeded roles include `super_admin`, `admin`, `manager`, `staff`, `seller`, `buyer`, and legacy `customer`. Permission keys follow `module:action` (see [AUTH_FLOW.md](./AUTH_FLOW.md)).

---

## Catalog

### Categories `/categories`

| Method     | Path                               | Access         |
| ---------- | ---------------------------------- | -------------- |
| GET        | `/categories`                      | Public         |
| GET        | `/categories/slug/:slug`           | Public         |
| Admin CRUD | `/categories`, `/categories/admin` | `categories:*` |

### Breeds `/breeds`

Same pattern (`breeds:*`). Breeds may reference multiple `categoryIds`.

### Attributes `/attributes`

| Method                | Path                               | Access             |
| --------------------- | ---------------------------------- | ------------------ |
| GET                   | `/attributes/category/:categoryId` | Public             |
| GET                   | `/attributes/admin`                | `attributes:read`  |
| GET                   | `/attributes/admin/:id`            | `attributes:read`  |
| POST / PATCH / DELETE | `/attributes`, `/attributes/:id`   | `attributes:create | update | delete` |

Attribute types: text, number, decimal, boolean, date, select, multiselect, radio, textarea, yes_no, image.

### Listings `/listings`

| Method | Path                   | Access                                                                                 |
| ------ | ---------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/listings`            | Public (filters: q, category, breed, price, gender, featured, location, page, sort, …) |
| GET    | `/listings/slug/:slug` | Public                                                                                 |
| GET    | `/listings/admin`      | `listings:read`                                                                        |
| GET    | `/listings/admin/:id`  | `listings:read`                                                                        |
| POST   | `/listings`            | `listings:create`                                                                      |
| PATCH  | `/listings/:id`        | `listings:update`                                                                      |
| PATCH  | `/listings/:id/status` | `listings:update`                                                                      |
| PATCH  | `/listings/:id/verify` | `listings:verify`                                                                      |
| DELETE | `/listings/:id`        | `listings:delete`                                                                      |

There is **no** `/cats` API in the active router. Species is a category on a listing.

---

## Sellers `/sellers`

| Method                | Path                       | Access                    |
| --------------------- | -------------------------- | ------------------------- |
| GET                   | `/sellers`                 | Public list               |
| GET / PUT             | `/sellers/me`              | Auth — own profile upsert |
| GET                   | `/sellers/admin`           | `sellers:read`            |
| GET                   | `/sellers/admin/:id`       | `sellers:read`            |
| POST / PATCH / DELETE | `/sellers`, `/sellers/:id` | `sellers:update`          |

---

## Enquiries `/enquiries`

| Method | Path                    | Access                   |
| ------ | ----------------------- | ------------------------ |
| POST   | `/enquiries`            | Public or optional Auth  |
| GET    | `/enquiries/me`         | Auth — buyer’s enquiries |
| GET    | `/enquiries/seller`     | Auth — seller inbox      |
| GET    | `/enquiries`            | `enquiries:read` — admin |
| PATCH  | `/enquiries/:id/status` | `enquiries:update`       |

Contact methods: `call`, `whatsapp`, `enquiry`, `view_mobile`.

---

## Homepage `/homepage`

| Method | Path                  | Access                 |
| ------ | --------------------- | ---------------------- |
| GET    | `/homepage`           | Public active sections |
| GET    | `/homepage/admin`     | `homepage:read`        |
| GET    | `/homepage/admin/:id` | `homepage:read`        |
| POST   | `/homepage`           | `homepage:create`      |
| PATCH  | `/homepage/reorder`   | `homepage:update`      |
| PATCH  | `/homepage/:id`       | `homepage:update`      |
| DELETE | `/homepage/:id`       | `homepage:delete`      |

Section types: `hero`, `categories`, `carousel`, `promo`, `info`, `banner`, `cta`.

---

## Wishlist `/wishlist`

| Method        | Path                   | Access |
| ------------- | ---------------------- | ------ |
| GET           | `/wishlist`            | Auth   |
| POST / DELETE | `/wishlist/:listingId` | Auth   |

---

## Coupons `/coupons`

| Method | Path                | Access          |
| ------ | ------------------- | --------------- |
| POST   | `/coupons/validate` | Auth (checkout) |
| CRUD   | `/coupons`          | `coupons:*`     |

---

## Orders `/orders`

| Method | Path                 | Access                             |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/orders`            | Auth (verified email for checkout) |
| GET    | `/orders/me`         | Auth                               |
| GET    | `/orders/me/:id`     | Auth                               |
| GET    | `/orders`            | `orders:read`                      |
| GET    | `/orders/:id`        | `orders:read`                      |
| PATCH  | `/orders/:id/status` | `orders:update`                    |
| POST   | `/orders/:id/cancel` | Owner or `orders:update`           |

---

## Payments `/payments` (manual — no Stripe)

| Method | Path                   | Access                                          |
| ------ | ---------------------- | ----------------------------------------------- |
| GET    | `/payments/methods`    | Public — UPI/QR/bank/instructions from settings |
| POST   | `/payments/submit`     | Auth + verified email + CSRF — submit proof     |
| GET    | `/payments/me`         | Auth — own payments                             |
| GET    | `/payments`            | `payments:read` — admin list                    |
| PATCH  | `/payments/:id/verify` | `payments:verify` — approve/reject              |
| PATCH  | `/payments/:id/refund` | `payments:refund`                               |

Providers: `upi`, `bank_transfer`, `cod`, `mobile`.

Submit body typically includes `orderId`, optional `provider`, `transactionId` / `utr`, `paymentDate`, `screenshot`.

**Removed (legacy):** Stripe checkout sessions, payment intents, and webhook endpoints.

---

## Reviews `/reviews`

| Method | Path                  | Access                    |
| ------ | --------------------- | ------------------------- |
| GET    | `/reviews?listingId=` | Public (approved)         |
| POST   | `/reviews`            | Auth                      |
| PATCH  | `/reviews/:id/status` | `reviews:moderate`        |
| DELETE | `/reviews/:id`        | Owner or `reviews:delete` |

---

## Upload `/uploads`

| Method | Path              | Access                  |
| ------ | ----------------- | ----------------------- |
| POST   | `/uploads/image`  | Auth + `uploads:create` |
| POST   | `/uploads/images` | Multiple                |
| DELETE | `/uploads`        | `uploads:delete`        |

MIME allowlist, max size (`UPLOAD_MAX_FILE_SIZE_MB`), folder `CLOUDINARY_FOLDER` (default `livestock-marketplace`). Mock URLs when Cloudinary unset in development.

---

## Notifications `/notifications`

| Method | Path                      | Access                 |
| ------ | ------------------------- | ---------------------- |
| GET    | `/notifications`          | Auth (own)             |
| PATCH  | `/notifications/:id/read` | Auth                   |
| PATCH  | `/notifications/read-all` | Auth                   |
| POST   | `/notifications`          | `notifications:create` |

---

## CMS / Banners / Settings

| Resource         | Public read                                                     | Admin CRUD   |
| ---------------- | --------------------------------------------------------------- | ------------ |
| `/cms/:slug`     | published                                                       | `cms:*`      |
| `/banners`       | active                                                          | `banners:*`  |
| `/settings/:key` | limited public keys (`general`, `seo`, `storefront`, `payment`) | `settings:*` |

---

## Dashboard & Activity

| Method | Path                   | Permission           |
| ------ | ---------------------- | -------------------- |
| GET    | `/dashboard/overview`  | `dashboard:read`     |
| GET    | `/dashboard/sales`     | `reports:read`       |
| GET    | `/dashboard/inventory` | `reports:read`       |
| GET    | `/activity-logs`       | `activity_logs:read` |

---

## Health

| Method | Path      | Access |
| ------ | --------- | ------ |
| GET    | `/health` | Public |

---

## Query conventions

- Pagination: `page`, `limit` (max 100)
- Sort: `sort=createdAt:desc` or `-createdAt`
- Search: `q`
- Filters: typed query params validated by express-validator
- IDs: Mongo ObjectId validation on `:id` params

## Status codes

| Code | Use                          |
| ---- | ---------------------------- |
| 200  | Success                      |
| 201  | Created                      |
| 400  | Validation                   |
| 401  | Unauthenticated              |
| 403  | Forbidden                    |
| 404  | Not found                    |
| 409  | Conflict                     |
| 423  | Locked (account)             |
| 429  | Rate limited                 |
| 500  | Unexpected (generic message) |
