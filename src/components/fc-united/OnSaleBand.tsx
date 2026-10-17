import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { isUpcomingEventStartDate } from '@/lib/homepage/homepageEventBands';
import { fcBebas } from './fcUnitedFonts';

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

const buttonClass =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-[32px] bg-[#ff0000] px-7 py-3 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none';

export function OnSaleBand({ events }: { events: BandEvent[] }) {
  const event = pickOnSaleEvent(events);
  if (!event) return null;

  const cta = bandCta(event);

  return (
    <aside
      aria-labelledby="on-sale-band-heading"
      className="mb-8 overflow-hidden rounded-[3px] border border-white/10 bg-[#262f3e] md:mb-10"
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="relative aspect-[16/9] w-full shrink-0 bg-[#081224] md:aspect-auto md:min-h-[180px] md:w-64 lg:w-80">
          <Image src={event.src} alt={event.title} fill className="object-contain object-center" sizes="(max-width: 768px) 100vw, 320px" />
        </div>

        <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-7 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">
              <span className="h-2 w-2 rounded-[1px] bg-[#ff0000]" aria-hidden />
              {event.isFeatured ? 'Featured event' : 'Upcoming event'}
            </p>
            <h3
              id="on-sale-band-heading"
              className={cn(fcBebas.className, 'mt-1 text-3xl tracking-[0.03em] text-white md:text-4xl')}
            >
              {cta.heading}
            </h3>
            <p className="mt-1 text-base font-medium text-white">{event.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#848992]">
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
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
