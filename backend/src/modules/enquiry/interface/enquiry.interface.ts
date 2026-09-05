import type { Document, Types } from 'mongoose';

export type EnquiryContactMethod = 'call' | 'whatsapp' | 'enquiry' | 'view_mobile';
export type EnquiryStatus = 'new' | 'contacted' | 'interested' | 'negotiating' | 'sold' | 'closed';

export interface IEnquiry {
  buyerId?: Types.ObjectId;
  sellerId: Types.ObjectId;
  listingId: Types.ObjectId;
  message: string;
  contactMethod: EnquiryContactMethod;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryDocument = Document<Types.ObjectId> & IEnquiry;
