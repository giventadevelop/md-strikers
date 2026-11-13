'use client';

interface GalleryTabsProps {
  activeTab: 'albums' | 'events';
  onTabChange: (tab: 'albums' | 'events') => void;
  albumsCount: number;
  eventsCount: number;
  loading?: boolean;
}

export function GalleryTabs({
  activeTab,
  onTabChange,
  albumsCount,
  eventsCount,
  loading = false,
}: GalleryTabsProps) {
  const albumsDisabled = albumsCount === 0 && !loading;
  const eventsDisabled = eventsCount === 0 && !loading;

  return (
    <div className="md-gallery-tabs">
      <h2>{activeTab === 'events' ? 'Event based albums' : 'Albums'}</h2>
      <div role="tablist" aria-label="Gallery view switch">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'albums'}
          disabled={albumsDisabled}
          onClick={() => onTabChange('albums')}
          title="Show albums"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Albums{!loading ? ` (${albumsCount})` : ''}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'events'}
          disabled={eventsDisabled}
          onClick={() => onTabChange('events')}
          title="Show event based albums"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Event based albums{!loading ? ` (${eventsCount})` : ''}
        </button>
      </div>
    </div>
  );
}
