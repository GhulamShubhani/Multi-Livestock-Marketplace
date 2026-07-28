import { apiGet, apiMutate } from '@/lib/api/client';

export type CmsPage = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  publishedAt?: string;
  updatedAt?: string;
};

export type BannerAdmin = {
  _id: string;
  title: string;
  image: { url: string; publicId?: string };
  linkUrl?: string;
  placement: string;
  sortOrder: number;
  isActive: boolean;
};

export type SettingsDoc = {
  _id?: string;
  key: string;
  value: Record<string, unknown>;
  updatedAt?: string;
};

export type ActivityLog = {
  _id: string;
  actorEmail?: string;
  action: string;
  module: string;
  resourceType?: string;
  resourceId?: string;
  severity: string;
  createdAt: string;
};

export const contentApi = {
  listCms: (params?: Record<string, unknown>) => apiGet<{ pages: CmsPage[] }>('/cms', params),
  createCms: (body: Record<string, unknown>) => apiMutate<{ page: CmsPage }>('post', '/cms', body),
  updateCms: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ page: CmsPage }>('patch', `/cms/admin/${id}`, body),
  deleteCms: (id: string) => apiMutate<null>('delete', `/cms/admin/${id}`),

  listBanners: (params?: Record<string, unknown>) =>
    apiGet<{ banners: BannerAdmin[] }>('/banners/admin', params),
  createBanner: (body: Record<string, unknown>) =>
    apiMutate<{ banner: BannerAdmin }>('post', '/banners', body),
  updateBanner: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ banner: BannerAdmin }>('patch', `/banners/${id}`, body),
  deleteBanner: (id: string) => apiMutate<null>('delete', `/banners/${id}`),

  broadcast: (body: Record<string, unknown>) =>
    apiMutate<{ recipients: number }>('post', '/notifications/broadcast', body),
  createNotification: (body: Record<string, unknown>) =>
    apiMutate<{ notification: unknown }>('post', '/notifications', body),
};

export const systemApi = {
  listSettings: () => apiGet<{ settings: SettingsDoc[] }>('/settings'),
  getSetting: (key: string) => apiGet<{ settings: SettingsDoc }>(`/settings/${key}`),
  putSetting: (key: string, value: Record<string, unknown>) =>
    apiMutate<{ settings: SettingsDoc }>('put', `/settings/${key}`, { value }),
  listActivity: (params?: Record<string, unknown>) =>
    apiGet<{ logs: ActivityLog[] }>('/activity-logs', params),
};
