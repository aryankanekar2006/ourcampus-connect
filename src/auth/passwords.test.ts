import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hashPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizePassword,
  verifyStoredPassword
} from './passwords.ts';

test('hashes a password and verifies the hash', async () => {
  const hash = await hashPassword('correct horse battery staple');

  assert.notEqual(hash, 'correct horse battery staple');
  assert.equal((await verifyStoredPassword('correct horse battery staple', null, hash)).valid, true);
  assert.equal((await verifyStoredPassword('incorrect password', null, hash)).valid, false);
});

test('accepts a legacy password and marks it for upgrade', async () => {
  assert.deepEqual(
    await verifyStoredPassword('legacy password', 'legacy password', null),
    { valid: true, needsUpgrade: true }
  );
  assert.deepEqual(
    await verifyStoredPassword('incorrect password', 'legacy password', null),
    { valid: false, needsUpgrade: true }
  );
});

test('rejects malformed hashes and accounts without credentials', async () => {
  assert.deepEqual(
    await verifyStoredPassword('password', null, 'scrypt$v1$malformed'),
    { valid: false, needsUpgrade: false }
  );
  assert.deepEqual(
    await verifyStoredPassword('password', null, null),
    { valid: false, needsUpgrade: false }
  );
});

test('normalizes passwords consistently and enforces the input bound', () => {
  assert.equal(normalizePassword('  valid password  '), 'valid password');
  assert.equal(normalizePassword(' 12345 '), null);
  assert.equal(normalizePassword('x'.repeat(MAX_PASSWORD_LENGTH + 1)), null);
  assert.equal(normalizePassword(null), null);
  assert.equal(MIN_PASSWORD_LENGTH, 6);
});

test('hashes and verifies the normalized password without logging raw input', async () => {
  const hash = await hashPassword('  normalized password  ');

  assert.equal((await verifyStoredPassword('normalized password', null, hash)).valid, true);
  await assert.rejects(() => hashPassword('short'));
});

test('legacy verification preserves the historical trim behavior', async () => {
  assert.equal(
    (await verifyStoredPassword('  legacy password  ', 'legacy password', null)).valid,
    true
  );
});

test('a concurrent password change prevents the old legacy password from verifying', async () => {
  const changedHash = await hashPassword('replacement password');
  const result = await verifyStoredPassword('legacy password', null, changedHash);

  assert.deepEqual(result, { valid: false, needsUpgrade: false });
});
