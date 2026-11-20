'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type RefObject } from 'react';
import type { LeagueClubDTO, LeagueDTO, LeagueMatchDTO, LeagueStandingRowDTO } from '@/types';

type Board = {
  league: LeagueDTO;
  clubs: LeagueClubDTO[];
  matches: LeagueMatchDTO[];
  rows: LeagueStandingRowDTO[];
};

type FilterKey = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

const GROUPS: { status: FilterKey; label: string; lead: string }[] = [
  { status: 'ACTIVE', label: 'Ongoing', lead: 'Current season tables.' },
  { status: 'UPCOMING', label: 'Upcoming', lead: 'Seasons that have not started yet.' },
  { status: 'COMPLETED', label: 'Completed', lead: 'Final tables and champions.' },
];

const TABS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Ongoing' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
];

const MATCH_CAP = 5;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateParts(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function formatDate(value?: string) {
  const parts = dateParts(value);
  if (!parts) return value || 'Date to be confirmed';
  return `${MONTHS[parts.m - 1]} ${parts.d}, ${parts.y}`;
}

function formatDay(value?: string) {
  const parts = dateParts(value);
  if (!parts) return formatDate(value);
  const weekday = WEEKDAYS[new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay()];
  return `${weekday}, ${formatDate(value)}`;
}

function ordinal(n: number) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
  return `${n}${suffix}`;
}

