export type LoginCandidate = {
  email: string;
  rollNo: string | null;
  facultyId: string | null;
  adminId: string | null;
};

export type LoginIdentityMatch<T> =
  | { status: 'found'; candidate: T }
  | { status: 'not-found' }
  | { status: 'ambiguous' };

const normalizeIdentifier = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const findLoginIdentityMatch = <T extends Partial<LoginCandidate>>(
  candidates: T[],
  identifier: string
): LoginIdentityMatch<T> => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) return { status: 'not-found' };

  const emailMatches = candidates.filter((candidate) => {
    const email = normalizeIdentifier(candidate.email);
    return Boolean(email) && email === normalizedIdentifier;
  });

  if (emailMatches.length === 1) return { status: 'found', candidate: emailMatches[0] };
  if (emailMatches.length > 1) return { status: 'ambiguous' };

  const identifierMatches = candidates.filter((candidate) =>
    [candidate.rollNo, candidate.facultyId, candidate.adminId].some((value) => {
      const normalizedValue = normalizeIdentifier(value);
      return Boolean(normalizedValue) && normalizedValue === normalizedIdentifier;
    })
  );

  if (identifierMatches.length === 1) {
    return { status: 'found', candidate: identifierMatches[0] };
  }
  return identifierMatches.length > 1 ? { status: 'ambiguous' } : { status: 'not-found' };
};
