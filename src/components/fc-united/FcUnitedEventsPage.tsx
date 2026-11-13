import { cn } from '@/lib/utils';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedEventsCatalogClient } from './FcUnitedEventsCatalogClient';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

/**
 * Dynamic events page — mdStrikers_site_general_design_final tokens.
 * Future/Past toggle, search, cards from event_details (same tenant as homepage).
 */
export default function FcUnitedEventsPage() {
  return (
    <div className={cn(fcPublicShell, 'md-events-page')}>
      <FcUnitedHeader active="events" />
      <FcUnitedInnerHero
        tone="club"
        title="All Events"
        subtitle="Tickets, registration and the whole schedule in one place."
      />
      <main>
        <FcUnitedEventsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
