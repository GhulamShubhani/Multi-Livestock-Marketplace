import { apiGet, apiMutate } from '@/lib/api/client';

export type CatAdmin = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  breed: { _id: string; name: string } | string;
  category: { _id: string; name: string } | string;
  ageMonths: number;
  gender: string;
  price: number;
  currency: string;
  stock: number;
  status: string;
  featured: boolean;
  images?: Array<{ url: string; publicId?: string }>;
  vaccinated?: boolean;
  neutered?: boolean;
  pedigree?: boolean;
};

export type CategoryAdmin = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
};

export type BreedAdmin = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  origin?: string;
  isActive: boolean;
};

export const catalogApi = {
  listCats: (params?: Record<string, unknown>) => apiGet<{ cats: CatAdmin[] }>('/cats/admin', params),
  getCat: (id: string) => apiGet<{ cat: CatAdmin }>(`/cats/admin/${id}`),
  createCat: (body: Record<string, unknown>) => apiMutate<{ cat: CatAdmin }>('post', '/cats', body),
  updateCat: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ cat: CatAdmin }>('patch', `/cats/${id}`, body),
  setCatStatus: (id: string, status: string) =>
    apiMutate<{ cat: CatAdmin }>('patch', `/cats/${id}/status`, { status }),
  deleteCat: (id: string) => apiMutate<null>('delete', `/cats/${id}`),

  listCategories: (params?: Record<string, unknown>) =>
    apiGet<{ categories: CategoryAdmin[] }>('/categories/admin', params),
  createCategory: (body: Record<string, unknown>) =>
    apiMutate<{ category: CategoryAdmin }>('post', '/categories', body),
  updateCategory: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ category: CategoryAdmin }>('patch', `/categories/${id}`, body),
  deleteCategory: (id: string) => apiMutate<null>('delete', `/categories/${id}`),

  listBreeds: (params?: Record<string, unknown>) =>
    apiGet<{ breeds: BreedAdmin[] }>('/breeds/admin', params),
  createBreed: (body: Record<string, unknown>) =>
    apiMutate<{ breed: BreedAdmin }>('post', '/breeds', body),
  updateBreed: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ breed: BreedAdmin }>('patch', `/breeds/${id}`, body),
  deleteBreed: (id: string) => apiMutate<null>('delete', `/breeds/${id}`),
};
