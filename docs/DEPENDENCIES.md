# Dependency List

Versions are indicative; pin exact versions at install time.

## Root (workspaces)

| Package | Purpose |
|---------|---------|
| `typescript` | Shared TS tooling |
| `prettier` | Formatting |
| `husky` | Git hooks |
| `lint-staged` | Pre-commit lint |
| `concurrently` | Run apps in parallel (dev) |

Package manager: **pnpm** (recommended) or npm workspaces.

---

## Backend (`backend/`)

### Core

| Package | Purpose |
|---------|---------|
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM |
| `dotenv` / `zod` | Env validation |
| `cors` | CORS |
| `helmet` | Security headers |
| `compression` | Response compression |
| `cookie-parser` | Cookie parsing |
| `morgan` | HTTP access logs |
| `winston` | Structured logging |
| `express-rate-limit` | Rate limiting |
| `express-mongo-sanitize` | NoSQL injection prevention |
| `hpp` | HTTP parameter pollution |
| `xss-clean` or `sanitize-html` | XSS sanitisation |
| `csurf` / custom double-submit | CSRF (cookie-based SPA strategy) |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT access/refresh |
| `express-validator` | Input validation |
| `multer` | Multipart uploads |
| `cloudinary` | Image CDN |
| `stripe` | Payments |
| `nodemailer` | Transactional email |
| `uuid` / `nanoid` | IDs / request IDs |
| `dayjs` | Dates |
| `lodash` (sparingly) | Utilities |

### Dev

| Package | Purpose |
|---------|---------|
| `typescript` | Types |
| `ts-node-dev` / `tsx` | Dev runner |
| `@types/express`, `@types/node`, … | Types |
| `eslint` + `@typescript-eslint/*` | Lint |
| `prettier` | Format |
| `jest` / `vitest` + `supertest` | Tests (later) |

---

## Frontend (`frontend/`)

| Package | Purpose |
|---------|---------|
| `next` (15) | Framework |
| `react`, `react-dom` | UI |
| `typescript` | Types |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling |
| `@mui/material`, `@mui/icons-material`, `@emotion/*` | Components |
| `@tanstack/react-query` | Server state |
| `axios` | HTTP |
| `zustand` | Client state |
| `react-hook-form` | Forms |
| `zod` + `@hookform/resolvers` | Validation |
| `framer-motion` | Motion |
| `@stripe/stripe-js`, `@stripe/react-stripe-js` | Payments UI |
| `next-themes` | Dark mode |
| `clsx` / `tailwind-merge` | Class utils |

---

## Admin (`admin/`)

| Package | Purpose |
|---------|---------|
| `vite` | Bundler |
| `react`, `react-dom` | UI |
| `typescript` | Types |
| `react-router-dom` | Routing |
| `@mui/material`, `@mui/x-data-grid`, `@mui/x-charts`, `@mui/x-date-pickers` | Dashboard UI |
| `@emotion/react`, `@emotion/styled` | MUI styling |
| `@tanstack/react-query` | Server state |
| `axios` | HTTP |
| `react-hook-form` + `zod` | Forms |
| `recharts` or MUI Charts | Analytics |
| `dayjs` | Dates |
| `file-saver` + `xlsx` | CSV/Excel export |
| `notistack` or MUI Snackbar | Toasts |

---

## Shared (`shared/`)

| Package | Purpose |
|---------|---------|
| `typescript` | Compile types |
| `zod` (optional) | Shared schemas |

---

## External Services

| Service | Use |
|---------|-----|
| MongoDB Atlas | Primary DB |
| Cloudinary | Images |
| Stripe | Payments + webhooks |
| SMTP (SendGrid/Resend/Mailgun) | Email/OTP |
| Vercel | Frontend + Admin |
| Railway or Render | Backend |
