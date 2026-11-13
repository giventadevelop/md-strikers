import { fetchLastMatchesServer } from './ApiServerActions';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { LastMatchSection } from './LastMatchSection';
import { MatchCentreHero } from './MatchCentreHero';

/**
 * Full matches page: all last_matches rows for the tenant, with upcoming/past toggle.
 */
export default async function FcUnitedMatchesPage() {
  const matches = await fetchLastMatchesServer();
  const upcoming = matches.filter((match) => match.matchKind === 'UPCOMING').length;
  const teams = new Set(
    matches.flatMap((match) => [match.homeName, match.awayName].filter((name) => name.length > 0)),
  ).size;

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="matches" />
      <MatchCentreHero total={matches.length} upcoming={upcoming} completed={matches.length - upcoming} teams={teams} />
      <main>
        <LastMatchSection matches={matches} toggleAlign="center" centre />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
