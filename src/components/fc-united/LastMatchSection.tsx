'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { LastMatchCard } from './ApiServerActions';
import { fcBebas } from './fcUnitedFonts';

type MatchView = 'PAST' | 'UPCOMING';

type Props = {
  matches: LastMatchCard[];
};

/**
 * Last Match section with Past / Upcoming period toggle (design-system period chips).
 */
export function LastMatchSection({ matches }: Props) {
  const [view, setView] = useState<MatchView>('PAST');

  const visible = matches.filter((m) => m.matchKind === view);
  const isUpcoming = view === 'UPCOMING';

  return (
    <section className="bg-[#f4f4f4] py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12">
        <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            {!isUpcoming && (
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
                results
              </span>
            )}
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>
              {isUpcoming ? 'The Upcoming Events' : 'Last Matches'}
            </h2>
          </div>

          {/* Period toggle — design system period chips, adapted for light band */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 md:justify-end"
            role="group"
            aria-label="Match list filter"
          >
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
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-sm text-[#797e87] md:text-left">
            {isUpcoming ? 'No upcoming matches scheduled.' : 'No past matches available.'}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((m) => (
              <div
                key={m.id}
                className="rounded-[3px] border border-[#e3e3e3] bg-white p-4 transition-colors hover:border-[#c8c8c8]"
              >
                <div className="flex items-center justify-center gap-3">
                  <Image src={m.home} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                  <Image src={m.away} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                </div>
                <p className="mt-3 text-center text-xs text-[#797e87]">{m.date}</p>
                {isUpcoming ? (
                  <p className={cn(fcBebas.className, 'text-center text-3xl tracking-wide text-[#262f3e]')}>
                    VS
                  </p>
                ) : (
                  <p className={cn(fcBebas.className, 'text-center text-3xl text-[#262f3e]')}>
                    <span className="text-[#2d7a3e]">{m.score[0]}</span> - {m.score[1]}
                  </p>
                )}
                <p className="text-center text-xs text-[#797e87]">{m.league}</p>
                <p className={cn(fcBebas.className, 'mt-2 text-center text-lg text-[#262f3e]')}>{m.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
