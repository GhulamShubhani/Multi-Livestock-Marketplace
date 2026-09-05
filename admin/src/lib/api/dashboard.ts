import { apiGet } from '@/lib/api/client';

export type DashboardOverview = {
  cards: {
    usersTotal: number;
    customersTotal: number;
    listingsAvailable: number;
    listingsReserved: number;
    listingsSold: number;
    ordersTotal: number;
    ordersPending: number;
    paidOrders: number;
    revenueCents: number;
    paymentsVerified: number;
    reviewsPending: number;
  };
  salesLast30Days: Array<{ date: string; revenueCents: number; orders: number }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
};

export const dashboardApi = {
  overview: () => apiGet<DashboardOverview>('/dashboard/overview'),
  sales: (days = 30) =>
    apiGet<{
      days: number;
      byDay: Array<{ date: string; orders: number; revenueCents: number }>;
      byStatus: Array<{ status: string; count: number }>;
    }>('/dashboard/sales', { days }),
  inventory: () =>
    apiGet<{
      byStatus: Array<{ status: string; count: number }>;
      lowStock: unknown[];
      featuredAvailable: unknown[];
    }>('/dashboard/inventory'),
};
