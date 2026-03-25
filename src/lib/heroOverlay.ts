import type { EventDetailsDTO } from '@/types';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { isTicketedEventCube } from '@/lib/eventcube/utils';

const BUY_TICKETS_IMAGE = '/images/buy_tickets_click_here_red.webp';

export type HeroOverlayInfo = {
  href: string;
  image: string;
  alt: string;
};

/**
 * Returns overlay link + image for ticketed hero slides (matches charity hero / events page routing).
 */
export function getOverlayInfo(event: EventDetailsDTO | null | undefined): HeroOverlayInfo | null {
  if (!event?.id) return null;
  if (event.admissionType?.toUpperCase() !== 'TICKETED') return null;

  const id = event.id;
  let href = `/events/${id}/checkout`;
  if (isTicketedEventCube(event)) {
    href = `/events/${id}/eventcube-checkout`;
  } else if (isTicketedFundraiserEvent(event)) {
    href = `/events/${id}/givebutter-checkout`;
  }

  return {
    href,
    image: BUY_TICKETS_IMAGE,
    alt: 'Buy Tickets Click Here',
  };
}
