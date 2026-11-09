'use client';

import { useCallback, useEffect, useRef, useState, type ElementRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { fcBrand } from './fcUnitedFonts';
import { stepLoop } from './loopCarousel';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchSection } from './pitchUi';
import { SportBackgroundIcons } from './SportBackgroundIcons';
import { MdPagination } from './MdPagination';

const EXECUTIVE_PAGE_SIZE = 20;

/** Expertise is stored as a JSON array string, or as a comma-separated list. */
function parseExpertise(expertise?: string): string[] {
  if (!expertise) return [];
  try {
    const parsed = JSON.parse(expertise);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    // not JSON
  }
  return expertise.split(',').map((item) => item.trim()).filter(Boolean);
}

function memberName(member: ExecutiveCommitteeTeamMemberDTO) {
  return [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || member.title;
}

function memberCopy(member: ExecutiveCommitteeTeamMemberDTO) {
  const role = member.designation?.trim() || member.title?.trim() || '';
  const expertise = parseExpertise(member.expertise);
  const blurb = expertise.length > 0 ? expertise.join(' · ') : (member.bio || '').replace(/<[^>]+>/g, '').trim();
  return { role, blurb };
}

export function ExecutiveTeamSection({
  members,
  showSeeAll = false,
  paginate = false,
}: {
  members: ExecutiveCommitteeTeamMemberDTO[];
  showSeeAll?: boolean;
  paginate?: boolean;
}) {
  const [page, setPage] = useState(0);
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
    if (paginate || members.length < 2) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      stepLoop(el, 1, members.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [members.length, paginate]);

  if (members.length === 0) return null;

  const pageSize = paginate ? EXECUTIVE_PAGE_SIZE : members.length;
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = members.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <section className={cn(fcBrand.className, pitchSection, 'bg-pitch-chalk')} aria-labelledby="executive-team-heading">
      <SportBackgroundIcons />
      <PitchShell>
        <PitchHeading
          tone="light"
          id="executive-team-heading"
          eyebrow="Leadership"
          title="Executive Team"
          lead="The volunteers who run Maryland Strikers Sports Club — tournaments, training, and community programs."
        />

        {paginate ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => {
            const name = memberName(m);
            const { role, blurb } = memberCopy(m);
            return (
              <article
                key={m.id ?? name}
                className="md-live-card group rounded-2xl bg-pitch-card/60 p-3"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-pitch-charcoal/[0.06]">
                  {m.profileImageUrl ? (
                    <Image
                      src={m.profileImageUrl}
                      alt={name}
                      fill
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-6xl font-extrabold text-pitch-charcoal/15"
                      aria-hidden
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="pt-6">
                  {role && (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">{role}</p>
                  )}
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.01em] text-pitch-charcoal md:text-2xl">
                    {name}
                  </h3>
                  {blurb && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-pitch-charcoal/70">{blurb}</p>}
                </div>
              </article>
            );
          })}
        </div>
        ) : (
          <div
            className="relative"
            role="region"
            aria-roledescription="carousel"
            aria-label="Executive team"
          >
            {members.length > 1 ? (
              <div className="md-event-news-nav">
                <button type="button" aria-label="Previous members" title="Previous" onClick={() => scrollStep(-1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button type="button" aria-label="Next members" title="Next" onClick={() => scrollStep(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : null}
            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-hidden"
              onPointerEnter={() => {
                pausedRef.current = true;
              }}
              onPointerLeave={() => {
                pausedRef.current = false;
              }}
            >
              {slides.map((m, i) => {
                const name = memberName(m);
                const { role, blurb } = memberCopy(m);
                const hasDetails = Boolean(role || blurb);
                return (
                  <div
                    key={`${m.id ?? name}-${i}`}
                    data-carousel-card
                    className="w-[calc((100%-2rem)/3)] min-w-0 shrink-0"
                  >
                    <article className={cn('md-player-card md-player-card--navy', !hasDetails && 'md-player-card--plain')}>
                      {m.profileImageUrl ? (
                        <Image
                          src={m.profileImageUrl}
                          alt={name}
                          fill
                          className="md-player-card__photo object-cover object-top"
                          sizes="33vw"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white/30" aria-hidden>
                          {name.charAt(0)}
                        </span>
                      )}
                      <span className="md-player-card__wash" aria-hidden />
                      <span className="md-player-card__info">
                        <span className="md-player-card__name">{name}</span>
                      </span>
                      {hasDetails ? (
                        <span className="md-player-card__stats">
                          {role ? <span className="md-player-card__role">{role}</span> : null}
                          {blurb ? <span className="md-exec-card__blurb">{blurb}</span> : null}
                        </span>
                      ) : null}
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {paginate && (
          <MdPagination
            page={safePage}
            pageSize={pageSize}
            totalCount={members.length}
            onPageChange={setPage}
            itemLabel="members"
          />
        )}

        {showSeeAll && (
          <div className="mt-12 flex justify-center">
            <Link href="/executive-team" className={cn(pitchButton.primaryOnLight, 'group')}>
              See All Members
              <PitchArrow />
            </Link>
          </div>
        )}
      </PitchShell>
    </section>
  );
}
