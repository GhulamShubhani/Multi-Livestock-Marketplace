import { apiGet } from '@/lib/api/client';
import type {
  Attribute,
  Breed,
  Category,
  HomepageSection,
  Listing,
  ListingsQuery,
} from '@/types/api';

export const catalogApi = {
  listListings: (params?: ListingsQuery) =>
    apiGet<{ listings: Listing[] }>('/listings', params as Record<string, unknown>),
  getListingBySlug: (slug: string) => apiGet<{ listing: Listing }>(`/listings/slug/${slug}`),
  listCategories: (params?: { page?: number; limit?: number; q?: string }) =>
    apiGet<{ categories: Category[] }>('/categories', params),
  listBreeds: (params?: { page?: number; limit?: number; q?: string; category?: string }) =>
    apiGet<{ breeds: Breed[] }>('/breeds', params),
  listAttributes: (params?: { category?: string; page?: number; limit?: number }) =>
    apiGet<{ attributes: Attribute[] }>('/attributes', params),
  getHomepage: () => apiGet<{ sections: HomepageSection[] }>('/homepage'),
};
