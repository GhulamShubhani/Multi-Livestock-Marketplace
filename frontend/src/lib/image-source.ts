import type { ImageSourceType } from '@/types/api';

export function imageSourceLabel(
  sourceType?: ImageSourceType,
  sourceLabel?: string,
): string | null {
  if (sourceLabel?.trim()) return sourceLabel.trim();
  switch (sourceType) {
    case 'ai':
      return 'AI-generated';
    case 'external':
      return 'External source';
    case 'upload':
      return 'Admin upload';
    default:
      return null;
  }
}

export function inferImageSourceType(url?: string): ImageSourceType | undefined {
  if (!url) return undefined;
  if (url.includes('res.cloudinary.com')) return 'upload';
  if (url.includes('images.unsplash.com') || url.includes('http')) return 'external';
  return undefined;
}
