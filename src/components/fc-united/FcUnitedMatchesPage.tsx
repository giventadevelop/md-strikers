import { cn } from '@/lib/utils';
import { fetchLastMatchesServer } from './ApiServerActions';
import { fcManrope } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { LastMatchSection } from './LastMatchSection';

/**
 * Full matches page: all last_matches rows for the tenant, with upcoming/past toggle.
 */
export default async function FcUnitedMatchesPage() {
  const matches = await fetchLastMatchesServer();

  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="matches" />
      <FcUnitedInnerHero title="Matches" />
      <main>
        <LastMatchSection matches={matches} toggleAlign="center" />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
