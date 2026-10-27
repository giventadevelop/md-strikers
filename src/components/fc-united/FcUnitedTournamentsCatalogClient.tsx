'use client';

/**
 * Sports-tenant tournament catalog — same card language as the events listing.
 * Published tournaments for the current tenant, then a link into /tournaments/[slug].
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PublicTournament } from '@/lib/tournaments/publicTournaments';
import { DEFAULT_EVENT_IMAGE, formatEventDate } from './homeEventDisplay';

import { MdPagination } from './MdPagination';

const PAGE_SIZE = 12;

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

function statusLabel(tournament: PublicTournament, past: boolean): string {
  if (tournament.status === 'IN_PROGRESS') return 'In progress';
  if (past || tournament.status === 'COMPLETED') return 'Past tournament';
  return 'Upcoming tournament';
}

function dateRange(tournament: PublicTournament): string {
  const start = formatEventDate(tournament.startDate || undefined);
  const end = formatEventDate(tournament.endDate || undefined);
  if (start && end && start !== end) return `${start} — ${end}`;
  return start || end || '';
}

function plainText(value?: string | null, max = 180): string {
  const text = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

const pillCta =
  'inline-flex items-center justify-center gap-2 rounded-full bg-pitch-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-in-out hover:bg-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive';

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-full border border-pitch-charcoal/10 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-colors duration-300 hover:border-pitch-charcoal/25 hover:text-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive';

export function FcUnitedTournamentsCatalogClient() {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [showPast, setShowPast] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [appliedTitle, setAppliedTitle] = useState('');
  const autoSwitched = useRef(false);

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
  const filtered = useMemo(() => {
    const query = appliedTitle.trim().toLowerCase();
    return tournaments
      .filter((row) => isPastTournament(row, today) === showPast)
      .filter((row) => {
        if (!query) return true;
        const haystack = `${row.title || ''} ${row.shortLabel || ''} ${row.ageGroupLabel || ''}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const aDate = a.startDate || '';
        const bDate = b.startDate || '';
        return showPast ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
      });
  }, [tournaments, showPast, appliedTitle, today]);

  const futureCount = tournaments.filter((row) => !isPastTournament(row, today)).length;
  const pastCount = tournaments.length - futureCount;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleSearch = () => {
    setAppliedTitle(searchTitle);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTitle('');
    setAppliedTitle('');
    setPage(0);
  };

  return (
    <section className="bg-pitch-chalk pb-16 pt-2 md:pb-20 md:pt-4">
      <Shell>
        <div className="mb-8 text-center md:mb-10 md:text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            club calendar
          </span>
          <h2 className={cn('font-extrabold tracking-[-0.02em] text-3xl text-pitch-charcoal md:text-4xl')}>
            {showPast ? 'Past Tournaments' : 'Upcoming Tournaments'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">
            {showPast
              ? 'Tournaments this club has already hosted. Switch to Future for what is coming up.'
              : 'Every published tournament for this club. Open a card for fixtures, guests, and registration.'}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-8">
          <span
            className={cn(
              'text-2xl font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
              !showPast ? 'text-pitch-olive' : 'text-pitch-charcoal/70',
            )}
          >
            Future
          </span>
          <button
            type="button"
            onClick={() => {
              setShowPast(!showPast);
              setPage(0);
            }}
            className={cn(
              'relative inline-flex h-20 w-32 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pitch-olive focus-visible:ring-offset-2',
              showPast ? 'bg-pitch-forest' : 'bg-pitch-forest',
            )}
            title={showPast ? 'Show upcoming tournaments' : 'Show past tournaments'}
            aria-label={showPast ? 'Show upcoming tournaments' : 'Show past tournaments'}
          >
            <span
              className={cn(
                'inline-flex h-16 w-16 translate-x-2 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300',
                showPast && 'translate-x-14',
              )}
            >
              {showPast ? (
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
              showPast ? 'text-pitch-charcoal' : 'text-pitch-charcoal/70',
            )}
          >
            Past
          </span>
        </div>

        <div className="mb-8 rounded-xl border border-pitch-charcoal/10 bg-white p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            Search tournaments
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="md-tournaments-title" className="mb-1.5 block text-sm font-medium text-pitch-charcoal">
                Title
              </label>
              <input
                id="md-tournaments-title"
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Search by title…"
                className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal outline-none transition-colors duration-300 focus:border-pitch-olive"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <button type="button" onClick={handleSearch} disabled={loading} className={cn(pillCta, 'w-full disabled:opacity-50 sm:w-auto')}>
                Search
              </button>
              <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'w-full sm:w-auto')}>
                Clear
              </button>
            </div>
          </div>
          {appliedTitle && (
            <p className="mt-4 text-sm text-pitch-charcoal/70">Active filters · title “{appliedTitle}”</p>
          )}
        </div>

        {!loading && !fetchError && tournaments.length === 0 && (
          <p className="mb-6 rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-8 text-center text-sm text-pitch-charcoal/70">
            No tournaments listed yet. Check back soon.
          </p>
        )}
        {!loading && !fetchError && showPast && futureCount === 0 && pastCount > 0 && (
          <p className="mb-6 rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-4 text-sm text-pitch-charcoal/70">
            Showing recent tournaments. New upcoming tournaments will appear here when published.
          </p>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-pitch-charcoal/10 border-t-pitch-olive" aria-label="Loading" />
          </div>
        ) : fetchError ? (
          <p className="rounded-xl border border-pitch-olive/30 bg-white px-5 py-8 text-center text-sm font-medium text-pitch-olive">
            Could not load tournaments. Please try again later.
          </p>
        ) : pageRows.length === 0 ? (
          <p className="rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-8 text-center text-sm text-pitch-charcoal/70">
            No tournaments found.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {pageRows.map((tournament) => {
              const href = `/tournaments/${tournament.slug}`;
              const imgSrc = tournament.heroImageUrl?.trim() || DEFAULT_EVENT_IMAGE;
              const dates = dateRange(tournament);
              const blurb = plainText(tournament.welcomeText || tournament.aboutText);
              const past = isPastTournament(tournament, today);
              return (
                <article
                  key={tournament.id ?? tournament.slug}
                  className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white transition-colors duration-300 ease-in-out hover:border-pitch-charcoal/25"
                >
                  {/* Container takes the image's own aspect ratio: full width, no side gaps, no cropping */}
                  <div className="relative w-full border-b border-pitch-charcoal/10 bg-pitch-chalk">
                    <Image
                      src={imgSrc}
                      alt={tournament.title}
                      width={1600}
                      height={900}
                      className="block h-auto w-full"
                      sizes="(max-width: 1240px) 100vw, 1240px"
                    />
                    {past && (
                      <span className="absolute left-3 top-3 rounded-xl bg-pitch-forest px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                        Past tournament
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-5 md:px-6 md:py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
                      {statusLabel(tournament, past)}
                    </p>
                    <h3 className={cn('font-extrabold tracking-[-0.02em] mt-1.5 text-2xl text-pitch-charcoal md:text-3xl')}>
                      <Link
                        href={href}
                        className="transition-colors duration-300 hover:text-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive"
                      >
                        {tournament.title}
                      </Link>
                    </h3>
                    {dates && <p className="mt-2 text-sm font-medium text-pitch-charcoal md:text-[15px]">{dates}</p>}
                    {tournament.ageGroupLabel?.trim() && (
                      <p className="mt-1 text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">
                        {tournament.ageGroupLabel.trim()}
                      </p>
                    )}
                    {blurb && <p className="mt-2 text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">{blurb}</p>}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={href} className={pillCta}>
                        View tournament
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && (
          <MdPagination
            page={safePage}
            pageSize={PAGE_SIZE}
            totalCount={filtered.length}
            onPageChange={setPage}
            itemLabel="tournaments"
          />
        )}
      </Shell>
    </section>
  );
}
