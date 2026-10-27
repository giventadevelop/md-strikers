'use client';

/**
 * /sponsors catalog — same listing tools as the events catalog:
 * name search, page size 20, previous/next, and a result count.
 */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { MdPagination } from './MdPagination';
import {
  fetchSponsorsCatalogServer,
  type HomepageSponsor,
} from './ApiServerActions';

const PAGE_SIZE = 20;

function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 sm:px-7 lg:px-12', className)}>
      {children}
    </div>
  );
}

const pillCta =
  'inline-flex items-center justify-center gap-2 rounded-full bg-pitch-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-in-out hover:bg-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive disabled:cursor-not-allowed disabled:opacity-50';

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-full border border-pitch-charcoal/10 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-colors duration-300 hover:border-pitch-charcoal/25 hover:text-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive disabled:cursor-not-allowed disabled:opacity-40';

export function FcUnitedSponsorsCatalogClient() {
  const [sponsors, setSponsors] = useState<HomepageSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedName, setAppliedName] = useState('');

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
  }, [page, appliedName]);

  const handleSearch = () => {
    setAppliedName(searchDraft.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchDraft('');
    setAppliedName('');
    setPage(0);
  };

  return (
    <section className="bg-pitch-chalk pb-16 pt-2 md:pb-20 md:pt-4">
      <Shell>
        <div className="mb-8 text-center md:mb-10 md:text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            partners
          </span>
          <h2 className={cn('font-extrabold tracking-[-0.02em] text-3xl text-pitch-charcoal md:text-4xl')}>
            Club Sponsors
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">
            Businesses that support Maryland Strikers, Capital Cup, and club programs.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-pitch-charcoal/10 bg-white p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-pitch-charcoal/70">
            Search sponsors
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label htmlFor="md-sponsors-name" className="mb-1.5 block text-sm font-medium text-pitch-charcoal">
                Name
              </label>
              <input
                id="md-sponsors-name"
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search by sponsor name…"
                className="w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal outline-none transition-colors duration-300 focus:border-pitch-olive"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleSearch} disabled={loading} className={cn(pillCta, 'w-full sm:w-auto')}>
                Search
              </button>
              <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'w-full sm:w-auto')}>
                Clear
              </button>
            </div>
          </div>
          {appliedName && (
            <p className="mt-4 text-sm text-pitch-charcoal/70">
              Active filter · name contains “{appliedName}”
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-pitch-charcoal/10 border-t-pitch-olive" aria-label="Loading sponsors" />
          </div>
        ) : fetchError ? (
          <p className="rounded-xl border border-pitch-olive/30 bg-white px-5 py-8 text-center text-sm font-medium text-pitch-olive">
            Could not load sponsors. Please try again later.
          </p>
        ) : sponsors.length === 0 ? (
          <div className="rounded-xl border border-pitch-charcoal/10 bg-white px-5 py-8 text-center">
            <p className="text-sm font-medium text-pitch-charcoal">
              {appliedName ? 'No sponsors found' : 'No sponsors are published yet.'}
            </p>
            {appliedName && (
              <p className="mt-2 text-sm text-pitch-charcoal/70">
                No sponsors match “{appliedName}”. Try a different name.
              </p>
            )}
            {appliedName && (
              <button type="button" onClick={clearSearch} className={cn(secondaryCta, 'mt-4')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {sponsors.map((sponsor) => (
              <article
                key={sponsor.id ?? sponsor.name}
                className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white transition-colors duration-300 ease-in-out hover:border-pitch-charcoal/25"
              >
                <div className="relative w-full border-b border-pitch-charcoal/10">
                  <Image
                    src={sponsor.imageUrl}
                    alt={sponsor.name}
                    width={1600}
                    height={600}
                    className="h-auto w-full object-contain"
                    sizes="100vw"
                  />
                  {sponsor.type ? (
                    <span className="absolute left-3 top-3 rounded-xl bg-pitch-forest px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] md:left-4 md:top-4">
                      {sponsor.type}
                    </span>
                  ) : null}
                </div>
                <div className="px-5 py-5 md:px-6 md:py-6">
                  <h3 className={cn('font-extrabold tracking-[-0.02em] text-2xl text-pitch-charcoal md:text-3xl')}>
                    {sponsor.name}
                  </h3>
                  {sponsor.tagline ? (
                    <p className="mt-2 text-sm leading-relaxed text-pitch-charcoal/70 md:text-[15px]">{sponsor.tagline}</p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {sponsor.id != null ? (
                      <Link href={`/sponsors/${sponsor.id}`} className={pillCta}>
                        Sponsor details
                      </Link>
                    ) : null}
                    {sponsor.websiteHref ? (
                      <a
                        href={sponsor.websiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={secondaryCta}
                      >
                        Visit website
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
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
      </Shell>
    </section>
  );
}
