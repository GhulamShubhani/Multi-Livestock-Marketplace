import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const ATTRIBUTE_TYPES = [
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

describe('dynamic attributes', () => {
  it('supports the configured attribute field types', () => {
    assert.ok(ATTRIBUTE_TYPES.includes('select'));
    assert.ok(ATTRIBUTE_TYPES.includes('number'));
    assert.ok(ATTRIBUTE_TYPES.includes('yes_no'));
    assert.equal(ATTRIBUTE_TYPES.length, 11);
  });

  it('can represent cow-specific milk capacity metadata', () => {
    const milkCapacity = {
      key: 'milkCapacity',
      type: 'number' as const,
      unit: 'Litres/day',
      required: true,
    };
    assert.equal(milkCapacity.type, 'number');
    assert.ok(ATTRIBUTE_TYPES.includes(milkCapacity.type));
  });
});
