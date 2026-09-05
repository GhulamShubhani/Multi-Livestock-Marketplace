export interface MediaAsset {
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ListingLocation {
  country: string;
  state: string;
  district?: string;
  city: string;
  village?: string;
  area?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}
