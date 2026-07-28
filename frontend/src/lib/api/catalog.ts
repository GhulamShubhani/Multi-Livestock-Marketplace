import { apiGet } from '@/lib/api/client';
import type { Breed, Cat, Category, CatsQuery } from '@/types/api';

export const catalogApi = {
  listCats: (params?: CatsQuery) => apiGet<{ cats: Cat[] }>('/cats', params as Record<string, unknown>),
  getCatBySlug: (slug: string) => apiGet<{ cat: Cat }>(`/cats/slug/${slug}`),
  listCategories: (params?: { page?: number; limit?: number; q?: string }) =>
    apiGet<{ categories: Category[] }>('/categories', params),
  listBreeds: (params?: { page?: number; limit?: number; q?: string }) =>
    apiGet<{ breeds: Breed[] }>('/breeds', params),
};
