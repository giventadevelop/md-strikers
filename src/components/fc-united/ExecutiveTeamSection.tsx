'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { fcBrand } from './fcUnitedFonts';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchSection } from './pitchUi';
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
  if (members.length === 0) return null;

  const pageSize = paginate ? EXECUTIVE_PAGE_SIZE : members.length;
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = members.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <section className={cn(fcBrand.className, pitchSection, 'bg-pitch-chalk')} aria-labelledby="executive-team-heading">
      <PitchShell>
        <PitchHeading
          tone="light"
          id="executive-team-heading"
          eyebrow="Leadership"
          title="Executive Team"
          lead="The volunteers who run Maryland Strikers Sports Club — tournaments, training, and community programs."
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => {
            const name = [m.firstName, m.lastName].filter(Boolean).join(' ').trim() || m.title;
            const role = m.designation?.trim() || m.title?.trim() || '';
            const expertise = parseExpertise(m.expertise);
            const blurb =
              expertise.length > 0 ? expertise.join(' · ') : (m.bio || '').replace(/<[^>]+>/g, '').trim();
            return (
              <article
                key={m.id ?? name}
                className="group"
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
