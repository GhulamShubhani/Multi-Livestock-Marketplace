# Dependency List

Versions are indicative; pin exact versions at install time. Workspace package scope remains `@cat-marketplace/*` (legacy npm names); the product is **Multi-Livestock Marketplace**.

## Root (workspaces)

| Package       | Purpose           |
| ------------- | ----------------- |
| `prettier`    | Formatting        |
| `husky`       | Git hooks         |
| `lint-staged` | Pre-commit format |

Package manager: **npm workspaces** (Node ≥ 20).

---

## Backend (`backend/`)

### Core

| Package                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `express`                | HTTP framework                     |
| `mongoose`               | MongoDB ODM                        |
| `dotenv` + `zod`         | Env loading & validation           |
| `cors`                   | CORS allowlist                     |
| `helmet`                 | Security headers                   |
| `compression`            | Response compression               |
| `cookie-parser`          | Cookie parsing                     |
| `winston`                | Structured logging                 |
| `express-rate-limit`     | Rate limiting                      |
| `express-mongo-sanitize` | NoSQL injection prevention         |
| `hpp`                    | HTTP parameter pollution           |
| `bcryptjs`               | Password hashing                   |
| `jsonwebtoken`           | JWT access tokens                  |
| `express-validator`      | Input validation                   |
| `multer`                 | Multipart uploads                  |
| `cloudinary`             | Image CDN                          |
| `@vercel/node`           | Optional Vercel serverless adapter |

**Not used:** `stripe` / `@stripe/*` — payments are manual UPI proof + admin verify.

### Dev

| Package            | Purpose               |
| ------------------ | --------------------- |
| `typescript`       | Types                 |
| `tsx`              | Dev runner / seed CLI |
| `@types/*`         | Type packages         |
| ESLint (workspace) | Lint                  |

---

## Frontend (`frontend/`)

| Package                                              | Purpose                       |
| ---------------------------------------------------- | ----------------------------- |
| `next` (15)                                          | Framework                     |
| `react`, `react-dom`                                 | UI                            |
| `typescript`                                         | Types                         |
| `tailwindcss`                                        | Styling                       |
| `@mui/material`, `@mui/icons-material`, `@emotion/*` | Components                    |
| `@tanstack/react-query`                              | Server state                  |
| `axios`                                              | HTTP (+ credentials / CSRF)   |
| `zustand`                                            | Client state (cart, wishlist) |
| `react-hook-form` + `zod`                            | Forms (where used)            |
| `framer-motion`                                      | Motion                        |
| `next-themes`                                        | Dark mode                     |
| `clsx` / `tailwind-merge`                            | Class utils                   |

**Not used:** `@stripe/stripe-js`, `@stripe/react-stripe-js`.

---

## Admin (`admin/`)

| Package                               | Purpose      |
| ------------------------------------- | ------------ |
| `vite`                                | Bundler      |
| `react`, `react-dom`                  | UI           |
| `typescript`                          | Types        |
| `react-router-dom`                    | Routing      |
| `@mui/material`, MUI X (as installed) | Dashboard UI |
| `@tanstack/react-query`               | Server state |
| `axios`                               | HTTP         |
| `zustand`                             | Auth / UI    |
| `notistack`                           | Toasts       |

---

## Shared (`shared/`)

| Package      | Purpose                   |
| ------------ | ------------------------- |
| `typescript` | Compile types / constants |

---

## External Services

| Service                          | Use                                                                      |
| -------------------------------- | ------------------------------------------------------------------------ |
| MongoDB Atlas (or local Mongo 7) | Primary DB (`livestock_marketplace`)                                     |
| Cloudinary                       | Listing / proof / CMS images (`CLOUDINARY_FOLDER=livestock-marketplace`) |
| SMTP (optional)                  | Email / OTP (mock-friendly in dev)                                       |
| Vercel                           | Frontend + Admin (+ optional API)                                        |
| Railway or Render                | Backend API                                                              |

**Payment receiver details** (UPI ID, QR image, bank account, instructions) are stored in MongoDB `settings` with key `payment`, not in Stripe env vars.
