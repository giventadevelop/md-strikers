import { getAppUrl, getTenantId } from '@/lib/env';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import type { EventWithMedia } from '@/hooks/useEventsData';
import {
  computeFeaturedEventsFromMedia,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';

function normalizeEventsList(data: unknown): EventDetailsDTO[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: EventDetailsDTO[] }).content;
  }
  return [];
}

function isEventInNextYear(eventDate: string, today: Date): boolean {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  oneYearFromNow.setHours(23, 59, 59, 999);
  const [year, month, day] = eventDate.split('-').map(Number);
  const eventStartDate = new Date(year, month - 1, day);
  eventStartDate.setHours(0, 0, 0, 0);
  return eventStartDate >= today && eventStartDate <= oneYearFromNow;
}

export async function fetchFeaturedEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const baseUrl = getAppUrl();
    const tenantId = getTenantId();

    let eventsResponse = await fetch(
      `${baseUrl}/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`,
      { cache: 'no-store' }
    );

    if (!eventsResponse.ok) {
      eventsResponse = await fetch(
        `${baseUrl}/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`,
        { cache: 'no-store' }
      );
      if (!eventsResponse.ok) return [];
    }

    const events = normalizeEventsList(await eventsResponse.json());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(
      (e) => e.startDate && isEventInNextYear(e.startDate, today) && e.isActive
    );

    const eventsWithMedia: EventWithMedia[] = [];

    for (const event of upcomingEvents) {
      try {
        const mediaResponse = await fetch(
          `${baseUrl}/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${String(event.id)}`,
          { cache: 'no-store' }
        );

        let mediaArray: EventMediaDTO[] = [];
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          mediaArray = Array.isArray(mediaData) ? mediaData : mediaData ? [mediaData] : [];
        }
        eventsWithMedia.push({ event, media: mediaArray });
      } catch {
        eventsWithMedia.push({ event, media: [] });
      }
    }

    return computeFeaturedEventsFromMedia(eventsWithMedia);
  } catch {
    return [];
  }
}
