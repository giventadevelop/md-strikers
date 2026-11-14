import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedSponsorsCatalogClient } from './FcUnitedSponsorsCatalogClient';

export default function FcUnitedSponsorsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="sponsors" />
      <main className="md-sp">
        <div className="md-sp-hero" aria-label="Sponsors">
          <div className="md-sp-wrap">
            <p className="md-sp-kicker"><span />Partners</p>
            <h1>Sponsors</h1>
            <p>Businesses that support the club and its programs.</p>
          </div>
        </div>
        <FcUnitedSponsorsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
