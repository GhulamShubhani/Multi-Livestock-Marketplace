# Authentication & Authorization Flow

## Goals

- Secure session management with **short-lived access JWT** + **rotating refresh tokens**
- Tokens in **HttpOnly, Secure, SameSite** cookies
- Email verification, OTP, password reset
- RBAC with **configurable permissions**
- Brute-force protection and account lockout
- Logout current device / all devices

Auth spirit is unchanged from the original platform; roles/permissions expanded for livestock marketplace (seller, buyer, listings, attributes, enquiries, homepage, payment verify).

---

## Token model

| Token      | Lifetime                  | Storage                         | Contents                                    |
| ---------- | ------------------------- | ------------------------------- | ------------------------------------------- |
| Access JWT | 15 minutes (configurable) | HttpOnly cookie `access_token`  | `sub`, `role`, `permissions[]`, `sid`       |
| Refresh    | 7–30 days                 | HttpOnly cookie `refresh_token` | Opaque random string; **hash** stored in DB |
| CSRF       | Session-aligned           | JS-readable cookie `csrf_token` | Double-submit via `X-CSRF-Token`            |

Refresh tokens are stored hashed (`sha256`) in `refresh_tokens` with a `familyId` for rotation reuse detection.

### Cookie flags (production)

```text
HttpOnly; Secure; SameSite=Lax|None;
Path=/; Domain=.yourdomain.com   # optional shared parent domain
```

Cross-site SPA → API on different hosts typically needs `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.

---

## Registration

```text
Client                  API                     DB / Email
  │  POST /auth/register  │
  │──────────────────────►│ validate, hash password
  │                       │ create user (buyer/customer role)
  │                       │ email verification token (hashed)
  │                       │──────────────────────────► send email
  │◄──────────────────────│ cookies optional per policy
```

Checkout and payment submit require **verified email** (`requireEmailVerified`).

---

## Login

```text
1. Validate email/password
2. If lockUntil > now → locked
3. On failure → increment failedLoginAttempts; lock after 5 for 30 minutes
4. On success → reset counters; issue access JWT + refresh (new family)
5. Set cookies; activity_log
6. Optional OTP step-up for admin roles
```

Admin app allows staff roles only (`super_admin`, `admin`, `manager`, `staff`).

---

## Refresh rotation

```text
POST /auth/refresh

1. Lookup refresh by hash
2. Missing/expired/revoked → 401 clear cookies
3. Already used (replacedBy) → REUSE ATTACK → revoke familyId
4. Else rotate refresh + mint new access JWT + set cookies
```

---

## Logout

- **Current:** revoke matching refresh; clear cookies
- **All devices:** revoke all refresh rows for user; clear cookies

Both require CSRF on mutating cookie auth.

---

## Forgot / Reset password

```text
POST /auth/forgot-password { email }  → always 200
POST /auth/reset-password { token, password }
  → update passwordHash, revoke ALL refresh tokens
```

---

## OTP

Used for email verification alternative, admin step-up, sensitive actions.

Limits: 6-digit, ~10 min expiry, max attempts, send rate limited.

---

## RBAC model

```text
User → Role → Permissions[]
         └─ optional user.permissionsOverride
```

### Default roles

| Role          | Typical access                                          |
| ------------- | ------------------------------------------------------- |
| `super_admin` | All permissions                                         |
| `admin`       | Broad CRM (excl. most destructive system ops as seeded) |
| `manager`     | Catalog, orders, reports                                |
| `staff`       | Limited ops                                             |
| `seller`      | Seller listing / enquiry permissions as seeded          |
| `buyer`       | Own profile, orders, wishlist, reviews, enquiries       |
| `customer`    | Legacy alias of buyer permissions                       |

### Permission key format

`module:action` — examples:

- `listings:create|read|update|delete|verify`
- `attributes:create|read|update|delete`
- `enquiries:read|update`
- `sellers:read|update`
- `homepage:create|read|update|delete`
- `payments:read|verify|refund`
- `orders:read|update`, `categories:*`, `breeds:*`, `cms:*`, `settings:*`, `dashboard:read`, `activity_logs:read`, …

### Middleware chain

```text
authenticate → authorize('payments:verify') → csrfProtection (mutations)
```

UI hides by permissions from `/auth/me`; **API always enforces**.

---

## CSRF strategy (SPA + cookies)

1. CSRF token cookie readable by JS (`csrf_token`)
2. Require matching `X-CSRF-Token` on POST/PUT/PATCH/DELETE
3. SameSite reduces risk; CSRF remains defense in depth
4. No Stripe webhook exception (Stripe removed)

---

## Session management (Admin)

- List active refresh sessions (device, IP)
- Revoke individual or all sessions for a user

---

## Sequence: Checkout with manual payment

```text
Login (verified email)
  → Browse listings → Cart
  → POST /orders
  → GET /payments/methods   (UPI / QR / bank from settings)
  → Customer pays offline / UPI
  → POST /payments/submit   (UTR + screenshot)
  → Admin PATCH /payments/:id/verify
  → Order paymentStatus → paid  (or rejected / later refund)
```

Never mark an order paid from the client alone — **admin verification** (or an explicit verified status transition in the payment service) is the source of truth.
