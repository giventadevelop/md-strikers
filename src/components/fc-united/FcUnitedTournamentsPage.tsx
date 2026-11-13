import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { FcUnitedTournamentsCatalogClient } from './FcUnitedTournamentsCatalogClient';

/**
 * Sports-tenant tournament catalog — same shell as the events listing page.
 */
export default function FcUnitedTournamentsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="tournaments" />
      <FcUnitedInnerHero
        title="All Tournaments"
        subtitle="Every published tournament for this club, then the full tournament page."
      />
      <main>
        <FcUnitedTournamentsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
