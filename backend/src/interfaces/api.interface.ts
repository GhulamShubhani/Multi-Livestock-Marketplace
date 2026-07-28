export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  errors: [];
  meta?: PaginationMeta;
}

export interface ApiFailureResponse {
  success: false;
  message: string;
  data: null;
  errors: ApiErrorItem[];
  meta?: undefined;
}

export type ApiResponseBody<T = unknown> = ApiSuccessResponse<T> | ApiFailureResponse;
