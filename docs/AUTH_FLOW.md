# Authentication & Authorization Flow

## Goals

- Secure session management with **short-lived access JWT** + **rotating refresh tokens**
- Tokens in **HttpOnly, Secure, SameSite** cookies
- Email verification, OTP, password reset
- RBAC with **configurable permissions**
- Brute-force protection and account lockout
- Logout current device / all devices

---

## Token model

| Token | Lifetime | Storage | Contents |
|-------|----------|---------|----------|
| Access JWT | 15 minutes | HttpOnly cookie `access_token` | `sub`, `role`, `permissions[]`, `sid` |
| Refresh | 7–30 days | HttpOnly cookie `refresh_token` | Opaque random string; **hash** stored in DB |

Refresh tokens are stored hashed (`sha256`) in `refresh_tokens` with a `familyId` for rotation reuse detection.

### Cookie flags (production)

```text
HttpOnly; Secure; SameSite=Lax (or Strict for admin);
Path=/; Domain=.yourdomain.com
```

Separate cookie names/prefixes for admin vs customer if origins differ (recommended: shared API, shared cookie domain behind same parent domain).

---

## Registration (Customer)

```text
Client                  API                     DB / Email
  │  POST /auth/register  │
  │──────────────────────►│ validate, hash password
  │                       │ create user (pending/unverified)
  │                       │ create email verification token (hashed)
  │                       │──────────────────────────► send email
  │◄──────────────────────│ 201 + set cookies? (optional: require verify first)
  │                       │ Prefer: no login until verified OR limited session
```

**Policy recommendation:** Allow login but block checkout until `isEmailVerified`; or require verify first. Configurable via settings.

---

## Login

```text
1. Validate email/password
2. If lockUntil > now → 423/401 locked
3. On failure → increment failedLoginAttempts; lock after N (e.g. 5) for M minutes
4. On success → reset counters; issue access JWT + refresh token (new family)
5. Set cookies; write activity_log (login + IP + UA)
6. Optional: require OTP step-up for admin roles
```

Admin logins should use stricter rate limits and optional OTP.

---

## Refresh rotation

```text
POST /auth/refresh  (sends refresh cookie)

1. Lookup refresh by hash
2. If missing/expired/revoked → 401 clear cookies
3. If token already used (replacedBy set) → REUSE ATTACK
      → revoke entire familyId; force re-login
4. Else:
      → revoke old token (set revokedAt, replacedBy)
      → mint new refresh in same family
      → mint new access JWT
      → set cookies
```

---

## Logout

- **Current:** revoke matching refresh row; clear cookies
- **All devices:** revoke all refresh rows for user; clear cookies

---

## Forgot / Reset password

```text
POST /auth/forgot-password { email }
  → always return 200 (no email enumeration)
  → if user exists: store hashed reset token + expiry; email link

POST /auth/reset-password { token, password }
  → validate strength
  → update passwordHash
  → revoke ALL refresh tokens
  → clear reset fields
  → activity_log
```

---

## OTP

Used for: email verification alternative, admin step-up, sensitive actions.

```text
1. Generate 6-digit OTP; store hash + expiry (5–10 min); limit send rate
2. Verify: compare hash; increment otpAttempts; lock after abuse
3. On success: clear OTP fields; mark verified / allow action
```

---

## RBAC model

```text
User → Role → Permissions[]
         └─ optional user.permissionsOverride
```

**Default roles**

| Role | Typical access |
|------|----------------|
| `super_admin` | All permissions |
| `admin` | Most CRM except destructive system settings |
| `manager` | Catalog, orders, reports (no role admin) |
| `staff` | Limited order/inventory ops |
| `customer` | Own profile, orders, wishlist, reviews |

**Permission key format:** `module:action`  
Examples: `cats:create`, `orders:refund`, `reports:export`, `roles:update`

### Middleware chain

```text
authenticate → attach req.user
authorize('orders:refund') → check permission set
```

Frontend/Admin hide UI by permissions from `/auth/me`, but **API always enforces**.

---

## CSRF strategy (SPA + cookies)

Because auth is cookie-based:

1. Issue CSRF token cookie (`csrf_token`, readable by JS) or header from `/auth/csrf`
2. Require matching `X-CSRF-Token` on POST/PUT/PATCH/DELETE
3. Stripe webhook excluded (signature verification instead)
4. SameSite cookies reduce risk; CSRF still recommended for defense in depth

---

## Session management (Admin)

- List active refresh sessions (device, IP, last used)
- Revoke individual session
- Force logout user from CRM

---

## Sequence: Checkout with auth

```text
Login → Browse → Add wishlist/cart (client) → Create Order (API)
  → Create Stripe Checkout Session
  → Redirect Stripe → Webhook payment_intent.succeeded
  → Mark Payment + Order paid → Notify user
```

Never mark order paid from client success URL alone — **webhook is source of truth**.
