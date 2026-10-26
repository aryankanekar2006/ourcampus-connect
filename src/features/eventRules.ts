export type EventVisibilityInput = {
  status?: string | null;
  targetAudience?: string | null;
};

export const parseEventDates = (value: unknown): string[] => {
  const cleanDates = (dates: unknown[]) => [...new Set(
    dates
      .filter((date): date is string => typeof date === 'string' && date.trim().length > 0)
      .map((date) => date.trim())
  )];
  if (Array.isArray(value)) {
    return cleanDates(value);
  }
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? cleanDates(parsed)
      : [];
  } catch {
    return [];
  }
};

const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const isValidEventDateSelection = (event: {
  date?: unknown;
  dateMode?: unknown;
  endDate?: unknown;
  multipleDates?: unknown;
} | null | undefined) => {
  if (!event || typeof event !== 'object') return false;
  const dateMode = event.dateMode || 'single';
  const date = typeof event.date === 'string' ? event.date.trim() : '';
  if (!date || !isValidIsoDate(date)) return false;
  if (dateMode === 'single') return true;
  if (dateMode === 'range') {
    const endDate = typeof event.endDate === 'string' ? event.endDate.trim() : '';
    if (!endDate || !isValidIsoDate(endDate)) return false;
    const isoDate = /^\d{4}-\d{2}-\d{2}$/;
    return !isoDate.test(date) || !isoDate.test(endDate) || endDate >= date;
  }
  if (dateMode === 'multiple') {
    const dates = parseEventDates(event.multipleDates);
    return dates.length >= 2 && dates.includes(date) && dates.every(isValidIsoDate);
  }
  return false;
};

export const getEventDateLabel = (event: {
  date?: string | null;
  dateMode?: string | null;
  endDate?: string | null;
  multipleDates?: string | string[] | null;
} | null | undefined) => {
  if (!event || typeof event !== 'object') return 'Date to be announced';
  const date = event.date?.trim() || '';
  if (event.dateMode === 'multiple') {
    const dates = parseEventDates(event.multipleDates);
    if (dates.length) return dates.join(', ');
  }
  if (event.dateMode === 'range' && event.endDate?.trim()) {
    return `${date} to ${event.endDate.trim()}`;
  }
  return date || 'Date to be announced';
};

export const isEventVisibleToStudent = (
  event: EventVisibilityInput | null | undefined,
  studentClass?: string | null
) => {
  if (!event || typeof event !== 'object' || event.status !== 'approved') return false;
  const audience = event.targetAudience?.trim().toLowerCase();
  return !audience || audience === 'everyone' ||
    Boolean(studentClass?.trim() && audience === studentClass.trim().toLowerCase());
};

export const isEventEligibleForAttendance = (
  event: (EventVisibilityInput & { attendanceEnabled?: boolean | null }) | null | undefined,
  studentClass?: string | null
) => Boolean(event && event.attendanceEnabled === true && isEventVisibleToStudent(event, studentClass));
