'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicLeagueBundle } from './ApiServerActions';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchFocus, pitchSection } from './pitchUi';
import { cn } from '@/lib/utils';

const GROUPS = [
  { status: 'ACTIVE', label: 'Ongoing' },
  { status: 'UPCOMING', label: 'Upcoming' },
  { status: 'COMPLETED', label: 'Completed' },
] as const;

function statusLabel(status?: string) {
  return GROUPS.find((group) => group.status === status)?.label ?? 'League';
}

function leadFor(status?: string) {
  if (status === 'COMPLETED') {
    return 'Final table. Three points for a win, one for a draw.';
  }
  if (status === 'UPCOMING') {
    return 'Season has not started. Clubs are listed, and points stay at zero until matches are played.';
  }
  return 'Ongoing season. Three points for a win, one for a draw.';
}

function preferredLeague(leagues: PublicLeagueBundle[]) {
  return (
    leagues.find((entry) => entry.league.status === 'ACTIVE') ??
    leagues.find((entry) => entry.league.status === 'UPCOMING') ??
    leagues[0]
  );
}

export function HomeLeagueSection({ leagues }: { leagues: PublicLeagueBundle[] }) {
  const initial = preferredLeague(leagues);
  const [selectedId, setSelectedId] = useState<number | null>(initial?.league.id ?? null);
  const current = useMemo(
    () => leagues.find((entry) => entry.league.id === selectedId) ?? initial,
    [leagues, selectedId, initial],
  );

  if (!current) return null;

  const { league, rows } = current;
  const grouped = GROUPS.map((group) => ({
    ...group,
    entries: leagues.filter((entry) => entry.league.status === group.status),
  })).filter((group) => group.entries.length > 0);

  return (
    <section className={cn(pitchSection, 'bg-pitch-forest')} aria-labelledby="home-league-heading">
      <PitchShell>
        <PitchHeading
          id="home-league-heading"
          eyebrow={`${statusLabel(league.status)}${league.seasonLabel ? ` · ${league.seasonLabel}` : ''}`}
          title={league.name}
          lead={leadFor(league.status)}
          action={
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-stone">
                League
                <select
                  value={league.id ?? ''}
                  onChange={(event) => setSelectedId(Number(event.target.value))}
                  className={cn(
                    'min-w-[16rem] rounded-full border border-pitch-chalk/25 bg-pitch-charcoal/40 px-4 py-3 text-sm font-semibold normal-case tracking-normal text-pitch-chalk',
                    pitchFocus,
                  )}
                  aria-label="Choose a league"
                >
                  {grouped.map((group) => (
                    <optgroup key={group.status} label={group.label}>
                      {group.entries.map((entry) => (
                        <option key={entry.league.id} value={entry.league.id ?? ''}>
                          {entry.league.name}
                          {entry.league.seasonLabel ? ` (${entry.league.seasonLabel})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              {league.slug ? (
                <Link href={`/leagues/${league.slug}`} className={pitchButton.ghost}>
                  Full league
                  <PitchArrow />
                </Link>
              ) : null}
            </div>
          }
        />
        <LeagueStandingsTable rows={rows} />
      </PitchShell>
    </section>
  );
}
