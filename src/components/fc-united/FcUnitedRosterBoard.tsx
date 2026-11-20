'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead } from './FcCatalogTypeahead';
import { MdPagination } from './MdPagination';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { fcPublicShell } from './fcUnitedFonts';
import { fcSponsors } from './fcUnitedConstants';
import type { FcNavKey } from './fcUnitedNavLinks';

const PAGE_SIZE = 20;

const PLAYER_TABS = [
  { key: 'goalkeeper', label: 'Goalkeepers', tone: 'goalkeeper' },
  { key: 'defender', label: 'Defenders', tone: 'defender' },
  { key: 'midfielder', label: 'Midfielders', tone: 'midfielder' },
  { key: 'forward', label: 'Forwards', tone: 'forward' },
] as const;

export type RosterTone = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'other';

export type RosterPerson = {
  id: string;
  href?: string;
  name: string;
  chip: string;
  tone: RosterTone;
  groupKey: string;
  groupLabel: string;
  detail: string;
  number: string;
  imageUrl: string;
  searchText: string;
  sortNumber: number;
};

type SquadChoice = { value: string; label: string };

type Props = {
  active: FcNavKey;
  kicker: string;
  title: string;
  subtitle: string;
  people: RosterPerson[];
  noun: string;
  emptyQuiet: string;
  emptyDetail?: string;
  searchLabel: string;
  searchPlaceholder: string;
  sorts: { key: string; label: string }[];
  playerTabs?: boolean;
  /** Build the position or sport chips from the people on the page. */
  groupFromPeople?: boolean;
  preferredGroupOrder?: string[];
  allTabLabel?: string;
  tabsLabel?: string;
  squads?: SquadChoice[];
  squadValue?: string;
  onSquadChange?: (value: string) => void;
  sports?: SquadChoice[];
  sportValue?: string;
  onSportChange?: (value: string) => void;
  largeCards?: boolean;
};

function wordsMatch(haystack: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack.toLowerCase();
  return words.every((word) => hay.includes(word));
}

