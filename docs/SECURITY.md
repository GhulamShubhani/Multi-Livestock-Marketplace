# Security Strategy (OWASP-Aligned)

## Principles

1. Never trust the client
2. Least privilege (RBAC + permission checks on every mutating/admin route)
3. Defense in depth (headers + validation + sanitisation + rate limits)
4. Fail closed (deny by default)
5. No secrets or stack traces in responses
6. Audit sensitive actions

---

## OWASP Top 10 mapping

| Risk | Mitigations |
|------|-------------|
| A01 Broken Access Control | JWT auth + `authorize(permission)` on every protected route; ownership checks for customer resources |
| A02 Cryptographic Failures | bcrypt (cost ≥ 12); HTTPS only; hashed refresh/reset/OTP tokens; secrets in env |
| A03 Injection | Mongoose parameterized queries; `express-mongo-sanitize`; express-validator; no raw `$where` |
| A04 Insecure Design | Layered architecture; webhook-verified payments; email enumeration-safe responses |
| A05 Security Misconfiguration | Helmet; disable `x-powered-by`; strict CORS allowlist; env validation at boot |
| A06 Vulnerable Components | Dependabot/npm audit; pin versions; Husky pre-commit |
| A07 Auth Failures | Rate limit login; account lockout; refresh rotation + reuse detection; strong password policy |
| A08 Software/Data Integrity | Stripe signature verification; authenticated admin uploads; CI checks |
| A09 Logging/Monitoring Failures | Winston structured logs; activity_logs; auth/payment logs; no PII secrets in logs |
| A10 SSRF | No user-controlled outbound URLs for fetch; Cloudinary SDK only |

---

## Global middleware stack (order)

```text
1. requestId
2. helmet
3. cors (allowlist origins: frontend + admin)
4. compression
5. cookie-parser
6. json/urlencoded with size limits (e.g. 100kb; uploads separate)
7. express-mongo-sanitize
8. hpp
9. xss sanitise
10. global rate limiter (general)
11. routes (auth routes get stricter limiter)
12. notFound
13. errorHandler
```

---

## Helmet / headers

- `Content-Security-Policy` tuned per app (Next.js/Admin on Vercel; API separate)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Frameguard: deny` on API
- HSTS in production

---

## CORS

```text
origin: [FRONTEND_URL, ADMIN_URL]
credentials: true
methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
allowedHeaders: Content-Type, X-CSRF-Token, Authorization
```

No `*` with credentials.

---

## Rate limiting

| Scope | Limit (starting point) |
|-------|------------------------|
| Global | 100 req / 15 min / IP |
| Login | 5 / 15 min / IP + email |
| Forgot password | 3 / 15 min / IP |
| OTP send | 3 / 10 min / user or IP |
| Upload | 20 / hour / user |
| Webhook | higher; signature-gated |

Use Redis store in production when multi-instance.

---

## Password policy

- Min 8–12 chars (configurable; recommend 12)
- Require upper, lower, number, special
- Reject common passwords list (optional)
- bcrypt cost factor 12+

---

## Input validation

- **Every** body/query/param validated with express-validator
- ObjectId checks
- Enum allowlists for status/role
- Price/quantity bounds
- Pagination caps (`limit ≤ 100`)
- File: MIME allowlist (`image/jpeg`, `image/png`, `image/webp`), extension vs magic-byte check, max size (e.g. 5MB)

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

- Production: generic 500 message; log full error server-side with `requestId`
- Never return `passwordHash`, tokens, env, stack

---

## File uploads (Cloudinary)

1. Multer memory/disk with size limit
2. Validate MIME + file signature
3. Upload via signed Cloudinary API (server-side)
4. Store only `url` + `publicId`
5. Delete/replace through authenticated endpoints
6. Transform URLs for thumbnails (q_auto, f_auto)

---

## Payments (Stripe)

- Secret key server-only
- Webhook endpoint uses `express.raw` + `stripe.webhooks.constructEvent`
- Idempotent webhook handlers (store event id)
- Refunds only with `payments:refund`
- Log payment actions without full card data (Stripe never sends PAN)

---

## CSRF + XSS

- Cookie auth ⇒ CSRF token required for mutating browser calls
- React escapes by default; sanitize CMS HTML with allowlist (`sanitize-html`)
- CSP on frontends

---

## Account protection

- Failed login counter + temporary lock
- Refresh token reuse ⇒ revoke family
- Email verify for sensitive commerce actions
- Admin optional OTP step-up

---

## Secrets management

| Secret | Where |
|--------|-------|
| `MONGODB_URI` | Backend env |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Backend env |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Backend env |
| `CLOUDINARY_*` | Backend env |
| `SMTP_*` | Backend env |
| Public Stripe/Cloudinary keys | Frontend env only if needed |

`.env` never committed; `.env.example` documents keys without values.

Boot fails if required env vars missing (Zod/`envalid`).

---

## Logging & audit

| Type | Content |
|------|---------|
| Access | method, path, status, duration, requestId, IP |
| Auth | login success/fail, lockouts, refresh reuse |
| Payment | intent id, amount, status changes |
| Activity | CRM mutations (who, what, resource) |

Retain logs per policy; redact emails partially if required by privacy policy.

---

## Secure coding checklist (every endpoint)

- [ ] Auth required? (or explicitly public)
- [ ] Permission / ownership check
- [ ] Input validated
- [ ] Rate limit if sensitive
- [ ] Activity log if mutating/admin
- [ ] No sensitive fields in response
- [ ] Errors via AppError + handler
