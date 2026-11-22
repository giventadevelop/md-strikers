'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import {
  applyContainsTokens,
  mergePublicSearchItems,
  parseProxyList,
  PUBLIC_EVENT_SEARCH_FIELDS,
  PUBLIC_GALLERY_ALBUM_SEARCH_FIELDS,
} from '@/lib/publicTypeaheadSearch';
import type { EventDetailsDTO, EventMediaDTO, GalleryAlbumDTO, GalleryAlbumWithMedia } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

async function fetchBackendSearchPage<T extends { id?: number | string | null }>(options: {
  backendPath: string;
  query: string;
  containsFields: readonly string[];
  extraParams: URLSearchParams;
  page: number;
  size: number;
}): Promise<{ items: T[]; totalCount: number }> {
  const trimmed = options.query.trim();
  const fetchBy = async (apply: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(options.extraParams.toString());
    params.set('page', String(options.page));
    params.set('size', String(options.size));
    apply(params);
    const response = await fetchWithJwtRetry(
      `${getApiBase()}${options.backendPath}?${params.toString()}`,
      { cache: 'no-store' },
    );
    if (!response.ok) return { items: [] as T[], totalCount: 0 };
    const items = parseProxyList<T>(await response.json());
    const header = response.headers.get('X-Total-Count') || response.headers.get('x-total-count');
    const totalCount = header ? parseInt(header, 10) : items.length;
    return { items, totalCount: Number.isFinite(totalCount) ? totalCount : items.length };
  };

  const jobs: Promise<{ items: T[]; totalCount: number }>[] = options.containsFields.map(
    (field) => fetchBy((p) => applyContainsTokens(p, field, trimmed)),
  );
  if (/^\d+$/.test(trimmed)) {
    jobs.push(fetchBy((p) => p.set('id.equals', trimmed)));
  }

  const results = await Promise.all(jobs);
  const items = mergePublicSearchItems(
    results.map((r) => r.items),
    options.size,
  );
  const totalCount = Math.max(items.length, ...results.map((r) => r.totalCount));
  return { items, totalCount };
}

export interface GalleryEventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
  totalMediaCount: number;
}

