import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedTournamentsCatalogClient } from './FcUnitedTournamentsCatalogClient';

/** Sports-tenant tournament catalog in the Claude calendar layout. */
export default function FcUnitedTournamentsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="tournaments" />
      <main className="md-tn">
        <div className="md-tn-hero" aria-label="Tournaments">
          <div className="md-tn-wrap">
            <p className="md-tn-kicker"><span />Club calendar</p>
            <h1>All Tournaments</h1>
            <p>Every published tournament for this club, then the full tournament page.</p>
          </div>
        </div>
        <FcUnitedTournamentsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
