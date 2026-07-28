export type ApiErrorItem = {
  field?: string;
  message: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  errors: [];
  meta?: PaginationMeta;
};

export type ApiFailureResponse = {
  success: false;
  message: string;
  data: null;
  errors: ApiErrorItem[];
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  permissions: string[];
  isEmailVerified: boolean;
  status: string;
};
