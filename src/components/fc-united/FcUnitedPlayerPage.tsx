'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcManrope } from './fcUnitedFonts';
import { encodePublicPath } from './fcUnitedGalleryData';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import type { PublicPlayerDetail } from './ApiServerActions';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}

function formatCount(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function resultLabel(result: string): string {
  if (result === 'WIN') return 'Win';
  if (result === 'LOSS') return 'Loss';
  if (result === 'DRAW') return 'Draw';
  return result;
}

function RadarChart({
  jersey,
  axes,
}: {
  jersey: string;
  axes: { label: string; value: number; display: string }[];
}) {
  const cx = 150;
  const cy = 132;
  const radius = 78;
  const count = axes.length || 1;
  const point = (index: number, amount: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return [cx + Math.cos(angle) * radius * amount, cy + Math.sin(angle) * radius * amount];
  };
  const ring = (amount: number) => axes.map((_, index) => point(index, amount).join(',')).join(' ');
  const shape = axes
    .map((axis, index) => point(index, Math.max(0.12, axis.value / 100)).join(','))
    .join(' ');

  return (
    <svg viewBox="0 0 300 280" className="h-full w-full" role="img" aria-label="Season form chart">
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fill="white"
        fillOpacity="0.22"
        fontSize="92"
        fontWeight="700"
      >
        {jersey || '—'}
      </text>
      {[0.35, 0.6, 0.85, 1].map((amount) => (
        <polygon key={amount} points={ring(amount)} fill="none" stroke="white" strokeOpacity="0.18" />
      ))}
      {axes.map((_, index) => {
        const [x, y] = point(index, 1);
        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke="white" strokeOpacity="0.18" />;
      })}
      <polygon points={shape} fill="rgba(255,255,255,0.08)" stroke="#A8BB83" strokeWidth="2.4" />
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1.28);
        return (
          <text key={axis.label} x={x} y={y} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">
            <tspan x={x} dy="-0.2em">
              {axis.label}
            </tspan>
            <tspan x={x} dy="1.25em" fillOpacity="0.8">
              {axis.display}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'coral' | 'rose' | 'white';
}) {
  const toneClass =
    tone === 'white' ? 'bg-white text-pitch-charcoal' : tone === 'rose' ? 'bg-pitch-olive text-pitch-chalk' : 'bg-pitch-lime text-pitch-charcoal';
  return (
    <div className={cn('rounded-2xl px-5 py-6 shadow-lg', toneClass)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className={cn('font-extrabold tracking-[-0.02em] mt-3 text-4xl leading-none')}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 py-4 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{label}</dt>
      <dd className="mt-2 text-base font-semibold leading-7 text-white">{value || '—'}</dd>
    </div>
  );
}

function ProfileNote({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-pitch-charcoal/35 px-5 py-5 sm:px-6 sm:py-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-pitch-lime">{label}</h4>
      <p className="mt-3 text-base leading-7 text-white/90">{value || '—'}</p>
    </article>
  );
}

function MatchScore({
  match,
  club,
}: {
  match: { dateLabel: string; kickoff: string; opponent: string; home: boolean; homeScore: number; awayScore: number; result: string };
  club: string;
}) {
  const ourScore = match.home ? match.homeScore : match.awayScore;
  const theirScore = match.home ? match.awayScore : match.homeScore;
  return (
    <article className="rounded-2xl bg-white/10 p-4 text-white backdrop-blur-sm">
      <p className="text-xs text-white/70">
        {match.dateLabel}
        {match.kickoff ? `, ${match.kickoff}` : ''}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{club}</p>
          <span className="mt-1 inline-flex rounded-full bg-pitch-lime text-pitch-charcoal px-2 py-0.5 text-[10px] font-bold uppercase">
            {match.home ? 'Home' : 'Away'}
          </span>
        </div>
        <p className={cn('font-extrabold tracking-[-0.02em] text-2xl leading-none')}>
          {ourScore} - {theirScore}
        </p>
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-semibold">{match.opponent}</p>
          <span className="mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
            {resultLabel(match.result) || 'Played'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function FcUnitedPlayerPage({ player }: { player: PublicPlayerDetail }) {
  const [sportId, setSportId] = useState(player.sports[0]?.id ?? 'football');
  const sport = player.sports.find((item) => item.id === sportId) ?? player.sports[0];
  const nameParts = player.fullName.trim().split(/\s+/);
  const firstLine = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : player.fullName;
  const lastLine = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const club = player.clubName || 'Maryland Strikers';
  const clubShort = club.split(' - ')[0] || club;

  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="team" />
      <FcUnitedInnerHero title={player.name} />

      <section className="bg-pitch-chalk py-8 md:py-12">
        <Shell>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/team" className="inline-flex text-sm font-semibold text-pitch-olive hover:underline">
              Back to roster
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {player.sports.map((item) => {
                const active = item.id === sport?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSportId(item.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      active ? 'bg-pitch-forest text-white' : 'bg-white text-pitch-charcoal ring-1 ring-pitch-charcoal/10'
                    }`}
                    aria-pressed={active}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-pitch-charcoal">
              <span>Sport</span>
              <select
                value={sport?.id ?? 'football'}
                onChange={(event) => setSportId(event.target.value as typeof sportId)}
                className="rounded-full border border-pitch-charcoal/10 bg-white px-4 py-2 text-sm font-semibold text-pitch-charcoal outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive"
                aria-label="Sport category"
              >
                {player.sports.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-pitch-charcoal via-pitch-forest to-pitch-olive p-4 shadow-2xl sm:p-6 lg:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 55%)' }}
            />
            <p
              aria-hidden
              className={cn(
                'font-extrabold tracking-[-0.02em] pointer-events-none absolute inset-x-0 top-6 select-none text-center text-[18vw] leading-none text-white/[0.08] xl:text-[148px]',
              )}
            >
              {sport?.label}
            </p>
            <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[240px_minmax(0,1fr)_320px] xl:items-center xl:gap-10">
              <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-[24px] bg-pitch-charcoal shadow-2xl">
                {player.imageUrl ? (
                  <Image
                    src={encodePublicPath(player.imageUrl)}
                    alt={player.fullName}
                    width={520}
                    height={680}
                    className="block h-auto w-full"
                    sizes="260px"
                    priority
                  />
                ) : (
                  <div className={cn('font-extrabold tracking-[-0.02em] flex h-[340px] items-center justify-center text-6xl text-white')}>
                    {player.fullName.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="min-h-[280px]">
                <RadarChart jersey={sport?.jersey || player.jersey} axes={sport?.axes ?? []} />
              </div>

              <div className="flex flex-col justify-center text-white">
                <h2 className={cn('font-extrabold tracking-[-0.02em] text-4xl leading-[0.9] sm:text-5xl')}>
                  {firstLine}
                  {lastLine ? (
                    <>
                      <br />
                      {lastLine}
                    </>
                  ) : null}
                </h2>
                <p className="mt-5 flex items-center gap-3 text-sm font-medium leading-6 text-white/85">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pitch-forest text-[10px] font-bold">
                    MS
                  </span>
                  <span>
                    {club}
                    {player.preferredName && player.preferredName !== firstLine ? ` · ${player.preferredName}` : ''}
                  </span>
                </p>
                {sport?.positionLine ? (
                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/70">{sport.positionLine}</p>
                ) : null}
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-6 sm:mt-10 sm:gap-8">
              <section className="rounded-3xl bg-white/10 px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="player-record">
                <h3 id="player-record" className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  Season record
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                  <MetricTile label="Wins" value={formatCount(sport?.wins ?? null)} tone="coral" />
                  <MetricTile label="Losses" value={formatCount(sport?.losses ?? null)} tone="rose" />
                  <MetricTile label="Winning %" value={sport?.winRateLabel || '—'} tone="white" />
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <section className="rounded-3xl bg-white/10 px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="player-details">
                  <h3 id="player-details" className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Player details
                  </h3>
                  <dl className="mt-3">
                    <DetailRow label="Height" value={player.heightLabel} />
                    <DetailRow label="Weight" value={player.weightLabel} />
                    <DetailRow label="Age" value={player.ageLabel} />
                    <DetailRow label="Country" value={player.nationality} />
                  </dl>
                </section>
                <section className="rounded-3xl bg-white/10 px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="player-season">
                  <h3 id="player-season" className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Season and contact
                  </h3>
                  <dl className="mt-3">
                    <DetailRow label="This season" value={sport?.seasonLine || ''} />
                    <DetailRow
                      label="Career"
                      value={(sport?.careerLine || '').replace(/^Career\s*·\s*/, '')}
                    />
                    {player.joinDate ? <DetailRow label="Joined" value={player.joinDate} /> : null}
                    <div className="py-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Coach</dt>
                      <dd className="mt-2 text-base font-semibold leading-7 text-white">
                        {player.coachEmail ? (
                          <a className="underline-offset-2 hover:underline" href={`mailto:${player.coachEmail}`}>
                            {player.coachEmail}
                          </a>
                        ) : (
                          'Not listed'
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <section aria-labelledby="player-background">
                <h3 id="player-background" className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  Background
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <ProfileNote label="Personal" value={sport?.personal || ''} />
                  <ProfileNote label="Physical" value={sport?.physical || ''} />
                  <ProfileNote label="Team" value={sport?.team || ''} />
                  <ProfileNote label="Academics and contact" value={sport?.academics || ''} />
                </div>
              </section>

              {player.bio ? (
                <p className="max-w-4xl px-1 text-base leading-7 text-white/85">{player.bio}</p>
              ) : null}
              {(sport?.skills.length ?? 0) > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {sport?.skills.map((skill) => (
                    <li key={skill} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="relative mt-8 grid grid-cols-1 gap-5 xl:mt-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] xl:gap-6">
              <div className="overflow-hidden rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
                  <span>Games Stats</span>
                  <span className="text-xs font-medium text-white/70">{sport?.seasonLabel || 'Season'}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-wide text-white/60">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Date</th>
                        <th className="px-4 py-2 font-semibold">Match</th>
                        <th className="px-4 py-2 font-semibold">Score</th>
                        <th className="px-4 py-2 font-semibold">Result</th>
                        {(sport?.tableHeaders ?? ['G', 'A', 'MIN', 'Pass']).map((header) => (
                          <th key={header} className="px-4 py-2 font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sport?.matches.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-white/70">
                            {sport?.available === false ? sport.seasonLine : 'No match log yet'}
                          </td>
                        </tr>
                      ) : (
                        sport?.matches.map((match) => (
                          <tr key={`${match.dateLabel}-${match.opponent}`} className="border-t border-white/10">
                            <td className="whitespace-nowrap px-4 py-3">{match.dateLabel}</td>
                            <td className="px-4 py-3">
                              <span className="font-medium">{clubShort}</span>
                              <span className="text-white/60"> vs </span>
                              {match.opponent}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold">
                              {match.home ? match.homeScore : match.awayScore}-{match.home ? match.awayScore : match.homeScore}
                            </td>
                            <td className="px-4 py-3">{resultLabel(match.result)}</td>
                            {match.cells.map((cell, index) => (
                              <td key={`${match.opponent}-${index}`} className="px-4 py-3">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {(sport?.matches ?? []).slice(0, 2).map((match) => (
                  <MatchScore key={`${match.dateLabel}-${match.opponent}`} match={match} club={clubShort} />
                ))}
              </div>
            </div>

          </div>

          {player.achievementGroups.length > 0 ? (
            // Same card treatment as the profile card above: forest gradient, glow, translucent panels.
            <section
              aria-labelledby="player-achievements"
              className="relative mt-10 overflow-hidden rounded-[28px] bg-gradient-to-br from-pitch-charcoal via-pitch-forest to-pitch-olive p-6 shadow-2xl sm:p-8 lg:p-10"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 55%)' }}
              />
              <div className="relative">
                <h3 id="player-achievements" className="text-2xl font-extrabold tracking-[-0.02em] text-white md:text-3xl">
                  Achievements
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-white/70">Medals, trophies, and recognition this player has earned.</p>
                <div className="mt-8 space-y-8">
                  {player.achievementGroups.map((group) => (
                    <section key={group.heading}>
                      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{group.heading}</h4>
                      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                        {group.items.map((item) => (
                          <li key={item.id} className="rounded-2xl bg-pitch-charcoal/35 px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pitch-lime">
                              {[item.categoryLabel, item.achievementDate].filter(Boolean).join(' · ')}
                            </p>
                            <p className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-white">{item.title}</p>
                            {item.description ? (
                              <p className="mt-2 text-sm leading-relaxed text-white/85">{item.description}</p>
                            ) : null}
                            {item.issuer ? <p className="mt-2 text-sm text-white/60">Given by {item.issuer}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
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
