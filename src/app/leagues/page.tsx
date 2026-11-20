import type { Metadata } from 'next';
import { fetchPublishedLeagueCatalogServer } from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedLeaguesCatalogClient } from '@/components/fc-united/FcUnitedLeaguesCatalogClient';
import { fcPublicShell } from '@/components/fc-united/fcUnitedFonts';

export const metadata: Metadata = {
  title: 'Leagues',
  description: 'Tables, clubs, and results for each published league.',
};

export const dynamic = 'force-dynamic';

export default async function LeaguesPage() {
  const boards = await fetchPublishedLeagueCatalogServer();

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="leagues" />
      <main className="md-lg">
        <div className="md-lg-hero" aria-label="Leagues">
          <div className="md-lg-wrap">
            <p className="md-lg-kicker"><span />Standings</p>
            <h1>Leagues</h1>
            <p>Tables, clubs, and results for each published league.</p>
          </div>
        </div>
        <FcUnitedLeaguesCatalogClient boards={boards} />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
