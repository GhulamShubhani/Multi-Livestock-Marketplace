export const ATTRIBUTE_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DECIMAL: 'decimal',
  BOOLEAN: 'boolean',
  DATE: 'date',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  RADIO: 'radio',
  TEXTAREA: 'textarea',
  YES_NO: 'yes_no',
  IMAGE: 'image',
} as const;

export type AttributeType = (typeof ATTRIBUTE_TYPES)[keyof typeof ATTRIBUTE_TYPES];

export const ATTRIBUTE_TYPE_VALUES = Object.values(ATTRIBUTE_TYPES);
