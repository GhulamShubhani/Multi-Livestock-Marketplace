# Security Strategy (OWASP-Aligned)

## Principles

1. Never trust the client
2. Least privilege (RBAC + permission checks on every mutating/admin route)
3. Defense in depth (headers + validation + sanitisation + rate limits)
4. Fail closed (deny by default)
5. No secrets or stack traces in responses
6. Audit sensitive actions (especially payment verify / refund)

---

## OWASP Top 10 mapping

| Risk                            | Mitigations                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control       | JWT auth + `authorize(permission)` on protected routes; ownership checks for customer resources               |
| A02 Cryptographic Failures      | bcrypt; HTTPS; hashed refresh/reset/OTP; secrets in env                                                       |
| A03 Injection                   | Mongoose; `express-mongo-sanitize`; express-validator; no raw `$where`                                        |
| A04 Insecure Design             | Layered architecture; **admin-verified** payments (not client-claimed paid); email enumeration-safe responses |
| A05 Security Misconfiguration   | Helmet; strict CORS allowlist; Zod env validation at boot                                                     |
| A06 Vulnerable Components       | npm audit; pin versions; Husky pre-commit                                                                     |
| A07 Auth Failures               | Rate limit login; account lockout; refresh rotation + reuse detection; strong password policy                 |
| A08 Software/Data Integrity     | Authenticated admin uploads; CI builds; payment proof stored as media refs only                               |
| A09 Logging/Monitoring Failures | Winston; activity_logs; auth/payment actions; no secrets in logs                                              |
| A10 SSRF                        | No user-controlled outbound fetch; Cloudinary SDK only                                                        |

---

## Global middleware stack (order)

```text
1. requestId
2. helmet
3. cors (FRONTEND_URL + ADMIN_URL allowlist, credentials)
4. compression
5. cookie-parser
6. json/urlencoded with size limits (uploads separate via multer)
7. express-mongo-sanitize
8. hpp
9. xss / sanitize
10. global rate limiter
11. routes (stricter limiters on auth)
12. notFound
13. errorHandler
```

---

## Helmet / headers

- CSP tuned per frontend app
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Frameguard deny on API
- HSTS in production

---

## CORS

```text
origin: FRONTEND_URL + ADMIN_URL  (comma-separated lists supported)
credentials: true
methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
allowedHeaders: Content-Type, X-CSRF-Token, Authorization
```

No `*` with credentials.

---

## Rate limiting

| Scope                 | Limit (starting point)                 |
| --------------------- | -------------------------------------- |
| Global                | 100 req / 15 min / IP (`RATE_LIMIT_*`) |
| Login                 | Strict per IP (+ email)                |
| Forgot password / OTP | Tight limits                           |
| Upload                | Per-user hourly cap                    |

Use Redis store when running multi-instance production.

---

## Password policy

- Min length enforced for super admin seed (12+)
- Upper, lower, number, special recommended
- bcrypt cost factor 12+

---

## Input validation

- Every body/query/param validated with express-validator
- ObjectId checks; enum allowlists for status/provider/gender
- Price/quantity bounds; pagination `limit ≤ 100`
- File: MIME allowlist (`image/jpeg`, `image/png`, `image/webp`), max size (`UPLOAD_MAX_FILE_SIZE_MB`)

---

## Output / error handling

```json
{
  "success": false,
  "message": "Something went wrong",
  "data": null,
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

Production: generic 500; log full error with `requestId`. Never return `passwordHash`, tokens, env, stack.

---

## File uploads (Cloudinary)

1. Multer with size limit
2. Validate MIME
3. Upload server-side to folder `CLOUDINARY_FOLDER` (default `livestock-marketplace`)
4. Store `url` + `publicId` only
5. Payment screenshots use the same pipeline

---

## Payments (manual UPI — no Stripe)

- Receiver details live in `settings` key `payment` (UPI ID, QR, bank, instructions)
- Customer submits proof (`POST /payments/submit`); status becomes `submitted`
- Only `payments:verify` may approve/reject; `payments:refund` for refunds
- Do not trust client-reported “paid”
- Log verify/reject/refund in activity_logs without storing full account secrets in metadata
- **No** `STRIPE_*` secrets; remove any leftover Stripe keys from env if migrating

---

## CSRF + XSS

- Cookie auth ⇒ CSRF token required for mutating browser calls
- React escapes by default; sanitize CMS HTML with allowlist
- CSP on frontends

---

## Account protection

- Failed login counter + temporary lock
- Refresh token reuse ⇒ revoke family
- Email verify for checkout / payment submit
- Admin optional OTP step-up

---

## Secrets management

| Secret                                     | Where              |
| ------------------------------------------ | ------------------ |
| `MONGODB_URI`                              | Backend env        |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Backend env        |
| `CLOUDINARY_*`                             | Backend env        |
| `SUPER_ADMIN_*`                            | Backend env (seed) |
| SMTP (if configured)                       | Backend env        |

**Not required:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, publishable Stripe keys.

`.env` never committed; `.env.example` documents keys. Boot fails if required env vars missing (Zod).

---

## Logging & audit

| Type     | Content                                        |
| -------- | ---------------------------------------------- |
| Access   | method, path, status, duration, requestId, IP  |
| Auth     | login success/fail, lockouts, refresh reuse    |
| Payment  | submit / verify / refund (ids, amount, status) |
| Activity | CRM mutations (who, what, resource)            |

---

## Secure coding checklist (every endpoint)

- [ ] Auth required? (or explicitly public)
- [ ] Permission / ownership check
- [ ] Input validated
- [ ] CSRF on cookie-authenticated mutations
- [ ] Rate limit if sensitive
- [ ] Activity log if mutating/admin (esp. payments)
- [ ] No sensitive fields in response
- [ ] Errors via AppError + handler
