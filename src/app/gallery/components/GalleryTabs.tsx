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
  const showEvents = activeTab === 'events';

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-semibold text-pitch-charcoal">
        {showEvents ? 'Event based albums' : 'Albums'}
      </h2>
      <div className="flex items-center gap-3" role="group" aria-label="Gallery view switch">
        <span className={`text-sm font-semibold ${!showEvents ? 'text-pitch-olive' : 'text-pitch-stone'}`}>
          Albums{!loading ? ` (${albumsCount})` : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            if (showEvents && !albumsDisabled) onTabChange('albums');
            else if (!showEvents && !eventsDisabled) onTabChange('events');
          }}
          disabled={(showEvents && albumsDisabled) || (!showEvents && eventsDisabled)}
          className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
            showEvents ? 'bg-gradient-to-r from-brand-red to-brand-orange focus:ring-pitch-charcoal' : 'bg-gradient-to-r from-brand-red to-brand-orange focus:ring-pitch-olive'
          }`}
          title={showEvents ? 'Show albums' : 'Show event based albums'}
          aria-label={showEvents ? 'Show albums' : 'Show event based albums'}
          aria-pressed={showEvents}
        >
          <span
            className={`inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
              showEvents ? 'translate-x-7' : 'translate-x-1'
            }`}
          >
            <svg className={`h-5 w-5 ${showEvents ? 'text-pitch-charcoal' : 'text-pitch-olive'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  showEvents
                    ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    : 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                }
              />
            </svg>
          </span>
        </button>
        <span className={`text-sm font-semibold ${showEvents ? 'text-pitch-charcoal' : 'text-pitch-stone'}`}>
          Event based albums{!loading ? ` (${eventsCount})` : ''}
        </span>
      </div>
    </div>
  );
}
