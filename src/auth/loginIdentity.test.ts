import assert from 'node:assert/strict';
import test from 'node:test';
import { findLoginIdentityMatch } from './loginIdentity.ts';

const accounts = [
  { id: 1, email: 'student@example.edu', rollNo: 'STU-1', facultyId: null, adminId: null },
  { id: 2, email: 'other@example.edu', rollNo: 'STU-2', facultyId: null, adminId: null }
];

const matchedId = (identifier: string) => {
  const match = findLoginIdentityMatch(accounts, identifier);
  return match.status === 'found' ? match.candidate.id : null;
};

test('login identity resolves email and case-insensitive account IDs', () => {
  assert.equal(matchedId(' STUDENT@example.edu '), 1);
  assert.equal(matchedId(' stu-2 '), 2);
});

test('login identity rejects ambiguous identifiers instead of selecting an arbitrary account', () => {
  const duplicateRoll = [
    accounts[0],
    { id: 3, email: 'third@example.edu', rollNo: 'stu-1', facultyId: null, adminId: null }
  ];

  assert.deepEqual(findLoginIdentityMatch(duplicateRoll, 'STU-1'), { status: 'ambiguous' });
  const emailMatch = findLoginIdentityMatch(duplicateRoll, 'student@example.edu');
  assert.equal(emailMatch.status === 'found' ? emailMatch.candidate.id : null, 1);
});

test('login identity reports identifiers that do not match an account', () => {
  assert.deepEqual(findLoginIdentityMatch(accounts, 'missing'), { status: 'not-found' });
  assert.deepEqual(findLoginIdentityMatch([
    { email: null as unknown as string, rollNo: 'STU-3', facultyId: null, adminId: null }
  ], 'stu-3'), { status: 'found', candidate: { email: null, rollNo: 'STU-3', facultyId: null, adminId: null } });
  assert.deepEqual(findLoginIdentityMatch(accounts, '   '), { status: 'not-found' });
});
