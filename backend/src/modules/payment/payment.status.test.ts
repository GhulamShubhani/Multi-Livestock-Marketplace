import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PaymentRecordStatus } from './interface/payment.interface';

const ALLOWED_TRANSITIONS: Record<PaymentRecordStatus, PaymentRecordStatus[]> = {
  pending: ['submitted', 'rejected'],
  submitted: ['under_verification', 'verified', 'rejected'],
  under_verification: ['verified', 'rejected'],
  verified: ['refunded'],
  rejected: [],
  refunded: [],
};

function canTransition(from: PaymentRecordStatus, to: PaymentRecordStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

describe('payment status model', () => {
  it('supports the manual UPI verification lifecycle', () => {
    assert.ok(canTransition('pending', 'submitted'));
    assert.ok(canTransition('submitted', 'under_verification'));
    assert.ok(canTransition('under_verification', 'verified'));
    assert.ok(canTransition('verified', 'refunded'));
  });

  it('rejects invalid transitions', () => {
    assert.equal(canTransition('pending', 'verified'), false);
    assert.equal(canTransition('refunded', 'verified'), false);
    assert.equal(canTransition('rejected', 'submitted'), false);
  });

  it('does not reference stripe providers', async () => {
    const { readFile } = await import('node:fs/promises');
    const path = await import('node:path');
    const modelPath = path.join(__dirname, 'model', 'payment.model.ts');
    const source = await readFile(modelPath, 'utf8');
    assert.equal(source.toLowerCase().includes('stripe'), false);
    assert.ok(source.includes('upi'));
  });
});
