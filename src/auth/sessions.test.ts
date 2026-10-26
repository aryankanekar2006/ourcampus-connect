import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSessionManager,
  hashSessionToken,
  isFacultyAccessApproved,
  isSessionUserAllowed,
  readSessionCookie,
  SESSION_MAX_AGE_MS,
  SESSION_COOKIE_NAME,
  sanitizeSessionUser,
  serializeClearedSessionCookie,
  serializeSessionCookie,
  type SessionRepository,
  type SessionUser,
  type StoredSession
} from './sessions.ts';

const makeRepository = () => {
  const records = new Map<string, StoredSession & { userId: number }>();
  const repository: SessionRepository = {
    async insert(tokenHash, userId, expiresAt) {
      records.set(tokenHash, {
        userId,
        expiresAt,
        user: { id: userId, role: 'student', isVerified: true, verificationStatus: 'approved' }
      });
    },
    async find(tokenHash) {
      const record = records.get(tokenHash);
      return record ? { expiresAt: record.expiresAt, user: record.user } : null;
    },
    async delete(tokenHash) {
      records.delete(tokenHash);
    },
    async deleteForUser(userId) {
      for (const [tokenHash, record] of records) {
        if (record.userId === userId) records.delete(tokenHash);
      }
    }
  };
  return { repository, records };
};

test('sessions store only a token digest and resolve to the current user', async () => {
  const { repository, records } = makeRepository();
  const sessions = createSessionManager(repository);
  const created = await sessions.create(42);

  assert.equal(records.size, 1);
  assert.equal(records.has(created.token), false);
  assert.deepEqual(await sessions.resolve(created.token), {
    id: 42,
    role: 'student',
    isVerified: true,
    verificationStatus: 'approved'
  });
});

test('missing, malformed, unknown, and expired sessions are unauthenticated', async () => {
  let now = 10_000;
  const { repository, records } = makeRepository();
  const sessions = createSessionManager(repository, () => now);
  const created = await sessions.create(7);

  assert.equal(await sessions.resolve(null), null);
  assert.equal(await sessions.resolve('invalid'), null);
  assert.equal(await sessions.resolve('A'.repeat(43)), null);
  now += SESSION_MAX_AGE_MS;
  assert.equal(await sessions.resolve(created.token), null);
  assert.equal(records.size, 0);
});

test('logout invalidates the session', async () => {
  const { repository } = makeRepository();
  const sessions = createSessionManager(repository);
  const created = await sessions.create(5);

  await sessions.revoke(created.token);
  assert.equal(await sessions.resolve(created.token), null);
});

test('role authorization rejects wrong roles and unverified faculty', () => {
  const student: SessionUser = { id: 1, role: 'student', isVerified: true, verificationStatus: 'approved' };
  const faculty: SessionUser = { id: 2, role: 'teacher', isVerified: false, verificationStatus: 'pending' };

  assert.equal(isSessionUserAllowed(student, ['student']), true);
  assert.equal(isSessionUserAllowed(student, ['admin']), false);
  assert.equal(isSessionUserAllowed(faculty, ['teacher'], true), false);
  assert.equal(isSessionUserAllowed({ ...faculty, isVerified: true }, ['teacher'], true), true);
});

test('faculty access requires both persistent approval fields', () => {
  const faculty: SessionUser = { id: 2, role: 'teacher', isVerified: false, verificationStatus: 'pending' };

  assert.equal(isFacultyAccessApproved(faculty), false);
  assert.equal(isFacultyAccessApproved({ ...faculty, verificationStatus: 'rejected' }), false);
  assert.equal(isFacultyAccessApproved({ ...faculty, isVerified: true, verificationStatus: 'revoked' }), false);
  assert.equal(isFacultyAccessApproved({ ...faculty, isVerified: true, verificationStatus: 'approved' }), true);
  assert.equal(isFacultyAccessApproved({ ...faculty, role: 'admin' }), true);
});

test('session cookies are HttpOnly, SameSite=Lax, and cleared on logout', () => {
  const cookie = serializeSessionCookie('token', true);
  const cleared = serializeClearedSessionCookie(true);

  assert.match(cookie, new RegExp(`^${SESSION_COOKIE_NAME}=token;`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /; Secure/);
  assert.match(cleared, /Max-Age=0/);
  assert.doesNotMatch(cleared, /token/);
  assert.equal(hashSessionToken('token').includes('token'), false);
  assert.equal(readSessionCookie(`${SESSION_COOKIE_NAME}=A`), null);
});

test('session cookie extraction accepts only a well-formed session value', () => {
  const token = 'A'.repeat(43);
  assert.equal(readSessionCookie(`other=x; ${SESSION_COOKIE_NAME}=${token}`), token);
  assert.equal(readSessionCookie(`${SESSION_COOKIE_NAME}=short`), null);
  assert.equal(readSessionCookie(undefined), null);
  assert.equal(readSessionCookie(`${SESSION_COOKIE_NAME}=${token}; ${SESSION_COOKIE_NAME}=other`), null);
});

test('session user serialization excludes plaintext and hashed credentials', () => {
  assert.deepEqual(
    sanitizeSessionUser({ id: 1, role: 'student', password: 'not-returned', passwordHash: 'also-not-returned' }),
    { id: 1, role: 'student' }
  );
});
