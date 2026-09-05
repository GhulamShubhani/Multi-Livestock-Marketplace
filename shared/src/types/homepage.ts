export type HomepageSectionType =
  'hero' | 'categories' | 'carousel' | 'promo' | 'info' | 'banner' | 'cta';

export interface HomepageSection {
  _id: string;
  key: string;
  type: HomepageSectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: { url: string; publicId?: string };
  ctaText?: string;
  ctaUrl?: string;
  category?: string;
  displayOrder: number;
  isActive: boolean;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
