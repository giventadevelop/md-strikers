import { cn } from '@/lib/utils';
import { fetchLastMatchesServer } from './ApiServerActions';
import { fcPoppins } from './fcUnitedFonts';
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
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="matches" />
      <FcUnitedInnerHero title="Matches" />
      <main>
        <LastMatchSection matches={matches} toggleAlign="center" />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
