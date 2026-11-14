import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedEventsCatalogClient } from './FcUnitedEventsCatalogClient';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';

export default function FcUnitedEventsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="events" />
      <main className="md-ev">
        <div className="md-ev-hero" aria-label="Events">
          <div className="md-ev-wrap">
            <p className="md-ev-kicker"><span />Calendar</p>
            <h1>All Events</h1>
            <p>Tickets, registration and the whole schedule in one place.</p>
          </div>
        </div>
        <FcUnitedEventsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
