'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LastMatchCard } from './ApiServerActions';
import { fcBebas } from './fcUnitedFonts';

export const HOMEPAGE_MATCHES_LIMIT = 6;

type MatchView = 'PAST' | 'UPCOMING';

type Props = {
  matches: LastMatchCard[];
  /** Max cards per view (upcoming or past). Omit for no cap (full matches page). */
  limitPerView?: number;
  /** Show “See All Matches” under the grid (homepage). */
  showSeeAll?: boolean;
  /** Toggle alignment: homepage end / matches page center. */
  toggleAlign?: 'end' | 'center';
};

function TeamSide({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <Image src={logo} alt={name ? `${name} logo` : ''} width={80} height={80} className="h-20 w-20 object-contain" />
      {name && (
        <p className={cn(fcBebas.className, 'text-lg leading-tight tracking-wide text-[#262f3e]')}>{name}</p>
      )}
    </div>
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
}: Props) {
  const [view, setView] = useState<MatchView>(() => initialMatchView(matches));

  const filtered = matches.filter((m) => m.matchKind === view);
  const visible =
    typeof limitPerView === 'number' && limitPerView > 0 ? filtered.slice(0, limitPerView) : filtered;
  const isUpcoming = view === 'UPCOMING';
  const toggleCentered = toggleAlign === 'center';

  return (
    <section className="bg-[#f4f4f4] py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12">
        <div
          className={cn(
            'mb-6 flex flex-col gap-4 md:mb-10',
            toggleCentered
              ? 'items-center text-center'
              : 'md:flex-row md:items-end md:justify-between',
          )}
        >
          <div className={cn(toggleCentered ? 'text-center' : 'text-center md:text-left')}>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
              {isUpcoming ? 'fixtures' : 'results'}
            </span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>
              {isUpcoming ? 'Upcoming Matches' : 'Past Matches'}
            </h2>
          </div>

          <div
            className={cn(
              'flex flex-wrap items-center gap-2',
              toggleCentered ? 'justify-center' : 'justify-center md:justify-end',
            )}
            role="group"
            aria-label="Match list filter"
          >
            <button
              type="button"
              onClick={() => setView('UPCOMING')}
              className={cn(
                'rounded-[32px] border px-[18px] py-2.5 text-[13px] font-medium transition-[color,border-color,background,filter] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]',
                view === 'UPCOMING'
                  ? 'border-[#ff0000] bg-[#ff0000] text-white'
                  : 'border-[#e3e3e3] bg-transparent text-[#797e87] hover:border-[#c8c8c8] hover:text-[#262f3e]',
              )}
              aria-pressed={view === 'UPCOMING'}
            >
              Upcoming Matches
            </button>
            <button
              type="button"
              onClick={() => setView('PAST')}
              className={cn(
                'rounded-[32px] border px-[18px] py-2.5 text-[13px] font-medium transition-[color,border-color,background,filter] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]',
                view === 'PAST'
                  ? 'border-[#ff0000] bg-[#ff0000] text-white'
                  : 'border-[#e3e3e3] bg-transparent text-[#797e87] hover:border-[#c8c8c8] hover:text-[#262f3e]',
              )}
              aria-pressed={view === 'PAST'}
            >
              Past Matches
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-[3px] border border-[#e3e3e3] bg-white px-5 py-8 text-center text-sm text-[#797e87] md:text-left">
            {isUpcoming ? 'No upcoming matches scheduled.' : 'No past matches available.'}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => {
              const home = Number(m.score[0]);
              const away = Number(m.score[1]);
              const winner = isUpcoming || home === away ? '' : home > away ? m.homeName : m.awayName;
              const scoreClass = (side: number, other: number) =>
                !isUpcoming && side > other ? 'text-[#2d7a3e]' : 'text-[#262f3e]';

              return (
                <article
                  key={m.id}
                  className="rounded-[3px] border border-[#e3e3e3] bg-white p-6 transition-colors hover:border-[#c8c8c8]"
                >
                  {m.league && (
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
                      {m.league}
                    </p>
                  )}

                  {!isUpcoming && (
                    <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">
                      Past Match
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <TeamSide logo={m.home} name={m.homeName} />
                    {isUpcoming ? (
                      <p className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e]')}>VS</p>
                    ) : (
                      <p className={cn(fcBebas.className, 'whitespace-nowrap text-4xl tracking-wide')}>
                        <span className={scoreClass(home, away)}>{m.score[0]}</span>
                        <span className="px-1.5 text-[#797e87]">-</span>
                        <span className={scoreClass(away, home)}>{m.score[1]}</span>
                      </p>
                    )}
                    <TeamSide logo={m.away} name={m.awayName} />
                  </div>

                  <p className="mt-5 text-center text-sm text-[#797e87]">{m.date}</p>

                  {!isUpcoming && (
                    <p
                      className={cn(
                        fcBebas.className,
                        'mt-2 text-center text-xl tracking-wide',
                        winner ? 'text-[#ff0000]' : 'text-[#262f3e]',
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

        {showSeeAll && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/matches"
              className="inline-flex items-center justify-center gap-2 rounded-[32px] bg-[#ff0000] px-7 py-3 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
            >
              See All Matches
              <span aria-hidden>›</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
