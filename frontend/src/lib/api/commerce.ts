import { apiGet, apiMutate } from '@/lib/api/client';
import type { Address, Order, PaymentMethods, PublicUser, Review, WishlistApi } from '@/types/api';

export const wishlistApi = {
  get: () => apiGet<{ wishlist: WishlistApi }>('/wishlist'),
  add: (listingId: string) =>
    apiMutate<{ wishlist: WishlistApi }>('post', `/wishlist/${listingId}`),
  remove: (listingId: string) =>
    apiMutate<{ wishlist: WishlistApi }>('delete', `/wishlist/${listingId}`),
};

export const orderApi = {
  create: (body: {
    items: Array<{ listingId: string; quantity: number }>;
    shippingAddress: Omit<Address, '_id' | 'isDefault'>;
    couponCode?: string;
    notes?: string;
  }) => apiMutate<{ order: Order }>('post', '/orders', body),
  listMine: (params?: { page?: number; limit?: number }) =>
    apiGet<{ orders: Order[] }>('/orders/me', params),
  getMine: (id: string) => apiGet<{ order: Order }>(`/orders/me/${id}`),
  cancel: (id: string) => apiMutate<{ order: Order }>('post', `/orders/me/${id}/cancel`),
};

export const paymentApi = {
  methods: () => apiGet<{ methods: PaymentMethods }>('/payments/methods'),
  submit: (body: {
    orderId: string;
    provider?: string;
    transactionId?: string;
    utr?: string;
    paymentDate?: string;
    screenshot?: { url: string; publicId?: string };
  }) => apiMutate<{ payment: unknown }>('post', '/payments/submit', body),
};

export const profileApi = {
  get: () => apiGet<{ profile: PublicUser & { phone?: string } }>('/profile'),
  update: (body: { firstName?: string; lastName?: string; phone?: string }) =>
    apiMutate<{ profile: PublicUser }>('patch', '/profile', body),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiMutate<null>('patch', '/profile/password', body),
  listAddresses: () => apiGet<{ addresses: Address[] }>('/profile/addresses'),
  addAddress: (body: Omit<Address, '_id'>) =>
    apiMutate<{ addresses: Address[] }>('post', '/profile/addresses', body),
  updateAddress: (id: string, body: Partial<Address>) =>
    apiMutate<{ addresses: Address[] }>('patch', `/profile/addresses/${id}`, body),
  deleteAddress: (id: string) =>
    apiMutate<{ addresses: Address[] }>('delete', `/profile/addresses/${id}`),
};

export const couponApi = {
  validate: (body: { code: string; subtotal: number; listingIds?: string[] }) =>
    apiMutate<{ code: string; type: string; value: number; discount: number }>(
      'post',
      '/coupons/validate',
      body,
    ),
};

export const reviewApi = {
  list: (params?: { listingId?: string; page?: number; limit?: number }) =>
    apiGet<{ reviews: Review[] }>('/reviews', params),
  create: (body: {
    listingId: string;
    rating: number;
    title?: string;
    body?: string;
    orderId?: string;
  }) => apiMutate<{ review: Review }>('post', '/reviews', body),
};

export const enquiryApi = {
  create: (body: {
    listingId: string;
    message: string;
    contactMethod: 'call' | 'whatsapp' | 'enquiry' | 'view_mobile';
    buyerName?: string;
    buyerPhone?: string;
    buyerEmail?: string;
  }) => apiMutate<{ enquiry: unknown }>('post', '/enquiries', body),
  listMine: (params?: { page?: number; limit?: number }) =>
    apiGet<{ enquiries: unknown[] }>('/enquiries/me', params),
};
