export const AVAILABILITY_STATUSES = {
  DRAFT: 'draft',
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  ARCHIVED: 'archived',
} as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[keyof typeof AVAILABILITY_STATUSES];

export const AVAILABILITY_STATUS_VALUES = Object.values(AVAILABILITY_STATUSES);

export const VERIFICATION_STATUSES = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[keyof typeof VERIFICATION_STATUSES];

export const VERIFICATION_STATUS_VALUES = Object.values(VERIFICATION_STATUSES);

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const GENDER_VALUES = Object.values(GENDERS);
