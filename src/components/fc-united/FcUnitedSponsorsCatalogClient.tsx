'use client';

/**
 * /sponsors catalog. Name search and type chips filter the full active list.
 * Page size stays 20. Homepage sponsor strip is a separate fetch.
 */
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  fetchSponsorSuggestionsServer,
  fetchSponsorsCatalogServer,
  fetchSponsorTypeCountsServer,
  type HomepageSponsor,
  type SponsorSuggestion,
  type SponsorTypeCount,
} from './ApiServerActions';

const PAGE_SIZE = 20;
const SUGGESTION_LIMIT = 20;
const TYPE_COLORS = ['#FFC857', '#329BFF', '#7C3AED', '#0E9F6E', '#E11D48', '#06B6D4', '#F59E0B'];

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % TYPE_COLORS.length;
  return TYPE_COLORS[hash];
}

function SponsorRow({ sponsor }: { sponsor: HomepageSponsor }) {
  const color = sponsor.type ? colorFor(sponsor.type) : '#329BFF';
  const media = (
    <>
      <Image
        src={sponsor.imageUrl}
        alt=""
        fill
        className="md-sp-card__img"
        sizes="(min-width: 1280px) 1232px, 100vw"
      />
      {sponsor.type ? (
        <span className="md-sp-card__badge" style={{ background: color }}>{sponsor.type}</span>
      ) : null}
    </>
  );

  return (
    <article className="md-sp-card">
      {sponsor.id != null ? (
        <Link href={`/sponsors/${sponsor.id}`} className="md-sp-card__media" aria-label={`${sponsor.name} details`}>
          {media}
        </Link>
      ) : (
        <div className="md-sp-card__media">{media}</div>
      )}
      <div className="md-sp-card__body">
        <div className="md-sp-card__copy">
          <span className="md-sp-card__bar" style={{ background: color }} aria-hidden />
          <h3>{sponsor.name}</h3>
          {sponsor.tagline ? <p>{sponsor.tagline}</p> : null}
        </div>
        <div className="md-sp-card__actions">
          {sponsor.id != null ? (
            <Link href={`/sponsors/${sponsor.id}`} className="md-sp-card__details">
              Sponsor details
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ) : null}
          {sponsor.websiteHref ? (
            <a href={sponsor.websiteHref} target="_blank" rel="noopener noreferrer" className="md-sp-card__site">
              Visit website
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M8 7h9v9" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function FcUnitedSponsorsCatalogClient() {
  const [sponsors, setSponsors] = useState<HomepageSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [type, setType] = useState('');
  const [facets, setFacets] = useState<{ total: number; types: SponsorTypeCount[] }>({ total: 0, types: [] });
  const [retryNonce, setRetryNonce] = useState(0);
  const [suggestions, setSuggestions] = useState<SponsorSuggestion[]>([]);
  const [suggestionTotal, setSuggestionTotal] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipMenuRefreshRef = useRef(false);
  const menuRequestRef = useRef(0);

  const applySuggestions = (requestId: number, result: { suggestions: SponsorSuggestion[]; totalCount: number }) => {
    if (requestId !== menuRequestRef.current) return;
    setSuggestions(result.suggestions.slice(0, SUGGESTION_LIMIT));
    setSuggestionTotal(result.totalCount);
    setSuggestOpen(true);
  };

  const loadMenu = (query: string) => {
    const requestId = ++menuRequestRef.current;
    setSuggestOpen(true);
    fetchSponsorSuggestionsServer(query)
      .then((result) => applySuggestions(requestId, result))
      .catch(() => {
        if (requestId !== menuRequestRef.current) return;
        setSuggestions([]);
        setSuggestionTotal(0);
        setSuggestOpen(true);
      });
  };

  const commitSearch = (value: string) => {
    const next = value.trim();
    if (next !== searchDraft) skipMenuRefreshRef.current = true;
    setSearchDraft(next);
    setAppliedName(next);
    setPage(0);
    setSuggestOpen(false);
  };

  useEffect(() => {
    if (skipMenuRefreshRef.current) {
      skipMenuRefreshRef.current = false;
      return;
    }
    const input = inputRef.current;
    const query = searchDraft.trim();
    if (!input || document.activeElement !== input) return;
    let cancelled = false;
    const requestId = ++menuRequestRef.current;
    const timer = window.setTimeout(() => {
      fetchSponsorSuggestionsServer(query)
        .then((result) => {
          if (!cancelled) applySuggestions(requestId, result);
        })
        .catch(() => {
          if (cancelled || requestId !== menuRequestRef.current) return;
          setSuggestions([]);
          setSuggestionTotal(0);
        });
    }, query ? 200 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchDraft]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setFetchError(false);
      try {
        const result = await fetchSponsorsCatalogServer({
          page,
          size: PAGE_SIZE,
          name: appliedName,
          type,
        });
        if (cancelled) return;
        setSponsors(result.sponsors);
        setTotalCount(result.totalCount);
      } catch {
        if (cancelled) return;
        setFetchError(true);
        setSponsors([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, appliedName, type, retryNonce]);

  useEffect(() => {
    let cancelled = false;
    async function loadFacets() {
      try {
        const result = await fetchSponsorTypeCountsServer(appliedName);
        if (!cancelled) setFacets(result);
      } catch {
        if (!cancelled) setFacets({ total: 0, types: [] });
      }
    }
    loadFacets();
    return () => {
      cancelled = true;
    };
  }, [appliedName, retryNonce]);

  const clearFilters = () => {
    if (searchDraft !== '') skipMenuRefreshRef.current = true;
    setSearchDraft('');
    setAppliedName('');
    setType('');
    setPage(0);
    setSuggestOpen(false);
    setSuggestions([]);
    setSuggestionTotal(0);
  };

  const pickType = (next: string) => {
    setType(next);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const startItem = totalCount > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const endItem = totalCount > 0 ? Math.min(totalCount, safePage * PAGE_SIZE + sponsors.length) : 0;
  const filtered = Boolean(appliedName || type);
  const showTypes = facets.types.length > 1;

  return (
    <>
      <div className="md-sp-filters" aria-label="Sponsor filters">
        <div className="md-sp-filters__card">
          <div className="md-sp-search" ref={searchRef}>
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-label="Search sponsors by name"
                aria-autocomplete="list"
                aria-expanded={suggestOpen}
                aria-controls="md-sponsor-suggestions"
                placeholder="Search by sponsor name…"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onClick={() => loadMenu(searchDraft.trim())}
                onFocus={() => loadMenu(searchDraft.trim())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitSearch(searchDraft);
                  } else if (event.key === 'Escape') {
                    setSuggestOpen(false);
                  }
                }}
              />
              {searchDraft.trim() || appliedName ? (
                <button
                  type="button"
                  className="md-sp-search__clear"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearFilters}
                >
                  Clear
                </button>
              ) : null}
            </label>
            {suggestOpen && (suggestions.length > 0 || suggestionTotal > SUGGESTION_LIMIT) ? (
              <ul id="md-sponsor-suggestions" role="listbox" aria-label="Sponsor suggestions">
                {suggestions.slice(0, SUGGESTION_LIMIT).map((item) => (
                  <li key={item.id ?? item.name} role="presentation">
                    <button
                      type="button"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => commitSearch(item.name)}
                    >
                      <strong>{item.name}</strong>
                      {item.type ? <span>{item.type}</span> : null}
                    </button>
                  </li>
                ))}
                {suggestionTotal > SUGGESTION_LIMIT ? (
                  <li role="presentation">
                    <button
                      type="button"
                      className="md-sp-search__more"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => commitSearch(searchDraft)}
                    >
                      Click Enter for more
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
          {showTypes ? (
            <div role="group" aria-label="Sponsor type">
              <button type="button" aria-pressed={type === ''} className={type === '' ? 'is-on' : undefined} onClick={() => pickType('')}>
                All
                <span>{facets.total}</span>
              </button>
              {facets.types.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  aria-pressed={type === item.type}
                  className={type === item.type ? 'is-on' : undefined}
                  onClick={() => pickType(item.type)}
                >
                  <i style={{ background: colorFor(item.type) }} />
                  {item.type}
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="md-sp-list" aria-label="Sponsor list">
        <div className="md-sp-list__head">
          <div>
            <h2>Club Sponsors</h2>
            <span>{loading ? '…' : totalCount}</span>
          </div>
          <p>Businesses that support Maryland Strikers, Capital Cup, and club programs.</p>
        </div>

        {loading ? (
          <div className="md-sp-stack" aria-label="Loading sponsors">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="md-sp-skeleton" />)}
          </div>
        ) : fetchError ? (
          <div className="md-sp-empty">
            <h3>No sponsors found</h3>
            <p>Could not load sponsors. Please try again later.</p>
            <button type="button" onClick={() => setRetryNonce((value) => value + 1)}>Try again</button>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="md-sp-empty">
            <h3>No sponsors found</h3>
            <p>
              {appliedName
                ? `No sponsors match “${appliedName}”. Try a different name.`
                : 'No sponsors are published yet.'}
            </p>
            {filtered ? (
              <button type="button" onClick={clearFilters}>Clear search</button>
            ) : null}
          </div>
        ) : (
          <div className="md-sp-stack">
            {sponsors.map((sponsor) => (
              <SponsorRow key={sponsor.id ?? sponsor.name} sponsor={sponsor} />
            ))}
          </div>
        )}

        {!loading && !fetchError && totalCount > 0 ? (
          <div className="md-sp-pager">
            <p>{`Showing ${startItem} to ${endItem} of ${totalCount} sponsors`}</p>
            <div>
              <button type="button" disabled={safePage === 0} onClick={() => setPage(Math.max(0, safePage - 1))}>
                Previous
              </button>
              <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
