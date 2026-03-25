import type { EventDetailsDTO } from '@/types';

/** Ticketed event that uses Event Cube embed/checkout flows. */
export function isTicketedEventCube(event: EventDetailsDTO): boolean {
  if (event.admissionType?.toUpperCase() !== 'TICKETED') return false;
  const embed = event.eventcubeEmbedUrl?.trim();
  const order = event.eventcubeOrderUrl?.trim();
  return Boolean(embed || order);
}
