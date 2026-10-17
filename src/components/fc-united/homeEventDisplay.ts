import type { EventDetailsDTO } from '@/types';
import { resolveRegisterTarget } from '@/lib/eventcube/utils';
import { eventAdmissionLabel, isUpcomingEventStartDate } from '@/lib/homepage/homepageEventBands';
import type { SpotlightItem } from './EventSpotlightSection';
import type { BandEvent } from './OnSaleBand';

export const DEFAULT_EVENT_IMAGE = '/images/default_placeholder_hero_image.jpeg';

export type EventWithImage = { event: EventDetailsDTO; imageUrl?: string | null };

export function formatEventDate(dateString?: string, timezone?: string): string {
  if (!dateString) return '';
  try {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: timezone || undefined,
    });
  } catch {
    return dateString;
  }
}

function formatEventTime(startTime?: string, endTime?: string): string {
  if (startTime && endTime) return `${startTime} — ${endTime}`;
  return startTime || endTime || '';
}

export function eventHref(event: EventDetailsDTO): string {
  return event.id ? `/events/${event.id}` : '/events';
}

function plainText(html: string | undefined, max: number): string {
  const text = (html || '').replace(/<[^>]+>/g, '').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Past → View event; ticketed → Get tickets; registration → Register; else View event. */
function primaryAction(event: EventDetailsDTO): SpotlightItem['primary'] {
  if (!isUpcomingEventStartDate(event.startDate)) return { label: 'View event', href: eventHref(event) };
  if (eventAdmissionLabel(event) === 'Ticketed') return { label: 'Get tickets', href: eventHref(event) };
  const register = resolveRegisterTarget(event);
  if (register) return { label: 'Register', href: register.href, external: register.kind === 'external' };
  return { label: 'View event', href: eventHref(event) };
}

export function eventToSpotlightItem({ event, imageUrl }: EventWithImage, label: string): SpotlightItem {
  const details = [
    { label: 'Date', value: formatEventDate(event.startDate, event.timezone) },
    { label: 'Time', value: formatEventTime(event.startTime, event.endTime) },
    { label: 'Venue', value: event.location?.trim() || '' },
    {
      label: 'Admission',
      value: `${eventAdmissionLabel(event)}${event.isRegistrationRequired ? ' · registration required' : ''}`,
    },
  ].filter((row) => row.value);

  return {
    key: `event-${event.id ?? event.title}`,
    label,
    title: event.title,
    description: plainText(event.description, 220),
    image: imageUrl || DEFAULT_EVENT_IMAGE,
    details,
    primary: primaryAction(event),
    secondary: { label: 'All events', href: '/events' },
  };
}

export function eventToBandEvent({ event, imageUrl }: EventWithImage, isFeatured: boolean): BandEvent {
  const isTicketed = eventAdmissionLabel(event) === 'Ticketed';
  return {
    key: `event-${event.id ?? event.title}`,
    title: event.title,
    src: imageUrl || DEFAULT_EVENT_IMAGE,
    startDate: event.startDate,
    dateTime: [formatEventDate(event.startDate, event.timezone), formatEventTime(event.startTime, event.endTime)]
      .filter(Boolean)
      .join(' · '),
    venue: event.location?.trim() || '',
    isFeatured,
    isTicketed,
    registrationUrl: isTicketed ? undefined : resolveRegisterTarget(event)?.href,
    href: eventHref(event),
  };
}
