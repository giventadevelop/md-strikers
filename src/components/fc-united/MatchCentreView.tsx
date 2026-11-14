'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { LastMatchCard } from './ApiServerActions';
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead } from './FcCatalogTypeahead';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const COMP_COLORS = ['#FFC857', '#329BFF', '#7C3AED', '#0E9F6E', '#E11D48', '#06B6D4', '#F59E0B'];

type Status = 'all' | 'upcoming' | 'live' | 'done';
type Layout = 'grid' | 'list';

const PAGE_SIZE = 20;

function parseMatchDate(label: string): Date | null {
  const time = Date.parse(label);
  if (!Number.isFinite(time)) return null;
  const date = new Date(time);
  return Number.isNaN(date.getTime()) ? null : date;
}

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % COMP_COLORS.length;
  return COMP_COLORS[hash];
}

function isClub(name: string): boolean {
  return /striker/i.test(name);
}

function byDate(direction: 'asc' | 'desc') {
  return (a: LastMatchCard, b: LastMatchCard) => {
    const left = parseMatchDate(a.date)?.getTime() ?? Number.POSITIVE_INFINITY;
    const right = parseMatchDate(b.date)?.getTime() ?? Number.POSITIVE_INFINITY;
    return direction === 'asc' ? left - right : right - left;
  };
}

function monthKey(match: LastMatchCard): string {
  const date = parseMatchDate(match.date);
  return date ? `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}` : 'Upcoming';
}

function clubMark(match: LastMatchCard): 'W' | 'L' | 'D' | null {
  if (match.matchKind !== 'PAST') return null;
  const home = Number(match.score[0]);
  const away = Number(match.score[1]);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  const homeUs = isClub(match.homeName);
  const awayUs = isClub(match.awayName);
  if (homeUs === awayUs) return null;
  const ours = homeUs ? home : away;
  const theirs = homeUs ? away : home;
  if (ours > theirs) return 'W';
  if (ours < theirs) return 'L';
  return 'D';
}

