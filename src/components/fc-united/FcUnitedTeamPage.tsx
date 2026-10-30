'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcBrand } from './fcUnitedFonts';
import { encodePublicPath } from './fcUnitedGalleryData';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { MdPagination } from './MdPagination';
import type { PublicRosterPlayer, PublicSquadMembership, PublicSquadOption } from './ApiServerActions';

const PAGE_SIZE = 20;

const pillCta =
  'inline-flex items-center justify-center gap-2 rounded-lg md-btn-primary px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0';

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-brand-orange/55 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange hover:bg-brand-orange/[0.06] hover:text-pitch-olive motion-reduce:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive disabled:cursor-not-allowed disabled:opacity-40';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}

function matchesQuery(player: PublicRosterPlayer, query: string): boolean {
  if (!query) return true;
  const haystack = [player.givenName, player.familyName, player.name, player.role, player.position, player.jersey]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => haystack.includes(part));
}

function activeMemberships(player: PublicRosterPlayer, memberships: PublicSquadMembership[]) {
  return memberships.filter((row) => row.teamMemberId === player.id && row.isActive !== false);
}

function playerInSquad(player: PublicRosterPlayer, squadId: number, memberships: PublicSquadMembership[]): boolean {
  const rows = activeMemberships(player, memberships);
  if (rows.length > 0) return rows.some((row) => row.teamGroupId === squadId);
  return player.primaryGroupId === squadId;
}

function withSquadDetails(
  player: PublicRosterPlayer,
  squadId: number,
  memberships: PublicSquadMembership[],
): PublicRosterPlayer {
  const row = activeMemberships(player, memberships).find((item) => item.teamGroupId === squadId);
  if (!row) return player;
  return {
    ...player,
    jersey: row.jerseyNumber != null && Number.isFinite(row.jerseyNumber) ? String(row.jerseyNumber) : player.jersey,
    position: row.position?.trim() || player.position,
  };
}

export default function FcUnitedTeamPage({
  players,
  squads,
  memberships,
  initialSquadSlug = '',
}: {
  players: PublicRosterPlayer[];
  squads: PublicSquadOption[];
  memberships: PublicSquadMembership[];
  initialSquadSlug?: string;
}) {
  const router = useRouter();
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [squadId, setSquadId] = useState(() => {
    const match = squads.find((squad) => squad.slug === initialSquadSlug);
    return match ? String(match.id) : '';
  });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const selected = squadId ? Number(squadId) : null;
    return players
      .filter((player) => matchesQuery(player, appliedName))
      .filter((player) => (selected == null ? true : playerInSquad(player, selected, memberships)))
      .map((player) => (selected == null ? player : withSquadDetails(player, selected, memberships)));
  }, [players, appliedName, squadId, memberships]);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const applySearch = () => {
    setAppliedName(searchDraft.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchDraft('');
    setAppliedName('');
    chooseSquad('');
  };

  const chooseSquad = (value: string) => {
    setSquadId(value);
    setPage(0);
    const slug = squads.find((squad) => String(squad.id) === value)?.slug;
    router.replace(slug ? `/team?squad=${encodeURIComponent(slug)}` : '/team', { scroll: false });
  };

  const selectedSquad = squads.find((squad) => String(squad.id) === squadId);
  const title = selectedSquad
    ? selectedSquad.categoryLabel
      ? `${selectedSquad.name} · ${selectedSquad.categoryLabel}`
      : selectedSquad.name
    : 'Sports Team';

  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="team" />
      <FcUnitedInnerHero title={title} />

      <section className="bg-pitch-chalk pb-16 pt-8 md:pb-20">
        <Shell>
          <div className="mb-8 rounded-xl border border-pitch-charcoal/10 bg-white p-5 md:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">Search players</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end">
              <div>
                <label htmlFor="md-team-name" className="mb-1.5 block text-sm font-medium text-pitch-charcoal">
                  Name
                </label>
                <input
                  id="md-team-name"
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applySearch();
                    }
                  }}
                  placeholder="Search by player name…"
                  className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal outline-none transition-colors duration-300 focus:border-pitch-olive"
                />
              </div>
              <div>
                <label htmlFor="md-team-squad" className="mb-1.5 block text-sm font-medium text-pitch-charcoal">
                  Team
                </label>
                <select
                  id="md-team-squad"
                  value={squadId}
                  onChange={(e) => chooseSquad(e.target.value)}
                  className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal outline-none transition-colors duration-300 focus:border-pitch-olive"
                >
                  <option value="">All teams</option>
                  {squads.map((squad) => (
                    <option key={squad.id} value={squad.id}>
                      {squad.categoryLabel ? `${squad.name} · ${squad.categoryLabel}` : squad.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={applySearch} className={cn(pillCta, 'w-full sm:w-auto')}>
                  Search
                </button>
                <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'w-full sm:w-auto')}>
                  Clear
                </button>
              </div>
            </div>
            {appliedName ? (
              <p className="mt-4 text-sm text-pitch-charcoal/70">Active filter · name contains “{appliedName}”</p>
            ) : null}
          </div>

          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-pitch-charcoal/10 bg-white p-10 text-center text-pitch-charcoal/70 shadow-sm">
              <p className={cn('font-extrabold tracking-[-0.02em] text-xl text-pitch-charcoal')}>
                {appliedName || squadId ? 'No players found' : 'No squad players yet'}
              </p>
              {appliedName ? (
                <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'mt-4')}>
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((player) => (
                <Link
                  key={player.id}
                  href={`/team/${player.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white text-left shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime focus-visible:ring-offset-2"
                >
                  {/* Same 4:5 frame for every card; photos fill it from the top (portraits are 0.67–0.79 wide, so trimming is minimal) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-pitch-charcoal">
                    {player.imageUrl ? (
                      <Image
                        src={encodePublicPath(player.imageUrl)}
                        alt={player.name}
                        fill
                        className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={cn('font-extrabold tracking-[-0.02em] flex h-full items-center justify-center text-4xl text-white')}>
                        {player.name.slice(0, 1)}
                      </div>
                    )}
                    {player.jersey ? (
                      <span className="absolute left-3 top-3 rounded-md bg-pitch-lime px-2.5 py-1 text-sm font-semibold text-pitch-charcoal">
                        {player.jersey}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-h-[5.5rem] flex-1 flex-col justify-center p-4">
                    {player.position || player.role ? (
                      <p className="truncate text-xs uppercase tracking-wide text-pitch-charcoal/70">
                        {[player.position, player.role].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    <h3 className={cn('font-extrabold tracking-[-0.02em] mt-1 truncate text-lg leading-tight text-pitch-charcoal')}>{player.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <MdPagination
            page={safePage}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
            itemLabel="players"
          />
        </Shell>
      </section>

      <section className="border-t border-pitch-charcoal/10 bg-pitch-chalk py-10">
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
