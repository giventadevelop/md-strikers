'use client';

/**
 * Published tournaments for the current tenant, then a link into /tournaments/[slug].
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PublicTournament } from '@/lib/tournaments/publicTournaments';
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead } from './FcCatalogTypeahead';

const PAGE_SIZE = 12;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function asList(data: unknown): PublicTournament[] {
  if (Array.isArray(data)) return data as PublicTournament[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: PublicTournament[] }).content;
  }
  return [];
}

function isPastTournament(tournament: PublicTournament, today: string): boolean {
  if (tournament.status === 'COMPLETED') return true;
  if (tournament.status === 'UPCOMING' || tournament.status === 'IN_PROGRESS') return false;
  const end = tournament.endDate || tournament.startDate;
  return Boolean(end && end < today);
}

function fmt(iso?: string | null): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11 || !day) return '';
  return `${MONTHS[monthIndex]} ${Number(day)}, ${year}`;
}

function dateRange(tournament: PublicTournament): string {
  const start = fmt(tournament.startDate);
  const end = fmt(tournament.endDate);
  if (start && end && start !== end) return `${start} — ${end}`;
  return start || end;
}

function plainText(value?: string | null, max = 180): string {
  const text = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function FcUnitedTournamentsCatalogClient() {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [showPast, setShowPast] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const autoSwitched = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const qs = new URLSearchParams({
          'isPublished.equals': 'true',
          sort: 'startDate,desc',
          size: '50',
        });
        const res = await fetch(`/api/proxy/tenant-tournaments?${qs}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch tournaments');
        const data = await res.json();
        if (!cancelled) setTournaments(asList(data).filter((row) => row.slug && row.isPublished !== false));
      } catch {
        if (!cancelled) {
          setFetchError(true);
          setTournaments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || autoSwitched.current || tournaments.length === 0) return;
    const today = todayIso();
    const hasFuture = tournaments.some((row) => !isPastTournament(row, today));
    if (!hasFuture) {
      autoSwitched.current = true;
      setShowPast(true);
    }
  }, [loading, tournaments]);

  const today = todayIso();
  const searched = appliedQuery.trim().toLowerCase();
  const draftQuery = searchDraft.trim().toLowerCase();
  const suggestionRows = useMemo(() => {
    if (!draftQuery) return [];
    return tournaments.filter((row) =>
      `${row.title || ''} ${row.shortLabel || ''} ${row.ageGroupLabel || ''} ${row.slug || ''} ${row.id ?? ''}`
        .toLowerCase()
        .includes(draftQuery),
    );
  }, [tournaments, draftQuery]);
  const commitSearch = (value: string) => {
    const next = value.trim();
    setSearchDraft(next);
    setAppliedQuery(next);
    setPage(0);
  };
  const base = useMemo(
    () => tournaments.filter((row) => {
      if (!searched) return true;
      return `${row.title || ''} ${row.shortLabel || ''} ${row.ageGroupLabel || ''} ${row.slug || ''} ${row.id ?? ''}`.toLowerCase().includes(searched);
    }),
    [tournaments, searched],
  );
  const filtered = useMemo(() => {
    return base
      .filter((row) => isPastTournament(row, today) === showPast)
      .sort((a, b) => {
        const aLive = a.status === 'IN_PROGRESS';
        const bLive = b.status === 'IN_PROGRESS';
        if (!showPast && aLive !== bLive) return aLive ? -1 : 1;
        const aDate = a.startDate || '';
        const bDate = b.startDate || '';
        return showPast ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
      });
  }, [base, showPast, today]);

  const futureCount = tournaments.filter((row) => !isPastTournament(row, today)).length;
  const pastCount = tournaments.length - futureCount;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const startItem = totalCount > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const endItem = totalCount > 0 ? safePage * PAGE_SIZE + pageRows.length : 0;

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    listRef.current?.scrollIntoView({ block: 'start' });
  };

  const emptyText = searched
    ? 'Nothing matches the current search.'
    : showPast
      ? 'No past tournaments to show.'
      : 'No tournaments listed yet. Check back soon.';

  return (
    <>
      <div className="md-tn-filters" aria-label="Tournament filters">
        <div className="md-tn-filtercard">
          <div role="tablist" aria-label="Tournament timing">
            <button
              type="button"
              role="tab"
              aria-selected={!showPast}
              className={showPast ? undefined : 'is-on'}
              onClick={() => { setShowPast(false); setPage(0); }}
            >
              Upcoming
              <span>{loading ? '–' : futureCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showPast}
              className={showPast ? 'is-on' : undefined}
              onClick={() => { setShowPast(true); setPage(0); }}
            >
              Past
              <span>{loading ? '–' : pastCount}</span>
            </button>
          </div>
          <FcCatalogTypeahead
            draft={searchDraft}
            onDraftChange={setSearchDraft}
            onCommit={commitSearch}
            suggestions={suggestionRows.slice(0, CATALOG_SUGGESTION_LIMIT).map((row) => ({
              key: row.slug || String(row.id),
              label: row.shortLabel || row.title || 'Tournament',
              hint: row.title && row.shortLabel && row.title !== row.shortLabel ? row.title : row.ageGroupLabel || undefined,
              commitValue: row.shortLabel || row.title || '',
            }))}
            totalCount={suggestionRows.length}
            placeholder="Search by title…"
            ariaLabel="Search tournaments by title"
            leading={(
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            )}
          />
        </div>
      </div>

      <div className="md-tn-list" ref={listRef}>
        <div className="md-tn-wrap">
          <div className="md-tn-head">
            <div>
              <h2>{showPast ? 'Past Tournaments' : 'Upcoming Tournaments'}</h2>
              <span>{loading ? '–' : totalCount}</span>
            </div>
            <p>
              {showPast
                ? 'Tournaments this club has already hosted. Switch to Upcoming for what is coming up.'
                : 'Every published tournament for this club. Open a card for fixtures, guests, and registration.'}
            </p>
          </div>

          {loading ? (
            <div className="md-tn-status" aria-live="polite">
              <div className="md-tn-spin" aria-label="Loading tournaments" />
            </div>
          ) : fetchError ? (
            <div className="md-tn-empty">
              <h3>No tournaments found</h3>
              <p>Could not load tournaments. Please try again later.</p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="md-tn-empty">
              <h3>No tournaments found</h3>
              <p>{emptyText}</p>
              {searched ? (
                <button type="button" onClick={() => commitSearch('')}>Clear search</button>
              ) : null}
            </div>
          ) : (
            <div className="md-tn-cards">
              {pageRows.map((tournament) => {
                const href = `/tournaments/${tournament.slug}`;
                const image = tournament.heroImageUrl?.trim() || '';
                const dates = dateRange(tournament);
                const age = tournament.ageGroupLabel?.trim() || '';
                const blurb = plainText(tournament.welcomeText || tournament.aboutText);
                const live = tournament.status === 'IN_PROGRESS';
                const past = isPastTournament(tournament, today);
                const tone = past ? 'is-past' : live ? 'is-live' : 'is-upcoming';
                const status = live ? 'In progress' : past ? 'Past tournament' : 'Upcoming tournament';
                return (
                  <article key={tournament.id ?? tournament.slug} className={`md-tn-card ${tone}`}>
                    <Link href={href} className="md-tn-card__media" aria-label={`View ${tournament.title}`}>
                      {image ? (
                        <Image src={image} alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" />
                      ) : (
                        <span>Tournament image</span>
                      )}
                    </Link>
                    <div className="md-tn-card__panel">
                      <div className="md-tn-card__copy">
                        <div className="md-tn-card__status">
                          <i className="md-tn-card__bar" />
                          <span>
                            {live ? <b /> : null}
                            {status}
                          </span>
                        </div>
                        <h3>
                          <Link href={href}>{tournament.title}</Link>
                        </h3>
                        <div className="md-tn-card__facts">
                          {dates ? (
                            <span>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="16" rx="2" />
                                <path d="M8 3v4M16 3v4M3 10h18" />
                              </svg>
                              {dates}
                            </span>
                          ) : null}
                          {age ? (
                            <span>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                                <circle cx="9" cy="8" r="3.5" />
                                <path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14.2a6.5 6.5 0 013.5 5.8" />
                              </svg>
                              {age}
                            </span>
                          ) : null}
                        </div>
                        {blurb ? <p>{blurb}</p> : null}
                      </div>
                      <Link href={href} className="md-tn-card__view">
                        View tournament
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !fetchError && totalCount > 0 ? (
            <div className="md-tn-pager">
              <p>{`Showing ${startItem}–${endItem} of ${totalCount} tournaments`}</p>
              <div>
                <button type="button" disabled={safePage === 0} onClick={() => changePage(safePage - 1)}>Previous</button>
                <button type="button" disabled={safePage >= totalPages - 1} onClick={() => changePage(safePage + 1)}>Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
