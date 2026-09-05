import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ALL_PERMISSION_KEYS, PERMISSIONS, ROLES, SYSTEM_ROLES } from './auth';

describe('RBAC constants', () => {
  it('includes livestock marketplace roles', () => {
    assert.ok(SYSTEM_ROLES.includes(ROLES.SELLER));
    assert.ok(SYSTEM_ROLES.includes(ROLES.BUYER));
    assert.ok(SYSTEM_ROLES.includes(ROLES.SUPER_ADMIN));
  });

  it('uses listings permissions instead of cats', () => {
    assert.equal(PERMISSIONS.LISTINGS_CREATE, 'listings:create');
    assert.equal(PERMISSIONS.LISTINGS_VERIFY, 'listings:verify');
    assert.ok(!ALL_PERMISSION_KEYS.some((key) => key.startsWith('cats:')));
  });

  it('includes UPI payment verification permission', () => {
    assert.equal(PERMISSIONS.PAYMENTS_VERIFY, 'payments:verify');
    assert.ok(ALL_PERMISSION_KEYS.includes(PERMISSIONS.ATTRIBUTES_CREATE));
    assert.ok(ALL_PERMISSION_KEYS.includes(PERMISSIONS.ENQUIRIES_READ));
    assert.ok(ALL_PERMISSION_KEYS.includes(PERMISSIONS.HOMEPAGE_UPDATE));
  });
});
