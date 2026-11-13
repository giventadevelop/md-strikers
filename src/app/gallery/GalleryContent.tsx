'use client';

import { useState, useEffect } from 'react';
import { GalleryEventCard } from './components/GalleryEventCard';
import { GalleryAlbumCard } from './components/GalleryAlbumCard';
import { GalleryTabs } from './components/GalleryTabs';
import { GallerySearch } from './components/GallerySearch';
import { GalleryPagination } from './components/GalleryPagination';
import { fetchEventsForGallery, fetchAlbumsForGallery } from './ApiServerActions';
import type { GalleryPageData, GalleryAlbumWithMedia } from './ApiServerActions';

const ITEMS_PER_PAGE = 20;

type TabType = 'albums' | 'events';

export function GalleryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('albums');
  const [galleryData, setGalleryData] = useState<GalleryPageData | null>(null);
  const [albumsData, setAlbumsData] = useState<{
    albumsWithMedia: GalleryAlbumWithMedia[];
    totalAlbums: number;
    currentPage: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  // Initial load: Fetch counts to determine default tab and load initial data
  useEffect(() => {
    const determineDefaultTabAndLoad = async () => {
      setLoading(true);
      try {
        // Fetch first page of albums to check if any exist
        const albumsResult = await fetchAlbumsForGallery(0, 1, '', undefined, undefined);
        const albumsTotal = albumsResult.totalAlbums;

        // Fetch first page of events to check if any exist
        const eventsResult = await fetchEventsForGallery(0, 1, '', undefined, undefined);
        const eventsTotal = eventsResult.totalEvents;

        setLoadError(null);
        setAlbumsCount(albumsTotal);
        setEventsCount(eventsTotal);

        // Set default tab: albums if they exist, otherwise events
        let defaultTab: TabType = 'albums';
        if (albumsTotal > 0) {
          defaultTab = 'albums';
        } else if (eventsTotal > 0) {
          defaultTab = 'events';
        }

        setActiveTab(defaultTab);
        setInitialLoad(false);

        // Load data for the default tab
        if (defaultTab === 'albums') {
          const albumsData = await fetchAlbumsForGallery(
            0,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setAlbumsData(albumsData);
          setAlbumsCount(albumsData.totalAlbums);
        } else {
          const eventsData = await fetchEventsForGallery(
            0,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setGalleryData(eventsData);
          setEventsCount(eventsData.totalEvents);
        }
      } catch (error) {
        console.error('Failed to determine default tab and load data:', error);
        setLoadError('The gallery could not be loaded.');
        setInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    determineDefaultTabAndLoad();
  }, []); // Only run once on mount

  // Load albums data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'albums' && !initialLoad) {
      const loadAlbumsData = async () => {
        setLoading(true);
        try {
          const data = await fetchAlbumsForGallery(
            currentPage,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setAlbumsData(data);
          setAlbumsCount(data.totalAlbums);
          setLoadError(null);
        } catch (error) {
          console.error('Failed to fetch albums data:', error);
          setAlbumsData(null);
          setLoadError('The gallery could not be loaded.');
        } finally {
          setLoading(false);
        }
      };
      loadAlbumsData();
    }
  }, [activeTab, currentPage, searchFilters.searchTerm, searchFilters.startDate, searchFilters.endDate, initialLoad, retryNonce]);

  // Load events data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'events' && !initialLoad) {
      const loadEventsData = async () => {
        setLoading(true);
        try {
          const data = await fetchEventsForGallery(
            currentPage,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setGalleryData(data);
          setEventsCount(data.totalEvents);
          setLoadError(null);
        } catch (error) {
          console.error('Failed to fetch events data:', error);
          setGalleryData(null);
          setLoadError('The gallery could not be loaded.');
        } finally {
          setLoading(false);
        }
      };
      loadEventsData();
    }
  }, [activeTab, currentPage, searchFilters.searchTerm, searchFilters.startDate, searchFilters.endDate, initialLoad, retryNonce]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => {
    // Always update filters and reset to first page, even if filters appear unchanged
    // This ensures clearing search properly reloads all items
    setSearchFilters({
      searchTerm: filters.searchTerm || '',
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    setCurrentPage(0); // Reset to first page on new search
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset to first page when switching tabs
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="space-y-6">
        <GalleryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          albumsCount={albumsCount}
          eventsCount={eventsCount}
          loading={true}
        />
        <GallerySearch
        onSearch={handleSearch}
        loading={loading}
        placeholder={activeTab === 'albums' ? 'Search albums...' : 'Search events...'}
        resetToken={resetToken}
      />

        {/* Grid Container with Bold Dark Gradient Background - Matching events page style */}
        <div className="mb-8">
          <div>
            <div className="md-gallery-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="md-gallery-skeleton" />
              ))}
            </div>
          </div>
        </div>

        {/* Always show pagination controls, even when loading */}
        <GalleryPagination
          currentPage={currentPage}
          totalPages={1}
          totalCount={0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
          itemType={activeTab === 'albums' ? 'albums' : 'events'}
        />
      </div>
    );
  }

  // Albums tab content
  if (activeTab === 'albums') {
    const hasFilters = searchFilters.searchTerm || searchFilters.startDate || searchFilters.endDate;
    const hasAlbums = albumsData && albumsData.albumsWithMedia && albumsData.albumsWithMedia.length > 0;

    if (!hasAlbums && !loading) {
      return (
        <div className="space-y-6">
          <GalleryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            albumsCount={albumsCount}
            eventsCount={eventsCount}
            loading={loading}
          />
          <GallerySearch
            onSearch={handleSearch}
            loading={loading}
            placeholder={activeTab === 'albums' ? 'Search albums...' : 'Search events...'}
        resetToken={resetToken}
          />
          <div className="md-gallery-empty">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <h3>{loadError ? 'Gallery unavailable' : hasFilters ? 'No albums found' : 'No albums available'}</h3>
            <p>
              {loadError
                ? loadError
                : hasFilters
                  ? 'No albums match your search criteria. Try adjusting your filters.'
                  : 'Check back later for album photos and videos'}
            </p>
            {loadError ? (
              <button type="button" onClick={() => { setLoadError(null); setRetryNonce((n) => n + 1); }}>
                Try again
              </button>
            ) : hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setResetToken((n) => n + 1);
                  handleSearch({ searchTerm: '', startDate: undefined, endDate: undefined });
                }}
              >
                Clear all filters
              </button>
            ) : null}
          </div>

          {/* Always show pagination controls, even when no results */}
          <GalleryPagination
            currentPage={currentPage}
            totalPages={albumsData?.totalPages || 1}
            totalCount={albumsData?.totalAlbums || 0}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <GalleryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          albumsCount={albumsCount}
          eventsCount={eventsCount}
          loading={loading}
        />
        <GallerySearch
        onSearch={handleSearch}
        loading={loading}
        placeholder={activeTab === 'albums' ? 'Search albums...' : 'Search events...'}
        resetToken={resetToken}
      />

        {/* Grid Container with Bold Dark Gradient Background - Matching events page style */}
        <div className="mb-8">
          <div>
            {loading ? (
              <div className="md-gallery-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="md-gallery-skeleton" />
                ))}
              </div>
            ) : (
              <div className="md-gallery-grid">
                {albumsData?.albumsWithMedia?.map((albumWithMedia, index) => (
                  <GalleryAlbumCard
                    key={albumWithMedia.album.id}
                    albumWithMedia={albumWithMedia}
                    cardIndex={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <GalleryPagination
          currentPage={currentPage}
          totalPages={albumsData?.totalPages || 1}
          totalCount={albumsData?.totalAlbums || 0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
          itemType="albums"
        />
      </div>
    );
  }

  // Events tab content
  const hasFilters = searchFilters.searchTerm || searchFilters.startDate || searchFilters.endDate;
  const hasEvents = galleryData && galleryData.eventsWithMedia && galleryData.eventsWithMedia.length > 0;

  if (!hasEvents && !loading) {
    return (
      <div className="space-y-6">
        <GalleryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          albumsCount={albumsCount}
          eventsCount={eventsCount}
          loading={loading}
        />
        <GallerySearch
        onSearch={handleSearch}
        loading={loading}
        placeholder={activeTab === 'albums' ? 'Search albums...' : 'Search events...'}
        resetToken={resetToken}
      />
        <div className="md-gallery-empty">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
            <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <h3>{loadError ? 'Gallery unavailable' : hasFilters ? 'No events found' : 'No events available'}</h3>
          <p>
            {loadError
              ? loadError
              : hasFilters
                ? 'No events match your search criteria. Try adjusting your filters.'
                : 'Check back later for event photos and videos'}
          </p>
          {loadError ? (
            <button type="button" onClick={() => { setLoadError(null); setRetryNonce((n) => n + 1); }}>
              Try again
            </button>
          ) : hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setResetToken((n) => n + 1);
                handleSearch({ searchTerm: '', startDate: undefined, endDate: undefined });
              }}
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {/* Always show pagination controls, even when no results */}
        <GalleryPagination
          currentPage={currentPage}
          totalPages={galleryData?.totalPages || 1}
          totalCount={galleryData?.totalEvents || 0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    );
  }

  const { eventsWithMedia, totalEvents, totalPages } = galleryData || { eventsWithMedia: [], totalEvents: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <GalleryTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        albumsCount={albumsCount}
        eventsCount={eventsCount}
        loading={loading}
      />
      <GallerySearch
        onSearch={handleSearch}
        loading={loading}
        placeholder={activeTab === 'albums' ? 'Search albums...' : 'Search events...'}
        resetToken={resetToken}
      />

      {/* Grid Container with Bold Dark Gradient Background - Matching events page style */}
      <div className="mb-8">
        <div>
          {loading ? (
            <div className="md-gallery-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="md-gallery-skeleton" />
              ))}
            </div>
          ) : (
            <div className="md-gallery-grid">
              {eventsWithMedia?.map((eventWithMedia, index) => (
                <GalleryEventCard
                  key={eventWithMedia.event.id}
                  eventWithMedia={eventWithMedia}
                  cardIndex={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <GalleryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalEvents}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}
