'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, type ElementRef } from 'react';
import { cn } from '@/lib/utils';
import type { TeamMemberImageTitle } from './ApiServerActions';
import { encodePublicPath } from './fcUnitedGalleryData';
import { fcBrand } from './fcUnitedFonts';
import { stepLoop } from './loopCarousel';
import { PitchShell } from './pitchUi';

type Props = { members: TeamMemberImageTitle[] };

type StatCol = { label: string; career: number | null; season: number | null };

function statColumns(m: TeamMemberImageTitle): StatCol[] {
  return [
    { label: 'Appearances', career: m.careerAppearances, season: m.seasonAppearances },
    { label: 'Goals', career: m.careerGoals, season: m.seasonGoals },
    { label: 'Assists', career: m.careerAssists, season: m.seasonAssists },
  ].filter((col) => col.career != null || col.season != null);
}

/** team_members slider. Resting card shows the name; hover slides the detail panel up. */
export function TeamMembersDbSection({ members }: Props) {
  const scrollerRef = useRef<ElementRef<'div'>>(null);
  const pausedRef = useRef(false);

  const slides =
    members.length === 0
      ? []
      : members.length > 6
        ? [...members, ...members]
        : [...members, ...members, ...members];

  const scrollStep = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    stepLoop(el, dir, members.length);
  }, [members.length]);

  useEffect(() => {
    if (members.length < 2) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      stepLoop(el, 1, members.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [members.length]);

  if (members.length === 0) return null;

  return (
    <section className={cn(fcBrand.className, 'md-band-players overflow-hidden py-14 md:py-20')}>
      <PitchShell>
        <div className="md-players-head">
          <Link href="/team" className="md-players-all">
            View all players
          </Link>
          <h2 className="md-players-title">Players</h2>
          <div className="md-players-nav">
            <button type="button" aria-label="Previous" title="Previous" onClick={() => scrollStep(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" aria-label="Next" title="Next" onClick={() => scrollStep(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members"
        >
          <div
            ref={scrollerRef}
            className="md-players-track pointer-events-auto flex gap-4 overflow-x-hidden pb-6"
            onPointerEnter={() => {
              pausedRef.current = true;
            }}
            onPointerLeave={() => {
              pausedRef.current = false;
            }}
          >
            {slides.map((m, i) => {
              const sourceIndex = i % members.length;
              const tone = sourceIndex % 2 === 0 ? 'red' : 'navy';
              const role = m.position || m.designation;
              const cols = statColumns(m);
              const hasDetails = Boolean(role) || cols.length > 0;
              return (
                <div
                  key={`${m.id}-${i}`}
                  data-carousel-card
                  className="w-[calc((100%-2rem)/3)] min-w-0 shrink-0"
                >
                  <Link
                    href={`/team/${m.id}`}
                    className={cn(
                      'md-player-card',
                      tone === 'red' ? 'md-player-card--red' : 'md-player-card--navy',
                      !hasDetails && 'md-player-card--plain',
                    )}
                  >
                    <Image
                      src={encodePublicPath(m.profileImageUrl)}
                      alt={m.title}
                      fill
                      className="md-player-card__photo object-cover object-top"
                      sizes="(max-width:639px) 78vw, (max-width:1023px) 46vw, 32vw"
                    />
                    <span className="md-player-card__wash" aria-hidden />
                    {m.jerseyNumber != null ? (
                      <span className="md-player-card__number" aria-hidden>
                        {m.jerseyNumber}
                      </span>
                    ) : null}
                    <span className="md-player-card__info">
                      <span className="md-player-card__name">{m.title}</span>
                    </span>
                    {hasDetails ? (
                      <span className="md-player-card__stats">
                        {role ? <span className="md-player-card__role">{role}</span> : null}
                        {cols.length > 0 ? (
                          <span className="md-player-card__stat-row">
                            {cols.map((col) => (
                              <span key={col.label} className="md-player-card__stat">
                                <span className="md-player-card__stat-label">{col.label}</span>
                                <span className="md-player-card__stat-value">
                                  {col.career != null ? col.career : col.season}
                                </span>
                                {col.career != null && col.season != null ? (
                                  <span className="md-player-card__stat-season">
                                    {m.seasonLabel ? <span>{m.seasonLabel}</span> : null}
                                    <strong>{col.season}</strong>
                                  </span>
                                ) : null}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </PitchShell>
    </section>
  );
}
