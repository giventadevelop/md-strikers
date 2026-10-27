'use client';

/**
 * MD Strikers /events catalog — design tokens from
 * design_systems/mdStrikers_site_general_design_final.json
 * Parity with kcnj-prod /events: Future/Past toggle, title + date search,
 * auto-switch to past when no upcoming, description expand, Add to Calendar,
 * Buy Tickets / Register / Donate, pagination.
 */
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MdPagination } from './MdPagination';
import type { EventDetailsDTO } from '@/types';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { resolveBuyTicketsTarget, resolveRegisterTarget } from '@/lib/eventcube/utils';
import { resolveEventImageUrlsServer } from './ApiServerActions';
import { DEFAULT_EVENT_IMAGE, formatEventDate, eventHref } from './homeEventDisplay';


const PAGE_SIZE = 20;

type CatalogEvent = EventDetailsDTO & { thumbnailUrl?: string };

function DescriptionDisplay({
  description,
  isExpanded,
}: {
  description: string;
  isExpanded: boolean;
}) {
  const maxLength = 200;
  if (description.length <= maxLength) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-pitch-charcoal/70 whitespace-pre-wrap break-words md:text-[15px]">
        {description}
      </p>
    );
  }
  const truncated = description.substring(0, maxLength).trim();
  return (
    <p className="mt-3 text-sm leading-relaxed text-pitch-charcoal/70 whitespace-pre-wrap break-words md:text-[15px]">
      {isExpanded ? description : `${truncated}…`}
    </p>
  );
}

function toGoogleCalendarDate(date: string, time: string) {
  if (!date || !time) return '';
  const [year, month, day] = date.split('-');
  let [hour, minute] = time.split(':');
  let ampm = '';
  if (minute && minute.includes(' ')) {
    [minute, ampm] = minute.split(' ');
  }
  let h = parseInt(hour, 10);
  if (isNaN(h)) h = 0;
  if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
  const min = minute && !isNaN(parseInt(minute, 10)) ? minute : '00';
  return `${year}${month}${day}T${String(h).padStart(2, '0')}${min.padStart(2, '0')}00`;
}

function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 sm:px-7 lg:px-12', className)}>
      {children}
    </div>
  );
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function collapseRecurring(list: EventDetailsDTO[], keepFinished: boolean): EventDetailsDTO[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYear = new Date(today);
  oneYear.setFullYear(today.getFullYear() + 1);
  oneYear.setHours(23, 59, 59, 999);

  const single: EventDetailsDTO[] = [];
  const series = new Map<unknown, EventDetailsDTO>();

  for (const event of list) {
    if (isRecurringEvent(event)) {
      const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;
      const next = getNextOccurrenceDate(event, today);
      if (!next) {
        if (keepFinished) single.push(event);
        continue;
      }
      if (next > oneYear) continue;
      const nextStr = next.toISOString().split('T')[0];
      const existing = series.get(seriesId);
      if (!existing || nextStr < (existing.startDate || '')) {
        series.set(seriesId, { ...event, startDate: nextStr });
      }
    } else if (!(event.recurrenceSeriesId || event.parentEventId)) {
      single.push(event);
    }
  }
  return [...single, ...series.values()];
}

const pillCta =
  'inline-flex items-center justify-center gap-2 rounded-full bg-pitch-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-in-out hover:bg-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive';

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-full border border-pitch-charcoal/10 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-colors duration-300 hover:border-pitch-charcoal/25 hover:text-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive';

