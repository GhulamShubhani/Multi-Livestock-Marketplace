import { apiGet, apiMutate } from '@/lib/api/client';

export type OrderAdmin = {
  _id: string;
  orderNumber: string;
  user?: { email?: string; firstName?: string; lastName?: string } | string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  couponCode?: string;
  createdAt: string;
};

export type PaymentAdmin = {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  provider?: string;
  order?: { orderNumber?: string; _id?: string } | string;
  user?: { email?: string } | string;
  createdAt: string;
};

export type CouponAdmin = {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
};

export type ReviewAdmin = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  status: string;
  cat?: string | { name?: string };
  user?: { firstName?: string; lastName?: string };
  createdAt: string;
};

export const commerceApi = {
  listOrders: (params?: Record<string, unknown>) =>
    apiGet<{ orders: OrderAdmin[] }>('/orders', params),
  getOrder: (id: string) => apiGet<{ order: OrderAdmin }>(`/orders/${id}`),
  setOrderStatus: (id: string, status: string) =>
    apiMutate<{ order: OrderAdmin }>('patch', `/orders/${id}/status`, { status }),
  cancelOrder: (id: string) => apiMutate<{ order: OrderAdmin }>('post', `/orders/${id}/cancel`),

  listPayments: (params?: Record<string, unknown>) =>
    apiGet<{ payments: PaymentAdmin[] }>('/payments', params),
  refund: (id: string, body?: { amount?: number; reason?: string }) =>
    apiMutate<{ payment: PaymentAdmin }>('post', `/payments/${id}/refund`, body),

  listCoupons: (params?: Record<string, unknown>) =>
    apiGet<{ coupons: CouponAdmin[] }>('/coupons', params),
  createCoupon: (body: Record<string, unknown>) =>
    apiMutate<{ coupon: CouponAdmin }>('post', '/coupons', body),
  updateCoupon: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ coupon: CouponAdmin }>('patch', `/coupons/${id}`, body),
  deleteCoupon: (id: string) => apiMutate<null>('delete', `/coupons/${id}`),

  listReviews: (params?: Record<string, unknown>) =>
    apiGet<{ reviews: ReviewAdmin[] }>('/reviews/admin', params),
  setReviewStatus: (id: string, status: string) =>
    apiMutate<{ review: ReviewAdmin }>('patch', `/reviews/${id}/status`, { status }),
  deleteReview: (id: string) => apiMutate<null>('delete', `/reviews/${id}`),
};
