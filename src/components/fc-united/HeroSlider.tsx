'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type HeroSlide =
  | { kind: 'image'; key: string; src: string; alt: string }
  | {
      kind: 'match';
      key: string;
      home: string;
      away: string;
      homeName: string;
      awayName: string;
      date: string;
      league: string;
    };

const AUTOPLAY_MS = 5000;
/** Above this many slides the dot row is replaced by a "3 / 40" counter. */
const MAX_DOTS = 12;

const FALLBACK_SLIDE: HeroSlide = {
  kind: 'image',
  key: 'fallback',
  src: '/images/md_strikers_media/gallery/Capital_Cup_Hero_Image.jpg',
  alt: 'Capital Cup 2026 — Maryland Strikers',
};

function MatchCrest({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:gap-3">
      <div className="relative h-12 w-12 sm:h-24 sm:w-24 lg:h-32 lg:w-32">
        <Image src={logo} alt={name ? `${name} crest` : ''} fill className="object-contain" sizes="128px" loading="eager" />
      </div>
      {name && <p className="text-xs font-bold leading-snug text-pitch-chalk sm:text-base lg:text-lg">{name}</p>}
    </div>
  );
}

const controlClass =
  'md-hero-control flex h-11 w-11 items-center justify-center rounded-full border border-pitch-chalk/20 text-pitch-chalk backdrop-blur transition-colors duration-300 hover:border-pitch-lime hover:text-pitch-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-lime motion-reduce:transition-none';

export function HeroSlider({ slides: upcomingSlides }: { slides: HeroSlide[] }) {
  const slides = upcomingSlides.length > 0 ? upcomingSlides : [FALLBACK_SLIDE];
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Timeout keyed on index so a manual arrow/dot click also gets a full interval; wraps to loop.
  useEffect(() => {
    if (count < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [count, index]);

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Upcoming events and matches"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden={i !== index}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          {slide.kind === 'image' ? (
            <>
              {/* Blurred copy fills the frame behind the uncropped flyer */}
              <Image
                src={slide.src}
                alt=""
                fill
                className="scale-110 object-cover opacity-40 blur-2xl"
                sizes="10vw"
                loading={i === 0 ? undefined : 'eager'}
              />
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 100vw, 70vw"
                priority={i === 0}
                loading={i === 0 ? undefined : 'eager'}
              />
            </>
          ) : (
            <div className="md-hero-match flex h-full w-full flex-col items-center justify-center px-14 pb-14 pt-4 text-center sm:px-16 sm:pb-16 sm:pt-8">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">
                <span className="md-hero-kicker-mark" aria-hidden />
                Upcoming match
              </p>
              <div className="mt-3 grid w-full max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-6 sm:gap-6">
                <MatchCrest logo={slide.home} name={slide.homeName} />
                <span className="md-hero-vs text-xl font-extrabold tracking-[-0.02em] text-pitch-chalk sm:text-3xl">VS</span>
                <MatchCrest logo={slide.away} name={slide.awayName} />
              </div>
              <p className="md-hero-kickoff mt-3 text-xs font-medium text-pitch-stone sm:mt-6 sm:text-sm">
                <span className="font-semibold text-pitch-chalk">{slide.date}</span>
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
            className={cn(controlClass, 'absolute left-4 top-1/2 z-10 -translate-y-1/2')}
            aria-label="Previous slide"
            title="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className={cn(controlClass, 'absolute right-4 top-1/2 z-10 -translate-y-1/2')}
            aria-label="Next slide"
            title="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-16">
            {count <= MAX_DOTS ? (
              <div className="md-hero-dots flex items-center gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => go(i)}
                    className={cn(
                      'h-2 rounded-full transition-[background-color,width] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-lime',
                      i === index ? 'w-6 bg-pitch-lime' : 'w-2 bg-pitch-chalk/40 hover:bg-pitch-chalk/70',
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                  />
                ))}
              </div>
            ) : (
              <p
                className="md-hero-control rounded-full px-4 py-1.5 text-xs font-semibold tabular-nums tracking-[0.12em] text-pitch-chalk backdrop-blur"
              >
                <span className="text-pitch-lime">{index + 1}</span> / {count}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