export function FcUnitedEventsCatalogClient() {
  const [events, setEvents] = useState<CatalogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');
  const [appliedTitle, setAppliedTitle] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [futureCount, setFutureCount] = useState<number | null>(null);
  const [pastCount, setPastCount] = useState<number | null>(null);
  const [checkedInitial, setCheckedInitial] = useState(false);
  const [autoSwitching, setAutoSwitching] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const loadGenRef = useRef(0);

  useEffect(() => {
    if (autoSwitching) {
      setAutoSwitching(false);
      return;
    }

    const gen = ++loadGenRef.current;

    async function load() {
      setLoading(true);
      setFetchError(false);
      setEvents([]);
      try {
        const today = todayIso();
        let loadingPast = showPastEvents;

        if (!checkedInitial && page === 0 && !appliedTitle && !appliedFrom && !appliedTo) {
          const futureQs = new URLSearchParams({
            sort: 'startDate,asc',
            page: '0',
            size: '1',
            'isActive.equals': 'true',
            'startDate.greaterThanOrEqual': today,
          });
          const pastQs = new URLSearchParams({
            sort: 'startDate,desc',
            page: '0',
            size: '1',
            'isActive.equals': 'true',
            'endDate.lessThan': today,
          });
          const [futureRes, pastRes] = await Promise.all([
            fetch(`/api/proxy/event-details?${futureQs}`),
            fetch(`/api/proxy/event-details?${pastQs}`),
          ]);
          if (gen !== loadGenRef.current) return;
          const fCount = futureRes.ok ? parseInt(futureRes.headers.get('x-total-count') || '0', 10) : 0;
          const pCount = pastRes.ok ? parseInt(pastRes.headers.get('x-total-count') || '0', 10) : 0;
          setFutureCount(fCount);
          setPastCount(pCount);
          setCheckedInitial(true);
          if (fCount === 0 && pCount > 0) {
            setAutoSwitching(true);
            setShowPastEvents(true);
            loadingPast = true;
          }
        }

        const qs = new URLSearchParams({
          sort: loadingPast ? 'startDate,desc' : 'startDate,asc',
          page: String(page),
          size: String(PAGE_SIZE),
          'isActive.equals': 'true',
        });
        if (appliedTitle.trim()) qs.append('title.contains', appliedTitle.trim());
        if (appliedFrom || appliedTo) {
          if (appliedFrom) qs.append('startDate.greaterThanOrEqual', appliedFrom);
          if (appliedTo) qs.append('startDate.lessThanOrEqual', appliedTo);
        } else if (loadingPast) {
          qs.append('endDate.lessThan', today);
        } else {
          qs.append('startDate.greaterThanOrEqual', today);
        }

        const res = await fetch(`/api/proxy/event-details?${qs}`);
        if (gen !== loadGenRef.current) return;
        if (!res.ok) throw new Error('Failed to fetch events');
        const total = parseInt(res.headers.get('x-total-count') || '0', 10);
        setTotalCount(total);

        const raw = await res.json();
        const list: EventDetailsDTO[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const processed = collapseRecurring(list, loadingPast).sort((a, b) =>
          loadingPast
            ? (b.startDate || '').localeCompare(a.startDate || '')
            : (a.startDate || '').localeCompare(b.startDate || ''),
        );

        const imageMap = await resolveEventImageUrlsServer(
          processed.map((e) => e.id).filter((id): id is number => id != null),
        );
        if (gen !== loadGenRef.current) return;
        const withMedia: CatalogEvent[] = processed.map((event) => ({
          ...event,
          thumbnailUrl: event.id != null ? imageMap[event.id] ?? undefined : undefined,
        }));
        setEvents(withMedia);
      } catch {
        if (gen !== loadGenRef.current) return;
        setFetchError(true);
        setEvents([]);
      } finally {
        if (gen === loadGenRef.current) setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showPastEvents, appliedTitle, appliedFrom, appliedTo]);

  const handleSearch = () => {
    setAppliedTitle(searchTitle);
    setAppliedFrom(searchDateFrom);
    setAppliedTo(searchDateTo);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTitle('');
    setSearchDateFrom('');
    setSearchDateTo('');
    setAppliedTitle('');
    setAppliedFrom('');
    setAppliedTo('');
    setPage(0);
    setShowPastEvents(false);
  };

  return (
    <section className="bg-pitch-chalk pb-16 pt-2 md:pb-20 md:pt-4">
      <Shell>
        {/* Section header — label → headline → detail */}
        <div className="mb-8 text-center md:mb-10 md:text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            calendar
          </span>
          <h2 className={cn('font-extrabold tracking-[-0.02em] text-3xl text-pitch-charcoal md:text-4xl')}>
            {showPastEvents ? 'Past Events' : 'Upcoming Events'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">
            {showPastEvents
              ? 'Events that have already ended. Switch to Future Events for what is coming up.'
              : 'Match days, tournaments, and club nights on the Maryland Strikers calendar.'}
          </p>
        </div>

        {/* Future / Past toggle — design system accent (2× size) */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-8">
          <span
            className={cn(
              'text-2xl font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
              !showPastEvents ? 'text-pitch-olive' : 'text-pitch-charcoal/70',
            )}
          >
            Future
          </span>
          <button
            type="button"
            onClick={() => {
              setShowPastEvents(!showPastEvents);
              setPage(0);
            }}
            className={cn(
              'relative inline-flex h-20 w-32 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pitch-olive focus-visible:ring-offset-2',
              showPastEvents ? 'bg-pitch-forest' : 'bg-pitch-forest',
            )}
            title={showPastEvents ? 'Show Future Events' : 'Show Past Events'}
            aria-label={showPastEvents ? 'Show Future Events' : 'Show Past Events'}
          >
            <span
              className={cn(
                'inline-flex h-16 w-16 translate-x-2 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300',
                showPastEvents && 'translate-x-14',
              )}
            >
              {showPastEvents ? (
                <svg className="h-8 w-8 text-pitch-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-pitch-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </span>
          </button>
          <span
            className={cn(
              'text-2xl font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
              showPastEvents ? 'text-pitch-charcoal' : 'text-pitch-charcoal/70',
            )}
          >
            Past
          </span>
        </div>

        {/* Search — flat bordered panel */}
        <div className="mb-8 rounded-xl border border-pitch-charcoal/10 bg-white p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            Search events
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="md-events-title" className="mb-1.5 block text-sm font-medium text-pitch-charcoal">
                Title
              </label>
              <input
                id="md-events-title"
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search by title…"
                className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal outline-none transition-colors duration-300 focus:border-pitch-olive"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-pitch-charcoal">Date range</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={searchDateFrom}
                  onChange={(e) => setSearchDateFrom(e.target.value)}
                  aria-label="From date"
                  className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-2 py-2.5 text-sm text-pitch-charcoal outline-none focus:border-pitch-olive"
                />
                <input
                  type="date"
                  value={searchDateTo}
                  onChange={(e) => setSearchDateTo(e.target.value)}
                  aria-label="To date"
                  className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-2 py-2.5 text-sm text-pitch-charcoal outline-none focus:border-pitch-olive"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end lg:flex-col">
              <button type="button" onClick={handleSearch} disabled={loading} className={cn(pillCta, 'w-full disabled:opacity-50')}>
                Search
              </button>
              <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'w-full')}>
                Clear
              </button>
            </div>
          </div>
          {(appliedTitle || appliedFrom || appliedTo) && (
            <p className="mt-4 text-sm text-pitch-charcoal/70">
              <strong className="font-semibold text-pitch-charcoal">Search active:</strong>
              {appliedTitle ? ` title contains “${appliedTitle}”` : ''}
              {appliedTitle && (appliedFrom || appliedTo) ? ' and' : ''}
              {appliedFrom && appliedTo
                ? ` date between “${appliedFrom}” and “${appliedTo}”`
                : appliedFrom
                  ? ` date from “${appliedFrom}” onwards`
                  : appliedTo
                    ? ` date until “${appliedTo}”`
                    : ''}
              {(appliedFrom || appliedTo) && ' (overrides the Future/Past toggle)'}
            </p>
          )}
        </div>

        {/* Status messages */}
        {!loading && checkedInitial && futureCount === 0 && pastCount === 0 && events.length === 0 && !fetchError && (
          <p className="mb-6 rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-8 text-center text-sm text-pitch-charcoal/70">
            No events listed yet. Check back soon.
          </p>
        )}
        {!loading && checkedInitial && showPastEvents && futureCount === 0 && (pastCount ?? 0) > 0 && !fetchError && (
          <p className="mb-6 rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-4 text-sm text-pitch-charcoal/70">
            Showing recent events. New upcoming events will appear here when scheduled.
          </p>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-pitch-charcoal/10 border-t-pitch-olive" aria-label="Loading" />
          </div>
        ) : fetchError ? (
          <p className="rounded-xl border border-pitch-olive/30 bg-white px-5 py-8 text-center text-sm font-medium text-pitch-olive">
            Could not load events. Please try again later.
          </p>
        ) : events.length === 0 ? (
          <p className="rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-8 text-center text-sm text-pitch-charcoal/70">
            No events found.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {events.map((event) => {
              const imgSrc = event.thumbnailUrl || DEFAULT_EVENT_IMAGE;
              const href = eventHref(event);
              const dateLabel = [
                formatEventDate(event.startDate, event.timezone),
                event.startTime && event.endTime
                  ? `${event.startTime} — ${event.endTime}`
                  : event.startTime || event.endTime || '',
              ]
                .filter(Boolean)
                .join(' · ');
              const isUpcoming = !showPastEvents;
              const buyTarget = isUpcoming ? resolveBuyTicketsTarget(event) : null;
              const registerTarget = isUpcoming ? resolveRegisterTarget(event) : null;
              const showDonation =
                isDonationBasedEvent(event) && isUpcoming && !isTicketedFundraiserEvent(event);
              const isLongDescription = !!event.description && event.description.length > 200;
              const descExpanded = !!(event.id && expandedDescriptions[event.id]);

              let calendarLink: string | null = null;
              if (isUpcoming && event.startDate && event.startTime) {
                const start = toGoogleCalendarDate(event.startDate, event.startTime);
                const end = toGoogleCalendarDate(
                  event.endDate || event.startDate,
                  event.endTime || event.startTime,
                );
                if (start && end) {
                  calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                }
              }

              return (
                <article
                  key={event.id ?? event.title}
                  className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white transition-colors duration-300 ease-in-out hover:border-pitch-charcoal/25"
                >
                  {/* Container takes the image's own aspect ratio: full width, no side gaps, no cropping */}
                  <div className="relative w-full border-b border-pitch-charcoal/10 bg-pitch-chalk">
                    <Image
                      src={imgSrc}
                      alt={event.title}
                      width={1600}
                      height={900}
                      className="block h-auto w-full"
                      sizes="(max-width: 1240px) 100vw, 1240px"
                    />
                    {showPastEvents && (
                      <span className="absolute left-3 top-3 rounded-xl bg-pitch-forest px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                        Past Event
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-5 md:px-6 md:py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
                      {showPastEvents ? 'Past Event' : 'Upcoming Event'}
                    </p>
                    <h3
                      className={cn(
                        'font-extrabold tracking-[-0.02em] mt-1.5 text-2xl text-pitch-charcoal md:text-3xl',
                      )}
                    >
                      <Link
                        href={href}
                        className="transition-colors duration-300 hover:text-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive"
                      >
                        {event.title}
                      </Link>
                    </h3>
                    {dateLabel && (
                      <p className="mt-2 text-sm font-medium text-pitch-charcoal md:text-[15px]">{dateLabel}</p>
                    )}
                    {event.location?.trim() && (
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">
                        <span>{event.location.trim()}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.trim())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-pitch-olive transition-colors hover:underline"
                          title="Open in Google Maps"
                          aria-label="Open location in Google Maps"
                        >
                          Map
                        </a>
                      </p>
                    )}
                    {event.description && (
                      <DescriptionDisplay description={event.description} isExpanded={descExpanded} />
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {isLongDescription && event.id != null && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [event.id!]: !prev[event.id!],
                            }))
                          }
                          className={secondaryCta}
                          title={descExpanded ? 'Show Less' : 'Read More'}
                          aria-label={descExpanded ? 'Show Less' : 'Read More'}
                        >
                          {descExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                      {calendarLink && (
                        <a
                          href={calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={secondaryCta}
                          title="Add to Calendar"
                          aria-label="Add to Calendar"
                        >
                          Add to Calendar
                        </a>
                      )}
                      <Link href={href} className={secondaryCta}>
                        View event
                      </Link>
                      {buyTarget && (
                        <Link
                          href={buyTarget.href}
                          className={pillCta}
                          {...(buyTarget.kind === 'external'
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          Buy tickets
                        </Link>
                      )}
                      {registerTarget && (
                        <Link
                          href={registerTarget.href}
                          className={pillCta}
                          {...(registerTarget.kind === 'external'
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          Register
                        </Link>
                      )}
                      {showDonation && event.id && (
                        <Link href={`/events/${event.id}/donation`} className={pillCta}>
                          Donate
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && (
          <MdPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
            itemLabel="events"
            loading={loading}
          />
        )}
      </Shell>
    </section>
  );
}
