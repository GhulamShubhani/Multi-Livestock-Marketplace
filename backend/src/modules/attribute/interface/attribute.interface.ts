import type { Document, Types } from 'mongoose';

export const ATTRIBUTE_TYPES = [
  'text',
  'number',
  'decimal',
  'boolean',
  'date',
  'select',
  'multiselect',
  'radio',
  'textarea',
  'yes_no',
  'image',
] as const;

export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

export interface IAttribute {
  name: string;
  slug: string;
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
  required: boolean;
  categoryIds: Types.ObjectId[];
  sortOrder: number;
  isActive: boolean;
  filterable: boolean;
  showOnCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AttributeDocument = Document<Types.ObjectId> & IAttribute;
