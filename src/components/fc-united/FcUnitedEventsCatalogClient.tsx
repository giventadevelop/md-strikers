'use client';

/**
 * MD Strikers /events catalog — design tokens from
 * design_systems/mdStrikers_site_general_design_final.json
 * (navy / red / hairline cards, Bebas + Poppins, pill CTAs).
 */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { EventDetailsDTO } from '@/types';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { resolveBuyTicketsTarget, resolveRegisterTarget } from '@/lib/eventcube/utils';
import { resolveEventImageUrlsServer } from './ApiServerActions';
import { DEFAULT_EVENT_IMAGE, formatEventDate, eventHref } from './homeEventDisplay';
import { fcBebas } from './fcUnitedFonts';

const PAGE_SIZE = 20;
const FETCH_SIZE = 50;

type CatalogEvent = EventDetailsDTO & { thumbnailUrl?: string };

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
  'inline-flex items-center justify-center gap-2 rounded-[32px] bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]';

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-[32px] border border-[#e3e3e3] bg-white px-6 py-2.5 text-sm font-semibold text-[#262f3e] transition-colors duration-300 hover:border-[#c8c8c8] hover:text-[#ff0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]';

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

  useEffect(() => {
    if (autoSwitching) {
      setAutoSwitching(false);
      return;
    }

    async function load() {
      setLoading(true);
      setFetchError(false);
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
          size: String(FETCH_SIZE),
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
        if (!res.ok) throw new Error('Failed to fetch events');
        const total = parseInt(res.headers.get('x-total-count') || '0', 10);
        setTotalCount(total);

        const raw = await res.json();
        const list: EventDetailsDTO[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const processed = collapseRecurring(list, loadingPast)
          .sort((a, b) =>
            loadingPast
              ? (b.startDate || '').localeCompare(a.startDate || '')
              : (a.startDate || '').localeCompare(b.startDate || ''),
          )
          .slice(0, PAGE_SIZE);

        // Same event_media resolution as homepage (server JWT → backend), not client proxy
        const imageMap = await resolveEventImageUrlsServer(
          processed.map((e) => e.id).filter((id): id is number => id != null),
        );
        const withMedia: CatalogEvent[] = processed.map((event) => ({
          ...event,
          thumbnailUrl: event.id != null ? imageMap[event.id] ?? undefined : undefined,
        }));
        setEvents(withMedia);
      } catch {
        setFetchError(true);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showPastEvents, appliedTitle, appliedFrom, appliedTo]);

  const totalPages = Math.max(1, Math.ceil(totalCount / FETCH_SIZE));
  const displayPage = page + 1;

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
  };

  return (
    <section className="bg-[#f4f4f4] pb-16 pt-2 md:pb-20 md:pt-4">
      <Shell>
        {/* Section header — label → headline → detail */}
        <div className="mb-8 text-center md:mb-10 md:text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
            calendar
          </span>
          <h2 className={cn(fcBebas.className, 'text-4xl tracking-[0.03em] text-[#262f3e] md:text-5xl')}>
            {showPastEvents ? 'Past Events' : 'Upcoming Events'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#797e87] md:text-[15px]">
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
              !showPastEvents ? 'text-[#ff0000]' : 'text-[#797e87]',
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
              'relative inline-flex h-20 w-32 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000] focus-visible:ring-offset-2',
              showPastEvents ? 'bg-[#262f3e]' : 'bg-[#ff0000]',
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
                <svg className="h-8 w-8 text-[#262f3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-[#ff0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </span>
          </button>
          <span
            className={cn(
              'text-2xl font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
              showPastEvents ? 'text-[#262f3e]' : 'text-[#797e87]',
            )}
          >
            Past
          </span>
        </div>

        {/* Search — flat bordered panel */}
        <div className="mb-8 rounded-[3px] border border-[#e3e3e3] bg-white p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
            Search events
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="md-events-title" className="mb-1.5 block text-sm font-medium text-[#262f3e]">
                Title
              </label>
              <input
                id="md-events-title"
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search by title…"
                className="w-full rounded-[3px] border border-[#e3e3e3] bg-white px-3 py-2.5 text-sm text-[#262f3e] outline-none transition-colors duration-300 focus:border-[#ff0000]"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-[#262f3e]">Date range</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={searchDateFrom}
                  onChange={(e) => setSearchDateFrom(e.target.value)}
                  aria-label="From date"
                  className="w-full rounded-[3px] border border-[#e3e3e3] bg-white px-2 py-2.5 text-sm text-[#262f3e] outline-none focus:border-[#ff0000]"
                />
                <input
                  type="date"
                  value={searchDateTo}
                  onChange={(e) => setSearchDateTo(e.target.value)}
                  aria-label="To date"
                  className="w-full rounded-[3px] border border-[#e3e3e3] bg-white px-2 py-2.5 text-sm text-[#262f3e] outline-none focus:border-[#ff0000]"
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
            <p className="mt-4 text-sm text-[#797e87]">
              Active filters
              {appliedTitle ? ` · title “${appliedTitle}”` : ''}
              {appliedFrom || appliedTo
                ? ` · dates ${appliedFrom || '…'} → ${appliedTo || '…'}`
                : ''}
            </p>
          )}
        </div>

        {/* Status messages */}
        {!loading && checkedInitial && futureCount === 0 && pastCount === 0 && events.length === 0 && !fetchError && (
          <p className="mb-6 rounded-[3px] border border-[#e3e3e3] bg-white px-5 py-8 text-center text-sm text-[#797e87]">
            No events listed yet. Check back soon.
          </p>
        )}
        {!loading && checkedInitial && showPastEvents && futureCount === 0 && (pastCount ?? 0) > 0 && !fetchError && (
          <p className="mb-6 rounded-[3px] border border-[#e3e3e3] bg-white px-5 py-4 text-sm text-[#797e87]">
            Showing recent events. New upcoming events will appear here when scheduled.
          </p>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e3e3e3] border-t-[#ff0000]" aria-label="Loading" />
          </div>
        ) : fetchError ? (
          <p className="rounded-[3px] border border-[#ff0000]/30 bg-white px-5 py-8 text-center text-sm font-medium text-[#ff0000]">
            Could not load events. Please try again later.
          </p>
        ) : events.length === 0 ? (
          <p className="rounded-[3px] border border-[#e3e3e3] bg-white px-5 py-8 text-center text-sm text-[#797e87]">
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

              return (
                <article
                  key={event.id ?? event.title}
                  className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white transition-colors duration-300 ease-in-out hover:border-[#c8c8c8]"
                >
                  <div className="relative aspect-[32/9] w-full border-b border-[#e3e3e3] bg-[#f4f4f4]">
                    <Image
                      src={imgSrc}
                      alt={event.title}
                      fill
                      className="object-contain object-center"
                      sizes="100vw"
                    />
                    {showPastEvents && (
                      <span className="absolute left-3 top-3 rounded-[3px] bg-[#262f3e] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                        Past Event
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-5 md:px-6 md:py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">
                      {showPastEvents ? 'Past Event' : 'Upcoming Event'}
                    </p>
                    <h3
                      className={cn(
                        fcBebas.className,
                        'mt-1.5 text-3xl tracking-[0.02em] text-[#262f3e] md:text-4xl',
                      )}
                    >
                      <Link
                        href={href}
                        className="transition-colors duration-300 hover:text-[#ff0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
                      >
                        {event.title}
                      </Link>
                    </h3>
                    {dateLabel && (
                      <p className="mt-2 text-sm font-medium text-[#262f3e] md:text-[15px]">{dateLabel}</p>
                    )}
                    {event.location?.trim() && (
                      <p className="mt-1 text-sm leading-relaxed text-[#797e87] md:text-[15px]">
                        {event.location.trim()}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
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

        {/* Pagination */}
        {!loading && events.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={cn(secondaryCta, 'disabled:cursor-not-allowed disabled:opacity-40')}
            >
              Previous
            </button>
            <p className="text-sm font-medium text-[#262f3e]">
              Page <span className="text-[#ff0000]">{displayPage}</span> of {totalPages}
              {totalCount > 0 && (
                <span className="ml-2 text-[#797e87]">({totalCount} total)</span>
              )}
            </p>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={cn(secondaryCta, 'disabled:cursor-not-allowed disabled:opacity-40')}
            >
              Next
            </button>
          </div>
        )}
      </Shell>
    </section>
  );
}
