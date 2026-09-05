export const ENQUIRY_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  NEGOTIATING: 'negotiating',
  SOLD: 'sold',
  CLOSED: 'closed',
} as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[keyof typeof ENQUIRY_STATUSES];

export const ENQUIRY_STATUS_VALUES = Object.values(ENQUIRY_STATUSES);

export const CONTACT_METHODS = {
  CALL: 'call',
  WHATSAPP: 'whatsapp',
  ENQUIRY: 'enquiry',
  VIEW_MOBILE: 'view_mobile',
} as const;

export type ContactMethod = (typeof CONTACT_METHODS)[keyof typeof CONTACT_METHODS];

export const CONTACT_METHOD_VALUES = Object.values(CONTACT_METHODS);
