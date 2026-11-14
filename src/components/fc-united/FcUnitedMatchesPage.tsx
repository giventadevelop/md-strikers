import { fetchLastMatchesServer } from './ApiServerActions';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { MatchCentreView } from './MatchCentreView';

/**
 * Full matches page: all last_matches rows for the tenant.
 */
export default async function FcUnitedMatchesPage() {
  const matches = await fetchLastMatchesServer();

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="matches" />
      <main className="md-mc">
        <MatchCentreView matches={matches} />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
