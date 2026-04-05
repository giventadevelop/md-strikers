'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  mdStrikersMemorableMomentTiles,
  mdStrikersMemorableMomentsHeading,
} from './fcUnitedAboutContent';
import { encodePublicPath } from './fcUnitedGalleryData';
import { fcBebas, fcPoppins } from './fcUnitedFonts';

const items = mdStrikersMemorableMomentTiles;

/**
 * Memorable moments: single-column, full-bleed thumbnails + gallery-style lightbox.
 */
export function FcMemorableMomentsSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i - 1 + items.length) % items.length;
    });
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i + 1) % items.length;
    });
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, close, goPrev, goNext]);

  const openAt = (index: number) => setLightboxIndex(index);

  const current = lightboxIndex !== null ? items[lightboxIndex] : null;
  const currentSrc = current ? encodePublicPath(current.src) : '';
  const currentLongDescription = current?.description?.trim();
  const hasSeparateDescription = Boolean(
    current && currentLongDescription && currentLongDescription !== current.caption,
  );

  return (
    <section className="overflow-x-hidden bg-white py-12 md:py-16">
      <div className="mx-auto mb-8 w-full max-w-[1308px] px-4 md:mb-10 md:px-7 lg:px-12">
        <h2
          className={cn(
            fcBebas.className,
            'text-center text-3xl uppercase tracking-[0.12em] text-[#262f3e] md:text-4xl',
          )}
        >
          {mdStrikersMemorableMomentsHeading}
        </h2>
      </div>

      {/* Full-bleed edge-to-edge thumbnails (single column) */}
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <div className="flex flex-col">
          {items.map((tile, index) => (
            <button
              key={tile.src}
              type="button"
              onClick={() => openAt(index)}
              className="group w-full cursor-pointer border-b border-[#e3e3e3] bg-white text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e31837] motion-reduce:transition-none"
            >
              <div className="relative h-[min(58vh,640px)] min-h-[300px] w-full overflow-hidden bg-[#081224] sm:min-h-[380px] md:min-h-[440px]">
                <Image
                  src={encodePublicPath(tile.src)}
                  alt={tile.caption}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="100vw"
                  priority={index < 2}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
              </div>
              <div
                className={cn(
                  fcPoppins.className,
                  'mx-auto w-full max-w-[1308px] px-4 py-5 md:px-7 md:py-6 lg:px-12',
                )}
              >
                <p className="text-xs uppercase tracking-wide text-[#797e87]">Memorable moment</p>
                <p className={cn(fcBebas.className, 'mt-1 text-xl leading-snug text-[#262f3e] md:text-2xl')}>
                  {tile.caption}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && current && (
        <div
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col bg-black/92"
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Memorable moments slideshow"
          aria-describedby="memorable-moment-description"
          onClick={close}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[210] flex items-start justify-end gap-2 p-3 md:p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="pointer-events-auto flex h-12 min-w-[5.5rem] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e31837] px-4 text-sm font-semibold text-white shadow-lg ring-2 ring-white/30 transition-colors duration-200 hover:bg-[#c41430] hover:ring-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/90"
              title="Close"
              aria-label="Close slideshow"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 z-[205] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-slate-900/95 text-amber-400 shadow-lg ring-2 ring-amber-400/70 transition-colors duration-200 hover:bg-slate-800 hover:text-amber-300 hover:ring-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/90 md:left-6"
                title="Previous"
                aria-label="Previous image"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 z-[205] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-slate-900/95 text-amber-400 shadow-lg ring-2 ring-amber-400/70 transition-colors duration-200 hover:bg-slate-800 hover:text-amber-300 hover:ring-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/90 md:right-6"
                title="Next"
                aria-label="Next image"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="mx-auto flex min-h-0 w-full max-w-5xl cursor-default flex-1 flex-col px-4 pt-14 sm:pt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-0 w-full flex-1">
              <div className="relative mx-auto h-[min(52vh,520px)] w-full max-w-5xl sm:h-[min(58vh,640px)] md:h-[min(62vh,720px)]">
                <Image
                  key={currentSrc}
                  src={currentSrc}
                  alt={current.caption}
                  fill
                  className="object-contain"
                  sizes="(max-width:1280px) 100vw, 1024px"
                  priority
                />
              </div>
            </div>

            <div
              id="memorable-moment-description"
              className="relative z-[205] mt-4 w-full max-w-3xl shrink-0 self-center rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-left backdrop-blur-sm sm:px-6 sm:py-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">Description</p>
              {hasSeparateDescription ? (
                <>
                  <p className={cn(fcBebas.className, 'mt-2 text-xl leading-snug text-white md:text-2xl')}>{current.caption}</p>
                  <p className={cn(fcPoppins.className, 'mt-3 text-sm leading-relaxed text-white/90 md:text-base')}>
                    {currentLongDescription}
                  </p>
                </>
              ) : (
                <p className={cn(fcPoppins.className, 'mt-3 text-base leading-relaxed text-white md:text-lg')}>
                  {current.caption}
                </p>
              )}
              <p className="mt-4 border-t border-white/10 pt-3 text-center text-xs text-white/65">
                {lightboxIndex + 1} / {items.length} — Arrow keys, side buttons, or tap Close / backdrop
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
