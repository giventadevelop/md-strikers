import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
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
import { PitchShell } from '@/components/fc-united/pitchUi';

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
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
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

  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="leagues" />
      <FcUnitedInnerHero title={league.name} subtitle={league.seasonLabel || league.description || undefined} />
      <section className="bg-pitch-forest py-16 text-pitch-chalk">
        <PitchShell>
          <h2 className="mb-8 text-3xl font-extrabold tracking-[-0.02em]">Standings</h2>
          <LeagueStandingsTable rows={rows} />
        </PitchShell>
      </section>
      <section className="bg-pitch-chalk py-16">
        <PitchShell>
          <h2 className="mb-6 text-3xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Clubs</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <li key={club.id} className="rounded-xl border border-pitch-charcoal/10 bg-white p-4">
                <p className="font-semibold text-pitch-charcoal">{club.name}</p>
                {club.isHomeClub ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-olive">This club</p> : null}
              </li>
            ))}
          </ul>
          <h2 className="mb-6 mt-14 text-3xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">Fixtures</h2>
          {matches.length === 0 ? (
            <p>No fixtures yet.</p>
          ) : (
            <ul className="divide-y divide-pitch-charcoal/10 rounded-xl border border-pitch-charcoal/10 bg-white">
              {matches.map((match) => (
                <li key={match.id} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
