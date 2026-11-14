'use client';

import { useEffect, useState } from 'react';
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead, type CatalogSuggestion } from '@/components/fc-united/FcCatalogTypeahead';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
  placeholder?: string;
  resetToken?: number;
  suggestKind?: 'albums' | 'events';
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export function GallerySearch({
  onSearch,
  loading = false,
  placeholder = 'Search albums...',
  resetToken = 0,
  suggestKind = 'albums',
}: GallerySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [suggestionTotal, setSuggestionTotal] = useState(0);

  useEffect(() => {
    if (!resetToken) return;
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    setSuggestions([]);
    setSuggestionTotal(0);
  }, [resetToken]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionTotal(0);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const base = {
        page: '0',
        size: String(CATALOG_SUGGESTION_LIMIT),
        'title.contains': query,
      };
      const titleParams = new URLSearchParams(suggestKind === 'albums'
        ? { ...base, 'isPublic.equals': 'true', sort: 'displayOrder,asc' }
        : { ...base, 'isActive.equals': 'true', sort: 'startDate,desc' });
      const extraParams = new URLSearchParams(titleParams);
      extraParams.delete('title.contains');
      extraParams.set(suggestKind === 'albums' ? 'description.contains' : 'caption.contains', query);
      const resource = suggestKind === 'albums' ? 'gallery-albums' : 'event-details';
      Promise.all([
        fetch(`/api/proxy/${resource}?${titleParams}`),
        fetch(`/api/proxy/${resource}?${extraParams}`),
      ]).then(async ([titleRes, extraRes]) => {
        if (cancelled) return;
        const read = async (res: Response) => {
          if (!res.ok) return [] as Array<{ id?: number; title?: string; description?: string; caption?: string }>;
          const raw = await res.json();
          return (Array.isArray(raw) ? raw : []) as Array<{ id?: number; title?: string; description?: string; caption?: string }>;
        };
        const [byTitle, byExtra] = await Promise.all([read(titleRes), read(extraRes)]);
        const seen = new Set<string>();
        const next: CatalogSuggestion[] = [];
        for (const item of [...byTitle, ...byExtra]) {
          const title = (item.title || '').trim();
          const key = item.id != null ? String(item.id) : title;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          next.push({
            key,
            label: title || `${suggestKind === 'albums' ? 'Album' : 'Event'} ${item.id}`,
            hint: (item.description || item.caption || '').trim() || undefined,
            commitValue: title,
          });
          if (next.length >= CATALOG_SUGGESTION_LIMIT) break;
        }
        const totals = [titleRes, extraRes].map((res) => parseInt(res.headers.get('x-total-count') || '0', 10));
        setSuggestions(next);
        setSuggestionTotal(Math.max(next.length, ...totals.filter((count) => Number.isFinite(count))));
      }).catch(() => {
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
  }, [searchTerm, suggestKind]);

  const runSearch = (term: string) => {
    if (startDate && endDate && startDate > endDate) {
      setDateError('From date must be on or before the To date.');
      return;
    }
    setDateError('');
    const next = term.trim();
    setSearchTerm(next);
    onSearch({
      searchTerm: next,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    onSearch({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="md-gallery-search">
      <p className="md-gallery-search__label">Search gallery</p>
      <div className="md-gallery-search__row">
        <div className="md-gallery-field">
          <label htmlFor="gallerySearchTitle">Album title</label>
          <div className="md-gallery-field__control">
            <SearchIcon />
            <FcCatalogTypeahead
              bare
              inputId="gallerySearchTitle"
              draft={searchTerm}
              onDraftChange={setSearchTerm}
              onCommit={runSearch}
              suggestions={suggestions}
              totalCount={suggestionTotal}
              placeholder={placeholder}
              ariaLabel={suggestKind === 'albums' ? 'Search albums by title' : 'Search events by title'}
            />
          </div>
        </div>
        <div className="md-gallery-dates">
          <div className="md-gallery-field">
            <label htmlFor="gallerySearchDateFrom">From date</label>
            <div className="md-gallery-field__control">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                id="gallerySearchDateFrom"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="md-gallery-field">
            <label htmlFor="gallerySearchDateTo">To date</label>
            <div className="md-gallery-field__control">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                id="gallerySearchDateTo"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <div className="md-gallery-search__actions">
          <button type="submit" disabled={loading} className="md-gallery-search__go">
            {loading ? <span className="md-gallery-spin" aria-hidden /> : <SearchIcon />}
            {loading ? 'Searching' : 'Search'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="md-gallery-search__clear"
            title="Clear search"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 7h16M9 7V5h6v2m-7 0l1 12h6l1-12" />
            </svg>
            Clear
          </button>
        </div>
      </div>
      {dateError ? <p className="md-gallery-search__error">{dateError}</p> : null}
    </form>
  );
}
