import { Schema, model } from 'mongoose';
import type { IAttribute } from '../interface/attribute.interface';
import { ATTRIBUTE_TYPES } from '../interface/attribute.interface';

const attributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    key: { type: String, required: true, trim: true, index: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ATTRIBUTE_TYPES, required: true },
    unit: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    required: { type: Boolean, default: false },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    filterable: { type: Boolean, default: false },
    showOnCard: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'attributes' },
);

attributeSchema.index({ categoryIds: 1, isActive: 1, sortOrder: 1 });

export const AttributeModel = model<IAttribute>('Attribute', attributeSchema);
