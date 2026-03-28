'use client';

/**
 * Team roster grid — intentionally not the same as `/gallery`:
 * portrait cells, `object-contain`, and padding so squad headshots aren’t cropped.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { encodePublicPath } from './fcUnitedGalleryData';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export type FcTeamGalleryItem = {
  src: string;
  title: string;
  tag: string;
  kind: 'image';
};

type Props = {
  items: FcTeamGalleryItem[];
};

export default function FcUnitedTeamPage({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i - 1 + items.length) % items.length;
    });
  }, [items.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i;
      return (i + 1) % items.length;
    });
  }, [items.length]);

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

  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="team" />
      <FcUnitedInnerHero title="Team" />

      <section className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <p className="mb-8 text-sm text-[#797e87] md:text-base">
            First Team — photos from <span className="font-medium text-[#262f3e]">squad/members</span>. Thumbnails show the full photo (fit inside the frame). Click any card for the slideshow.
          </p>

          {items.length === 0 ? (
            <div className="rounded-[3px] border border-[#e3e3e3] bg-white p-10 text-center text-[#797e87] shadow-sm">
              <p className={cn(fcBebas.className, 'text-2xl text-[#262f3e]')}>No squad photos yet</p>
              <p className="mt-2 text-sm">Add images to <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-xs">public/images/md_strikers_media/squad/members/</code></p>
            </div>
          ) : (
            <>
              {/* Team grid: portrait frames + object-contain (not gallery cover) so full headshots stay visible */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  type="button"
                  onClick={() => openAt(index)}
                  className="group flex flex-col overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-t-[3px] bg-[#d8dce2] p-3 sm:p-4">
                    <Image
                      src={encodePublicPath(item.src)}
                      alt={item.title}
                      width={800}
                      height={1000}
                      className="h-auto max-h-full w-auto max-w-full min-h-0 min-w-0 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-[#797e87]">{item.tag}</p>
                    <h3 className={cn(fcBebas.className, 'mt-1 text-xl leading-tight text-[#262f3e]')}>{item.title}</h3>
                  </div>
                </button>
              ))}
              </div>
            </>
          )}
        </Shell>
      </section>

      {lightboxIndex !== null && current && items.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/92 p-4"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
          role="dialog"
          aria-modal="true"
          aria-label="Team slideshow"
          onClick={close}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[210] flex items-start justify-end gap-2 p-3 md:p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="pointer-events-auto flex h-12 min-w-[5.5rem] items-center justify-center gap-2 rounded-full bg-[#e31837] px-4 text-sm font-semibold text-white shadow-lg ring-2 ring-white/30 transition-colors hover:bg-[#c41430] hover:ring-white/50"
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
                className="absolute left-2 top-1/2 z-[205] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/95 text-amber-400 shadow-lg ring-2 ring-amber-400/70 transition-colors hover:bg-slate-800 hover:text-amber-300 hover:ring-amber-300 md:left-6"
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
                className="absolute right-2 top-1/2 z-[205] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/95 text-amber-400 shadow-lg ring-2 ring-amber-400/70 transition-colors hover:bg-slate-800 hover:text-amber-300 hover:ring-amber-300 md:right-6"
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
            className="relative mt-14 flex max-h-[min(72vh,calc(100vh-8rem))] w-full max-w-5xl flex-1 items-center justify-center sm:mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[min(72vh,800px)] w-full max-w-5xl">
              <Image
                src={currentSrc}
                alt={current.title}
                fill
                className="object-contain"
                sizes="(max-width:1280px) 100vw, 1024px"
                priority
              />
            </div>
          </div>

          <div className="relative z-[205] mt-4 max-w-2xl px-2 text-center text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-wide text-white/70">{current.tag}</p>
            <h2 className={cn(fcBebas.className, 'mt-1 text-2xl text-white md:text-3xl')}>{current.title}</h2>
            <p className="mt-2 text-sm text-white/80">
              {lightboxIndex + 1} / {items.length} — Arrow keys, side buttons, or tap Close / backdrop
            </p>
          </div>
        </div>
      )}

      <section className="border-t border-[#e3e3e3] bg-[#f4f4f4] py-10">
        <Shell>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:justify-between">
            {fcSponsors.map((src) => (
              <div key={src} className="relative h-12 w-28 md:h-14 md:w-32">
                <Image src={src} alt="" fill className="object-contain opacity-90" sizes="128px" />
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
