import type { Document, Types } from 'mongoose';
import type { MediaAsset } from '../../../types/media';

export type BannerPlacement = 'home_hero' | 'home_secondary' | 'sidebar';

export interface IBanner {
  title: string;
  image: MediaAsset;
  linkUrl?: string;
  placement: BannerPlacement;
  sortOrder: number;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BannerDocument = Document<Types.ObjectId> & IBanner;
