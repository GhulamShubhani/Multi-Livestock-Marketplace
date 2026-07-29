import axios, { type AxiosError } from 'axios';
import type { ApiFailureResponse, ApiResponse } from '@/types/api';
import { API_URL } from '@/lib/utils';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  // FormData must use multipart boundary set by the browser — never force application/json.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.set === 'function') {
      config.headers.set('Content-Type', false);
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
      delete (config.headers as Record<string, unknown>)['content-type'];
    }
  }

  if (typeof document !== 'undefined') {
    const csrf = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))
      ?.split('=')[1];
    if (
      csrf &&
      config.method &&
      !['get', 'head', 'options'].includes(config.method.toLowerCase())
    ) {
      config.headers['X-CSRF-Token'] = decodeURIComponent(csrf);
    }
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  const axiosError = error as AxiosError<ApiFailureResponse>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params });
  if (!data.success) throw new Error(data.message);
  return data;
}

export async function apiMutate<T>(
  method: 'post' | 'patch' | 'put' | 'delete',
  url: string,
  body?: unknown,
) {
  const { data } = await apiClient.request<ApiResponse<T>>({ method, url, data: body });
  if (!data.success) throw new Error(data.message);
  return data;
}
