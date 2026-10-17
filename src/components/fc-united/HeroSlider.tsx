'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { fcBebas } from './fcUnitedFonts';

export type HeroSlide =
  | { kind: 'image'; key: string; src: string; alt: string }
  | {
      kind: 'match';
      key: string;
      home: string;
      away: string;
      date: string;
      league: string;
      title: string;
    };

const AUTOPLAY_MS = 8000;

const FALLBACK_SLIDE: HeroSlide = {
  kind: 'image',
  key: 'fallback',
  src: '/images/md_strikers_media/gallery/Capital_Cup_Hero_Image.jpg',
  alt: 'Capital Cup 2026 — Maryland Strikers',
};

export function HeroSlider({ slides: upcomingSlides }: { slides: HeroSlide[] }) {
  const slides = upcomingSlides.length > 0 ? upcomingSlides : [FALLBACK_SLIDE];
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Timeout keyed on index so a manual arrow/dot click also gets a full interval.
  useEffect(() => {
    if (count < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [count, index]);

  return (
    <div
      className="relative min-h-0 flex-1 bg-[#081224]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Upcoming events and matches"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={cn(
            'absolute inset-0 transition-opacity duration-300 ease-in-out motion-reduce:transition-none',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden={i !== index}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          {slide.kind === 'image' ? (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 70vw"
              priority={i === 0}
              loading={i === 0 ? undefined : 'eager'}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center sm:gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">Upcoming Match</p>
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                <div className="relative h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                  <Image src={slide.home} alt="" fill className="object-contain" sizes="144px" loading="eager" />
                </div>
                <span className={cn(fcBebas.className, 'text-3xl tracking-[0.03em] text-white sm:text-5xl')}>VS</span>
                <div className="relative h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                  <Image src={slide.away} alt="" fill className="object-contain" sizes="144px" loading="eager" />
                </div>
              </div>
              <h3 className={cn(fcBebas.className, 'text-3xl tracking-[0.03em] text-white sm:text-4xl lg:text-5xl')}>
                {slide.title}
              </h3>
              <p className="text-sm font-medium text-[#848992] sm:text-base">
                {slide.date}
                {slide.league ? ` · ${slide.league}` : ''}
              </p>
            </div>
          )}
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#081224]/60 text-white transition-[color,border-color,background] duration-300 hover:border-white/35 hover:bg-[#081224]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
            aria-label="Previous slide"
            title="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#081224]/60 text-white transition-[color,border-color,background] duration-300 hover:border-white/35 hover:bg-[#081224]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
            aria-label="Next slide"
            title="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  'h-2.5 rounded-full transition-[background,width] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]',
                  i === index ? 'w-6 bg-[#ff0000]' : 'w-2.5 bg-white/40 hover:bg-white/70',
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
