'use client';

import { useState } from 'react';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
  placeholder?: string;
}

const fieldClass =
  'mt-1 block w-full rounded-xl border border-pitch-charcoal/10 bg-white px-3 py-2.5 text-sm text-pitch-charcoal placeholder:text-pitch-charcoal/70 focus:border-pitch-olive focus:outline-none focus:ring-1 focus:ring-pitch-olive disabled:opacity-60';

export function GallerySearch({
  onSearch,
  loading = false,
  placeholder = 'Search by title…',
}: GallerySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    onSearch({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-pitch-charcoal/10 bg-white p-4 shadow-sm md:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pitch-charcoal/70">Search gallery</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <div className="lg:col-span-2">
          <label htmlFor="gallerySearchTitle" className="text-sm font-semibold text-pitch-charcoal">
            Title
          </label>
          <input
            type="text"
            id="gallerySearchTitle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="gallerySearchDateFrom" className="text-sm font-semibold text-pitch-charcoal">
            From
          </label>
          <input
            type="date"
            id="gallerySearchDateFrom"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="gallerySearchDateTo" className="text-sm font-semibold text-pitch-charcoal">
            To
          </label>
          <input
            type="date"
            id="gallerySearchDateTo"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg md-btn-primary px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-brand-orange/55 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange hover:bg-brand-orange/[0.06] hover:text-pitch-olive motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          title="Clear search"
          aria-label="Clear search"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
