export interface AuthRequestContext {
  ip?: string;
  userAgent?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface OtpSendDto {
  email: string;
}

export interface OtpVerifyDto {
  email: string;
  otp: string;
}

export interface PublicUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  permissions: string[];
  isEmailVerified: boolean;
  status: string;
}
