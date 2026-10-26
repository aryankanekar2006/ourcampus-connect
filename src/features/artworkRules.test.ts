import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canEditEventArtwork,
  getStudentApprovedArtwork,
  isFacultyEventOwner,
  isValidFlyerDesign,
  isValidImageDataUrl
} from './artworkRules.ts';

test('artwork upload validation accepts supported image data and rejects invalid or oversized data', () => {
  assert.equal(isValidImageDataUrl('data:image/png;base64,iVBORw0KGgo='), true);
  assert.equal(isValidImageDataUrl('data:image/jpeg;base64,/9j/2Q=='), true);
  const webpHeader = Buffer.from('RIFF....WEBP', 'ascii').toString('base64');
  assert.equal(isValidImageDataUrl(`data:image/webp;base64,${webpHeader}`), true);
  assert.equal(isValidImageDataUrl('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isValidImageDataUrl('data:image/png;base64,not valid'), false);
  assert.equal(isValidImageDataUrl('data:image/png;base64,YWJjZA==', 3), false);
});

test('faculty ownership checks are case-insensitive and reject missing owners', () => {
  assert.equal(isFacultyEventOwner({ creatorEmail: 'Faculty@college.edu' }, 'faculty@college.edu'), true);
  assert.equal(isFacultyEventOwner({ creatorEmail: null }, 'faculty@college.edu'), false);
});

test('flyer editing is limited to faculty owners and disabled in read-only views', () => {
  const ownerEvent = { id: 12, creatorEmail: 'faculty@college.edu' };
  assert.equal(canEditEventArtwork({ role: 'teacher', email: 'faculty@college.edu' }, ownerEvent), true);
  assert.equal(canEditEventArtwork({ role: 'teacher', email: 'other@college.edu' }, ownerEvent), false);
  assert.equal(canEditEventArtwork({ role: 'student', email: 'faculty@college.edu' }, ownerEvent), false);
  assert.equal(canEditEventArtwork({ role: 'admin', email: 'faculty@college.edu' }, ownerEvent), false);
  assert.equal(canEditEventArtwork({ role: 'teacher', email: 'faculty@college.edu' }, ownerEvent, true), false);
  assert.equal(canEditEventArtwork({ role: 'teacher', email: 'faculty@college.edu' }, {}), true);
});

test('flyer design validation only accepts supported templates and safe per-element styling', () => {
  const design = {
    template: 'academic',
    titlePosition: 'middle',
    text: { title: 'Annual Research Symposium' },
    styles: {
      title: {
        fontFamily: 'Georgia',
        fontSize: 42,
        fontWeight: '800',
        color: '#ffffff',
        alignment: 'center',
        lineHeight: 1.1,
        spacing: 8,
        shadow: true,
        outline: false,
        background: false
      }
    }
  };
  assert.equal(isValidFlyerDesign(design), true);
  assert.equal(isValidFlyerDesign({ ...design, template: 'unknown' }), false);
  assert.equal(isValidFlyerDesign({ ...design, styles: { title: { color: 'red' } } }), false);
  assert.equal(isValidFlyerDesign({ ...design, text: { script: '<img>' } }), false);
});

test('students receive only artwork explicitly approved by the Principal', () => {
  assert.deepEqual(getStudentApprovedArtwork({
    status: 'pending_approval',
    proposedFlyerImage: 'hidden',
    selectedFlyerImage: 'old'
  }), { selectedFlyerImage: null, image: null });
  assert.deepEqual(getStudentApprovedArtwork({
    status: 'approved',
    approvedFlyerImage: 'final',
    approvedCoverImage: 'cover'
  }), { selectedFlyerImage: 'final', image: 'cover' });
  assert.deepEqual(getStudentApprovedArtwork({
    status: 'approved',
    selectedFlyerImage: 'legacy'
  }), { selectedFlyerImage: null, image: null });
  assert.deepEqual(getStudentApprovedArtwork({
    status: 'approved',
    image: 'unreviewed-cover'
  }), { selectedFlyerImage: null, image: null });
});