function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (now == null) return <div className="md-mc-count" aria-hidden="true" />;
  const left = Math.max(0, target - now);
  const parts = [
    [Math.floor(left / 86400000), 'Days'],
    [Math.floor(left / 3600000) % 24, 'Hours'],
    [Math.floor(left / 60000) % 60, 'Mins'],
    [Math.floor(left / 1000) % 60, 'Secs'],
  ] as const;
  return (
    <div className="md-mc-count" aria-label="Time until kickoff">
      {parts.map(([value, label]) => (
        <div key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Crest({ src, name, large = false }: { src: string; name: string; large?: boolean }) {
  return (
    <span className={large ? 'md-mc-crest is-lg' : 'md-mc-crest'}>
      <Image src={src} alt={name ? `${name} logo` : ''} width={large ? 76 : 64} height={large ? 76 : 64} />
    </span>
  );
}

function MatchCard({ match }: { match: LastMatchCard }) {
  const upcoming = match.matchKind === 'UPCOMING';
  const date = parseMatchDate(match.date);
  const home = Number(match.score[0]);
  const away = Number(match.score[1]);
  const scored = !upcoming && Number.isFinite(home) && Number.isFinite(away);
  const loser = scored && home !== away ? (home < away ? 'home' : 'away') : '';
  const mark = clubMark(match);
  const compColor = match.league ? colorFor(match.league) : '#329BFF';

  return (
    <article className={upcoming ? 'md-mc-card is-next' : 'md-mc-card is-done'}>
      <div className="md-mc-card__date" style={{ borderBottomColor: compColor }}>
        {date ? (
          <>
            <span>{WEEKDAYS[date.getDay()]}</span>
            <strong>{String(date.getDate()).padStart(2, '0')}</strong>
            <span>{MONTHS[date.getMonth()]}</span>
            <em>{date.getFullYear()}</em>
          </>
        ) : (
          <em>{match.date}</em>
        )}
      </div>
      <div className="md-mc-card__body">
        <div className="md-mc-card__meta">
          {match.league ? (
            <span className="md-mc-comp">
              <i style={{ background: compColor }} />
              {match.league}
            </span>
          ) : <span />}
          <span className="md-mc-card__pills">
            <span className={upcoming ? 'md-mc-pill is-next' : 'md-mc-pill'}>{upcoming ? 'Upcoming' : 'Full time'}</span>
            {mark ? <span className={`md-mc-mark is-${mark.toLowerCase()}`} title={mark === 'W' ? 'Won' : mark === 'L' ? 'Lost' : 'Draw'}>{mark}</span> : null}
          </span>
        </div>
        <div className="md-mc-sides">
          <div className={loser === 'home' ? 'is-out' : undefined}>
            <Crest src={match.home} name={match.homeName} />
            <span>{match.homeName}</span>
            <b>{scored ? match.score[0] : ''}</b>
          </div>
          <div className={loser === 'away' ? 'is-out' : undefined}>
            <Crest src={match.away} name={match.awayName} />
            <span>{match.awayName}</span>
            <b>{scored ? match.score[1] : ''}</b>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MatchCentreView({ matches }: { matches: LastMatchCard[] }) {
  const [status, setStatus] = useState<Status>('all');
  const [comp, setComp] = useState('all');
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [layout, setLayout] = useState<Layout>('grid');
  const [page, setPage] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const leagues = useMemo(
    () => [...new Set(matches.map((match) => match.league).filter((name) => name.length > 0))],
    [matches],
  );

  const next = useMemo(() => {
    const upcoming = matches.filter((match) => match.matchKind === 'UPCOMING').sort(byDate('asc'));
    const future = upcoming.find((match) => {
      const time = parseMatchDate(match.date)?.getTime();
      return time != null && time > Date.now();
    });
    return future ?? upcoming[0] ?? null;
  }, [matches]);
  const kickoff = next ? parseMatchDate(next.date)?.getTime() ?? null : null;
  const showCountdown = kickoff != null && kickoff > Date.now();

  const searched = appliedQuery.trim().toLowerCase();
  const draftQuery = searchDraft.trim().toLowerCase();
  const suggestionNames = useMemo(() => {
    if (!draftQuery) return [];
    const names = new Set<string>();
    for (const match of matches) {
      for (const name of [match.homeName, match.awayName, match.league]) {
        if (name && name.toLowerCase().includes(draftQuery)) names.add(name);
      }
    }
    return [...names];
  }, [matches, draftQuery]);
  const commitSearch = (value: string) => {
    const next = value.trim();
    setSearchDraft(next);
    setAppliedQuery(next);
    setPage(0);
  };
  const base = matches.filter((match) => {
    if (comp !== 'all' && match.league !== comp) return false;
    if (!searched) return true;
    return `${match.homeName} ${match.awayName} ${match.league}`.toLowerCase().includes(searched);
  });
  const shown = base.filter((match) => {
    if (status === 'upcoming') return match.matchKind === 'UPCOMING';
    if (status === 'done') return match.matchKind === 'PAST';
    if (status === 'live') return false;
    return true;
  });

  const ordered = [
    ...shown.filter((match) => match.matchKind === 'UPCOMING').sort(byDate('asc')),
    ...shown.filter((match) => match.matchKind === 'PAST').sort(byDate('desc')),
  ];
  const totalCount = ordered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageMatches = ordered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const startItem = totalCount > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const endItem = totalCount > 0 ? safePage * PAGE_SIZE + pageMatches.length : 0;
  const groups: { label: string; matches: LastMatchCard[] }[] = [];
  for (const match of pageMatches) {
    const label = match.matchKind === 'PAST' ? 'Results' : monthKey(match);
    const current = groups[groups.length - 1];
    if (current?.label === label) current.matches.push(match);
    else groups.push({ label, matches: [match] });
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    listRef.current?.scrollIntoView({ block: 'start' });
  };

  const tabs: { id: Status; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: base.length },
    { id: 'upcoming', label: 'Upcoming', count: base.filter((match) => match.matchKind === 'UPCOMING').length },
    { id: 'live', label: 'Live', count: 0 },
    { id: 'done', label: 'Results', count: base.filter((match) => match.matchKind === 'PAST').length },
  ];

  return (
    <>
      <div className="md-mc-hero" aria-label="Matches">
        <div className="md-mc-hero__row">
          <div>
            <p className="md-mc-kicker"><span />Fixtures &amp; results</p>
            <h1>Matches</h1>
            <p>Every Maryland Strikers fixture, live score and result across all competitions.</p>
          </div>
          {next ? (
            <article className="md-mc-next">
              <header>
                <span><i />Next match</span>
                {next.league ? <strong>{next.league}</strong> : null}
              </header>
              <div className="md-mc-next__teams">
                <div>
                  <Crest src={next.home} name={next.homeName} large />
                  <b>{next.homeName}</b>
                </div>
                <em>VS</em>
                <div className="is-away">
                  <b>{next.awayName}</b>
                  <Crest src={next.away} name={next.awayName} large />
                </div>
              </div>
              <footer>
                <p>{next.date}</p>
                {showCountdown && kickoff != null ? <Countdown target={kickoff} /> : null}
              </footer>
            </article>
          ) : null}
        </div>
      </div>

      <div className="md-mc-filters" aria-label="Match filters">
        <div className="md-mc-filters__card">
          <div className="md-mc-filters__row">
            <div role="tablist" aria-label="Match status">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={status === tab.id}
                  className={status === tab.id ? 'is-on' : undefined}
                  onClick={() => { setStatus(tab.id); setPage(0); }}
                >
                  {tab.label}
                  <span>{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="md-mc-filters__tools">
              <FcCatalogTypeahead
                draft={searchDraft}
                onDraftChange={setSearchDraft}
                onCommit={commitSearch}
                suggestions={suggestionNames.slice(0, CATALOG_SUGGESTION_LIMIT).map((name) => ({
                  key: name,
                  label: name,
                  commitValue: name,
                }))}
                totalCount={suggestionNames.length}
                placeholder="Search team"
                ariaLabel="Search matches by team"
                leading={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                )}
              />
              <div role="group" aria-label="Layout">
                <button type="button" aria-label="Grid view" aria-pressed={layout === 'grid'} className={layout === 'grid' ? 'is-on' : undefined} onClick={() => setLayout('grid')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
                <button type="button" aria-label="List view" aria-pressed={layout === 'list'} className={layout === 'list' ? 'is-on' : undefined} onClick={() => setLayout('list')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="md-mc-chips">
            <button type="button" aria-pressed={comp === 'all'} className={comp === 'all' ? 'is-on' : undefined} onClick={() => { setComp('all'); setPage(0); }}>
              All competitions
            </button>
            {leagues.map((league) => (
              <button key={league} type="button" aria-pressed={comp === league} className={comp === league ? 'is-on' : undefined} onClick={() => { setComp(league); setPage(0); }}>
                <i style={{ background: colorFor(league) }} />
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md-mc-list" aria-label="Match list" ref={listRef}>
        {groups.length === 0 ? (
          <div className="md-mc-empty">
            <h2>No matches found</h2>
            <p>Nothing fits the current filters.</p>
            <button type="button" onClick={() => { setStatus('all'); setComp('all'); commitSearch(''); }}>Clear filters</button>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="md-mc-group">
              <div className="md-mc-group__title">
                <h2>{group.label}</h2>
                <span>{group.matches.length}</span>
              </div>
              <div className={layout === 'list' ? 'md-mc-grid is-list' : 'md-mc-grid'}>
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))
        )}
        {totalCount > 0 ? (
          <div className="md-mc-pager">
            <p>{`Showing ${startItem}–${endItem} of ${totalCount} matches`}</p>
            <div>
              <button type="button" disabled={safePage === 0} onClick={() => changePage(safePage - 1)}>
                Previous
              </button>
              <button type="button" disabled={safePage >= totalPages - 1} onClick={() => changePage(safePage + 1)}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
