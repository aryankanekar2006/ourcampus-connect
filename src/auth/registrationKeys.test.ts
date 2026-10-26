import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesConfiguredRegistrationKey } from './registrationKeys.ts';

test('registration keys compare without case sensitivity or surrounding whitespace', () => {
  assert.equal(matchesConfiguredRegistrationKey('  Faculty-Secret  ', 'faculty-secret'), true);
});

test('missing, empty, and mismatched registration keys are rejected', () => {
  assert.equal(matchesConfiguredRegistrationKey(undefined, 'faculty-secret'), false);
  assert.equal(matchesConfiguredRegistrationKey('faculty-secret', undefined), false);
  assert.equal(matchesConfiguredRegistrationKey('', 'faculty-secret'), false);
  assert.equal(matchesConfiguredRegistrationKey('short', 'faculty-secret'), false);
  assert.equal(matchesConfiguredRegistrationKey('faculty-secret', 'different-secret'), false);
});
