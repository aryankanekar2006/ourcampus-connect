import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'node:crypto';

const HASH_PREFIX = 'scrypt$v1$';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 1024;

// Preserve historical trim-on-entry behavior; investigate any stored legacy password longer than this bound before rollout.
export const normalizePassword = (value: unknown) => {
  if (typeof value !== 'string' || value.length > MAX_PASSWORD_LENGTH) return null;
  const normalized = value.trim();
  return normalized.length >= MIN_PASSWORD_LENGTH ? normalized : null;
};

const deriveKey = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, KEY_BYTES, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });

export const hashPassword = async (password: string) => {
  const normalizedPassword = normalizePassword(password);
  if (normalizedPassword === null) {
    throw new TypeError('Password does not satisfy the password policy.');
  }
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(normalizedPassword, salt);
  return `${HASH_PREFIX}${salt.toString('hex')}$${key.toString('hex')}`;
};

const verifyPasswordHash = async (password: string, encodedHash: string) => {
  const match = /^scrypt\$v1\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(encodedHash);
  if (!match) return false;

  const salt = Buffer.from(match[1], 'hex');
  const expectedKey = Buffer.from(match[2], 'hex');
  const actualKey = await deriveKey(password, salt);
  return timingSafeEqual(actualKey, expectedKey);
};

export const verifyStoredPassword = async (
  password: string,
  legacyPassword: string | null,
  passwordHash: string | null
) => {
  const normalizedPassword = normalizePassword(password);
  if (normalizedPassword === null) {
    return { valid: false, needsUpgrade: passwordHash === null && legacyPassword !== null };
  }

  if (passwordHash !== null) {
    return {
      valid: await verifyPasswordHash(normalizedPassword, passwordHash),
      needsUpgrade: false
    };
  }

  if (legacyPassword === null) {
    return { valid: false, needsUpgrade: false };
  }

  const candidateDigest = createHash('sha256').update(normalizedPassword).digest();
  const legacyDigest = createHash('sha256').update(legacyPassword).digest();
  return {
    valid: timingSafeEqual(candidateDigest, legacyDigest),
    needsUpgrade: true
  };
};
