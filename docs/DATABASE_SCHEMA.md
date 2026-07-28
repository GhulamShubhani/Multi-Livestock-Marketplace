# Database Schema (MongoDB Atlas)

All money fields stored as **integer cents** (or decimal128) to avoid float errors. Prefer `Number` cents + currency code.

---

## Collections Overview

| Collection | Purpose |
|------------|---------|
| `users` | Accounts (all roles) |
| `roles` | Role definitions |
| `permissions` | Permission catalog |
| `refresh_tokens` | Rotating refresh sessions |
| `cats` | Catalog listings |
| `breeds` | Breed taxonomy |
| `categories` | Category taxonomy |
| `orders` | Customer orders |
| `payments` | Payment records |
| `reviews` | Product reviews |
| `coupons` | Discount codes |
| `notifications` | In-app notifications |
| `activity_logs` | Audit trail |
| `settings` | App/site settings (singleton / keyed) |
| `cms_pages` | CMS content |
| `banners` | Marketing banners |
| `wishlists` | Per-user wishlist (or embed on user) |

---

## 1. users

```ts
{
  _id: ObjectId,
  email: string,              // unique, lowercase
  passwordHash: string,       // select: false
  firstName: string,
  lastName: string,
  phone?: string,
  avatar?: { url, publicId },
  role: ObjectId,             // ref roles
  permissionsOverride?: string[], // optional grants/denies
  isEmailVerified: boolean,
  emailVerificationTokenHash?: string,
  emailVerificationExpires?: Date,
  passwordResetTokenHash?: string,
  passwordResetExpires?: Date,
  otpHash?: string,
  otpExpires?: Date,
  otpAttempts: number,
  failedLoginAttempts: number,
  lockUntil?: Date,
  status: 'active' | 'inactive' | 'banned' | 'pending',
  addresses?: [{
    label, line1, line2, city, state, postalCode, country, isDefault
  }],
  stripeCustomerId?: string,
  lastLoginAt?: Date,
  lastLoginIp?: string,
  createdAt, updatedAt
}
```

**Indexes:** `email` unique, `role`, `status`, `phone`

---

## 2. roles

```ts
{
  _id: ObjectId,
  name: 'super_admin' | 'admin' | 'manager' | 'staff' | 'customer',
  displayName: string,
  description?: string,
  permissions: ObjectId[],    // ref permissions
  isSystem: boolean,          // cannot delete system roles
  createdAt, updatedAt
}
```

**Indexes:** `name` unique

---

## 3. permissions

```ts
{
  _id: ObjectId,
  key: string,                // e.g. 'cats:create', 'orders:refund'
  module: string,             // 'cats' | 'orders' | ...
  action: string,             // 'create' | 'read' | 'update' | 'delete' | 'export'
  description?: string,
  createdAt, updatedAt
}
```

**Indexes:** `key` unique, `module`

---

## 4. refresh_tokens

```ts
{
  _id: ObjectId,
  user: ObjectId,
  tokenHash: string,          // never store raw refresh token
  familyId: string,           // rotation family — reuse detection
  userAgent?: string,
  ip?: string,
  expiresAt: Date,
  revokedAt?: Date,
  replacedBy?: ObjectId,
  createdAt
}
```

**Indexes:** `tokenHash` unique, `user`, TTL on `expiresAt`

---

## 5. categories

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,               // unique
  description?: string,
  image?: { url, publicId },
  parent?: ObjectId,          // nested categories optional
  isActive: boolean,
  sortOrder: number,
  seo?: { title, description, keywords },
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `isActive`, `parent`

---

## 6. breeds

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  description?: string,
  origin?: string,
  temperament?: string[],
  lifeSpan?: string,
  image?: { url, publicId },
  isActive: boolean,
  seo?: { title, description, keywords },
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `name`

---

## 7. cats

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  sku?: string,
  description: string,
  shortDescription?: string,
  breed: ObjectId,
  category: ObjectId,
  ageMonths: number,
  gender: 'male' | 'female' | 'unknown',
  color?: string,
  price: number,              // cents
  compareAtPrice?: number,
  currency: 'USD' | 'INR' | ...,
  stock: number,              // 0/1 for unique pets, or quantity
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived',
  images: [{ url, publicId, isPrimary, alt }],
  attributes?: Record<string, string>,
  vaccinated: boolean,
  neutered: boolean,
  pedigree: boolean,
  featured: boolean,
  averageRating: number,
  reviewCount: number,
  seo?: { title, description, keywords },
  createdBy: ObjectId,
  updatedBy?: ObjectId,
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `breed`, `category`, `status`, `price`, `featured`, text index on `name description`

