import assert from 'node:assert/strict';
import test from 'node:test';
import { isNotificationVisibleToUser } from './notificationRules.ts';

const student = { role: 'student', email: 'student@college.edu', studentClass: 'FYCS' };

test('notification visibility respects role, class audience, and private recipient', () => {
  assert.equal(isNotificationVisibleToUser({
    targetRole: 'student',
    targetAudience: 'FYCS'
  }, student), true);
  assert.equal(isNotificationVisibleToUser({
    targetRole: 'teacher',
    targetAudience: 'Everyone'
  }, student), false);
  assert.equal(isNotificationVisibleToUser({
    targetRole: 'student',
    targetAudience: 'SYCS'
  }, student), false);
  assert.equal(isNotificationVisibleToUser({
    targetRole: 'student',
    targetAudience: 'FYCS',
    recipientEmail: 'another@college.edu'
  }, student), false);
  assert.equal(isNotificationVisibleToUser({
    targetRole: 'student',
    targetAudience: 'FYCS',
    recipientEmail: 'STUDENT@COLLEGE.EDU'
  }, student), true);
});

test('notifications without role, audience, or recipient remain generally visible', () => {
  assert.equal(isNotificationVisibleToUser({}, student), true);
  assert.equal(isNotificationVisibleToUser(null, student), false);
  assert.equal(isNotificationVisibleToUser({ targetRole: 'student' }, null as any), false);
});
