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
import type { EventDetailsDTO } from '@/types';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { isDonationBasedEvent, isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { resolveBuyTicketsTarget, resolveRegisterTarget } from '@/lib/eventcube/utils';
import { resolveEventImageUrlsServer } from './ApiServerActions';
import { FcCatalogTypeahead, CATALOG_SUGGESTION_LIMIT, type CatalogSuggestion } from './FcCatalogTypeahead';
import { DEFAULT_EVENT_IMAGE, eventHref } from './homeEventDisplay';
import {
  fetchPublicSearchPage,
  parseProxyList,
  PUBLIC_EVENT_SEARCH_FIELDS,
} from '@/lib/publicTypeaheadSearch';


const PAGE_SIZE = 20;

function eventDateExtras(options: {
  loadingPast: boolean;
  today: string;
  appliedFrom?: string;
  appliedTo?: string;
  sort?: string;
}): Record<string, string> {
  const extras: Record<string, string> = {
    'isActive.equals': 'true',
  };
  if (options.sort) extras.sort = options.sort;
  if (options.appliedFrom || options.appliedTo) {
    if (options.appliedFrom) extras['startDate.greaterThanOrEqual'] = options.appliedFrom;
    if (options.appliedTo) extras['startDate.lessThanOrEqual'] = options.appliedTo;
  } else if (options.loadingPast) {
    extras['endDate.lessThan'] = options.today;
  } else {
    extras['startDate.greaterThanOrEqual'] = options.today;
  }
  return extras;
}

function eventsToSuggestions(events: EventDetailsDTO[]): CatalogSuggestion[] {
  const seen = new Set<string>();
  const suggestions: CatalogSuggestion[] = [];
  for (const event of events) {
    const key = event.id != null ? String(event.id) : event.title || '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const title = (event.title || '').trim();
    suggestions.push({
      key,
      label: title || `Event ${event.id}`,
      hint: event.caption?.trim() || (event.id != null ? `#${event.id}` : undefined),
      commitValue: title || String(event.id ?? ''),
    });
    if (suggestions.length >= CATALOG_SUGGESTION_LIMIT) break;
  }
  return suggestions;
}

async function loadEventSuggestions(
  query: string,
  extraParams: Record<string, string>,
): Promise<{ suggestions: CatalogSuggestion[]; totalCount: number }> {
  const trimmed = query.trim();
  if (!trimmed) return { suggestions: [], totalCount: 0 };
  const pageResult = await fetchPublicSearchPage<EventDetailsDTO>({
    resource: 'event-details',
    query: trimmed,
    containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
    extraParams,
    page: 0,
    size: CATALOG_SUGGESTION_LIMIT,
  });
  return {
    suggestions: eventsToSuggestions(pageResult.items),
    totalCount: pageResult.totalCount,
  };
}

type CatalogEvent = EventDetailsDTO & { thumbnailUrl?: string };

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateParts(iso?: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    wd: WEEKDAYS_SHORT[date.getDay()],
    day: String(day).padStart(2, '0'),
    mon: MONTHS_SHORT[month - 1],
    year,
    when: `${WEEKDAYS[date.getDay()]}, ${MONTHS[month - 1]} ${day}, ${year}`,
  };
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
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [suggestionTotal, setSuggestionTotal] = useState(0);
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

        const extraParams = eventDateExtras({
          loadingPast,
          today,
          appliedFrom,
          appliedTo,
          sort: loadingPast ? 'startDate,desc' : 'startDate,asc',
        });
        let total = 0;
        let list: EventDetailsDTO[] = [];
        const titleQuery = appliedTitle.trim();
        if (titleQuery) {
          const pageResult = await fetchPublicSearchPage<EventDetailsDTO>({
            resource: 'event-details',
            query: titleQuery,
            containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
            extraParams,
            page,
            size: PAGE_SIZE,
          });
          if (gen !== loadGenRef.current) return;
          list = pageResult.items;
          total = pageResult.totalCount;
        } else {
          const qs = new URLSearchParams({
            ...extraParams,
            page: String(page),
            size: String(PAGE_SIZE),
          });
          const res = await fetch(`/api/proxy/event-details?${qs}`);
          if (gen !== loadGenRef.current) return;
          if (!res.ok) throw new Error('Failed to fetch events');
          total = parseInt(res.headers.get('x-total-count') || '0', 10);
          list = parseProxyList<EventDetailsDTO>(await res.json());
        }
        setTotalCount(total);
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

  const commitSearch = (value: string) => {
    const next = value.trim();
    setSearchTitle(next);
    setAppliedTitle(next);
    setPage(0);
  };

  useEffect(() => {
    const query = searchTitle.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionTotal(0);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      loadEventSuggestions(
        query,
        eventDateExtras({
          loadingPast: showPastEvents,
          today: todayIso(),
          appliedFrom,
          appliedTo,
          sort: showPastEvents ? 'startDate,desc' : 'startDate,asc',
        }),
      )
        .then((result) => {
          if (cancelled) return;
          setSuggestions(result.suggestions);
          setSuggestionTotal(result.totalCount);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setSuggestionTotal(0);
          }
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchTitle, showPastEvents, appliedFrom, appliedTo]);

  useEffect(() => {
    let cancelled = false;
    const title = appliedTitle.trim();
    const today = todayIso();
    async function count(past: boolean) {
      const extraParams = eventDateExtras({
        loadingPast: past,
        today,
        sort: past ? 'startDate,desc' : 'startDate,asc',
      });
      if (title) {
        const pageResult = await fetchPublicSearchPage<EventDetailsDTO>({
          resource: 'event-details',
          query: title,
          containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
          extraParams,
          page: 0,
          size: 1,
        });
        return pageResult.totalCount;
      }
      const qs = new URLSearchParams({
        ...extraParams,
        page: '0',
        size: '1',
      });
      const res = await fetch(`/api/proxy/event-details?${qs}`);
      return res.ok ? parseInt(res.headers.get('x-total-count') || '0', 10) : 0;
      setSearchDateTo(value);
      setAppliedTo(value);
    }
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTitle('');
    setSuggestions([]);
    setSuggestionTotal(0);
    setSearchDateFrom('');
    setSearchDateTo('');
    setAppliedTitle('');
    setAppliedFrom('');
    setAppliedTo('');
    setPage(0);
    setShowPastEvents(false);
  };

  const dateActive = !!(appliedFrom || appliedTo);
  const hasFilters = !!searchTitle.trim() || dateActive;
  const heading = dateActive ? 'Events by date' : showPastEvents ? 'Past Events' : 'Upcoming Events';
  const blurb = dateActive
    ? 'Events that start within the selected dates.'
    : showPastEvents
      ? 'Events that have already ended. Switch to Upcoming for what is coming up.'
      : 'Match days, tournaments, and club nights on the Maryland Strikers calendar.';
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startItem = totalCount > 0 ? page * PAGE_SIZE + 1 : 0;
  const endItem = totalCount > 0 ? Math.min(totalCount, page * PAGE_SIZE + events.length) : 0;

  return (
    <>
      <div className="md-ev-filters">
        <div className="md-ev-wrap md-ev-filtercard">
          <div className="md-ev-filterrow">
            <div role="tablist" aria-label="Event timing" className={dateActive ? 'is-dim' : undefined}>
              <button
                type="button"
                role="tab"
                aria-selected={!showPastEvents}
                className={!showPastEvents ? 'is-on' : undefined}
                onClick={() => {
                  setShowPastEvents(false);
                  setPage(0);
                }}
              >
                Upcoming
                <span>{futureCount ?? '–'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={showPastEvents}
                className={showPastEvents ? 'is-on' : undefined}
                onClick={() => {
                  setShowPastEvents(true);
                  setPage(0);
                }}
              >
                Past
                <span>{pastCount ?? '–'}</span>
              </button>
            </div>
            <div className="md-ev-searchrow">
              <FcCatalogTypeahead
                draft={searchTitle}
                onDraftChange={setSearchTitle}
                onCommit={commitSearch}
                suggestions={suggestions}
                totalCount={suggestionTotal}
                placeholder="Search by title…"
                ariaLabel="Search events by title, caption, or id"
                leading={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                )}
              />
              <label>
                From
                <input
                  type="date"
                  aria-label="From date"
                  value={searchDateFrom}
                  onChange={(event) => applyDate('from', event.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  aria-label="To date"
                  value={searchDateTo}
                  onChange={(event) => applyDate('to', event.target.value)}
                />
              </label>
              {hasFilters ? (
                <button type="button" onClick={clearSearch}>
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          {dateActive ? (
            <p>The date range searches all events and overrides the Upcoming / Past switch.</p>
          ) : null}
        </div>
      </div>

      <div className="md-ev-list">
        <div className="md-ev-wrap">
          <div className="md-ev-head">
            <div>
              <h2>{heading}</h2>
              <span>{loading ? '…' : totalCount}</span>
            </div>
            <p>{blurb}</p>
          </div>

          {loading ? (
            <div className="md-ev-status" aria-label="Loading events">
              <span className="md-ev-spin" />
            </div>
          ) : fetchError ? (
            <div className="md-ev-empty">
              <h3>Could not load events</h3>
              <p>Please try again later.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="md-ev-empty">
              <h3>No events found</h3>
              <p>
                {hasFilters
                  ? 'Nothing matches the current search.'
                  : showPastEvents
                    ? 'No past events to show.'
                    : 'No events listed yet. Check back soon.'}
              </p>
              {hasFilters ? (
                <button type="button" onClick={clearSearch}>Clear search</button>
              ) : null}
            </div>
          ) : (
            <div className="md-ev-cards">
              {events.map((event, index) => {
                const imgSrc = event.thumbnailUrl || DEFAULT_EVENT_IMAGE;
                const href = eventHref(event);
                const parts = dateParts(event.startDate);
                const timeLabel = [event.startTime, event.endTime].filter(Boolean).join(' — ');
                const when = [parts?.when, timeLabel].filter(Boolean).join(' · ');
                const isNext = !showPastEvents && !dateActive && page === 0 && index === 0;
                const tone = showPastEvents ? 'is-past' : isNext ? 'is-next' : 'is-upcoming';
                const badge = showPastEvents ? 'Past Event' : isNext ? 'Next up' : 'Upcoming Event';
                const isUpcoming = !showPastEvents;
                const buyTarget = isUpcoming ? resolveBuyTicketsTarget(event) : null;
                const registerTarget = isUpcoming ? resolveRegisterTarget(event) : null;
                const showDonation = isDonationBasedEvent(event) && isUpcoming && !isTicketedFundraiserEvent(event);
                const isLongDescription = !!event.description && event.description.length > 200;
                const descExpanded = !!(event.id && expandedDescriptions[event.id]);
                const description = event.description
                  ? descExpanded || event.description.length <= 200
                    ? event.description
                    : `${event.description.slice(0, 200).trim()}…`
                  : '';
                let calendarLink: string | null = null;
                if (isUpcoming && event.startDate && event.startTime) {
                  const start = toGoogleCalendarDate(event.startDate, event.startTime);
                  const end = toGoogleCalendarDate(event.endDate || event.startDate, event.endTime || event.startTime);
                  if (start && end) {
                    calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                  }
                }
                return (
                  <article key={event.id ?? event.title} className={`md-ev-card ${tone}`}>
                    <Link href={href} className="md-ev-media" aria-label={`View ${event.title}`}>
                      <Image src={imgSrc} alt="" fill sizes="(max-width: 1280px) 100vw, 1232px" />
                      <span className="md-ev-badge">{badge}</span>
                    </Link>
                    <div className="md-ev-card__body">
                      {parts ? (
                        <div className="md-ev-tile" aria-hidden="true">
                          <span>{parts.wd}</span>
                          <strong>{parts.day}</strong>
                          <span>{parts.mon}</span>
                          <em>{parts.year}</em>
                        </div>
                      ) : null}
                      <div className="md-ev-copy">
                        <h3>
                          <Link href={href}>{event.title}</Link>
                        </h3>
                        <div className="md-ev-facts">
                          {when ? (
                            <span>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 2" />
                              </svg>
                              <b>{when}</b>
                            </span>
                          ) : null}
                          {event.location?.trim() ? (
                            <span>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>
                                {event.location.trim()}
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.trim())}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open location in Google Maps"
                                >
                                  Map
                                </a>
                              </span>
                            </span>
                          ) : null}
                        </div>
                        {description ? <p>{description}</p> : null}
                        {isLongDescription && event.id != null ? (
                          <button
                            type="button"
                            className="md-ev-more"
                            onClick={() =>
                              setExpandedDescriptions((prev) => ({
                                ...prev,
                                [event.id!]: !prev[event.id!],
                              }))
                            }
                          >
                            {descExpanded ? 'Show less' : 'Read more'}
                          </button>
                        ) : null}
                      </div>
                      <div className="md-ev-actions">
                        <Link href={href} className="md-ev-view">
                          View event
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </Link>
                        {calendarLink ? (
                          <a href={calendarLink} target="_blank" rel="noopener noreferrer">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                              <rect x="3" y="5" width="18" height="16" rx="2" />
                              <path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5" />
                            </svg>
                            Add to Calendar
                          </a>
                        ) : null}
                        {buyTarget ? (
                          <Link
                            href={buyTarget.href}
                            {...(buyTarget.kind === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            Buy tickets
                          </Link>
                        ) : null}
                        {registerTarget ? (
                          <Link
                            href={registerTarget.href}
                            {...(registerTarget.kind === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            Register
                          </Link>
                        ) : null}
                        {showDonation && event.id ? (
                          <Link href={`/events/${event.id}/donation`}>Donate</Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && totalCount > 0 ? (
            <div className="md-ev-pager">
              <p>{`Showing ${startItem}–${endItem} of ${totalCount} events`}</p>
              <div>
                <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                  Previous
                </button>
                <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
