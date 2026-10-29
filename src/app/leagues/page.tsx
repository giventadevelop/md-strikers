import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LeagueDTO } from '@/types';
import { fetchPublishedLeaguesServer } from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedInnerHero } from '@/components/fc-united/FcUnitedInnerHero';
import { fcManrope } from '@/components/fc-united/fcUnitedFonts';
import { PitchShell } from '@/components/fc-united/pitchUi';

export const metadata: Metadata = {
  title: 'Leagues',
  description: 'Published league tables for Maryland Strikers.',
};

export const dynamic = 'force-dynamic';

const GROUPS: { status: string; label: string; lead: string }[] = [
  { status: 'ACTIVE', label: 'Ongoing', lead: 'Current season tables.' },
  { status: 'UPCOMING', label: 'Upcoming', lead: 'Seasons that have not started yet.' },
  { status: 'COMPLETED', label: 'Completed', lead: 'Final tables and champions.' },
];

function statusLabel(status?: string) {
  return GROUPS.find((group) => group.status === status)?.label ?? status ?? 'League';
}

function LeagueCard({ league }: { league: LeagueDTO }) {
  return (
    <li>
      <Link
        href={`/leagues/${league.slug}`}
        className="flex h-full flex-col rounded-xl border border-pitch-charcoal/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
          {statusLabel(league.status)}
          {league.seasonLabel ? ` · ${league.seasonLabel}` : ''}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">{league.name}</h2>
        {league.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-pitch-charcoal/70">{league.description}</p>
        ) : null}
        <span className="mt-6 text-sm font-semibold text-pitch-olive">View table →</span>
      </Link>
    </li>
  );
}

export default async function LeaguesPage() {
  const leagues = await fetchPublishedLeaguesServer();
  const grouped = GROUPS.map((group) => ({
    ...group,
    entries: leagues.filter((league) => league.status === group.status),
  })).filter((group) => group.entries.length > 0);
  const other = leagues.filter((league) => !GROUPS.some((group) => group.status === league.status));

  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="leagues" />
      <FcUnitedInnerHero title="Leagues" subtitle="Tables, clubs, and results for each published league." />
      <section className="bg-pitch-chalk pb-20 pt-10">
        <PitchShell className="space-y-14">
          {leagues.length === 0 ? (
            <p className="rounded-xl border border-pitch-charcoal/10 bg-white p-10 text-center text-pitch-charcoal/70">
              No published leagues yet.
            </p>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.status}>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pitch-olive">{group.label}</p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal md:text-3xl">
                      {group.label} leagues
                    </h2>
                    <p className="mt-2 text-sm text-pitch-charcoal/70">{group.lead}</p>
                  </div>
                  <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {group.entries.map((league) => (
                      <LeagueCard key={league.id} league={league} />
                    ))}
                  </ul>
                </div>
              ))}
              {other.length > 0 ? (
                <div>
                  <h2 className="mb-6 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Other leagues</h2>
                  <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {other.map((league) => (
                      <LeagueCard key={league.id} league={league} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </PitchShell>
      </section>
      <FcUnitedFooter />
    </div>
  );
}
