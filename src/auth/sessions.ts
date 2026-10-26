import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'ourcampus_session';
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export type SessionRole = 'student' | 'teacher' | 'admin';

export type SessionUser = {
  id: number;
  role: SessionRole;
  isVerified: boolean | null;
  verificationStatus?: string | null;
};

export type StoredSession = {
  expiresAt: Date;
  user: SessionUser | null;
};

export type SessionRepository = {
  insert: (tokenHash: string, userId: number, expiresAt: Date) => Promise<void>;
  find: (tokenHash: string) => Promise<StoredSession | null>;
  delete: (tokenHash: string) => Promise<void>;
  deleteForUser: (userId: number) => Promise<void>;
};

export const hashSessionToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export const createSessionToken = () => randomBytes(32).toString('base64url');

export const isSessionRole = (role: unknown): role is SessionRole =>
  role === 'student' || role === 'teacher' || role === 'admin';

export const sanitizeSessionUser = <T extends object>(user: T | null | undefined): Omit<T, 'password' | 'passwordHash'> => {
  if (!user || typeof user !== 'object') return {} as Omit<T, 'password' | 'passwordHash'>;
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => key !== 'password' && key !== 'passwordHash')
  ) as Omit<T, 'password' | 'passwordHash'>;
};

export const isSessionUserAllowed = (
  user: SessionUser,
  roles: readonly SessionRole[],
  requireVerifiedFaculty = false
) =>
  roles.includes(user.role) &&
  (!requireVerifiedFaculty || user.role !== 'teacher' || user.isVerified === true);

export const isFacultyAccessApproved = (user: {
  role: unknown;
  isVerified: boolean | null;
  verificationStatus?: string | null;
}) =>
  user.role !== 'teacher' ||
  (user.isVerified === true && user.verificationStatus === 'approved');

export const serializeSessionCookie = (token: string, secure: boolean) =>
  `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_MS / 1000}${secure ? '; Secure' : ''}`;

export const serializeClearedSessionCookie = (secure: boolean) =>
  `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;

export const readSessionCookie = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(part => part.trim())
    .filter(part => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (cookies.length !== 1) return null;
  const cookie = cookies[0];
  const token = cookie?.slice(SESSION_COOKIE_NAME.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
};

export const createSessionManager = (
  repository: SessionRepository,
  now: () => number = Date.now
) => ({
  async create(userId: number) {
    const token = createSessionToken();
    const expiresAt = new Date(now() + SESSION_MAX_AGE_MS);
    await repository.insert(hashSessionToken(token), userId, expiresAt);
    return { token, expiresAt };
  },

  async resolve(token: string | null) {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const tokenHash = hashSessionToken(token);
    const stored = await repository.find(tokenHash);
    if (!stored) return null;
    if (stored.expiresAt.getTime() <= now() || !stored.user || !isSessionRole(stored.user.role)) {
      await repository.delete(tokenHash);
      return null;
    }
    return stored.user;
  },

  async revoke(token: string | null) {
    if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      await repository.delete(hashSessionToken(token));
    }
  },

  revokeForUser: (userId: number) => repository.deleteForUser(userId)
});
