'use client';

import { useEffect, useState } from 'react';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
  placeholder?: string;
  resetToken?: number;
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
}: GallerySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!resetToken) return;
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDateError('');
  }, [resetToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      setDateError('From date must be on or before the To date.');
      return;
    }
    setDateError('');
    onSearch({
      searchTerm: searchTerm.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
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
            <input
              type="text"
              id="gallerySearchTitle"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
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
