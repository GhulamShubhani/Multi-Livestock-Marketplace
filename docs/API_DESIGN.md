# API Design

**Base URL:** `https://api.example.com/api/v1`

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

**Auth:** HttpOnly cookies (`access_token`, `refresh_token`) + CSRF header for state-changing browser requests. Admin SPA and Frontend both use `credentials: 'include'`.

---

## Auth — `/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | Public | Customer registration |
| POST | `/auth/login` | Public | Login (rate limited) |
| POST | `/auth/logout` | Auth | Revoke current refresh |
| POST | `/auth/logout-all` | Auth | Revoke all sessions |
| POST | `/auth/refresh` | Cookie | Rotate refresh, issue new access |
| POST | `/auth/verify-email` | Public | Email token verify |
| POST | `/auth/resend-verification` | Public | Resend email |
| POST | `/auth/forgot-password` | Public | Send reset (always 200) |
| POST | `/auth/reset-password` | Public | Reset with token |
| POST | `/auth/otp/send` | Public/Auth | Send OTP |
| POST | `/auth/otp/verify` | Public/Auth | Verify OTP |
| GET | `/auth/me` | Auth | Current user + permissions |

---

## Users — `/users` (Admin CRM)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/users` | `users:read` |
| GET | `/users/:id` | `users:read` |
| POST | `/users` | `users:create` |
| PATCH | `/users/:id` | `users:update` |
| PATCH | `/users/:id/status` | `users:update` |
| DELETE | `/users/:id` | `users:delete` |
| GET | `/users/:id/sessions` | `users:read` |
| DELETE | `/users/:id/sessions` | `users:update` |

## Profile — `/profile` (Customer)

| Method | Path | Access |
|--------|------|--------|
| GET | `/profile` | Auth |
| PATCH | `/profile` | Auth |
| PATCH | `/profile/password` | Auth |
| GET/POST/PATCH/DELETE | `/profile/addresses` | Auth |

---

## Roles & Permissions

| Method | Path | Permission |
|--------|------|------------|
| GET/POST/PATCH/DELETE | `/roles` | `roles:*` |
| GET | `/permissions` | `permissions:read` |
| PUT | `/roles/:id/permissions` | `roles:update` |

---

## Catalog

### Categories `/categories`

| Method | Path | Access |
|--------|------|--------|
| GET | `/categories` | Public |
| GET | `/categories/:slug` | Public |
| POST/PATCH/DELETE | `/categories` | `categories:*` |

### Breeds `/breeds`

Same pattern as categories (`breeds:*`).

### Cats `/cats`

| Method | Path | Access |
|--------|------|--------|
| GET | `/cats` | Public (filters: q, breed, category, price, gender, featured, page, sort) |
| GET | `/cats/:slug` | Public |
| POST | `/cats` | `cats:create` |
| PATCH | `/cats/:id` | `cats:update` |
| DELETE | `/cats/:id` | `cats:delete` |
| PATCH | `/cats/:id/status` | `cats:update` |

---

## Wishlist `/wishlist`

| Method | Path | Access |
|--------|------|--------|
| GET | `/wishlist` | Customer |
| POST | `/wishlist/:catId` | Customer |
| DELETE | `/wishlist/:catId` | Customer |

---

## Coupons `/coupons`

| Method | Path | Access |
|--------|------|--------|
| POST | `/coupons/validate` | Auth (customer checkout) |
| CRUD | `/coupons` | `coupons:*` |

---

## Orders `/orders`

| Method | Path | Access |
|--------|------|--------|
| POST | `/orders` | Customer (create from cart payload) |
| GET | `/orders/me` | Customer |
| GET | `/orders/me/:id` | Customer |
| GET | `/orders` | `orders:read` |
| GET | `/orders/:id` | `orders:read` |
| PATCH | `/orders/:id/status` | `orders:update` |
| POST | `/orders/:id/cancel` | Owner or `orders:update` |

---

## Payments `/payments`

| Method | Path | Access |
|--------|------|--------|
| POST | `/payments/checkout-session` | Customer |
| POST | `/payments/payment-intent` | Customer |
| GET | `/payments/me` | Customer |
| GET | `/payments` | `payments:read` |
| POST | `/payments/:id/refund` | `payments:refund` |
| POST | `/payments/webhook` | Stripe signature (raw body) |

---

## Reviews `/reviews`

| Method | Path | Access |
|--------|------|--------|
| GET | `/reviews?catId=` | Public (approved only) |
| POST | `/reviews` | Customer |
| PATCH | `/reviews/:id/status` | `reviews:moderate` |
| DELETE | `/reviews/:id` | Owner or `reviews:delete` |

---

## Upload `/uploads`

| Method | Path | Access |
|--------|------|--------|
| POST | `/uploads/image` | Auth + `uploads:create` (or staff roles) |
| POST | `/uploads/images` | Multiple |
| DELETE | `/uploads/:publicId` | `uploads:delete` |

Constraints: MIME allowlist, max size, virus-scan optional later.

---

## Notifications `/notifications`

| Method | Path | Access |
|--------|------|--------|
| GET | `/notifications` | Auth (own) |
| PATCH | `/notifications/:id/read` | Auth |
| PATCH | `/notifications/read-all` | Auth |
| POST | `/notifications` | `notifications:create` (admin broadcast) |

---

## CMS / Banners / Settings

| Resource | Public read | Admin CRUD |
|----------|-------------|------------|
| `/cms/:slug` | published | `cms:*` |
| `/banners` | active | `banners:*` |
| `/settings/:key` | limited public keys | `settings:*` |

---

## Dashboard & Reports `/dashboard`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/dashboard/overview` | `dashboard:read` |
| GET | `/dashboard/sales` | `reports:read` |
| GET | `/dashboard/inventory` | `reports:read` |
| GET | `/reports/orders/export` | `reports:export` (CSV/Excel) |

---

## Activity Logs `/activity-logs`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/activity-logs` | `activity_logs:read` |

---

## Query conventions

- Pagination: `page`, `limit` (max 100)
- Sort: `sort=createdAt:desc` or `-createdAt`
- Search: `q`
- Filters: typed query params validated by express-validator
- IDs: Mongo ObjectId validation on all `:id` params

## Status codes

| Code | Use |
|------|-----|
| 200 | Success |
| 201 | Created |
| 400 | Validation |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Unexpected (generic message) |
