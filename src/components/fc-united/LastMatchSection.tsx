'use client';

import { useEffect, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LastMatchCard } from './ApiServerActions';
import { fcBrand } from './fcUnitedFonts';
import { PitchArrow, PitchShell, pitchButton, pitchSection } from './pitchUi';
import { SportBackgroundIcons } from './SportBackgroundIcons';
import { MdPagination } from './MdPagination';

export const HOMEPAGE_MATCHES_LIMIT = 6;
const MATCHES_PAGE_SIZE = 20;

type MatchView = 'PAST' | 'UPCOMING' | 'ALL';

type Props = {
  matches: LastMatchCard[];
  /** Max cards per view (upcoming or past). Omit for no cap (full matches page). */
  limitPerView?: number;
  /** Show “See All Matches” under the grid (homepage). */
  showSeeAll?: boolean;
  /** Toggle alignment: homepage end / matches page center. */
  toggleAlign?: 'end' | 'center';
  /** Match-centre presentation for /matches. Homepage keeps the default layout. */
  centre?: boolean;
};

function TeamSide({
  logo,
  name,
  side,
  tone = 'ink',
}: {
  logo: string;
  name: string;
  side: 'home' | 'away';
  tone?: 'ink' | 'light';
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <Image
        src={logo}
        alt={name ? `${name} logo` : ''}
        width={64}
        height={64}
        className={cn('md-match-crest h-16 w-16 object-contain', `md-match-crest--${side}`)}
      />
      {name && (
        <p className={tone === 'light' ? 'md-centre-name' : 'text-sm font-bold leading-snug text-pitch-charcoal'}>
          {name}
        </p>
      )}
    </div>
  );
}

/** Tilt the card toward the mouse and move its spotlight (CSS vars read by .md-match-card). */
function tiltCard(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return;
  const el = event.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width;
  const y = (event.clientY - r.top) / r.height;
  el.style.setProperty('--rx', `${((0.5 - y) * 16).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${((x - 0.5) * 22).toFixed(2)}deg`);
  el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
}

function resetCard(event: PointerEvent<HTMLElement>) {
  for (const name of ['--rx', '--ry', '--mx', '--my']) event.currentTarget.style.removeProperty(name);
}

function KickoffCountdown({ label }: { label: string }) {
  const target = Date.parse(label);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(target) || target <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target) || target <= now) return null;
  const diff = target - now;
  const parts = [
    Math.floor(diff / 86400000),
    Math.floor((diff % 86400000) / 3600000),
    Math.floor((diff % 3600000) / 60000),
    Math.floor((diff % 60000) / 1000),
  ];
  const units = ['d', 'h', 'm', 's'];
  return (
    <p className="md-centre-count">
      {parts.map((value, index) => (
        <span key={units[index]}>
          {String(value).padStart(2, '0')}
          <small>{units[index]}</small>
        </span>
      ))}
    </p>
  );
}

function CentreCard({ match }: { match: LastMatchCard }) {
  const upcoming = match.matchKind === 'UPCOMING';
  const home = Number(match.score[0]);
  const away = Number(match.score[1]);
  const scored = Number.isFinite(home) && Number.isFinite(away);
  const winner = upcoming || !scored || home === away ? '' : home > away ? match.homeName : match.awayName;

  return (
    <article className="md-centre-card" onPointerMove={tiltCard} onPointerLeave={resetCard}>
      <header>
        {match.league ? <span className="md-centre-badge">{match.league}</span> : null}
        <span className={upcoming ? 'md-centre-status is-next' : 'md-centre-status'}>
          {upcoming ? 'Upcoming' : 'Completed'}
        </span>
      </header>
      <div className="md-centre-board">
        <TeamSide logo={match.home} name={match.homeName} side="home" tone="light" />
        {upcoming ? (
          <p className="md-centre-vs">VS</p>
        ) : (
          <p className="md-centre-score" aria-label={`Final score ${match.score[0]} to ${match.score[1]}`}>
            <span className={scored && home > away ? 'is-win' : undefined}>{match.score[0]}</span>
            <span aria-hidden>–</span>
            <span className={scored && away > home ? 'is-win' : undefined}>{match.score[1]}</span>
          </p>
        )}
        <TeamSide logo={match.away} name={match.awayName} side="away" tone="light" />
      </div>
      <p className="md-centre-date">{match.date}</p>
      {!upcoming && scored ? (
        <p className="md-centre-result">{winner ? `${winner} won` : 'Draw'}</p>
      ) : null}
    </article>
  );
}
function initialMatchView(matches: LastMatchCard[]): MatchView {
  if (matches.some((m) => m.matchKind === 'UPCOMING')) return 'UPCOMING';
  if (matches.some((m) => m.matchKind === 'PAST')) return 'PAST';
  return 'UPCOMING';
}