function statusLabel(status?: string) {
  return GROUPS.find((group) => group.status === status)?.label ?? status ?? 'League';
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

function homeClub(board: Board) {
  return board.clubs.find((club) => club.isHomeClub) ?? null;
}

export function FcUnitedLeaguesCatalogClient({ boards }: { boards: Board[] }) {
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(boards[0]?.league.id ?? null);
  const [clubId, setClubId] = useState<number | null>(null);
  const [matchTab, setMatchTab] = useState<'results' | 'fixtures' | null>(null);
  const [showAll, setShowAll] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => boards.filter((board) => filter === 'ALL' || board.league.status === filter),
    [boards, filter],
  );
  const selected = visible.find((board) => board.league.id === selectedId) ?? visible[0] ?? null;

  const reveal = () => {
    const node = detailRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.6) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const chooseFilter = (key: FilterKey) => {
    setFilter(key);
    setClubId(null);
    setMatchTab(null);
    setShowAll(false);
    window.setTimeout(reveal, 0);
  };

  const chooseLeague = (id: number) => {
    setSelectedId(id);
    setClubId(null);
    setMatchTab(null);
    setShowAll(false);
    window.setTimeout(reveal, 0);
  };

  const counts = {
    ALL: boards.length,
    ACTIVE: boards.filter((board) => board.league.status === 'ACTIVE').length,
    UPCOMING: boards.filter((board) => board.league.status === 'UPCOMING').length,
    COMPLETED: boards.filter((board) => board.league.status === 'COMPLETED').length,
  };

  return (
    <>
      <div className="md-lg-filters">
        <div className="md-lg-filtercard">
          <div role="tablist" aria-label="League status">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={filter === tab.key ? 'is-on' : undefined}
                onClick={() => chooseFilter(tab.key)}
              >
                {tab.label}
                <span>{counts[tab.key]}</span>
              </button>
            ))}
          </div>
          <p>Pick a season to see its table and matches.</p>
        </div>
      </div>

      <div className="md-lg-board">
        <div className="md-lg-wrap">
          {boards.length === 0 ? (
            <p className="md-lg-empty">No published leagues yet.</p>
          ) : (
            <div className="md-lg-layout">
              <div className="md-lg-seasons">
                {GROUPS.map((group) => {
                  const items = visible.filter((board) => board.league.status === group.status);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.status}>
                      <p className="md-lg-group">{group.label}</p>
                      <p className="md-lg-lead">{group.lead}</p>
                      <div className="md-lg-cards">
                        {items.map((board) => (
                          <SeasonCard
                            key={board.league.id}
                            board={board}
                            selected={board.league.id === selected?.league.id}
                            onPick={() => board.league.id != null && chooseLeague(board.league.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {visible.some((board) => !GROUPS.some((group) => group.status === board.league.status)) ? (
                  <div>
                    <p className="md-lg-group">Other</p>
                    <p className="md-lg-lead">Published leagues outside the current seasons.</p>
                    <div className="md-lg-cards">
                      {visible
                        .filter((board) => !GROUPS.some((group) => group.status === board.league.status))
                        .map((board) => (
                          <SeasonCard
                            key={board.league.id}
                            board={board}
                            selected={board.league.id === selected?.league.id}
                            onPick={() => board.league.id != null && chooseLeague(board.league.id)}
                          />
                        ))}
                    </div>
                  </div>
                ) : null}
                {visible.length === 0 ? <p className="md-lg-empty">No leagues in this group.</p> : null}
              </div>
              {selected ? (
                <LeagueDetail
                  board={selected}
                  detailRef={detailRef}
                  clubId={clubId}
                  matchTab={matchTab}
                  showAll={showAll}
                  onClub={(id) => {
                    setClubId((current) => (current === id ? null : id));
                    setShowAll(false);
                  }}
                  onClearClub={() => setClubId(null)}
                  onMatchTab={(tab) => {
                    setMatchTab(tab);
                    setShowAll(false);
                  }}
                  onToggleMore={() => setShowAll((current) => !current)}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SeasonCard({ board, selected, onPick }: { board: Board; selected: boolean; onPick: () => void }) {
  const played = board.matches.filter(playedMatch).length;
  const total = board.matches.length;
  const percent = total > 0 ? Math.round((100 * played) / total) : 0;
  const home = homeClub(board);
  const table = sortedRows(board.rows);
  const homeRow = home ? table.find((row) => row.leagueClubId === home.id) : undefined;
  const homePos = homeRow ? table.findIndex((row) => row.leagueClubId === home.id) + 1 : 0;
  const status = board.league.status || 'LEAGUE';

  return (
    <button
      type="button"
      aria-pressed={selected}
      data-status={status}
      data-on={selected ? 'true' : 'false'}
      className="md-lg-card"
      onClick={onPick}
    >
      <span className="md-lg-card__meta">
        <span className="md-lg-card__status">
          {status === 'ACTIVE' ? <span className="md-lg-live" /> : null}
          {statusLabel(status)}
        </span>
        <span>{board.league.seasonLabel}</span>
      </span>
      <span className="md-lg-card__name">{board.league.name}</span>
      <span className="md-lg-track" aria-hidden>
        <span style={{ width: `${percent}%` }} />
      </span>
      <span className="md-lg-card__foot">
        <span>{played} of {total} played</span>
        <span>
          {played > 0 && home && homePos > 0
            ? `${home.shortName || home.name} ${ordinal(homePos)}`
            : board.league.startDate
              ? `Starts ${formatDate(board.league.startDate)}`
              : 'Season dates to be confirmed'}
        </span>
      </span>
    </button>
  );
}

function LeagueDetail({
  board,
  detailRef,
  clubId,
  matchTab,
  showAll,
  onClub,
  onClearClub,
  onMatchTab,
  onToggleMore,
}: {
  board: Board;
  detailRef: RefObject<HTMLDivElement | null>;
  clubId: number | null;
  matchTab: 'results' | 'fixtures' | null;
  showAll: boolean;
  onClub: (id: number) => void;
  onClearClub: () => void;
  onMatchTab: (tab: 'results' | 'fixtures') => void;
  onToggleMore: () => void;
}) {
  const league = board.league;
  const table = sortedRows(board.rows);
  const clubs = new Map(board.clubs.map((club) => [club.id, club]));
  const home = homeClub(board);
  const homeRow = home ? table.find((row) => row.leagueClubId === home.id) : undefined;
  const homePos = homeRow ? table.findIndex((row) => row.leagueClubId === home.id) + 1 : 0;
  const playedAll = board.matches.filter(playedMatch);
  const percent = board.matches.length > 0 ? Math.round((100 * playedAll.length) / board.matches.length) : 0;
  const clubMatches = board.matches.filter((match) => {
    if (!clubId) return true;
    return match.homeClubId === clubId || match.awayClubId === clubId;
  });
  const played = clubMatches.filter(playedMatch);
  const scheduled = clubMatches.filter((match) => !playedMatch(match));
  const activeTab = matchTab ?? (playedAll.length > 0 ? 'results' : 'fixtures');
  const club = board.clubs.find((item) => item.id === clubId) ?? null;
  const pool = (activeTab === 'results' ? played : scheduled).filter((match) => {
    if (!club?.id) return true;
    return match.homeClubId === club.id || match.awayClubId === club.id;
  });
  const ordered = [...pool].sort((a, b) => {
    const left = a.playedAt || '';
    const right = b.playedAt || '';
    return activeTab === 'results' ? right.localeCompare(left) : left.localeCompare(right);
  });
  const shown = showAll ? ordered : ordered.slice(0, MATCH_CAP);
  const status = league.status || 'LEAGUE';
  const homeName = home?.name || 'Home club';
  const seasonPlayed = playedAll.length;

  return (
    <div ref={detailRef} className="md-lg-detail" data-status={status}>
      <div className="md-lg-head">
        <div className="md-lg-head__main">
          <div>
            <div className="md-lg-head__tags">
              <span>
                {status === 'ACTIVE' ? <span className="md-lg-live" /> : null}
                {statusLabel(status)}
              </span>
              {league.seasonLabel ? <b>{league.seasonLabel}</b> : null}
            </div>
            <h2>{league.name}</h2>
            {league.description ? <p>{league.description}</p> : null}
            <p className="md-lg-head__facts">
              {league.startDate || league.endDate ? (
                <span>{formatDate(league.startDate)} – {formatDate(league.endDate)}</span>
              ) : null}
              <span>{board.clubs.length} clubs</span>
            </p>
          </div>
          <div className="md-lg-stat">
          <span>{!seasonPlayed ? 'Kicks off' : status === 'COMPLETED' ? `${homeName} finished` : homeName}</span>
          <strong>
            {seasonPlayed && homePos > 0
              ? ordinal(homePos)
              : league.startDate
                ? formatDate(league.startDate).replace(/, \d{4}$/, '')
                : 'TBC'}
          </strong>
          <em>
            {seasonPlayed && homeRow
              ? `${homeRow.points} pts · ${homeRow.won}W ${homeRow.drawn}D ${homeRow.lost}L`
              : dateParts(league.startDate)?.y || 'Season ahead'}
          </em>
        </div>
      </div>
      <div className="md-lg-progress">
        <div>
          <span>{seasonPlayed} of {board.matches.length} matches played</span>
          <span>{percent}%</span>
        </div>
        <span aria-hidden><b style={{ width: `${percent}%` }} /></span>
      </div>
      </div>

      <div className="md-lg-body">
        <div className="md-lg-sectionhead">
          <h3>League table</h3>
          <span>Select a club to filter the matches below.</span>
        </div>
        <div className="md-lg-table">
          <div className="md-lg-row md-lg-row--head">
            <span>#</span><span>Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span>
          </div>
          {table.map((row, index) => {
            const lead = index === 0 && seasonPlayed > 0;
            const homeRowSelected = home?.id === row.leagueClubId;
            const on = club?.id === row.leagueClubId;
            const gd = row.goalDifference > 0 ? `+${row.goalDifference}` : String(row.goalDifference);
            const short = row.shortName || row.clubName.slice(0, 3).toUpperCase();
            return (
              <button
                key={row.leagueClubId}
                type="button"
                className="md-lg-row"
                aria-pressed={on}
                data-on={on ? 'true' : 'false'}
                data-home={homeRowSelected ? 'true' : 'false'}
                data-lead={lead ? 'true' : 'false'}
                onClick={() => onClub(row.leagueClubId)}
              >
                <span className="md-lg-pos">{index + 1}</span>
                <span className="md-lg-club">
                  <b>{short}</b>
                  <span>
                    {row.clubName}
                    {lead && status === 'COMPLETED' ? <i>Champion</i> : null}
                  </span>
                </span>
                <span>{row.played}</span>
                <span>{row.won}</span>
                <span>{row.drawn}</span>
                <span>{row.lost}</span>
                <span>{gd}</span>
                <strong>{row.points}</strong>
              </button>
            );
          })}
        </div>
        <p className="md-lg-key">P played, W won, D drawn, L lost, GD goal difference, Pts points. 3 points for a win, 1 for a draw.</p>

        <div className="md-lg-matches">
          <div className="md-lg-sectionhead">
            <div className="md-lg-matchtitle">
              <h3>Matches</h3>
              {club ? (
                <button type="button" className="md-lg-chip" onClick={onClearClub} aria-label="Clear club filter">
                  {club.name}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </div>
            <div role="tablist" aria-label="Match type">
              <button type="button" role="tab" aria-selected={activeTab === 'results'} className={activeTab === 'results' ? 'is-on' : undefined} onClick={() => onMatchTab('results')}>
                Results<span>{played.length}</span>
              </button>
              <button type="button" role="tab" aria-selected={activeTab === 'fixtures'} className={activeTab === 'fixtures' ? 'is-on' : undefined} onClick={() => onMatchTab('fixtures')}>
                Fixtures<span>{scheduled.length}</span>
              </button>
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="md-lg-empty">{activeTab === 'results' ? 'No matches played yet.' : 'No fixtures left to play.'}</p>
          ) : (
            <div className="md-lg-matchlist">
              {shown.map((match) => {
                const homeSide = clubs.get(match.homeClubId);
                const awaySide = clubs.get(match.awayClubId);
                const ours = Boolean(home && (match.homeClubId === home.id || match.awayClubId === home.id));
                const isPlayed = playedMatch(match);
                return (
                  <div key={match.id} className="md-lg-match">
                    <p>
                      <span>{formatDay(match.playedAt)}</span>
                      {match.venue ? <span>{match.venue}</span> : null}
                    </p>
                    <div>
                      <span data-home={home?.id === match.homeClubId ? 'true' : 'false'} data-strong={home?.id === match.homeClubId || club?.id === match.homeClubId ? 'true' : 'false'}>{homeSide?.name || 'Home'}</span>
                      <b data-played={isPlayed ? 'true' : 'false'} data-ours={ours && isPlayed ? 'true' : 'false'}>
                        {isPlayed ? `${match.homeScore} – ${match.awayScore}` : 'VS'}
                      </b>
                      <span data-home={home?.id === match.awayClubId ? 'true' : 'false'} data-strong={home?.id === match.awayClubId || club?.id === match.awayClubId ? 'true' : 'false'}>{awaySide?.name || 'Away'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="md-lg-actions">
            {ordered.length > MATCH_CAP ? (
              <button type="button" onClick={onToggleMore}>{showAll ? 'Show fewer' : `Show all ${ordered.length}`}</button>
            ) : <span />}
            {league.slug ? (
              <Link href={`/leagues/${league.slug}`}>
                Full league page
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
