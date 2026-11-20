'use client';

import Link from 'next/link';
import { useRef, useState, type RefObject } from 'react';
import type { LeagueClubDTO, LeagueDTO, LeagueMatchDTO, LeagueStandingRowDTO } from '@/types';

type MatchTab = 'all' | 'results' | 'upcoming';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateParts(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return null;
  return {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
    hh: match[4] == null ? null : Number(match[4]),
    mm: match[5] ?? '00',
  };
}

function formatDate(value?: string) {
  const parts = dateParts(value);
  if (!parts) return '';
  return `${MONTHS[parts.m - 1]} ${parts.d}, ${parts.y}`;
}

function formatMonthDay(value?: string) {
  const parts = dateParts(value);
  if (!parts) return 'Date TBD';
  return `${MONTHS[parts.m - 1]} ${parts.d}`;
}

function formatTime(value?: string) {
  const parts = dateParts(value);
  if (!parts || parts.hh == null) return '';
  const suffix = parts.hh >= 12 ? 'PM' : 'AM';
  const hour = parts.hh % 12 || 12;
  return `${hour}:${parts.mm} ${suffix}`;
}

function weekday(value?: string) {
  const parts = dateParts(value);
  if (!parts) return '';
  return WEEKDAYS[new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay()];
}

function ordinal(n: number) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
}

function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}

function playedMatch(match: LeagueMatchDTO) {
  return match.status === 'PLAYED' || (match.homeScore != null && match.awayScore != null);
}

function sortedRows(rows: LeagueStandingRowDTO[]) {
  return [...rows].sort((a, b) => {
    if ((a.position ?? 999) !== (b.position ?? 999)) return (a.position ?? 999) - (b.position ?? 999);
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return a.clubName.localeCompare(b.clubName);
  });
}

function shortName(name: string, short?: string | null) {
  const trimmed = short?.trim();
  if (trimmed) return trimmed;
  const letters = name.replace(/[^A-Za-z]/g, '');
  return (letters || name).slice(0, 3).toUpperCase();
}

function statusCopy(status?: string) {
  if (status === 'ACTIVE') return { label: 'Ongoing', live: true };
  if (status === 'UPCOMING') return { label: 'Upcoming', live: false };
  if (status === 'COMPLETED') return { label: 'Completed', live: false };
  return { label: status || 'League', live: false };
}

function outcome(match: LeagueMatchDTO, clubId: number): 'W' | 'D' | 'L' | null {
  if (!playedMatch(match) || match.homeScore == null || match.awayScore == null) return null;
  const mine = match.homeClubId === clubId ? match.homeScore : match.awayScore;
  const theirs = match.homeClubId === clubId ? match.awayScore : match.homeScore;
  if (mine > theirs) return 'W';
  if (mine < theirs) return 'L';
  return 'D';
}

const RESULT_WORD = { W: 'won', D: 'drew', L: 'lost' };

function jump(ref: RefObject<HTMLElement | null>) {
  const node = ref.current;
  if (!node) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = window.scrollY + node.getBoundingClientRect().top - 96;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}

