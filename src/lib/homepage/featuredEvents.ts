import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import type { EventWithMedia } from '@/hooks/useEventsData';

export const MAX_FEATURED_EVENTS_HOMEPAGE = 3;

export type FeaturedEventWithMedia = {
  event: EventDetailsDTO;
  media: EventMediaDTO;
};

function isDisplayDateValid(media: EventMediaDTO, today: Date): boolean {
  const displayDateValue = media.startDisplayingFromDate;
  if (!displayDateValue) return true;
  try {
    const [year, month, day] = displayDateValue.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day);
    displayDate.setHours(0, 0, 0, 0);
    return displayDate <= today;
  } catch {
    return true;
  }
}

/**
 * Picks featured homepage events from loaded event + media lists (same rules as client filter).
 */
export function computeFeaturedEventsFromMedia(eventsWithMedia: EventWithMedia[]): FeaturedEventWithMedia[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidates: FeaturedEventWithMedia[] = [];

  for (const { event, media } of eventsWithMedia) {
    const featuredMedia = media.filter((m) => {
      if (!m.isFeaturedEventImage) return false;
      return isDisplayDateValid(m, today);
    });

    if (featuredMedia.length === 0) continue;

    const sorted = [...featuredMedia].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );

    candidates.push({ event, media: sorted[0]! });
  }

  candidates.sort((a, b) => {
    const pa = a.event.featuredEventPriorityRanking ?? 999;
    const pb = b.event.featuredEventPriorityRanking ?? 999;
    if (pa !== pb) return pa - pb;
    return (a.event.id ?? 0) - (b.event.id ?? 0);
  });

  return candidates.slice(0, MAX_FEATURED_EVENTS_HOMEPAGE);
}
