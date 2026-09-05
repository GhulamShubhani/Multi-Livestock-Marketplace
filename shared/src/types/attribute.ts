import type { AttributeType } from '../constants/attributes';

export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
  required: boolean;
  categoryIds: string[];
  sortOrder: number;
  isActive: boolean;
  filterable: boolean;
  showOnCard: boolean;
  createdAt?: string;
  updatedAt?: string;
}
