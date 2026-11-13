'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { pitchPageInset } from './pitchUi';
import { GalleryContent } from '@/app/gallery/GalleryContent';

const GALLERY_HERO_IMAGE = '/images/hero_section/stadium-night.jpg';

export default function FcUnitedGalleryPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="gallery" />
      <section className="md-gallery-hero md-sport-bg" aria-label="Gallery">
        <div className="md-gallery-hero__media" aria-hidden>
          <Image src={GALLERY_HERO_IMAGE} alt="" fill priority className="object-cover object-[center_40%]" sizes="100vw" />
        </div>
        <div className="md-gallery-hero__shade" aria-hidden />
        <div className={`${pitchPageInset} md-gallery-hero__content`}>
          <nav className="md-gallery-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span>Gallery</span>
          </nav>
          <p className="md-gallery-kicker">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            MD Strikers Media
          </p>
          <h1>Our Gallery</h1>
          <span className="md-gallery-rule" aria-hidden />
          <p>Explore the moments, matches and memories that define our club.</p>
          <p>Albums and event photos from Maryland Strikers.</p>
        </div>
      </section>
      <main className="md-sport-bg md-gallery-main">
        <div className={pitchPageInset}>
          <Suspense fallback={<p className="md-gallery-loading">Loading gallery…</p>}>
            <GalleryContent />
          </Suspense>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
