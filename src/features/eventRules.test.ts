import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEventDateLabel,
  isEventEligibleForAttendance,
  isEventVisibleToStudent,
  isValidEventDateSelection,
  parseEventDates
} from './eventRules.ts';

test('formats single, range, and multiple event dates consistently', () => {
  assert.equal(getEventDateLabel({ date: '2026-10-12', dateMode: 'single' }), '2026-10-12');
  assert.equal(getEventDateLabel({
    date: '2026-10-12',
    endDate: '2026-10-14',
    dateMode: 'range'
  }), '2026-10-12 to 2026-10-14');
  assert.equal(getEventDateLabel({
    date: '2026-10-12',
    multipleDates: '["2026-10-12","2026-10-19"]',
    dateMode: 'multiple'
  }), '2026-10-12, 2026-10-19');
});

test('safely handles legacy and malformed multiple-date values', () => {
  assert.deepEqual(parseEventDates('not-json'), []);
  assert.deepEqual(parseEventDates(['2026-10-12', null, '']), ['2026-10-12']);
  assert.equal(getEventDateLabel({ date: 'legacy date', dateMode: 'multiple', multipleDates: '{' }), 'legacy date');
});

test('validates complete event date selections', () => {
  assert.equal(isValidEventDateSelection({ dateMode: 'single', date: 'legacy date' }), true);
  assert.equal(isValidEventDateSelection({
    dateMode: 'range',
    date: '2026-10-12',
    endDate: '2026-10-14'
  }), true);
  assert.equal(isValidEventDateSelection({
    dateMode: 'range',
    date: '2026-10-14',
    endDate: '2026-10-12'
  }), false);
  assert.equal(isValidEventDateSelection({ dateMode: 'single', date: '2026-02-31' }), false);
  assert.equal(isValidEventDateSelection({
    dateMode: 'multiple',
    date: '2026-10-12',
    multipleDates: '["2026-10-12","2026-10-19"]'
  }), true);
  assert.equal(isValidEventDateSelection({
    dateMode: 'multiple',
    date: '2026-10-12',
    multipleDates: '["2026-10-12"]'
  }), false);
});

test('students only see approved events intended for their audience', () => {
  assert.equal(isEventVisibleToStudent({ status: 'approved', targetAudience: 'Everyone' }, 'FYCS'), true);
  assert.equal(isEventVisibleToStudent({ status: 'approved', targetAudience: 'fycs' }, 'FYCS'), true);
  assert.equal(isEventVisibleToStudent({ status: 'approved', targetAudience: 'SYCS' }, 'FYCS'), false);
  assert.equal(isEventVisibleToStudent({ status: 'pending_approval', targetAudience: 'Everyone' }, 'FYCS'), false);
  assert.equal(isEventVisibleToStudent({ targetAudience: 'Everyone' }, 'FYCS'), false);
});

test('students can request attendance only for approved enabled events in their audience', () => {
  assert.equal(isEventEligibleForAttendance({
    status: 'approved',
    targetAudience: 'FYCS',
    attendanceEnabled: true
  }, 'FYCS'), true);
  assert.equal(isEventEligibleForAttendance({
    status: 'pending_approval',
    targetAudience: 'FYCS',
    attendanceEnabled: true
  }, 'FYCS'), false);
  assert.equal(isEventEligibleForAttendance({
    status: 'approved',
    targetAudience: 'SYCS',
    attendanceEnabled: true
  }, 'FYCS'), false);
  assert.equal(isEventEligibleForAttendance({
    status: 'approved',
    targetAudience: 'FYCS',
    attendanceEnabled: false
  }, 'FYCS'), false);
  assert.equal(isEventVisibleToStudent(null as any, 'FYCS'), false);
  assert.equal(isEventEligibleForAttendance(null as any, 'FYCS'), false);
});
