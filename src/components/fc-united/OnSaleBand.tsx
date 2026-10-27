import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { isUpcomingEventStartDate } from '@/lib/homepage/homepageEventBands';
import { PitchArrow, pitchButton } from './pitchUi';

export type BandEvent = {
  key: string;
  title: string;
  src: string;
  /** YYYY-MM-DD */
  startDate: string;
  dateTime: string;
  venue: string;
  isFeatured: boolean;
  isTicketed: boolean;
  registrationUrl?: string;
  href: string;
};

/**
 * Upcoming only (never past): ticketed featured → any featured →
 * first ticketed → first upcoming (by start date).
 */
export function pickOnSaleEvent(events: BandEvent[]): BandEvent | null {
  const upcoming = events
    .filter((e) => isUpcomingEventStartDate(e.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    upcoming.find((e) => e.isFeatured && e.isTicketed) ??
    upcoming.find((e) => e.isFeatured) ??
    upcoming.find((e) => e.isTicketed) ??
    upcoming[0] ??
    null
  );
}

function bandCta(event: BandEvent) {
  if (event.isTicketed) {
    return { heading: 'On sale now', label: 'Get tickets', href: event.href, external: false };
  }
  if (event.registrationUrl) {
    return {
      heading: 'Register now',
      label: 'Register',
      href: event.registrationUrl,
      external: /^https?:\/\//i.test(event.registrationUrl),
    };
  }
  return { heading: 'Coming up', label: 'View event', href: event.href, external: false };
}

const buttonClass = cn(pitchButton.primary, 'group shrink-0');

export function OnSaleBand({ events }: { events: BandEvent[] }) {
  const event = pickOnSaleEvent(events);
  if (!event) return null;

  const cta = bandCta(event);

  return (
    <aside
      aria-labelledby="on-sale-band-heading"
      className="group/band mb-12 overflow-hidden rounded-3xl border border-pitch-chalk/10 bg-pitch-forest md:mb-16"
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-pitch-charcoal md:aspect-auto md:min-h-[200px] md:w-72 lg:w-96">
          <Image src={event.src} alt={event.title} fill className="object-cover object-center transition-transform duration-700 ease-out group-hover/band:scale-105 motion-reduce:transition-none" sizes="(max-width: 768px) 100vw, 384px" />
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-12">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-pitch-lime">
              <span className="h-2 w-2 rounded-full bg-pitch-lime" aria-hidden />
              {event.isFeatured ? 'Featured event' : 'Upcoming event'}
            </p>
            <h3
              id="on-sale-band-heading"
              className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-pitch-chalk md:text-3xl"
            >
              {cta.heading}
            </h3>
            <p className="mt-2 text-base font-semibold text-pitch-chalk">{event.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-pitch-stone">
              {[event.dateTime, event.venue].filter(Boolean).join(' · ')}
            </p>
          </div>

          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              {cta.label}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <Link href={cta.href} className={buttonClass}>
              {cta.label}
              <PitchArrow />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
