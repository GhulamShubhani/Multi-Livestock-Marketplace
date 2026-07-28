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

## Local MongoDB (Docker)

```bash
docker run -d --name cat-mongo -p 27017:27017 mongo:7
```
