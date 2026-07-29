export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface CatImage extends MediaAsset {
  isPrimary?: boolean;
  alt?: string;
}

export interface CatVideo extends MediaAsset {
  alt?: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
}

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Validate image magic bytes (JPEG / PNG / WebP). */
export function detectImageMime(buffer: Buffer): AllowedImageMime | null {
  if (buffer.length < 12) return null;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }

  // WEBP: RIFF....WEBP
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export type AllowedVideoMime = (typeof ALLOWED_VIDEO_MIME_TYPES)[number];
