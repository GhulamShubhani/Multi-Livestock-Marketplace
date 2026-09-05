# Complete Folder Structure

```text
cat_ecom/                        # Multi-Livestock Marketplace monorepo
├── package.json                 # Workspaces root
├── .gitignore
├── .nvmrc
├── README.md
├── .prettierrc
├── .prettierignore
├── render.yaml                  # Render blueprint (API)
├── .husky/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   ├── DEPENDENCIES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   ├── AUTH_FLOW.md
│   ├── SECURITY.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── RUNBOOK.md
│   └── DEPLOYMENT.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.admin
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── README.md
│
├── shared/
│   ├── package.json             # @cat-marketplace/shared
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── types/
│       ├── constants/
│       └── …
│
├── backend/
│   ├── package.json             # @cat-marketplace/backend
│   ├── tsconfig.json
│   ├── .env.example
│   ├── api/                     # Vercel serverless entry (optional)
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts           # Zod-validated env (no STRIPE_*)
│   │   │   ├── cors.ts
│   │   │   ├── cloudinary.ts
│   │   │   └── logger.ts
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   ├── seed.ts
│   │   │   └── seed.cli.ts
│   │   ├── middlewares/
│   │   │   ├── csrf.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── sanitize.ts
│   │   │   ├── validateRequest.ts
│   │   │   ├── requestLogger.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── utils/
│   │   ├── helpers/
│   │   ├── constants/           # ROLES, PERMISSIONS, cookies
│   │   ├── types/
│   │   ├── services/            # Email / OTP infra
│   │   ├── routes/
│   │   │   ├── index.ts         # Mounts all /api/v1 modules
│   │   │   └── health.route.ts
│   │   └── modules/
│   │       ├── auth/
│   │       ├── user/
│   │       ├── role/
│   │       ├── permission/
│   │       ├── category/
│   │       ├── attribute/
│   │       ├── breed/
│   │       ├── listing/         # Dynamic catalog (not per-species schemas)
│   │       ├── seller/
│   │       ├── enquiry/
│   │       ├── homepage/
│   │       ├── upload/
│   │       ├── wishlist/
│   │       ├── coupon/
│   │       ├── order/
│   │       ├── payment/         # Manual UPI / verify / refund
│   │       ├── review/
│   │       ├── notification/
│   │       ├── dashboard/
│   │       ├── cms/
│   │       ├── banner/
│   │       ├── settings/        # Includes payment receiver config
│   │       └── activity-log/
│   │
│   │   # Typical module layout:
│   │   #   controller/  service/  repository/  model/
│   │   #   route/  validator/  interface/  middleware/
│   │
│   └── tests/                   # optional
│
├── frontend/                    # Next.js 15 storefront (port 3005)
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx         # Homepage (CMS-driven sections)
│       │   ├── animals/         # /animals, /[category], /[slug]
│       │   ├── cats/ cows/ …    # Category shortcut pages
│       │   ├── livestock/
│       │   ├── search/ sell/
│       │   ├── cart/ checkout/ wishlist/
│       │   ├── auth/
│       │   ├── profile/ orders/
│       │   ├── about/ contact/
│       │   └── …
│       ├── components/
│       │   ├── home/
│       │   ├── catalog/
│       │   ├── cart/ checkout/
│       │   ├── auth/ layout/
│       │   └── …
│       ├── lib/api/             # catalog, commerce clients
│       ├── stores/
│       └── types/
│
└── admin/                       # Vite + React CRM (port 5173)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env.example
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── config/nav.ts
        ├── layouts/
        ├── pages/               # Listings, Attributes, Enquiries, Homepage, Payments, …
        ├── lib/api/
        ├── components/
        ├── hooks/
        ├── theme/
        └── types/
```

## Module contract (backend)

| Layer         | Responsibility                       |
| ------------- | ------------------------------------ |
| `route/`      | Path + middleware chain + controller |
| `validator/`  | express-validator chains             |
| `middleware/` | Module-specific guards (optional)    |
| `controller/` | HTTP adapter                         |
| `interface/`  | Request/response / document shapes   |
| `service/`    | Domain logic                         |
| `repository/` | Persistence                          |
| `model/`      | Mongoose schema                      |

No controller imports Mongoose models directly.

## API mount points

All modules mount under `API_PREFIX` (default `/api/v1`) via `backend/src/routes/index.ts`:

`/health`, `/auth`, `/users`, `/profile`, `/categories`, `/breeds`, `/listings`, `/attributes`, `/sellers`, `/enquiries`, `/homepage`, `/uploads`, `/wishlist`, `/coupons`, `/orders`, `/payments`, `/reviews`, `/notifications`, `/settings`, `/cms`, `/banners`, `/activity-logs`, `/dashboard`.
