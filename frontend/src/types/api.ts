export type ApiErrorItem = {
  field?: string;
  message: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  errors: [];
  meta?: PaginationMeta;
};

export type ApiFailureResponse = {
  success: false;
  message: string;
  data: null;
  errors: ApiErrorItem[];
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  permissions: string[];
  isEmailVerified: boolean;
  status: string;
};

export type ImageSourceType = 'ai' | 'external' | 'upload';

export type MediaImage = {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  alt?: string;
  /** How the image was produced / obtained (hero CMS, admin uploads, etc.) */
  sourceType?: ImageSourceType;
  sourceLabel?: string;
};

export type HeroSlide = {
  src: string;
  alt: string;
  sourceType?: ImageSourceType;
  sourceLabel?: string;
};

export type MediaVideo = {
  url: string;
  publicId?: string;
  alt?: string;
};

export type NamedRef = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type ListingLocation = {
  country: string;
  state: string;
  district?: string;
  city: string;
  village?: string;
  area?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
};

export type AvailabilityStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type Listing = {
  _id: string;
  title: string;
  slug: string;
  listingId: string;
  description: string;
  shortDescription?: string;
  breed?: NamedRef | string;
  category: NamedRef | string;
  subcategory?: NamedRef | string;
  ageMonths?: number;
  gender: 'male' | 'female' | 'unknown';
  weight?: number;
  healthStatus?: string;
  vaccinationStatus?: string;
  price: number;
  negotiable: boolean;
  currency: string;
  location: ListingLocation;
  images: MediaImage[];
  videos?: MediaVideo[];
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  featured: boolean;
  premium?: boolean;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
  seller?: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  sellerMobile?: string;
  sellerWhatsApp?: string;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = NamedRef & {
  image?: MediaImage;
  icon?: string;
  group?: string;
  listingCount?: number;
  isActive?: boolean;
  sortOrder?: number;
};

export type Breed = NamedRef & {
  origin?: string;
  temperament?: string;
  lifeSpan?: string;
  image?: MediaImage;
  isActive?: boolean;
};

export type Attribute = NamedRef & {
  key?: string;
  dataType?: string;
  unit?: string;
  options?: string[];
  categoryIds?: string[];
  filterable?: boolean;
  showOnCard?: boolean;
};

export type Address = {
  _id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type OrderItem = {
  listing: string | Listing;
  name: string;
  sku?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  couponCode?: string;
  status: string;
  paymentStatus: string;
  shippingAddress: Address;
  notes?: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
};

export type WishlistApi = {
  user: string;
  items: Array<{ listing: Listing; addedAt: string }>;
};

export type Review = {
  _id: string;
  listing: string;
  user?: { firstName: string; lastName: string };
  rating: number;
  title?: string;
  body?: string;
  status?: string;
  createdAt: string;
};

export type HomepageSection = {
  _id?: string;
  key: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: MediaImage;
  ctaText?: string;
  ctaUrl?: string;
  category?: string | NamedRef;
  displayOrder: number;
  isActive: boolean;
  config?: Record<string, unknown>;
};

export type PaymentMethods = {
  receiverName?: string | null;
  mobile?: string | null;
  upiId?: string | null;
  qrCode?: MediaImage | string | null;
  bankName?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  instructions?: string | null;
  providers?: string[];
};

export type CartItem = {
  listingId: string;
  title: string;
  slug: string;
  categorySlug?: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

export type WishlistItemLocal = {
  listingId: string;
  title: string;
  slug: string;
  categorySlug?: string;
  price: number;
  image?: string;
};

export type ListingsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  breed?: string;
  category?: string;
  gender?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  city?: string;
  sort?: string;
};