export function FcUnitedLeagueDetail({
  league,
  clubs,
  matches,
  rows,
}: {
  league: LeagueDTO;
  clubs: LeagueClubDTO[];
  matches: LeagueMatchDTO[];
  rows: LeagueStandingRowDTO[];
}) {
  const standingsRef = useRef<HTMLDivElement>(null);
  const clubsRef = useRef<HTMLDivElement>(null);
  const fixturesRef = useRef<HTMLDivElement>(null);
  const home = clubs.find((club) => club.isHomeClub) ?? null;
  const [clubId, setClubId] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null | undefined>(undefined);
  const [tab, setTab] = useState<MatchTab>('all');

  const byId = new Map(clubs.map((club) => [club.id, club]));
  const table = sortedRows(rows);
  const playedCount = matches.filter(playedMatch).length;
  const hasPlayed = playedCount > 0 || table.some((row) => row.played > 0);
  const completed = league.status === 'COMPLETED';
  const leader = hasPlayed ? table[0] : null;
  const champion = completed && leader ? leader : null;
  const status = statusCopy(league.status);
  const openId = open === undefined ? home?.id ?? null : open;
  const focusId = clubId ?? home?.id ?? null;
  const focusName = (focusId != null ? byId.get(focusId)?.name : null) ?? table.find((row) => row.leagueClubId === focusId)?.clubName;
  const selectedClub = clubId != null ? byId.get(clubId) : null;
  const maxPoints = Math.max(1, ...table.map((row) => row.points));
  const range = league.startDate && league.endDate ? `${formatDate(league.startDate)} – ${formatDate(league.endDate)}` : '';

  const clubMatches = (id: number) =>
    matches
      .filter((match) => match.homeClubId === id || match.awayClubId === id)
      .sort((a, b) => (a.playedAt || '').localeCompare(b.playedAt || ''));

  const pool = matches
    .filter((match) => clubId == null || match.homeClubId === clubId || match.awayClubId === clubId)
    .sort((a, b) => (a.playedAt || '').localeCompare(b.playedAt || ''));
  const visibleMatches = pool.filter((match) => {
    if (tab === 'results') return playedMatch(match);
    if (tab === 'upcoming') return !playedMatch(match);
    return true;
  });

  const days: { key: string; played: boolean; matches: LeagueMatchDTO[] }[] = [];
  visibleMatches.forEach((match) => {
    const parts = dateParts(match.playedAt);
    const key = parts ? `${parts.y}-${parts.m}-${parts.d}` : 'unscheduled';
    const group = days.find((day) => day.key === key);
    if (group) group.matches.push(match);
    else days.push({ key, played: playedMatch(match), matches: [match] });
  });

  const tabs: { key: MatchTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: pool.length },
    { key: 'results', label: 'Results', count: pool.filter(playedMatch).length },
    { key: 'upcoming', label: 'Upcoming', count: pool.filter((match) => !playedMatch(match)).length },
  ];

  const empty =
    matches.length === 0
      ? 'No fixtures yet.'
      : tab === 'results'
        ? 'No matches played yet.'
        : tab === 'upcoming'
          ? 'No fixtures left to play.'
          : 'No fixtures for this club.';

  return (
    <>
      <div className="md-ld-hero" data-status={league.status || 'ACTIVE'}>
        <div className="md-ld-wrap md-ld-hero__row">
          <div className="md-ld-hero__copy">
            <nav className="md-ld-crumb" aria-label="Breadcrumb">
              <Link href="/leagues">Leagues</Link>
              <span aria-hidden="true">/</span>
              <span>{league.name}</span>
            </nav>
            <div className="md-ld-hero__tags">
              <span className="md-ld-pill">
                {status.live ? <span className="md-ld-live" /> : null}
                {status.label}
              </span>
              {league.seasonLabel ? <span>{league.seasonLabel}</span> : null}
            </div>
            <h1>{league.name}</h1>
            {league.description ? <p>{league.description}</p> : null}
            <p className="md-ld-facts">
              {range ? <span>{range}</span> : null}
              <span>{clubs.length} clubs</span>
              <span>{playedCount} of {matches.length} matches played</span>
            </p>
          </div>
          {champion ? (
            <div className="md-ld-champ" aria-label="League champion">
              <div className="md-ld-champ__top">
                <span>
                  <svg viewBox="0 0 24 28" aria-hidden="true">
                    <path d="M6 2h12v6a6 6 0 01-12 0z" />
                    <path d="M6 4H2v2a5 5 0 005 5v-2a3 3 0 01-3-3V6h2zM18 4h4v2a5 5 0 01-5 5v-2a3 3 0 003-3V6h-2z" />
                    <path d="M10.5 14h3v6h-3z" />
                    <path d="M7 20h10v3H7zM5 24h14v3H5z" />
                  </svg>
                  Champions
                </span>
                {league.seasonLabel ? <span>{league.seasonLabel}</span> : null}
              </div>
              <div className="md-ld-champ__club">
                <span>{shortName(champion.clubName, champion.shortName)}</span>
                <strong>{champion.clubName}</strong>
              </div>
              <p>
                Finished first in {league.name}
                {league.seasonLabel ? ` (${league.seasonLabel})` : ''} with {champion.points} points
                {champion.played > 0 ? ` from ${champion.played} matches` : ''}.
              </p>
              <div className="md-ld-champ__stats">
                <div><b>{champion.points}</b><span>Pts</span></div>
                <div><b>{signed(champion.goalDifference)}</b><span>GD</span></div>
                <div><b>{champion.won}-{champion.drawn}-{champion.lost}</b><span>W-D-L</span></div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="md-ld-jumps">
        <div className="md-ld-jumpcard">
          <div>
            <button type="button" onClick={() => jump(standingsRef)}>Standings</button>
            <button type="button" onClick={() => jump(clubsRef)}>Clubs</button>
            <button type="button" onClick={() => jump(fixturesRef)}>Fixtures</button>
          </div>
          <Link href="/leagues">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            All leagues
          </Link>
        </div>
      </div>

      <div className="md-ld-block">
        <div ref={standingsRef} className="md-ld-table" data-bars={hasPlayed ? 'true' : 'false'}>
          <div className="md-ld-table__head">
            <div>
              <p>Table</p>
              <h2>Standings</h2>
            </div>
            <p>Select a club to see its results.</p>
          </div>
          {table.length === 0 ? (
            <p className="md-ld-table__empty">No clubs in this table yet.</p>
          ) : (
            <>
              <div className="md-ld-grid md-ld-grid--head">
                <span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span><span />
              </div>
              <div className="md-ld-rows">
                {table.map((row, index) => {
                  const lead = index === 0 && hasPlayed;
                  const isHome = row.homeClub || row.leagueClubId === home?.id;
                  const isOpen = openId === row.leagueClubId;
                  const mine = clubMatches(row.leagueClubId);
                  return (
                    <div
                      key={row.leagueClubId}
                      className="md-ld-row"
                      data-open={isOpen ? 'true' : 'false'}
                      data-home={isHome ? 'true' : 'false'}
                      data-lead={lead ? 'true' : 'false'}
                      data-champ={lead && completed ? 'true' : 'false'}
                    >
                      <button
                        type="button"
                        className="md-ld-grid md-ld-row__btn"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : row.leagueClubId)}
                      >
                        <span className="md-ld-pos">{row.position ?? index + 1}</span>
                        <span className="md-ld-club">
                          <span className="md-ld-badge">{shortName(row.clubName, row.shortName)}</span>
                          <span className="md-ld-name">
                            <span>{row.clubName}</span>
                            {lead && completed ? <i>Champions</i> : null}
                          </span>
                        </span>
                        <span>{row.played}</span>
                        <span>{row.won}</span>
                        <span>{row.drawn}</span>
                        <span>{row.lost}</span>
                        <span>{signed(row.goalDifference)}</span>
                        <span className="md-ld-pts">{row.points}</span>
                        <svg className="md-ld-chev" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                        <span className="md-ld-bar" style={{ width: `${Math.round((100 * row.points) / maxPoints)}%` }} />
                      </button>
                      <div className="md-ld-fold" data-open={isOpen ? 'true' : 'false'}>
                        <div>
                          <div className="md-ld-form">
                            <p>
                              {row.played > 0
                                ? `${row.goalsFor} goal${row.goalsFor === 1 ? '' : 's'} for, ${row.goalsAgainst} against in ${row.played} match${row.played === 1 ? '' : 'es'}.`
                                : 'No matches played yet.'}
                            </p>
                            {mine.length > 0 ? (
                              <div>
                                {mine.map((match) => {
                                  const atHome = match.homeClubId === row.leagueClubId;
                                  const opponentId = atHome ? match.awayClubId : match.homeClubId;
                                  const opponent = byId.get(opponentId)?.name ?? 'Club';
                                  const result = outcome(match, row.leagueClubId);
                                  const score = playedMatch(match) && match.homeScore != null && match.awayScore != null
                                    ? `${atHome ? match.homeScore : match.awayScore}–${atHome ? match.awayScore : match.homeScore}`
                                    : formatMonthDay(match.playedAt);
                                  return (
                                    <span key={match.id ?? `${match.playedAt}-${opponentId}`} data-res={result ?? 'U'}>
                                      <b>{result ?? '–'}</b>
                                      <strong>{score}</strong>
                                      <em>v {opponent} {atHome ? '(H)' : '(A)'}</em>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="md-ld-note">P played, W won, D drawn, L lost, GD goal difference, Pts points. 3 points for a win, 1 for a draw.</p>
            </>
          )}
        </div>
      </div>

      <div className="md-ld-block md-ld-clubs">
        <div ref={clubsRef} className="md-ld-wrap">
          <div className="md-ld-sectionhead">
            <div>
              <h2>Clubs</h2>
              <span>{clubs.length}</span>
            </div>
            <p>Select a club to filter the fixtures.</p>
          </div>
          <div className="md-ld-clubgrid">
            {clubs.map((club) => {
              const index = table.findIndex((row) => row.leagueClubId === club.id);
              const row = index >= 0 ? table[index] : null;
              const on = clubId === club.id;
              const isHome = !!club.isHomeClub;
              const isChamp = champion?.leagueClubId === club.id;
              return (
                <button
                  key={club.id}
                  type="button"
                  aria-pressed={on}
                  data-on={on ? 'true' : 'false'}
                  data-home={isHome ? 'true' : 'false'}
                  data-champ={isChamp ? 'true' : 'false'}
                  onClick={() => setClubId(on ? null : club.id ?? null)}
                >
                  <span>{shortName(club.name, club.shortName ?? row?.shortName)}</span>
                  <span>
                    <strong>{club.name}</strong>
                    <em>
                      {row && row.played > 0
                        ? `${ordinal(index + 1)} · ${row.points} pts · ${row.won}W ${row.drawn}D ${row.lost}L`
                        : 'No matches played yet'}
                    </em>
                    {isHome || isChamp ? (
                      <span className="md-ld-tags">
                        {isHome ? <i data-kind="home">This club</i> : null}
                        {isChamp ? <i data-kind="champ">Champions</i> : null}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md-ld-block md-ld-fixtures">
        <div ref={fixturesRef} className="md-ld-wrap">
          <div className="md-ld-fixtop">
            <div>
              <h2>Fixtures</h2>
              <span>{visibleMatches.length}</span>
              {selectedClub ? (
                <button type="button" className="md-ld-clear" aria-label="Clear club filter" onClick={() => setClubId(null)}>
                  {selectedClub.name}
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              ) : null}
            </div>
            <div role="tablist" aria-label="Match type">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
          </div>
          {visibleMatches.length === 0 ? <p className="md-ld-empty">{empty}</p> : (
            <div className="md-ld-days">
              {days.map((day, index) => {
                const sample = day.matches[0]?.playedAt;
                const parts = dateParts(sample);
                return (
                  <div key={day.key} className="md-ld-day" data-last={index === days.length - 1 ? 'true' : 'false'}>
                    <div className="md-ld-date" data-played={day.played ? 'true' : 'false'}>
                      <span>{weekday(sample)}</span>
                      <b>{parts ? String(parts.d).padStart(2, '0') : '—'}</b>
                      <span>{parts ? MONTHS[parts.m - 1] : ''}</span>
                      <small>{parts ? parts.y : ''}</small>
                    </div>
                    <div>
                      {day.matches.map((match) => {
                        const homeClub = byId.get(match.homeClubId);
                        const awayClub = byId.get(match.awayClubId);
                        const homeName = homeClub?.name ?? 'Club';
                        const awayName = awayClub?.name ?? 'Club';
                        const played = playedMatch(match);
                        const ours = focusId != null && (match.homeClubId === focusId || match.awayClubId === focusId);
                        const result = focusId != null && ours ? outcome(match, focusId) : null;
                        const time = formatTime(match.playedAt);
                        return (
                          <article key={match.id ?? `${match.playedAt}-${match.homeClubId}`} data-ours={ours ? 'true' : 'false'}>
                            <div className="md-ld-scoreline">
                              <span data-focus={focusId === match.homeClubId ? 'true' : 'false'}>
                                <span>{homeName}</span>
                                <b>{shortName(homeName, homeClub?.shortName)}</b>
                              </span>
                              <strong data-played={played ? 'true' : 'false'} data-ours={ours ? 'true' : 'false'}>
                                {played && match.homeScore != null && match.awayScore != null ? `${match.homeScore} – ${match.awayScore}` : 'VS'}
                              </strong>
                              <span data-focus={focusId === match.awayClubId ? 'true' : 'false'}>
                                <b>{shortName(awayName, awayClub?.shortName)}</b>
                                <span>{awayName}</span>
                              </span>
                            </div>
                            <p>
                              {result && focusName ? (
                                <b data-res={result} title={`${focusName} ${RESULT_WORD[result]}`}>{result}</b>
                              ) : null}
                              {time ? <span>{time}</span> : null}
                              {match.venue ? <span>{match.venue}</span> : null}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
