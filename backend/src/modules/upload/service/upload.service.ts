import type { UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { cloudinary, isCloudinaryConfigured } from '../../../config/cloudinary';
import { env } from '../../../config/env';
import { AppError } from '../../../utils/AppError';
import { detectImageMime, type MediaAsset } from '../../../types/media';
import { logger } from '../../../config/logger';

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder?: string): Promise<MediaAsset> {
    this.assertValidImage(file);

    const targetFolder = folder || env.CLOUDINARY_FOLDER;

    if (!isCloudinaryConfigured) {
      const publicId = `dev/${targetFolder}/${randomUUID()}`;
      const asset: MediaAsset = {
        publicId,
        url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`,
      };
      logger.info('Mock image upload (Cloudinary not configured)', { publicId });
      return asset;
    }

    try {
      const result = await this.uploadBuffer(file.buffer, targetFolder, file.mimetype);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error('Cloudinary upload failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw AppError.badRequest('Image upload failed');
    }
  }

  async uploadImages(files: Express.Multer.File[], folder?: string): Promise<MediaAsset[]> {
    const uploads = await Promise.all(files.map((file) => this.uploadImage(file, folder)));
    return uploads;
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw AppError.badRequest('publicId is required');
    }

    if (!isCloudinaryConfigured) {
      logger.info('Mock image delete', { publicId });
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      logger.error('Cloudinary delete failed', {
        error: error instanceof Error ? error.message : String(error),
        publicId,
      });
      throw AppError.badRequest('Image delete failed');
    }
  }

  private assertValidImage(file: Express.Multer.File): void {
    if (!file?.buffer?.length) {
      throw AppError.badRequest('Empty file');
    }

    const detected = detectImageMime(file.buffer);
    if (!detected) {
      throw AppError.badRequest('Invalid image file. Allowed: JPEG, PNG, WebP');
    }

    if (file.mimetype && file.mimetype !== detected) {
      throw AppError.badRequest('File MIME type does not match file contents');
    }
  }

  private uploadBuffer(
    buffer: Buffer,
    folder: string,
    mime: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Empty Cloudinary response'));
            return;
          }
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }
}

export const uploadService = new UploadService();
