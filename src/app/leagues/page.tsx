import type { Metadata } from 'next';
import Link from 'next/link';
import type { LeagueDTO } from '@/types';
import { fetchPublishedLeaguesServer } from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedInnerHero } from '@/components/fc-united/FcUnitedInnerHero';
import { fcPublicShell } from '@/components/fc-united/fcUnitedFonts';
import { PitchArrow, PitchShell } from '@/components/fc-united/pitchUi';

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
        className="md-league-card group flex h-full flex-col p-6 sm:p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#104a91]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="md-league-card__status" data-status={league.status || 'LEAGUE'}>
            {statusLabel(league.status)}
          </p>
          {league.seasonLabel ? <p className="md-league-card__season">{league.seasonLabel}</p> : null}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">{league.name}</h2>
        {league.description ? (
          <p className="mt-3 flex-1 line-clamp-3 text-sm leading-relaxed text-pitch-charcoal/70">{league.description}</p>
        ) : (
          <span className="flex-1" />
        )}
        <span className="md-btn md-btn-primary mt-6 self-start">
          View table
          <PitchArrow />
        </span>
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
    <div className={fcPublicShell}>
      <FcUnitedHeader active="leagues" />
      <FcUnitedInnerHero title="Leagues" subtitle="Tables, clubs, and results for each published league." />
      <section className="md-sport-bg bg-pitch-chalk pb-20 pt-10">
        <PitchShell className="space-y-14">
          {leagues.length === 0 ? (
            <p className="rounded-xl border border-pitch-charcoal/10 bg-pitch-card p-10 text-center text-pitch-charcoal/70">
              No published leagues yet.
            </p>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.status}>
                  <div className="mb-6">
                    <p className="md-league-kicker">{group.label}</p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal md:text-3xl">
                      {group.label} leagues
                    </h2>
                    <p className="mt-2 text-sm text-pitch-charcoal/70">{group.lead}</p>
                  </div>
                  <ul className="md-league-grid grid grid-cols-1 gap-6 md:grid-cols-2">
                    {group.entries.map((league) => (
                      <LeagueCard key={league.id} league={league} />
                    ))}
                  </ul>
                </div>
              ))}
              {other.length > 0 ? (
                <div>
                  <h2 className="mb-6 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Other leagues</h2>
                  <ul className="md-league-grid grid grid-cols-1 gap-6 md:grid-cols-2">
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
