import type { EventDetailsDTO } from '@/types';

/**
 * True for the recurring series parent (or explicit recurring flag).
 */
export function isRecurringEvent(event: EventDetailsDTO): boolean {
  if (event.isRecurring === true) return true;
  if (event.recurrenceSeriesId != null && event.id != null && event.recurrenceSeriesId === event.id) {
    return true;
  }
  return false;
}

type RecurrenceMeta = {
  frequency?: string;
  interval?: number;
};

function parseRecurrenceMeta(event: EventDetailsDTO): RecurrenceMeta | null {
  if (!event.eventRecurrenceMetadata) return null;
  try {
    const raw = JSON.parse(event.eventRecurrenceMetadata) as unknown;
    if (raw && typeof raw === 'object') return raw as RecurrenceMeta;
    return null;
  } catch {
    return null;
  }
}

/**
 * Next occurrence on/after `fromDate` (midnight-normalized), or null.
 */
export function getNextOccurrenceDate(event: EventDetailsDTO, fromDate: Date): Date | null {
  if (!event.startDate) return null;
  const [y, m, d] = event.startDate.split('-').map(Number);
  if (!y || !m || !d) return null;

  let cursor = new Date(y, m - 1, d);
  cursor.setHours(0, 0, 0, 0);

  const boundary = new Date(fromDate);
  boundary.setHours(0, 0, 0, 0);

  const meta = parseRecurrenceMeta(event);
  const freq = (meta?.frequency || 'WEEKLY').toString().toUpperCase();
  const interval = Math.max(1, meta?.interval ?? 1);

  for (let i = 0; i < 800; i++) {
    if (cursor.getTime() >= boundary.getTime()) {
      return cursor;
    }
    if (freq === 'DAILY') {
      cursor.setDate(cursor.getDate() + interval);
    } else if (freq === 'MONTHLY') {
      cursor.setMonth(cursor.getMonth() + interval);
    } else {
      cursor.setDate(cursor.getDate() + 7 * interval);
    }
  }
  return null;
}
