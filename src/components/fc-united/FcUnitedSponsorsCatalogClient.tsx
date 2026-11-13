'use client';

/**
 * /sponsors catalog — name search, page size 20, previous/next, and a result count.
 * Presentation only. The fetch contract is unchanged.
 */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { MdPagination } from './MdPagination';
import { pitchPageInset } from './pitchUi';
import {
  fetchSponsorsCatalogServer,
  type HomepageSponsor,
} from './ApiServerActions';

const PAGE_SIZE = 20;

function SponsorMark({ sponsor }: { sponsor: HomepageSponsor }) {
  return (
    <div className="md-partners-card__logo">
      <Image
        src={sponsor.imageUrl}
        alt=""
        fill
        className="object-contain"
        sizes="(min-width: 1280px) 22vw, (min-width: 700px) 40vw, 90vw"
      />
    </div>
  );
}

function SponsorCard({ sponsor, lead }: { sponsor: HomepageSponsor; lead?: boolean }) {
  return (
    <article className={lead ? 'md-partners-card is-lead' : 'md-partners-card'}>
      <SponsorMark sponsor={sponsor} />
      <div className="md-partners-card__body">
        {sponsor.type ? <span className="md-partners-card__type">{sponsor.type}</span> : null}
        <h3>{sponsor.name}</h3>
        {sponsor.tagline ? <p>{sponsor.tagline}</p> : null}
        <div className="md-partners-card__links">
          {sponsor.id != null ? (
            <Link href={`/sponsors/${sponsor.id}`}>
              Sponsor details
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ) : null}
          {sponsor.websiteHref ? (
            <a href={sponsor.websiteHref} target="_blank" rel="noopener noreferrer">
              Visit website
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function groupsFor(list: HomepageSponsor[]) {
  const counts = new Map<string, number>();
  for (const sponsor of list) {
    if (!sponsor.type) continue;
    counts.set(sponsor.type, (counts.get(sponsor.type) ?? 0) + 1);
  }
  const shared = [...counts.entries()].filter(([, count]) => count > 1).map(([type]) => type);
  if (shared.length < 2) return null;
  const distinct = [...new Set(list.map((sponsor) => sponsor.type).filter((type) => shared.includes(type)))];
  return {
    groups: distinct.map((type) => ({
      type,
      items: list.filter((sponsor) => sponsor.type === type),
    })),
    untyped: list.filter((sponsor) => !shared.includes(sponsor.type)),
  };
}

export function FcUnitedSponsorsCatalogClient() {
  const [sponsors, setSponsors] = useState<HomepageSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [retryNonce, setRetryNonce] = useState(0);

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
  }, [page, appliedName, retryNonce]);

  const handleSearch = () => {
    setAppliedName(searchDraft.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchDraft('');
    setAppliedName('');
    setPage(0);
  };

  const lead =
    page === 0 &&
    !appliedName &&
    sponsors.length > 1 &&
    typeof sponsors[0]?.priorityRanking === 'number' &&
    typeof sponsors[1]?.priorityRanking === 'number' &&
    sponsors[0].priorityRanking < sponsors[1].priorityRanking
      ? sponsors[0]
      : null;

  const grouped = groupsFor(sponsors);
  const showMarquee = sponsors.length >= 6;

  return (
    <section className="md-partners-catalog">
      <div className={pitchPageInset}>
        <div className="md-partners-catalog__head">
          <p className="md-partners-kicker md-partners-kicker--ink">partners</p>
          <h2>Club Sponsors</h2>
          <span className="md-partners-rule" aria-hidden />
          <p>Businesses that support Maryland Strikers, Capital Cup, and club programs.</p>
        </div>

        <form
          className="md-partners-search"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <p>Search sponsors</p>
          <div className="md-partners-search__row">
            <div>
              <label htmlFor="md-sponsors-name">Sponsor name</label>
              <span className="md-partners-search__field">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M16 16l4 4" />
                </svg>
                <input
                  id="md-sponsors-name"
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search by sponsor name..."
                />
              </span>
            </div>
            <div className="md-partners-search__actions">
              <button type="submit" disabled={loading} className="md-partners-search__go">
                {loading ? <span className="md-partners-spin" aria-hidden /> : (
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M16 16l4 4" />
                  </svg>
                )}
                {loading ? 'Searching' : 'Search'}
              </button>
              <button type="button" onClick={clearSearch} className="md-partners-search__clear">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M20 12a8 8 0 10-2.2 5.5M20 12V7m0 5h-5" />
                </svg>
                Clear
              </button>
            </div>
          </div>
          {appliedName ? (
            <p className="md-partners-search__filter">
              Active filter · name contains “{appliedName}”
            </p>
          ) : null}
        </form>

        {loading ? (
          <div className="md-partners-grid" aria-label="Loading sponsors">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="md-partners-skeleton" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="md-partners-empty">
            <p>Could not load sponsors. Please try again later.</p>
            <button type="button" onClick={() => setRetryNonce((value) => value + 1)}>
              Try again
            </button>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="md-partners-empty">
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8 12h8" />
            </svg>
            <p>{appliedName ? 'No sponsors found' : 'No sponsors are published yet.'}</p>
            {appliedName ? <p>No sponsors match “{appliedName}”. Try a different name.</p> : null}
            {appliedName ? (
              <button type="button" onClick={clearSearch}>
                Clear search
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {showMarquee ? (
              <div className="md-partners-marquee" aria-hidden>
                <div className="md-partners-marquee__track">
                  {[0, 1].map((copy) => (
                    <div key={copy}>
                      {sponsors.map((sponsor) => (
                        <span key={`${copy}-${sponsor.id ?? sponsor.name}`}>
                          <Image src={sponsor.imageUrl} alt="" width={160} height={72} />
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {grouped ? (
              <>
                {grouped.groups.map((group) => (
                  <div key={group.type} className="md-partners-group">
                    <h3>{group.type}</h3>
                    <span className="md-partners-rule" aria-hidden />
                    <div className="md-partners-grid">
                      {group.items.map((sponsor) => (
                        <SponsorCard
                          key={sponsor.id ?? sponsor.name}
                          sponsor={sponsor}
                          lead={lead?.id != null && sponsor.id === lead.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {grouped.untyped.length > 0 ? (
                  <div className="md-partners-group">
                    <h3>Club sponsors</h3>
                    <span className="md-partners-rule" aria-hidden />
                    <div className="md-partners-grid">
                      {grouped.untyped.map((sponsor) => (
                        <SponsorCard key={sponsor.id ?? sponsor.name} sponsor={sponsor} lead={lead?.id != null && sponsor.id === lead.id} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="md-partners-grid">
                {sponsors.map((sponsor) => (
                  <SponsorCard
                    key={sponsor.id ?? sponsor.name}
                    sponsor={sponsor}
                    lead={lead?.id != null && sponsor.id === lead.id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && (
          <MdPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
            itemLabel="sponsors"
          />
        )}
      </div>
    </section>
  );
}