export interface GalleryPageData {
  eventsWithMedia: GalleryEventWithMedia[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
}

export interface GalleryPageDataWithAlbums {
  eventsWithMedia: GalleryEventWithMedia[];
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalEvents: number;
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Fetch events with their media for gallery display
 */
export async function fetchEventsForGallery(
  page: number = 0,
  size: number = 20,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string
): Promise<GalleryPageData> {
  try {
    const tenantId = getTenantId();

        // Build query parameters for events
        const eventParams = new URLSearchParams();
        eventParams.append('tenantId.equals', tenantId);
        eventParams.append('isActive.equals', 'true');
        eventParams.append('sort', 'startDate,desc');

        // Add date range filtering
        if (startDate) {
          eventParams.append('startDate.greaterThanOrEqual', startDate);
        }
        if (endDate) {
          eventParams.append('startDate.lessThanOrEqual', endDate);
        }

    let eventsArray: EventDetailsDTO[] = [];
    let totalEvents = 0;

    if (searchTerm.trim()) {
      const pageResult = await fetchBackendSearchPage<EventDetailsDTO>({
        backendPath: '/api/event-details',
        query: searchTerm.trim(),
        containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
        extraParams: eventParams,
        page,
        size,
      });
      eventsArray = pageResult.items;
      totalEvents = pageResult.totalCount;
    } else {
      eventParams.append('page', page.toString());
      eventParams.append('size', size.toString());
      const eventsUrl = `${getApiBase()}/api/event-details?${eventParams.toString()}`;
      const eventsResponse = await fetchWithJwtRetry(eventsUrl, { cache: 'no-store' });

      if (!eventsResponse.ok) {
        console.error(`Failed to fetch events for gallery: ${eventsResponse.statusText}`);
        return {
          eventsWithMedia: [],
          totalEvents: 0,
          currentPage: page,
          totalPages: 0
        };
      }

      totalEvents = parseInt(eventsResponse.headers.get('X-Total-Count') || '0', 10);
      eventsArray = parseProxyList<EventDetailsDTO>(await eventsResponse.json());
    }

    // Fetch media for each event
    const eventsWithMedia: GalleryEventWithMedia[] = [];

    for (const event of eventsArray) {
      try {
        // Fetch public media for this event (exclude official documents)
        const mediaParams = new URLSearchParams();
        mediaParams.append('eventId.equals', event.id!.toString());
        mediaParams.append('isEventManagementOfficialDocument.equals', 'false');
        mediaParams.append('isPublic.equals', 'true');
        mediaParams.append('sort', 'displayOrder,asc');
        mediaParams.append('sort', 'updatedAt,desc');
        mediaParams.append('size', '200');

        const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
        console.log(`Fetching media for event ${event.id}: ${mediaUrl}`);
        const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

        let media: EventMediaDTO[] = [];
        let totalMediaCount = 0;

        if (mediaResponse.ok) {
          totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
          const mediaData = await mediaResponse.json();
          media = Array.isArray(mediaData) ? mediaData : [];
          console.log(`Event ${event.id} media fetched:`, { totalMediaCount, mediaCount: media.length, media });
        } else {
          console.log(`Failed to fetch media for event ${event.id}:`, mediaResponse.status, mediaResponse.statusText);
        }

        eventsWithMedia.push({
          event,
          media,
          totalMediaCount
        });

      } catch (mediaError) {
        console.error(`Failed to fetch media for event ${event.id}:`, mediaError);
        eventsWithMedia.push({
          event,
          media: [],
          totalMediaCount: 0
        });
      }
    }

    const totalPages = Math.ceil(totalEvents / size);

    return {
      eventsWithMedia,
      totalEvents,
      currentPage: page,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching events for gallery:', error);
    return {
      eventsWithMedia: [],
      totalEvents: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}

/**
 * Fetch media for a specific event with pagination
 */
export async function fetchEventMedia(
  eventId: number,
  page: number = 0,
  size: number = 20
): Promise<{ media: EventMediaDTO[]; totalCount: number }> {
  try {
    const params = new URLSearchParams();
    params.append('eventId.equals', eventId.toString());
    params.append('isEventManagementOfficialDocument.equals', 'false');
    params.append('isPublic.equals', 'true');
    params.append('sort', 'displayOrder,asc');
    params.append('sort', 'updatedAt,desc');
    params.append('page', page.toString());
    params.append('size', size.toString());

    const url = `${getApiBase()}/api/event-medias?${params.toString()}`;
    const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Failed to fetch media for event ${eventId}: ${response.statusText}`);
      return { media: [], totalCount: 0 };
    }

    const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const data = await response.json();
    const media = Array.isArray(data) ? data : [];

    return { media, totalCount };

  } catch (error) {
    console.error(`Error fetching media for event ${eventId}:`, error);
    return { media: [], totalCount: 0 };
  }
}

/**
 * Search events by title for gallery
 */
export async function searchEventsForGallery(
  searchTerm: string,
  startDate?: string,
  endDate?: string
): Promise<EventDetailsDTO[]> {
  try {
    const tenantId = getTenantId();
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);
    params.append('isActive.equals', 'true');
    params.append('sort', 'startDate,desc');

    // Add date range filtering
    if (startDate) {
      params.append('startDate.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      params.append('startDate.lessThanOrEqual', endDate);
    }

    const pageResult = await fetchBackendSearchPage<EventDetailsDTO>({
      backendPath: '/api/event-details',
      query: searchTerm.trim(),
      containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
      extraParams: params,
      page: 0,
      size: 50,
    });
    return pageResult.items;

  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

/**
 * Fetch albums with their media for gallery display
 */
export async function fetchAlbumsForGallery(
  page: number = 0,
  size: number = 20,
  searchTerm: string = '',
  startDate?: string,
  endDate?: string
): Promise<{
  albumsWithMedia: GalleryAlbumWithMedia[];
  totalAlbums: number;
  currentPage: number;
  totalPages: number;
}> {
  try {
    const tenantId = getTenantId();

    // Build query parameters for albums
    const albumParams = new URLSearchParams();
    albumParams.append('tenantId.equals', tenantId);
    albumParams.append('isPublic.equals', 'true'); // Public albums only for gallery
    albumParams.append('sort', 'displayOrder,asc');
    albumParams.append('sort', 'createdAt,desc');

    // Add date range filtering (for albums, filter by createdAt)
    if (startDate) {
      albumParams.append('createdAt.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      albumParams.append('createdAt.lessThanOrEqual', endDate);
    }

    let albumsArray: GalleryAlbumDTO[] = [];
    let totalAlbums = 0;

    if (searchTerm.trim()) {
      const pageResult = await fetchBackendSearchPage<GalleryAlbumDTO>({
        backendPath: '/api/gallery-albums',
        query: searchTerm.trim(),
        containsFields: PUBLIC_GALLERY_ALBUM_SEARCH_FIELDS,
        extraParams: albumParams,
        page,
        size,
      });
      albumsArray = pageResult.items;
      totalAlbums = pageResult.totalCount;
    } else {
      albumParams.append('page', page.toString());
      albumParams.append('size', size.toString());
      const albumsUrl = `${getApiBase()}/api/gallery-albums?${albumParams.toString()}`;
      const albumsResponse = await fetchWithJwtRetry(albumsUrl, { cache: 'no-store' });

      if (!albumsResponse.ok) {
        console.error(`Failed to fetch albums for gallery: ${albumsResponse.statusText}`);
        return {
          albumsWithMedia: [],
          totalAlbums: 0,
          currentPage: page,
          totalPages: 0
        };
      }

      totalAlbums = parseInt(albumsResponse.headers.get('X-Total-Count') || '0', 10);
      albumsArray = parseProxyList<GalleryAlbumDTO>(await albumsResponse.json());
    }

    // Fetch media for each album
    const albumsWithMedia: GalleryAlbumWithMedia[] = [];

    for (const album of albumsArray) {
      try {
        // Fetch public media for this album
        const mediaParams = new URLSearchParams();
        mediaParams.append('albumId.equals', album.id!.toString());
        mediaParams.append('isPublic.equals', 'true');
        mediaParams.append('sort', 'displayOrder,asc');
        mediaParams.append('sort', 'updatedAt,desc');
        mediaParams.append('size', '200');

        const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
        console.log(`Fetching media for album ${album.id}: ${mediaUrl}`);
        const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

        let media: EventMediaDTO[] = [];
        let totalMediaCount = 0;

        if (mediaResponse.ok) {
          totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
          const mediaData = await mediaResponse.json();
          media = Array.isArray(mediaData) ? mediaData : [];
          console.log(`Album ${album.id} media fetched:`, { totalMediaCount, mediaCount: media.length });
        } else {
          console.log(`Failed to fetch media for album ${album.id}:`, mediaResponse.status, mediaResponse.statusText);
        }

        albumsWithMedia.push({
          album,
          media,
          totalMediaCount
        });

      } catch (mediaError) {
        console.error(`Failed to fetch media for album ${album.id}:`, mediaError);
        albumsWithMedia.push({
          album,
          media: [],
          totalMediaCount: 0
        });
      }
    }

    const totalPages = Math.ceil(totalAlbums / size);

    return {
      albumsWithMedia,
      totalAlbums,
      currentPage: page,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching albums for gallery:', error);
    return {
      albumsWithMedia: [],
      totalAlbums: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}

/**
 * Fetch album by ID with media
 */
export async function fetchAlbumWithMedia(
  albumId: number
): Promise<GalleryAlbumWithMedia | null> {
  try {
    // Fetch album
    const albumUrl = `${getApiBase()}/api/gallery-albums/${albumId}`;
    const albumResponse = await fetchWithJwtRetry(albumUrl, { cache: 'no-store' });

    if (!albumResponse.ok) {
      if (albumResponse.status === 404) {
        return null;
      }
      console.error(`Failed to fetch album ${albumId}:`, albumResponse.statusText);
      return null;
    }

    const album: GalleryAlbumDTO = await albumResponse.json();

    // Fetch media for album
    const mediaParams = new URLSearchParams();
    mediaParams.append('albumId.equals', albumId.toString());
    mediaParams.append('isPublic.equals', 'true');
    mediaParams.append('sort', 'displayOrder,asc');
    mediaParams.append('sort', 'updatedAt,desc');
    mediaParams.append('size', '100');

    const mediaUrl = `${getApiBase()}/api/event-medias?${mediaParams.toString()}`;
    const mediaResponse = await fetchWithJwtRetry(mediaUrl, { cache: 'no-store' });

    let media: EventMediaDTO[] = [];
    let totalMediaCount = 0;

    if (mediaResponse.ok) {
      totalMediaCount = parseInt(mediaResponse.headers.get('X-Total-Count') || '0', 10);
      const mediaData = await mediaResponse.json();
      media = Array.isArray(mediaData) ? mediaData : [];
    }

    return {
      album,
      media,
      totalMediaCount
    };

  } catch (error) {
    console.error(`Error fetching album ${albumId} with media:`, error);
    return null;
  }
}
