export type EventArtwork = {
  status?: string | null;
  approvedFlyerImage?: string | null;
  selectedFlyerImage?: string | null;
  approvedCoverImage?: string | null;
  proposedFlyerImage?: string | null;
  proposedCoverImage?: string | null;
  image?: string | null;
};

const flyerElements = new Set([
  'title',
  'subtitle',
  'description',
  'highlights',
  'prizes',
  'dateTime',
  'venue',
  'speaker',
  'department',
  'audience'
]);
const flyerFonts = new Set([
  'Arial',
  'Georgia',
  'Trebuchet MS',
  'Verdana',
  'Tahoma',
  'Times New Roman',
  'Courier New'
]);

export const isValidFlyerDesign = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const design = value as Record<string, unknown>;
  if (!['academic', 'workshop', 'festival', 'culture', 'competition'].includes(String(design.template))) return false;
  if (!['top', 'middle', 'bottom'].includes(String(design.titlePosition))) return false;
  if (!design.styles || typeof design.styles !== 'object' || Array.isArray(design.styles)) return false;
  if (!design.text || typeof design.text !== 'object' || Array.isArray(design.text)) return false;

  const styles = design.styles as Record<string, unknown>;
  const text = design.text as Record<string, unknown>;
  if (Object.keys(styles).some((key) => !flyerElements.has(key)) ||
    Object.keys(text).some((key) => !flyerElements.has(key))) return false;
  if (Object.values(text).some((content) => typeof content !== 'string' || content.length > 1200)) return false;

  return Object.values(styles).every((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const style = entry as Record<string, unknown>;
    return Object.entries(style).every(([key, setting]) => {
      if (key === 'fontFamily') return typeof setting === 'string' && flyerFonts.has(setting);
      if (key === 'fontSize') return Number.isInteger(setting) && Number(setting) >= 10 && Number(setting) <= 72;
      if (key === 'fontWeight') return ['400', '500', '600', '700', '800', '900'].includes(String(setting));
      if (key === 'color') return typeof setting === 'string' && /^#[0-9a-fA-F]{6}$/.test(setting);
      if (key === 'alignment') return ['left', 'center', 'right'].includes(String(setting));
      if (key === 'lineHeight') return typeof setting === 'number' && setting >= 0.9 && setting <= 2;
      if (key === 'spacing') return Number.isInteger(setting) && Number(setting) >= 0 && Number(setting) <= 48;
      if (key === 'offset') return Number.isInteger(setting) && Number(setting) >= 0 && Number(setting) <= 48;
      if (key === 'shadow' || key === 'outline' || key === 'background') return typeof setting === 'boolean';
      return false;
    });
  });
};

export const isFacultyEventOwner = (
  event: { creatorEmail?: string | null } | null | undefined,
  email: string
) => Boolean(
  event &&
  typeof event.creatorEmail === 'string' &&
  event.creatorEmail.trim() &&
  event.creatorEmail.toLowerCase() === email.toLowerCase()
);

export const canEditEventArtwork = (
  user: { role?: string; email?: string } | null | undefined,
  event: { id?: unknown; creatorEmail?: string | null } | null | undefined,
  readOnly = false
) => Boolean(
  !readOnly &&
  user?.role === 'teacher' &&
  user.email &&
  (!event?.id || isFacultyEventOwner(event, user.email))
);

export const isValidImageDataUrl = (value: unknown, maxBytes = 8 * 1024 * 1024) => {
  if (typeof value !== 'string') return false;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;
  const base64 = match[2];
  if (base64.length % 4 !== 0) return false;
  const byteLength = Math.floor(base64.length * 3 / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  if (byteLength <= 0 || byteLength > maxBytes) return false;
  const bytes = Buffer.from(base64, 'base64');
  if (match[1] === 'png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (match[1] === 'jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP';
};

export const getStudentApprovedArtwork = (event: EventArtwork | null | undefined) => ({
  selectedFlyerImage: event?.status === 'approved'
    ? event.approvedFlyerImage || null
    : null,
  image: event?.status === 'approved'
    ? event.approvedCoverImage || null
    : null
});
