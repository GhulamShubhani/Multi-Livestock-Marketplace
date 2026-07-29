import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export type MediaAsset = {
  url: string;
  publicId: string;
};

function assertApiOk<T>(data: ApiResponse<T>): T {
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

const multipartConfig = {
  withCredentials: true as const,
  // Let the browser set multipart/form-data + boundary (do not send application/json).
  headers: { 'Content-Type': undefined as unknown as string },
  timeout: 120_000,
};

export const uploadsApi = {
  uploadMainImage: async (file: File): Promise<MediaAsset> => {
    const form = new FormData();
    form.append('image', file);

    const { data } = await apiClient.post<ApiResponse<{ image: MediaAsset }>>(
      '/uploads/image',
      form,
      multipartConfig,
    );

    return assertApiOk(data).image;
  },

  uploadImages: async (files: File[]): Promise<MediaAsset[]> => {
    const form = new FormData();
    for (const f of files) form.append('images', f);

    const { data } = await apiClient.post<ApiResponse<{ images: MediaAsset[] }>>(
      '/uploads/images',
      form,
      multipartConfig,
    );

    return assertApiOk(data).images;
  },

  uploadVideo: async (file: File): Promise<MediaAsset> => {
    const form = new FormData();
    form.append('video', file);

    const { data } = await apiClient.post<ApiResponse<{ video: MediaAsset }>>(
      '/uploads/video',
      form,
      multipartConfig,
    );

    return assertApiOk(data).video;
  },

  uploadVideos: async (files: File[]): Promise<MediaAsset[]> => {
    const form = new FormData();
    for (const f of files) form.append('videos', f);

    const { data } = await apiClient.post<ApiResponse<{ videos: MediaAsset[] }>>(
      '/uploads/videos',
      form,
      multipartConfig,
    );

    return assertApiOk(data).videos;
  },
};