---

## 8. orders

```ts
{
  _id: ObjectId,
  orderNumber: string,        // human-readable unique
  user: ObjectId,
  items: [{
    cat: ObjectId,
    name, sku, image,
    unitPrice: number,
    quantity: number,
    lineTotal: number
  }],
  subtotal: number,
  discount: number,
  tax: number,
  shipping: number,
  total: number,
  currency: string,
  coupon?: ObjectId,
  couponCode?: string,
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
  shippingAddress: { ... },
  billingAddress?: { ... },
  notes?: string,
  paidAt?: Date,
  cancelledAt?: Date,
  createdAt, updatedAt
}
```

**Indexes:** `orderNumber` unique, `user`, `status`, `createdAt`

---

## 9. payments

```ts
{
  _id: ObjectId,
  order: ObjectId,
  user: ObjectId,
  provider: 'stripe',
  stripePaymentIntentId?: string,
  stripeCheckoutSessionId?: string,
  stripeInvoiceId?: string,
  amount: number,
  currency: string,
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded',
  method?: string,
  receiptUrl?: string,
  refunds?: [{
    stripeRefundId, amount, reason, createdAt
  }],
  rawEvents?: ObjectId[],     // optional refs to webhook log
  ip?: string,
  createdAt, updatedAt
}
```

**Indexes:** `order`, `stripePaymentIntentId` unique sparse, `status`

---

## 10. reviews

```ts
{
  _id: ObjectId,
  cat: ObjectId,
  user: ObjectId,
  order?: ObjectId,           // verified purchase
  rating: number,             // 1-5
  title?: string,
  body?: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt, updatedAt
}
```

**Indexes:** unique `{ cat, user }`, `status`, `rating`

---

## 11. coupons

```ts
{
  _id: ObjectId,
  code: string,               // uppercase unique
  type: 'percent' | 'fixed',
  value: number,
  minOrderAmount?: number,
  maxDiscount?: number,
  usageLimit?: number,
  usedCount: number,
  perUserLimit?: number,
  startsAt?: Date,
  endsAt?: Date,
  isActive: boolean,
  applicableCategories?: ObjectId[],
  applicableCats?: ObjectId[],
  createdAt, updatedAt
}
```

**Indexes:** `code` unique, `isActive`, `endsAt`

---

## 12. notifications

```ts
{
  _id: ObjectId,
  user: ObjectId,
  title: string,
  body: string,
  type: string,
  data?: object,
  channel: 'in_app' | 'email',
  isRead: boolean,
  readAt?: Date,
  createdAt
}
```

**Indexes:** `{ user, isRead, createdAt }`

---

## 13. activity_logs

```ts
{
  _id: ObjectId,
  actor?: ObjectId,
  actorEmail?: string,
  action: string,             // 'user.login', 'order.refund'
  module: string,
  resourceType?: string,
  resourceId?: ObjectId,
  ip?: string,
  userAgent?: string,
  metadata?: object,          // never store secrets
  severity: 'info' | 'warn' | 'critical',
  createdAt
}
```

**Indexes:** `actor`, `action`, `createdAt`, TTL optional (e. for 180 days)

---

## 14. settings

```ts
{
  _id: ObjectId,
  key: string,                // unique e.g. 'general', 'payments', 'seo'
  value: object,
  updatedBy?: ObjectId,
  updatedAt, createdAt
}
```

---

## 15. cms_pages

```ts
{
  _id: ObjectId,
  title: string,
  slug: string,
  content: string,            // sanitized HTML/Markdown
  status: 'draft' | 'published',
  seo?: { title, description },
  publishedAt?: Date,
  createdBy, updatedBy,
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `status`

---

## 16. banners

```ts
{
  _id: ObjectId,
  title: string,
  image: { url, publicId },
  linkUrl?: string,
  placement: 'home_hero' | 'home_secondary' | 'sidebar',
  sortOrder: number,
  isActive: boolean,
  startsAt?: Date,
  endsAt?: Date,
  createdAt, updatedAt
}
```

---

## 17. wishlists

```ts
{
  _id: ObjectId,
  user: ObjectId,             // unique
  items: [{ cat: ObjectId, addedAt: Date }],
  updatedAt, createdAt
}
```

---

## Relationships (simplified)

```text
User ──role──► Role ──► Permissions
User ──► Orders ──► Payments
User ──► Reviews ──► Cat
Cat ──► Breed, Category
Order items ──► Cat
Coupon ── used by ──► Order
```

## Seed data (phase 2–3)

- System roles + full permission matrix
- Super Admin user (from env)
- Default settings, sample categories/breeds (optional)
