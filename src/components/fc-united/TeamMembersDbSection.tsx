'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, type ElementRef } from 'react';
import { cn } from '@/lib/utils';
import type { TeamMemberImageTitle } from './ApiServerActions';
import { encodePublicPath } from './fcUnitedGalleryData';
import { fcBrand } from './fcUnitedFonts';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchSection } from './pitchUi';

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
    const gap = 32;
    const step = card ? card.getBoundingClientRect().width + gap : 280;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  if (members.length === 0) return null;

  return (
    <section className={cn(fcBrand.className, pitchSection, 'md-sport-bg overflow-hidden bg-pitch-forest')}>
      <PitchShell>
        <PitchHeading
          eyebrow="Squad"
          title="The First Team"
          action={
            <Link href="/team" className={cn(pitchButton.ghost, 'group')}>
              View all players
              <PitchArrow />
            </Link>
          }
        />

        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members"
        >
          <button
            type="button"
            className="absolute left-0 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-pitch-chalk/15 bg-pitch-charcoal/70 text-pitch-chalk backdrop-blur transition-colors duration-300 hover:border-pitch-lime hover:text-pitch-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime motion-reduce:transition-none sm:flex md:left-2"
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
            className="absolute right-0 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-pitch-chalk/15 bg-pitch-charcoal/70 text-pitch-chalk backdrop-blur transition-colors duration-300 hover:border-pitch-lime hover:text-pitch-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime motion-reduce:transition-none sm:flex md:right-2"
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
            className="-mx-4 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-16 [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((m, i) => (
              <div
                key={`${m.id}-${i}`}
                data-carousel-card
                className="group w-[min(260px,72vw)] shrink-0 snap-start"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-pitch-charcoal">
                  <Image
                    src={encodePublicPath(m.profileImageUrl)}
                    alt={m.title}
                    fill
                    className="origin-top scale-[1.22] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.3] motion-reduce:transition-none"
                    sizes="(max-width:768px) 72vw, 260px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pitch-charcoal/95 via-pitch-charcoal/50 to-transparent p-6 pt-16">
                    <p className="text-lg font-bold leading-snug text-pitch-chalk">{m.title}</p>
                    {m.designation ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-lime/90">
                        {m.designation}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </PitchShell>
    </section>
  );
}
