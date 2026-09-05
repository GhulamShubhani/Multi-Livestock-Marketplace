import { apiGet, apiMutate } from '@/lib/api/client';

export type ListingLocation = {
  country: string;
  state: string;
  district?: string;
  city: string;
  village?: string;
  area?: string;
  pincode?: string;
};

export type ListingAdmin = {
  _id: string;
  title: string;
  slug: string;
  listingId?: string;
  description: string;
  shortDescription?: string;
  category: { _id: string; name: string } | string;
  subcategory?: { _id: string; name: string } | string;
  breed?: { _id: string; name: string } | string;
  price: number;
  negotiable?: boolean;
  currency: string;
  seller?: { _id: string; name?: string; email?: string } | string;
  sellerMobile?: string;
  sellerWhatsApp?: string;
  location: ListingLocation;
  images?: Array<{
    url: string;
    publicId: string;
    isPrimary?: boolean;
    alt?: string;
  }>;
  videos?: Array<{
    url: string;
    publicId: string;
    alt?: string;
  }>;
  ageMonths?: number;
  gender: string;
  weight?: number;
  healthStatus?: string;
  vaccinationStatus?: string;
  availabilityStatus: string;
  verificationStatus: string;
  featured: boolean;
  premium?: boolean;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
};

export type AttributeType =
  | 'text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'textarea'
  | 'yes_no'
  | 'image';

export type AttributeAdmin = {
  _id: string;
  name: string;
  slug: string;
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
  required: boolean;
  categoryIds: Array<string | { _id: string; name?: string }>;
  sortOrder?: number;
  isActive: boolean;
  filterable: boolean;
  showOnCard: boolean;
};

export type CategoryAdmin = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  group?: string;
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
  listListings: (params?: Record<string, unknown>) =>
    apiGet<{ listings: ListingAdmin[] }>('/listings/admin', params),
  getListing: (id: string) => apiGet<{ listing: ListingAdmin }>(`/listings/admin/${id}`),
  createListing: (body: Record<string, unknown>) =>
    apiMutate<{ listing: ListingAdmin }>('post', '/listings', body),
  updateListing: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ listing: ListingAdmin }>('patch', `/listings/${id}`, body),
  setListingStatus: (id: string, availabilityStatus: string) =>
    apiMutate<{ listing: ListingAdmin }>('patch', `/listings/${id}/status`, {
      availabilityStatus,
    }),
  verifyListing: (id: string, verificationStatus: string) =>
    apiMutate<{ listing: ListingAdmin }>('patch', `/listings/${id}/verify`, {
      verificationStatus,
    }),
  deleteListing: (id: string) => apiMutate<null>('delete', `/listings/${id}`),

  listAttributes: (params?: Record<string, unknown>) =>
    apiGet<{ attributes: AttributeAdmin[] }>('/attributes/admin', params),
  listAttributesByCategory: (categoryId: string) =>
    apiGet<{ attributes: AttributeAdmin[] }>(`/attributes/category/${categoryId}`),
  getAttribute: (id: string) => apiGet<{ attribute: AttributeAdmin }>(`/attributes/admin/${id}`),
  createAttribute: (body: Record<string, unknown>) =>
    apiMutate<{ attribute: AttributeAdmin }>('post', '/attributes', body),
  updateAttribute: (id: string, body: Record<string, unknown>) =>
    apiMutate<{ attribute: AttributeAdmin }>('patch', `/attributes/${id}`, body),
  deleteAttribute: (id: string) => apiMutate<null>('delete', `/attributes/${id}`),

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
