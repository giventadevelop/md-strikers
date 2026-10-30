import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { FcUnitedSponsorsCatalogClient } from './FcUnitedSponsorsCatalogClient';

export default function FcUnitedSponsorsPage() {
  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="sponsors" />
      <FcUnitedInnerHero title="Sponsors" subtitle="Businesses that support the club and its programs." />
      <main>
        <FcUnitedSponsorsCatalogClient />
      </main>
      <FcUnitedFooter />
    </div>
  );
}
