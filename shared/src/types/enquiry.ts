import type { ContactMethod, EnquiryStatus } from '../constants/enquiry';

export interface Enquiry {
  _id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  message: string;
  contactMethod: ContactMethod;
  status: EnquiryStatus;
  createdAt?: string;
  updatedAt?: string;
}
