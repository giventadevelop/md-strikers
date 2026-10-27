import { cn } from '@/lib/utils';
import { fcManrope } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { FcUnitedTournamentsCatalogClient } from './FcUnitedTournamentsCatalogClient';

/**
 * Sports-tenant tournament catalog — same shell as the events listing page.
 */
export default function FcUnitedTournamentsPage() {
  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
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
