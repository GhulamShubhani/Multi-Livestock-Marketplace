import type { Listing, NamedRef } from '@/types/api';

export function listingId(listing: { _id: string } | string) {
  return typeof listing === 'string' ? listing : listing._id;
}

export function namedRefName(ref: { name: string } | string | undefined) {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref.name;
}

export function namedRefSlug(ref: { slug: string } | string | undefined) {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref.slug;
}

export function primaryImage(
  images?: Array<{ url: string; isPrimary?: boolean }>,
  fallback?: string,
) {
  if (!images?.length) return fallback;
  return images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? fallback;
}

export function ageLabel(months?: number) {
  if (months == null) return '';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years}y ${rem}mo` : `${years} yr`;
}

export function categorySlugOf(listing: Pick<Listing, 'category'>) {
  return namedRefSlug(listing.category as NamedRef | string) || 'animals';
}

export function listingHref(listing: Pick<Listing, 'slug' | 'category'>) {
  const category = categorySlugOf(listing);
  return `/animals/${category}/${listing.slug}`;
}

export function locationLabel(location?: { city?: string; state?: string }) {
  if (!location) return '';
  return [location.city, location.state].filter(Boolean).join(', ');
}

export const CATEGORY_SLUGS = [
  'cats',
  'kittens',
  'cows',
  'buffaloes',
  'bulls',
  'goats',
  'khassi',
  'sheep',
  'chickens',
  'ducks',
  'poultry',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}
