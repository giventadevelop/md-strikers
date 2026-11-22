import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';
import type { EventDetailsDTO } from '@/types';
import {
  computeFeaturedEventsFromMedia,
  isPastHomepageEvent,
  MAX_FEATURED_EVENTS_HOMEPAGE,
  selectHomepageFeaturedEvents,
  type EventWithMedia,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';
import {
  isTruthyApiFlag,
  normalizeEventDetailsList,
  normalizeEventMediasList,
} from '@/lib/homepage/homepageApiNormalize';

function localDate(dateValue: string): Date | null {
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Still running or not yet started, and starting within the next year. */
function isCurrentHomepageEvent(event: EventDetailsDTO, today: Date): boolean {
  if (!event.startDate || event.isActive === false) return false;
  const start = localDate(event.startDate);
  const end = localDate(event.endDate || event.startDate);
  if (!start || !end || end < today) return false;
  const horizon = new Date(today);
  horizon.setFullYear(today.getFullYear() + 1);
  horizon.setHours(23, 59, 59, 999);
  return start <= horizon;
}

function eventIsFeatured(event: EventDetailsDTO): boolean {
  const row = event as EventDetailsDTO & Record<string, unknown>;
  return isTruthyApiFlag(row.isFeaturedEvent) || isTruthyApiFlag(row.is_featured_event);
}

/**
 * Server-only: featured events for homepage SSR / later UI wiring.
 * Prefers upcoming active featured; falls back to any active featured (incl. past).
 * Fails closed to [].
 */
export async function fetchFeaturedEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const apiBase = getApiBaseUrl();
    const tenantId = getTenantId();

    let eventsResponse = await fetchWithJwtRetry(
      `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`,
      { cache: 'no-store' }
    );

    if (!eventsResponse.ok) {
      eventsResponse = await fetchWithJwtRetry(
        `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`,
        { cache: 'no-store' }
      );
    }

    if (!eventsResponse.ok) {
      console.warn('[fetchFeaturedEventsForHomepageServer] event-details failed:', eventsResponse.status);
      return [];
    }

    const events = normalizeEventDetailsList(await eventsResponse.json());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter((event) => isCurrentHomepageEvent(event, today));
    const upcomingFeatured = upcomingEvents.filter(eventIsFeatured);

    // Upcoming featured first. Past featured only when there are no future events.
    const eventsToLoad =
      upcomingFeatured.length > 0
        ? upcomingFeatured
        : upcomingEvents.length === 0
          ? events.filter(
              (event) => event.isActive !== false && isPastHomepageEvent(event) && eventIsFeatured(event)
            )
          : [];

    if (eventsToLoad.length === 0) {
      return [];
    }

    const eventsWithMedia: EventWithMedia[] = [];

    for (const event of eventsToLoad) {
      try {
        let mediaResponse = await fetchWithJwtRetry(
          `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isFeaturedEventImage.equals=true`,
          { cache: 'no-store' }
        );
        let mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHomePageHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&size=50`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok ? normalizeEventMediasList(await mediaResponse.json()) : [];
        }

        eventsWithMedia.push({ event, media: mediaArray });
      } catch {
        eventsWithMedia.push({ event, media: [] });
      }
    }

    return selectHomepageFeaturedEvents(
      computeFeaturedEventsFromMedia(eventsWithMedia),
      upcomingEvents.length > 0,
      MAX_FEATURED_EVENTS_HOMEPAGE
    );
  } catch (e) {
    logServerFetchFailure('fetchFeaturedEventsForHomepageServer', e);
    return [];
  }
}
