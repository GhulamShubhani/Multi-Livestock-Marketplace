# Database Schema (MongoDB)

Default database name: **`livestock_marketplace`**.

> **Migration note:** Older local Docker Compose used `cat_marketplace`. Prefer `livestock_marketplace`. If you still have a volume named `cat_mongo_data`, either migrate data or start fresh; compose now uses `livestock_mongo_data`.

Money fields are stored as **integer minor units** (paise for INR) plus a currency code (`DEFAULT_CURRENCY=INR`).

---

## Collections Overview

| Collection         | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `users`            | Accounts (all roles)                     |
| `roles`            | Role definitions                         |
| `permissions`      | Permission catalog                       |
| `refresh_tokens`   | Rotating refresh sessions                |
| `categories`       | Animal / product taxonomy                |
| `attributes`       | Dynamic fields per category              |
| `breeds`           | Breed taxonomy (linked to categories)    |
| `listings`         | All livestock listings (dynamic catalog) |
| `sellers`          | Seller profiles                          |
| `enquiries`        | Buyer ↔ seller interest / contact        |
| `orders`           | Customer orders                          |
| `payments`         | Manual UPI / bank / COD / mobile proofs  |
| `reviews`          | Listing reviews                          |
| `coupons`          | Discount codes                           |
| `wishlists`        | Per-user wishlist                        |
| `notifications`    | In-app notifications                     |
| `activity_logs`    | Audit trail                              |
| `settings`         | Keyed config (incl. `payment`)           |
| `cms_pages`        | CMS content                              |
| `banners`          | Marketing banners                        |
| `homepageSections` | Homepage CMS sections                    |

There is **no** `cats` collection and **no** Stripe payment-intent fields.

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
  permissionsOverride: string[],
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
  addresses: [{
    label, line1, line2, city, state, postalCode, country, isDefault
  }],
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
  name: 'super_admin' | 'admin' | 'manager' | 'staff'
       | 'seller' | 'buyer' | 'customer',  // customer = legacy buyer
  displayName: string,
  description?: string,
  permissions: ObjectId[],
  isSystem: boolean,
  createdAt, updatedAt
}
```

**Indexes:** `name` unique

---

## 3. permissions

```ts
{
  _id: ObjectId,
  key: string,     // e.g. 'listings:create', 'payments:verify'
  module: string,
  action: string,
  description?: string,
  createdAt, updatedAt
}
```

**Indexes:** `key` unique, `module`

Notable keys: `listings:*`, `listings:verify`, `attributes:*`, `enquiries:*`, `sellers:*`, `homepage:*`, `payments:read|verify|refund`, plus users/orders/cms/settings/dashboard/reports/activity_logs.

---

## 4. refresh_tokens

```ts
{
  _id: ObjectId,
  user: ObjectId,
  tokenHash: string,
  familyId: string,
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
  slug: string,
  description?: string,
  image?: { url, publicId },
  icon?: string,
  group?: string,
  parent?: ObjectId,
  listingCount: number,
  attributes: ObjectId[],     // attribute defs linked to this category
  isActive: boolean,
  sortOrder: number,
  seo?: { title, description, keywords },
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `isActive`, `parent`

---

## 6. attributes

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  key: string,                // stable machine key
  label: string,
  type: 'text' | 'number' | 'decimal' | 'boolean' | 'date'
      | 'select' | 'multiselect' | 'radio' | 'textarea'
      | 'yes_no' | 'image',
  unit?: string,
  options?: string[],
  required: boolean,
  categoryIds: ObjectId[],
  sortOrder: number,
  isActive: boolean,
  filterable: boolean,
  showOnCard: boolean,
  createdAt, updatedAt
}
```

**Indexes:** `key` unique, `slug`, `categoryIds`, `isActive`

---

## 7. breeds

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  description?: string,
  origin?: string,
  temperament?: string[],
  lifeSpan?: string,
  categoryIds: ObjectId[],
  image?: { url, publicId },
  isActive: boolean,
  seo?: { title, description, keywords },
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `name`, `categoryIds`

---

## 8. listings

```ts
{
  _id: ObjectId,
  title: string,
  slug: string,
  listingId: string,          // human-readable id
  description: string,
  shortDescription?: string,
  category: ObjectId,
  subcategory?: ObjectId,
  breed?: ObjectId,
  price: number,              // minor units
  negotiable: boolean,
  currency: string,           // default INR
  seller: ObjectId,
  sellerMobile?: string,
  sellerWhatsApp?: string,
  location: {
    country, state, district?, city, village?, area?, pincode?,
    latitude?, longitude?
  },
  images: [{ url, publicId, isPrimary?, alt? }],
  videos: [{ url, publicId?, … }],
  ageMonths?: number,
  gender: 'male' | 'female' | 'unknown',
  weight?: number,
  healthStatus?: string,
  vaccinationStatus?: string,
  availabilityStatus: 'draft' | 'available' | 'reserved' | 'sold' | 'archived',
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected',
  featured: boolean,
  premium: boolean,
  isActive: boolean,
  attributes?: Record<string, unknown>,  // key → value from attribute defs
  averageRating: number,
  reviewCount: number,
  seo?: { title, description, keywords },
  createdBy: ObjectId,
  updatedBy?: ObjectId,
  createdAt, updatedAt
}
```

**Indexes:** `slug` unique, `listingId`, `category`, `breed`, `seller`, `availabilityStatus`, `featured`, text on title/description

---

## 9. sellers

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  businessName: string,
  sellerType: 'individual' | 'farmer' | 'breeder' | 'farm' | 'dealer' | 'business',
  yearsOfExperience?: number,
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected',
  whatsapp?: string,
  phone?: string,
  address?: { line1, line2, village, city, district, state, pincode, country },
  bio?: string,
  isActive: boolean,
  createdAt, updatedAt
}
```

