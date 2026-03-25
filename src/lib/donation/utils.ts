import type { EventDetailsDTO } from '@/types';

function parseDonationMetadata(event: EventDetailsDTO): Record<string, unknown> | null {
  if (!event.donationMetadata) return null;
  try {
    const raw = JSON.parse(event.donationMetadata) as unknown;
    if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

export function isDonationBasedEvent(event: EventDetailsDTO): boolean {
  const admission = event.admissionType?.toUpperCase() ?? '';
  if (admission === 'DONATION' || admission === 'FREE_WITH_DONATION') return true;
  const meta = parseDonationMetadata(event);
  if (meta?.zeroFeeProvider === 'GIVEBUTTER') return true;
  return false;
}

/**
 * Ticketed event that uses Givebutter / fundraiser checkout instead of standard Stripe checkout.
 */
export function isTicketedFundraiserEvent(event: EventDetailsDTO): boolean {
  if (event.admissionType?.toUpperCase() !== 'TICKETED') return false;
  const meta = parseDonationMetadata(event);
  if (meta?.zeroFeeProvider === 'GIVEBUTTER') return true;
  if (meta?.isFundraiser === true) return true;
  if (meta?.fundraiser === true) return true;
  if (meta?.eventCategory === 'FUNDRAISER') return true;
  return false;
}
