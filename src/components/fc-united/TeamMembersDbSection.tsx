'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, type ElementRef } from 'react';
import { cn } from '@/lib/utils';
import type { TeamMemberImageTitle } from './ApiServerActions';
import { encodePublicPath } from './fcUnitedGalleryData';
import { fcBebas } from './fcUnitedFonts';

type Props = { members: TeamMemberImageTitle[] };

/** team_members profileImageUrl + title + designation; prev/next slider for full roster. */
export function TeamMembersDbSection({ members }: Props) {
  const scrollerRef = useRef<ElementRef<'div'>>(null);

  const slides =
    members.length === 0
      ? []
      : members.length > 6
        ? [...members, ...members]
        : [...members, ...members, ...members];

  const scrollStep = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-carousel-card]');
    const gap = 24;
    const step = card ? card.getBoundingClientRect().width + gap : 280;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  if (members.length === 0) return null;

  return (
    <section className="bg-[#0c1830] py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12">
        <div className="mb-10 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">squad</span>
          <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-white md:text-5xl')}>The First Team</h2>
        </div>

        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members"
        >
          <button
            type="button"
            className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1830] motion-reduce:transition-none md:left-1"
            aria-label="Previous"
            title="Previous"
            onClick={() => scrollStep(-1)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1830] motion-reduce:transition-none md:right-1"
            aria-label="Next"
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
            {slides.map((m, i) => (
              <div
                key={`${m.id}-${i}`}
                data-carousel-card
                className="w-[min(240px,78vw)] shrink-0 snap-center text-center"
              >
                <div className="relative mx-auto aspect-[380/495] max-w-[240px] overflow-hidden rounded-[3px] bg-[#081224]">
                  <Image
                    src={encodePublicPath(m.profileImageUrl)}
                    alt={m.title}
                    fill
                    className="origin-top scale-[1.22] object-cover object-top"
                    sizes="(max-width:768px) 78vw, 240px"
                  />
                </div>
                <p className={cn(fcBebas.className, 'mt-4 text-lg text-white')}>{m.title}</p>
                {m.designation ? (
                  <p className="text-xs uppercase tracking-wide text-[#848992]">{m.designation}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/team"
            className={cn(
              fcBebas.className,
              'inline-flex cursor-pointer items-center justify-center rounded-[32px] bg-[#ff0000] px-8 py-3 text-lg tracking-wide text-white transition-[filter] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none motion-reduce:hover:brightness-100',
            )}
          >
            View All Players
          </Link>
        </div>
      </div>
    </section>
  );
}
