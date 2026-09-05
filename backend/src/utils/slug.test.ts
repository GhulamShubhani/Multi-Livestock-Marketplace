import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ensureUniqueSlug, slugify } from './slug';

describe('slugify', () => {
  it('normalizes titles for SEO-friendly listing URLs', () => {
    assert.equal(slugify('Gir Cow for Sale — Patna'), 'gir-cow-for-sale-patna');
    assert.equal(slugify('  Khassi / Male Goat  '), 'khassi-male-goat');
  });
});

describe('ensureUniqueSlug', () => {
  it('appends a counter when the slug already exists', async () => {
    const taken = new Set(['gir-cow', 'gir-cow-2']);
    const slug = await ensureUniqueSlug('Gir Cow', async (s) => taken.has(s));
    assert.equal(slug, 'gir-cow-3');
  });
});