function comparePeople(sort: string, a: RosterPerson, b: RosterPerson) {
  if (sort !== 'name') {
    const byNumber = a.sortNumber - b.sortNumber;
    if (byNumber !== 0) return byNumber;
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

export function FcUnitedRosterBoard({
  active,
  kicker,
  title,
  subtitle,
  people,
  noun,
  emptyQuiet,
  emptyDetail,
  searchLabel,
  searchPlaceholder,
  sorts,
  playerTabs = false,
  groupFromPeople = false,
  preferredGroupOrder,
  allTabLabel,
  tabsLabel = 'Filter by group',
  squads,
  squadValue = '',
  onSquadChange,
  sports,
  sportValue = '',
  onSportChange,
  largeCards = false,
}: Props) {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState(sorts[0]?.key || 'name');
  const [page, setPage] = useState(0);
  const rosterKey = people.map((person) => person.id).join('|');

  useEffect(() => {
    setPage(0);
  }, [rosterKey, query, tab, sort, squadValue, sportValue]);

  const searched = useMemo(
    () => people.filter((person) => wordsMatch(person.searchText, query)),
    [people, query],
  );
  const suggestionRows = useMemo(() => {
    const typed = draft.trim();
    if (!typed) return [];
    return people.filter((person) => wordsMatch(person.searchText, typed));
  }, [draft, people]);
  const commitSearch = (value: string) => {
    const next = value.trim();
    if (!next) {
      clearFilters();
      return;
    }
    setDraft(next);
    setQuery(next);
  };

  const extraTabs = useMemo(() => {
    const fromPeople = () => {
      const seen = new Map<string, { key: string; label: string; tone: RosterTone }>();
      people.forEach((person) => {
        if (!seen.has(person.groupKey)) {
          seen.set(person.groupKey, { key: person.groupKey, label: person.groupLabel, tone: person.tone });
        }
      });
      const tabs = [...seen.values()];
      if (!preferredGroupOrder?.length) return tabs;
      const rank = new Map(preferredGroupOrder.map((key, index) => [key, index]));
      return tabs.sort(
        (a, b) => (rank.get(a.key) ?? 1000) - (rank.get(b.key) ?? 1000) || a.label.localeCompare(b.label),
      );
    };
    if (!playerTabs || groupFromPeople) return fromPeople();
    const known = new Set<string>(PLAYER_TABS.map((item) => item.key));
    const extras = new Map<string, { key: string; label: string; tone: RosterTone }>();
    people.forEach((person) => {
      if (!known.has(person.groupKey) && !extras.has(person.groupKey)) {
        extras.set(person.groupKey, { key: person.groupKey, label: person.groupLabel, tone: person.tone });
      }
    });
    return [...PLAYER_TABS, ...extras.values()];
  }, [groupFromPeople, people, playerTabs, preferredGroupOrder]);

  const counts = useMemo(() => {
    const tally = new Map<string, number>();
    searched.forEach((person) => tally.set(person.groupKey, (tally.get(person.groupKey) || 0) + 1));
    return tally;
  }, [searched]);

  const activeTab = tab === 'all' || extraTabs.some((item) => item.key === tab) ? tab : 'all';
  const filtered = activeTab === 'all' ? searched : searched.filter((person) => person.groupKey === activeTab);
  const ordered = [...filtered].sort((a, b) => comparePeople(sort, a, b));
  const total = ordered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageItems = ordered.slice(start, start + PAGE_SIZE);
  const groupOrder = extraTabs.map((item) => item.key);
  const groups = extraTabs
    .map((item) => ({
      ...item,
      people: pageItems.filter((person) => person.groupKey === item.key),
    }))
    .filter((group) => group.people.length > 0)
    .sort((a, b) => groupOrder.indexOf(a.key) - groupOrder.indexOf(b.key));

  const hasFilters = Boolean(draft.trim() || query.trim() || squadValue || sportValue || activeTab !== 'all');

  function clearFilters() {
    setDraft('');
    setQuery('');
    setTab('all');
    onSquadChange?.('');
    onSportChange?.('');
  }

  return (
    <div className={`${fcPublicShell} md-tm min-h-screen${largeCards ? ' md-tm--large' : ''}`}>
      <FcUnitedHeader active={active} />
      <main>
        <div className="md-tm-hero">
          <div className="md-tm-wrap">
            <div className="md-tm-kicker">
              <span />
              {kicker}
            </div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className="md-tm-filters">
          <div className="md-tm-card">
            <div className="md-tm-row">
              <FcCatalogTypeahead
                draft={draft}
                onDraftChange={setDraft}
                onCommit={commitSearch}
                suggestions={suggestionRows.slice(0, CATALOG_SUGGESTION_LIMIT).map((person) => ({
                  key: person.id,
                  label: person.name,
                  hint: [person.number ? `#${person.number}` : '', person.chip].filter(Boolean).join(' · ') || undefined,
                  commitValue: person.name,
                }))}
                totalCount={suggestionRows.length}
                placeholder={searchPlaceholder}
                ariaLabel={searchLabel}
                leading={(
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                )}
              />

              {squads ? (
                <label className="md-tm-team">
                  <span>Team</span>
                  <select
                    value={squadValue}
                    aria-label="Team"
                    onChange={(event) => onSquadChange?.(event.target.value)}
                  >
                    <option value="">All teams</option>
                    {squads.map((squad) => (
                      <option key={squad.value} value={squad.value}>
                        {squad.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {sports ? (
                <label className="md-tm-team">
                  <span>Sport</span>
                  <select
                    value={sportValue}
                    aria-label="Sport"
                    onChange={(event) => {
                      setTab('all');
                      onSportChange?.(event.target.value);
                    }}
                  >
                    <option value="">All sports</option>
                    {sports.map((sport) => (
                      <option key={sport.value} value={sport.value}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="md-tm-sort" role="group" aria-label={`Sort ${noun}s`}>
                {sorts.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    data-on={sort === option.key ? 'true' : 'false'}
                    onClick={() => setSort(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {hasFilters ? (
                <button type="button" className="md-tm-clear" onClick={clearFilters}>
                  Clear
                </button>
              ) : null}
            </div>

            <div className="md-tm-tabs" role="tablist" aria-label={tabsLabel}>
              <button type="button" role="tab" data-on={activeTab === 'all' ? 'true' : 'false'} onClick={() => setTab('all')}>
                <span>{allTabLabel || (playerTabs ? 'All positions' : 'All')}</span>
                <em>{searched.length}</em>
              </button>
              {extraTabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  data-on={activeTab === item.key ? 'true' : 'false'}
                  onClick={() => setTab(item.key)}
                >
                  <i data-tone={item.tone} />
                  <span>{item.label}</span>
                  <em>{counts.get(item.key) || 0}</em>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md-tm-board">
          {groups.length === 0 ? (
            <div className="md-tm-empty">
              <h2>{hasFilters ? `No ${noun}s found` : emptyQuiet}</h2>
              {!hasFilters && emptyDetail ? <p>{emptyDetail}</p> : null}
              {hasFilters ? (
                <button type="button" onClick={clearFilters}>
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key} className="md-tm-group">
                <header>
                  <i data-tone={group.tone} />
                  <h2>{group.label}</h2>
                  <span>{counts.get(group.key) || group.people.length}</span>
                  <b />
                </header>
                <div className="md-tm-grid">
                  {group.people.map((person) => (
                    <PersonCard key={person.id} person={person} large={largeCards} />
                  ))}
                </div>
              </section>
            ))
          )}

          <MdPagination
            page={safePage}
            pageSize={PAGE_SIZE}
            totalCount={total}
            onPageChange={setPage}
            itemLabel={`${noun}s`}
            itemLabelSingular={noun}
          />
        </div>

        <div className="md-tm-partners">
          <div>
            {fcSponsors.map((src) => (
              <span key={src}>
                <Image src={src} alt="" width={140} height={52} />
              </span>
            ))}
          </div>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}

function PersonCard({ person, large = false }: { person: RosterPerson; large?: boolean }) {
  const photo = person.imageUrl ? (
    <Image
      src={person.imageUrl}
      alt=""
      fill
      sizes={large ? '(max-width: 640px) 90vw, 420px' : '96px'}
      quality={large ? 90 : 75}
      className="object-cover object-top"
    />
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.4-3 3.8-4.5 7-4.5s5.6 1.5 7 4.5" />
    </svg>
  );
  const body = (
    <>
      <div className="md-tm-photo">
        {photo}
        {person.number ? <b>{person.number}</b> : null}
      </div>
      <div className="md-tm-copy">
        <em data-tone={person.tone}>{person.chip}</em>
        <strong>{person.name}</strong>
        {person.detail ? <span>{person.detail}</span> : null}
        {person.href ? (
          <span className="md-tm-profile">
            View profile
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        ) : null}
      </div>
    </>
  );
  const label = [person.name, person.number ? `number ${person.number}` : '', person.chip, person.detail]
    .filter(Boolean)
    .join(', ');
  if (person.href) {
    return (
      <Link href={person.href} className="md-tm-card-person" aria-label={label}>
        {body}
      </Link>
    );
  }
  return (
    <article className="md-tm-card-person" aria-label={label}>
      {body}
    </article>
  );
}
