import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchLeagueBySlugServer,
  fetchLeagueClubsServer,
  fetchLeagueMatchesServer,
  fetchLeagueStandingsServer,
} from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedLeagueDetail } from '@/components/fc-united/FcUnitedLeagueDetail';
import { fcPublicShell } from '@/components/fc-united/fcUnitedFonts';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await fetchLeagueBySlugServer(slug);
  return {
    title: league?.name || 'League',
    description: league?.description || 'Table, clubs, and fixtures.',
  };
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
    <div className={fcPublicShell}>
      <FcUnitedHeader active="leagues" />
      <main className="md-ld">
        <FcUnitedLeagueDetail league={league} clubs={clubs} matches={matches} rows={rows} />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
