'use client';

import Image from 'next/image';
import { useCallback, useRef, type ElementRef } from 'react';
import { cn } from '@/lib/utils';
import { fcBebas } from './fcUnitedFonts';

export type FcSquadPlayer = {
  img: string;
  num: string;
  name: string;
  role: string;
};

type Props = { players: FcSquadPlayer[] };

/**
 * Horizontal squad strip: scroll-snap + prev/next for testing.
 * Slides repeat the same `players` entries (3×) as a template until real data exists.
 */
export function FcSquadCarousel({ players }: Props) {
  const scrollerRef = useRef<ElementRef<'div'>>(null);

  const slides = [...players, ...players, ...players];

  const scrollStep = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-carousel-card]');
    const gap = 24;
    const step = card ? card.getBoundingClientRect().width + gap : 280;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="First team squad"
    >
      <button
        type="button"
        className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur transition hover:bg-white/20 md:left-1"
        aria-label="Previous players"
        title="Previous"
        onClick={() => scrollStep(-1)}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur transition hover:bg-white/20 md:right-1"
        aria-label="Next players"
        title="Next"
        onClick={() => scrollStep(1)}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-12 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory md:px-14 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            data-carousel-card
            className="group w-[min(240px,78vw)] shrink-0 snap-center text-center"
          >
            <div className="relative mx-auto aspect-[380/495] max-w-[240px] overflow-hidden rounded-[3px]">
              <Image
                src={p.img}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width:768px) 78vw, 240px"
              />
              <span className="absolute left-3 top-3 rounded bg-[#ff0000] px-2 py-1 text-sm font-bold text-white">
                {p.num}
              </span>
            </div>
            <p className={cn(fcBebas.className, 'mt-4 text-lg text-white')}>{p.name}</p>
            <p className="text-xs uppercase tracking-wide text-[#848992]">{p.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
