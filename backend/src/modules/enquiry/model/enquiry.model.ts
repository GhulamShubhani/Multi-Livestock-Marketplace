import { Schema, model } from 'mongoose';
import type { IEnquiry } from '../interface/enquiry.interface';

const enquirySchema = new Schema<IEnquiry>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    message: { type: String, required: true, trim: true },
    contactMethod: {
      type: String,
      enum: ['call', 'whatsapp', 'enquiry', 'view_mobile'],
      required: true,
    },
    buyerName: { type: String, trim: true },
    buyerPhone: { type: String, trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'negotiating', 'sold', 'closed'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true, collection: 'enquiries' },
);

enquirySchema.index({ createdAt: -1 });

export const EnquiryModel = model<IEnquiry>('Enquiry', enquirySchema);