/**
 * Matches from last_matches: always show section title.
 * Prefer upcoming; if none, fall back to past (marked as Past Matches).
 * Grid is 3 cards per row on large screens.
 */
export function LastMatchSection({
  matches,
  limitPerView,
  showSeeAll = false,
  toggleAlign = 'end',
  centre = false,
}: Props) {
  const [view, setView] = useState<MatchView>(() => initialMatchView(matches));
  const [page, setPage] = useState(0);

  const filtered = view === 'ALL' ? matches : matches.filter((m) => m.matchKind === view);
  const paginate = !(typeof limitPerView === 'number' && limitPerView > 0);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / MATCHES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = paginate
    ? filtered.slice(safePage * MATCHES_PAGE_SIZE, (safePage + 1) * MATCHES_PAGE_SIZE)
    : filtered.slice(0, limitPerView);
  const isUpcoming = view === 'UPCOMING';
  const toggleCentered = toggleAlign === 'center';

  const selectView = (next: MatchView) => {
    setView(next);
    setPage(0);
  };

  if (centre) {
    const featured = matches.find((match) => match.matchKind === 'UPCOMING');
    const heading = view === 'ALL' ? 'All Matches' : isUpcoming ? 'Upcoming Matches' : 'Past Matches';
    const kicker = view === 'PAST' ? 'Results' : 'Fixtures';
    const empty =
      view === 'ALL'
        ? 'No matches available.'
        : isUpcoming
          ? 'No upcoming matches scheduled.'
          : 'No past matches available.';

    return (
      <section className={cn(fcBrand.className, 'md-match-centre')} aria-label="Match list">
        <div className="md-match-centre__inner">
          {featured ? (
            <article className="md-centre-feature">
              <header>
                <p>Featured fixture</p>
                {featured.league ? <span className="md-centre-badge">{featured.league}</span> : null}
                <span className="md-centre-status is-next">Upcoming</span>
              </header>
              <div className="md-centre-board">
                <TeamSide logo={featured.home} name={featured.homeName} side="home" tone="light" />
                <div>
                  <p className="md-centre-vs">VS</p>
                  <KickoffCountdown label={featured.date} />
                </div>
                <TeamSide logo={featured.away} name={featured.awayName} side="away" tone="light" />
              </div>
              <p className="md-centre-date">{featured.date}</p>
            </article>
          ) : null}

          <div className="md-match-centre__head">
            <div>
              <p className="md-match-kicker">{kicker}</p>
              <h2>{heading}</h2>
            </div>
            <div className="md-match-filters" role="group" aria-label="Match list filter">
              {(
                [
                  ['UPCOMING', 'Upcoming Matches'],
                  ['PAST', 'Past Matches'],
                  ['ALL', 'All Matches'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectView(value)}
                  className={view === value ? 'is-on' : undefined}
                  aria-pressed={view === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="md-centre-empty">{empty}</p>
          ) : (
            <div className="md-centre-grid">
              {visible.map((match) => (
                <CentreCard key={match.id} match={match} />
              ))}
            </div>
          )}

          {paginate && (
            <MdPagination
              page={safePage}
              pageSize={MATCHES_PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
              itemLabel="matches"
              itemLabelSingular="match"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={cn(fcBrand.className, pitchSection, 'md-band-scoreboard bg-pitch-charcoal')}>
      <SportBackgroundIcons />
      <PitchShell>
        {showSeeAll && (
          <div className="mb-8 flex justify-end">
            <Link href="/matches" className={cn(pitchButton.primaryOnLight, 'group')}>
              See All Matches
              <PitchArrow />
            </Link>
          </div>
        )}
        <div
          className={cn(
            'mb-12 flex flex-col gap-6 md:mb-16',
            toggleCentered
              ? 'items-center text-center'
              : 'md:flex-row md:items-end md:justify-between',
          )}
        >
          <div className={cn(toggleCentered ? 'text-center' : 'text-left')}>
            <p
              className={cn(
                'mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-olive',
                toggleCentered && 'justify-center',
              )}
            >
              <span className="md-brand-rule h-0.5 w-10 rounded-full" aria-hidden />
              {isUpcoming ? 'Fixtures' : 'Results'}
            </p>
            <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-pitch-charcoal md:text-[2.75rem]">
              {isUpcoming ? 'Upcoming Matches' : 'Past Matches'}
            </h2>
          </div>

          <div
            className={cn(
              'flex flex-wrap items-center gap-2',
              toggleCentered ? 'justify-center' : 'justify-start md:justify-end',
            )}
            role="group"
            aria-label="Match list filter"
          >
            <button
              type="button"
              onClick={() => selectView('UPCOMING')}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive',
                view === 'UPCOMING'
                  ? 'border-transparent md-btn-primary text-white'
                  : 'md-btn-gold',
              )}
              aria-pressed={view === 'UPCOMING'}
            >
              Upcoming Matches
            </button>
            <button
              type="button"
              onClick={() => selectView('PAST')}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive',
                view === 'PAST'
                  ? 'border-transparent md-btn-primary text-white'
                  : 'md-btn-gold',
              )}
              aria-pressed={view === 'PAST'}
            >
              Past Matches
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-pitch-charcoal/10 px-6 py-10 text-center text-sm text-pitch-charcoal/70">
            {isUpcoming ? 'No upcoming matches scheduled.' : 'No past matches available.'}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {visible.map((m) => {
              const home = Number(m.score[0]);
              const away = Number(m.score[1]);
              const winner = isUpcoming || home === away ? '' : home > away ? m.homeName : m.awayName;
              const scoreClass = (side: number, other: number) =>
                !isUpcoming && side > other ? 'text-pitch-olive' : 'text-pitch-charcoal';

              return (
                <article
                  key={m.id}
                  className="md-match-card rounded-2xl border border-pitch-charcoal/10 bg-pitch-card/80 p-6 md:p-8"
                  onPointerMove={tiltCard}
                  onPointerLeave={resetCard}
                >
                  {m.league && (
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/60">
                      {m.league}
                    </p>
                  )}

                  {!isUpcoming && (
                    <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
                      Past Match
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <TeamSide logo={m.home} name={m.homeName} side="home" />
                    {isUpcoming ? (
                      <p className="md-match-vs text-lg">VS</p>
                    ) : (
                      <p className="md-match-score whitespace-nowrap text-3xl font-extrabold tabular-nums">
                        <span className={scoreClass(home, away)}>{m.score[0]}</span>
                        <span className="px-1.5 text-pitch-charcoal/30">–</span>
                        <span className={scoreClass(away, home)}>{m.score[1]}</span>
                      </p>
                    )}
                    <TeamSide logo={m.away} name={m.awayName} side="away" />
                  </div>

                  <p className="md-match-date mt-6 border-t border-pitch-charcoal/10 pt-4 text-center text-sm text-pitch-charcoal/70">{m.date}</p>

                  {!isUpcoming && (
                    <p
                      className={cn(
                        'mt-2 text-center text-sm font-bold',
                        winner ? 'text-pitch-olive' : 'text-pitch-charcoal',
                      )}
                    >
                      {winner ? `${winner} won` : 'Draw'}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {paginate && (
          <MdPagination
            page={safePage}
            pageSize={MATCHES_PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
            itemLabel="matches"
            itemLabelSingular="match"
          />
        )}

        {showSeeAll && (
          <div className="mt-12 flex justify-center">
            <Link href="/matches" className={cn(pitchButton.primaryOnLight, 'group')}>
              See All Matches
              <PitchArrow />
            </Link>
          </div>
        )}
      </PitchShell>
    </section>
  );
}
