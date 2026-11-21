'use client';

/**
 * /sponsors catalog. Name search and type chips filter the full active list.
 * Page size stays 20. Homepage sponsor strip is a separate fetch.
 */
import { useEffect, useState } from 'react';
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
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead } from './FcCatalogTypeahead';
import { MdPagination } from './MdPagination';

const PAGE_SIZE = 20;
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
        {sponsor.id != null ? (
          <Link className="md-sp-card__copy" href={`/sponsors/${sponsor.id}`}>
            <span className="md-sp-card__bar" style={{ background: color }} aria-hidden />
            <h3>{sponsor.name}</h3>
            {sponsor.tagline ? <p>{sponsor.tagline}</p> : null}
          </Link>
        ) : (
          <div className="md-sp-card__copy">
            <span className="md-sp-card__bar" style={{ background: color }} aria-hidden />
            <h3>{sponsor.name}</h3>
            {sponsor.tagline ? <p>{sponsor.tagline}</p> : null}
          </div>
        )}
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

  const commitSearch = (value: string) => {
    const next = value.trim();
    if (!next) {
      clearFilters();
      return;
    }
    setSearchDraft(next);
    setAppliedName(next);
    setPage(0);
  };

  useEffect(() => {
    const query = searchDraft.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionTotal(0);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetchSponsorSuggestionsServer(query)
        .then((result) => {
          if (cancelled) return;
          setSuggestions(result.suggestions.slice(0, CATALOG_SUGGESTION_LIMIT));
          setSuggestionTotal(result.totalCount);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setSuggestionTotal(0);
          }
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchDraft]);

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
    setSearchDraft('');
    setAppliedName('');
    setType('');
    setPage(0);
    setSuggestions([]);
    setSuggestionTotal(0);
  };

  const pickType = (next: string) => {
    setType(next);
    setPage(0);
  };

  const filtered = Boolean(appliedName || type);
  const showTypes = facets.types.length > 1;

  return (
    <>
      <div className="md-sp-filters" aria-label="Sponsor filters">
        <div className="md-sp-filters__card">
          <FcCatalogTypeahead
            className="md-sp-search"
            draft={searchDraft}
            onDraftChange={setSearchDraft}
            onCommit={commitSearch}
            suggestions={suggestions.slice(0, CATALOG_SUGGESTION_LIMIT).map((item) => ({
              key: item.id != null ? String(item.id) : item.name,
              label: item.name,
              hint: item.type || undefined,
              commitValue: item.name,
            }))}
            totalCount={suggestionTotal}
            placeholder="Search by name, company, or type…"
            ariaLabel="Search sponsors by name, company, type, or tagline"
            leading={(
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            )}
            trailing={searchDraft.trim() || appliedName ? (
              <button
                type="button"
                className="md-sp-search__clear"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearFilters}
              >
                Clear
              </button>
            ) : null}
          />
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

        {!loading && !fetchError ? (
          <MdPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
            itemLabel="sponsors"
            loading={loading}
          />
        ) : null}
      </div>
    </>
  );
}
