'use client';

import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { pitchPageInset } from './pitchUi';
import { GalleryContent } from '@/app/gallery/GalleryContent';

export default function FcUnitedGalleryPage() {
  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="gallery" />
      <FcUnitedInnerHero
        title="Gallery"
        subtitle="Albums and event photos from Maryland Strikers."
      />
      <main className="md-sport-bg bg-pitch-chalk py-20 md:py-28">
        <div className={pitchPageInset}>
          <Suspense fallback={<p className="text-sm text-pitch-charcoal/70">Loading gallery…</p>}>
            <GalleryContent />
          </Suspense>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
