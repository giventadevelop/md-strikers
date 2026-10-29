import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LeagueStandingRowDTO } from '@/types';
import {
  fetchLeagueBySlugServer,
  fetchLeagueClubsServer,
  fetchLeagueMatchesServer,
  fetchLeagueStandingsServer,
} from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedInnerHero } from '@/components/fc-united/FcUnitedInnerHero';
import { fcManrope } from '@/components/fc-united/fcUnitedFonts';
import { LeagueStandingsTable } from '@/components/fc-united/LeagueStandingsTable';
import { PitchShell, pitchButton } from '@/components/fc-united/pitchUi';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await fetchLeagueBySlugServer(slug);
  return { title: league?.name || 'League' };
}

function clubName(clubs: { id?: number | null; name: string }[], id: number) {
  return clubs.find((club) => club.id === id)?.name || 'Club';
}

function when(value?: string) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusLabel(status?: string) {
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'ACTIVE') return 'Ongoing';
  if (status === 'UPCOMING') return 'Upcoming';
  return status || 'League';
}

function champion(rows: LeagueStandingRowDTO[]) {
  if (rows.length === 0) return null;
  return [...rows].sort((a, b) => {
    if ((a.position ?? 999) !== (b.position ?? 999)) return (a.position ?? 999) - (b.position ?? 999);
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return a.clubName.localeCompare(b.clubName);
  })[0];
}

export default async function LeaguePage({ params }: PageProps) {
  const { slug } = await params;
  const league = await fetchLeagueBySlugServer(slug);
  if (!league?.id) notFound();
  const [clubs, matches, rows] = await Promise.all([
    fetchLeagueClubsServer(league.id),
    fetchLeagueMatchesServer(league.id),
    fetchLeagueStandingsServer(league.id),
  ]);
  const isCompleted = league.status === 'COMPLETED';
  const winner = isCompleted ? champion(rows) : null;
  const heroSubtitle = [statusLabel(league.status), league.seasonLabel, league.description]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="leagues" />
      <FcUnitedInnerHero
        title={league.name}
        subtitle={heroSubtitle || undefined}
        parentHref="/leagues"
        parentLabel="Leagues"
      />

      {winner ? (
        <section className="border-b border-pitch-lime/20 bg-pitch-charcoal py-10 text-pitch-chalk" aria-label="League champion">
          <PitchShell>
            <div className="flex flex-col gap-4 rounded-2xl border border-pitch-lime/35 bg-pitch-forest/70 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">Champions</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-pitch-chalk md:text-4xl">
                  {winner.clubName}
                </h2>
                <p className="mt-2 text-sm text-pitch-chalk/75 md:text-base">
                  Finished first in {league.name}
                  {league.seasonLabel ? ` (${league.seasonLabel})` : ''} with {winner.points} points
                  {winner.played > 0 ? ` from ${winner.played} matches` : ''}.
                </p>
              </div>
              <div className="flex items-center gap-6 tabular-nums">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-pitch-lime">{winner.points}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-stone">Pts</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-pitch-chalk">
                    {winner.goalDifference > 0 ? `+${winner.goalDifference}` : winner.goalDifference}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-stone">GD</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-pitch-chalk">
                    {winner.won}-{winner.drawn}-{winner.lost}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-stone">W-D-L</p>
                </div>
              </div>
            </div>
          </PitchShell>
        </section>
      ) : null}

      <section className="bg-pitch-forest py-16 text-pitch-chalk">
        <PitchShell>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">Table</p>
              <h2 className="text-3xl font-extrabold tracking-[-0.02em]">Standings</h2>
            </div>
            <Link href="/leagues" className={pitchButton.ghost}>
              All leagues
            </Link>
          </div>
          <LeagueStandingsTable rows={rows} highlightChampion={isCompleted} />
        </PitchShell>
      </section>

      <section className="bg-pitch-chalk py-16">
        <PitchShell>
          <h2 className="mb-6 text-3xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Clubs</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <li
                key={club.id}
                className={cn(
                  'rounded-xl border bg-white p-4',
                  winner && club.id === winner.leagueClubId
                    ? 'border-pitch-olive/40 shadow-sm'
                    : 'border-pitch-charcoal/10',
                )}
              >
                <p className="font-semibold text-pitch-charcoal">{club.name}</p>
                {club.isHomeClub ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-olive">This club</p>
                ) : null}
                {winner && club.id === winner.leagueClubId ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-olive">Champions</p>
                ) : null}
              </li>
            ))}
          </ul>

          <h2 className="mb-6 mt-14 text-3xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Fixtures</h2>
          {matches.length === 0 ? (
            <p>No fixtures yet.</p>
          ) : (
            <ul className="divide-y divide-pitch-charcoal/10 rounded-xl border border-pitch-charcoal/10 bg-white">
              {matches.map((match) => (
                <li
                  key={match.id}
                  className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-semibold text-pitch-charcoal">
                    {clubName(clubs, match.homeClubId)} vs {clubName(clubs, match.awayClubId)}
                  </p>
                  <p className="text-sm">
                    {match.status === 'PLAYED' && match.homeScore != null && match.awayScore != null
                      ? `${match.homeScore}–${match.awayScore}`
                      : match.status || 'Scheduled'}
                    <span className="mx-2 text-pitch-charcoal/30">·</span>
                    {when(match.playedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PitchShell>
      </section>
      <FcUnitedFooter />
    </div>
  );
}
