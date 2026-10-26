import { timingSafeEqual } from 'node:crypto';

export const matchesConfiguredRegistrationKey = (
  provided: unknown,
  configured: unknown
) => {
  if (typeof provided !== 'string' || typeof configured !== 'string' ||
    !provided.trim() || !configured.trim()) {
    return false;
  }

  const providedBytes = Buffer.from(provided.trim().toUpperCase());
  const configuredBytes = Buffer.from(configured.trim().toUpperCase());
  return providedBytes.length === configuredBytes.length &&
    timingSafeEqual(providedBytes, configuredBytes);
};
