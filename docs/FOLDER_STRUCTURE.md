# Complete Folder Structure

```text
cat-marketplace/
├── package.json                 # Workspaces root
├── .gitignore
├── .nvmrc
├── README.md
├── .prettierrc
├── .prettierignore
├── .husky/                      # (phase 1 tooling)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   ├── DEPENDENCIES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   ├── AUTH_FLOW.md
│   ├── SECURITY.md
│   └── IMPLEMENTATION_PLAN.md
│
├── docker/
│   ├── Dockerfile.backend       # (later)
│   ├── docker-compose.yml       # (later)
│   └── nginx.conf               # (optional)
│
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── types/
│       ├── constants/
│       ├── utils/
│       └── validators/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── cors.ts
│   │   │   ├── database.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── stripe.ts
│   │   │   └── logger.ts
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── seed.ts
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorize.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── csrf.ts
│   │   │   ├── sanitize.ts
│   │   │   ├── validateRequest.ts
│   │   │   ├── requestLogger.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── utils/
│   │   │   ├── AppError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   ├── asyncHandler.ts
│   │   │   ├── token.ts
│   │   │   ├── password.ts
│   │   │   └── pagination.ts
│   │   ├── helpers/
│   │   ├── constants/
│   │   ├── types/
│   │   ├── interfaces/
│   │   ├── validators/
│   │   ├── services/            # Cross-module infra (email, otp)
│   │   ├── repositories/        # Rare shared repos only
│   │   ├── routes/
│   │   │   └── index.ts         # Mounts all module routes
│   │   └── modules/
│   │       ├── auth/
│   │       ├── user/
│   │       ├── cat/
│   │       ├── order/
│   │       ├── payment/
│   │       ├── review/
│   │       ├── breed/
│   │       ├── category/
│   │       ├── coupon/
│   │       ├── upload/
│   │       ├── notification/
│   │       ├── dashboard/
│   │       ├── cms/
│   │       ├── banner/
│   │       ├── settings/
│   │       ├── activity-log/
│   │       ├── role/
│   │       └── permission/
│   │
│   │   # Each module:
│   │   #   controller/  service/  repository/  model/
│   │   #   route/  validator/  interface/  dto/  middleware/
│   │
│   └── tests/                   # (later)
│
├── frontend/                    # Next.js 15 (scaffolded in phase 7)
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   ├── public/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing
│   │   ├── about/
│   │   ├── contact/
│   │   ├── cats/
│   │   ├── breeds/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── wishlist/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── orders/
│   │   └── api/                 # BFF only if needed (prefer direct API)
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── schemas/
│   ├── types/
│   └── styles/
│
└── admin/                       # Vite + React (scaffolded in phase 9)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env.example
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── app/
        ├── layouts/
        ├── pages/
        ├── features/
        ├── components/
        ├── hooks/
        ├── services/
        ├── schemas/
        ├── theme/
        └── types/
```

## Module contract (backend)

Every feature module exposes:

| Layer | Responsibility |
|-------|----------------|
| `route/` | Wire path + middleware chain + controller |
| `validator/` | express-validator chains |
| `middleware/` | Module-specific guards (optional) |
| `controller/` | HTTP adapter |
| `dto/` / `interface/` | Request/response shapes |
| `service/` | Domain logic |
| `repository/` | Persistence |
| `model/` | Mongoose schema |

No controller imports Mongoose models directly.
