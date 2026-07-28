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

export type MediaImage = {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  alt?: string;
};

export type NamedRef = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Cat = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  breed: NamedRef | string;
  category: NamedRef | string;
  ageMonths: number;
  gender: 'male' | 'female' | 'unknown';
  color?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  status: string;
  images: MediaImage[];
  vaccinated: boolean;
  neutered: boolean;
  pedigree: boolean;
  featured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = NamedRef & {
  image?: MediaImage;
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
  cat: string | Cat;
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
  items: Array<{ cat: Cat; addedAt: string }>;
};

export type Review = {
  _id: string;
  cat: string;
  user?: { firstName: string; lastName: string };
  rating: number;
  title?: string;
  body?: string;
  status?: string;
  createdAt: string;
};

export type Banner = {
  _id: string;
  title: string;
  image: MediaImage;
  linkUrl?: string;
  placement: string;
  sortOrder: number;
};

export type CheckoutSessionResult = {
  mock: boolean;
  sessionId: string;
  url?: string;
  paymentId: string;
};

export type CartItem = {
  catId: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

export type WishlistItemLocal = {
  catId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
};

export type CatsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  breed?: string;
  category?: string;
  gender?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
};