**Indexes:** `userId`, `verificationStatus`, `isActive`

---

## 10. enquiries

```ts
{
  _id: ObjectId,
  buyerId?: ObjectId,
  sellerId: ObjectId,
  listingId: ObjectId,
  message: string,
  contactMethod: 'call' | 'whatsapp' | 'enquiry' | 'view_mobile',
  buyerName?: string,
  buyerPhone?: string,
  buyerEmail?: string,
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'sold' | 'closed',
  createdAt, updatedAt
}
```

**Indexes:** `listingId`, `sellerId`, `buyerId`, `status`, `createdAt`

---

## 11. orders

```ts
{
  _id: ObjectId,
  orderNumber: string,
  user: ObjectId,
  items: [{
    listing: ObjectId,
    name, sku?, image?,
    unitPrice, quantity, lineTotal
  }],
  subtotal, discount, tax, shipping, total: number,
  currency: string,
  coupon?: ObjectId,
  couponCode?: string,
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
  shippingAddress: { … },
  billingAddress?: { … },
  notes?: string,
  paidAt?: Date,
  cancelledAt?: Date,
  createdAt, updatedAt
}
```

**Indexes:** `orderNumber` unique, `user`, `status`, `createdAt`

---

## 12. payments

```ts
{
  _id: ObjectId,
  order?: ObjectId,
  listing?: ObjectId,
  user: ObjectId,
  seller?: ObjectId,
  provider: 'upi' | 'bank_transfer' | 'cod' | 'mobile',
  amount: number,
  currency: string,
  status: 'pending' | 'submitted' | 'under_verification'
        | 'verified' | 'rejected' | 'refunded',
  method?: string,
  transactionId?: string,
  utr?: string,
  paymentDate?: Date,
  screenshot?: { url, publicId },
  adminNotes?: string,
  verifiedBy?: ObjectId,
  verifiedAt?: Date,
  rejectedReason?: string,
  ip?: string,
  createdAt, updatedAt
}
```

**Indexes:** `order`, `user`, `status`, `utr`, `createdAt`

---

## 13. reviews

```ts
{
  _id: ObjectId,
  listing: ObjectId,
  user: ObjectId,
  order?: ObjectId,
  rating: number,             // 1-5
  title?: string,
  body?: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt, updatedAt
}
```

**Indexes:** unique `{ listing, user }`, `status`, `rating`

---

## 14. coupons

```ts
{
  _id: ObjectId,
  code: string,
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
  applicableListings?: ObjectId[],
  createdAt, updatedAt
}
```

**Indexes:** `code` unique, `isActive`, `endsAt`

---

## 15. wishlists

```ts
{
  _id: ObjectId,
  user: ObjectId,             // unique
  items: [{ listing: ObjectId, addedAt: Date }],
  createdAt, updatedAt
}
```

---

## 16. notifications

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

## 17. activity_logs

```ts
{
  _id: ObjectId,
  actor?: ObjectId,
  actorEmail?: string,
  action: string,             // e.g. 'payments.submit', 'payments.verify'
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

---

## 18. settings

```ts
{
  _id: ObjectId,
  key: string,                // 'general' | 'seo' | 'storefront' | 'payment' | …
  value: object,
  updatedBy?: ObjectId,
  createdAt, updatedAt
}
```

### `payment` settings value (public via `GET /payments/methods`)

```ts
{
  receiverName?, mobile?, upiId?, qrCode?,  // qrCode = media URL/asset
  bankName?, accountHolder?, accountNumber?, ifsc?,
  instructions?
}
```

Public settings keys include: `general`, `seo`, `storefront`, `payment`.

---

## 19. cms_pages

```ts
{
  _id: ObjectId,
  title: string,
  slug: string,
  content: string,
  status: 'draft' | 'published',
  seo?: { title, description },
  publishedAt?: Date,
  createdBy, updatedBy,
  createdAt, updatedAt
}
```

---

## 20. banners

```ts
{
  _id: ObjectId,
  title: string,
  image: { url, publicId },
  linkUrl?: string,
  placement: string,
  sortOrder: number,
  isActive: boolean,
  startsAt?: Date,
  endsAt?: Date,
  createdAt, updatedAt
}
```

---

## 21. homepageSections

```ts
{
  _id: ObjectId,
  key: string,
  type: 'hero' | 'categories' | 'carousel' | 'promo' | 'info' | 'banner' | 'cta',
  title?: string,
  subtitle?: string,
  description?: string,
  image?: { url, publicId },
  ctaText?: string,
  ctaUrl?: string,
  category?: ObjectId,
  displayOrder: number,
  isActive: boolean,
  config?: Record<string, unknown>,
  createdAt, updatedAt
}
```

**Indexes:** `key`, `type`, `displayOrder`, `isActive`

---

## Relationships (simplified)

```text
User ──role──► Role ──► Permissions
User ──► Seller profile
Category ──► Attributes
Listing ──► Category, Breed?, Seller, attributes map
Enquiry ──► Listing, Seller, Buyer?
Order items ──► Listing
Payment ──► Order, User (manual proof)
Review / Wishlist ──► Listing
HomepageSection / Banner / CMS ── content
Settings(payment) ──► public payment methods
```

## Seed data

On boot (`SEED_ON_BOOT=true`) or `npm run seed --workspace=@cat-marketplace/backend`:

- System roles + full permission matrix (incl. seller / buyer)
- Super admin from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
- Default categories, breeds, attributes, homepage sections, settings (incl. payment placeholder)
