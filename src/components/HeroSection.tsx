'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EventWithMedia, EventMediaDTO } from '@/types';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { isRecurringEvent, getNextOccurrenceDate } from '@/lib/eventUtils';
import { getOverlayInfo } from '@/lib/heroOverlay';
import { getTenantId } from '@/lib/env';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';
import { ArrowRight, Heart, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import GivebutterDonateButton from '@/components/GivebutterDonateButton';

/** Hero media is shown only if startDisplayingFromDate is null or <= today (matches useFilteredEvents). */
function isHeroMediaDisplayDateValid(media: EventMediaDTO & { start_displaying_from_date?: string }): boolean {
  const displayDateValue = media.startDisplayingFromDate ?? media.start_displaying_from_date;
  if (!displayDateValue) return true;
  try {
    const [year, month, day] = displayDateValue.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day);
    displayDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return displayDate <= today;
  } catch {
    return true;
  }
}

/** True when media is not associated with any event (event_id NULL). Supports eventId, event_id, and event.id from API. */
function isStandaloneHeroMedia(media: EventMediaDTO & { event_id?: number | null; event?: { id?: number | null } }): boolean {
  const eid = media.eventId ?? media.event_id ?? media.event?.id;
  return eid == null || eid === undefined;
}

/** True when media is eligible for standalone hero: is_home_page_hero_image OR is_hero_image (camel or snake_case). Used only for standalone (event_id NULL) selection. */
function isStandaloneHeroEligible(media: EventMediaDTO & { is_hero_image?: boolean; is_home_page_hero_image?: boolean }): boolean {
  const homePage = media.isHomePageHeroImage === true || media.is_home_page_hero_image === true;
  const hero = media.isHeroImage === true || media.is_hero_image === true;
  return homePage || hero;
}

/** Normalize event-medias API response: backend may return array or paged { content: [] }. */
function normalizeEventMediasResponse(data: unknown): EventMediaDTO[] {
  if (Array.isArray(data)) return data as EventMediaDTO[];
  if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
    return (data as { content: EventMediaDTO[] }).content;
  }
  if (data && typeof data === 'object') return [data as EventMediaDTO];
  return [];
}

type MediaWithSnake = EventMediaDTO & {
  event_id?: number | null;
  file_url?: string;
  home_page_hero_display_duration_seconds?: number | null;
  is_hero_image?: boolean;
  is_home_page_hero_image?: boolean;
};

function getHeroMediaUrl(media: MediaWithSnake): string | undefined {
  return media.fileUrl ?? media.file_url;
}

function getHeroMediaDurationMs(media: MediaWithSnake): number {
  const sec = media.homePageHeroDisplayDurationSeconds ?? media.home_page_hero_display_duration_seconds;
  return sec != null && sec > 0 ? Math.max(1000, Math.min(600000, sec * 1000)) : 8000;
}

// Extended event type
interface EventWithMediaExtended extends EventWithMedia {
  placeholderText?: string;
}

// Hands/Heart Icon SVG for About Card
const HandsHeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 20C40 20 32 12 24 12C16 12 10 18 10 26C10 40 40 56 40 56C40 56 70 40 70 26C70 18 64 12 56 12C48 12 40 20 40 20Z"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M20 44V64C20 66 22 68 24 68H32C34 68 36 66 36 64V52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M60 44V64C60 66 58 68 56 68H48C46 68 44 66 44 64V52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 52H52"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Dynamic Hero Image Component
const DynamicHeroImage: React.FC<{
  onEventChange?: (event: EventWithMediaExtended | null) => void;
}> = ({ onEventChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithMediaExtended[]>([]);
  const [imageDurations, setImageDurations] = useState<number[]>([]); // Duration in milliseconds for each image
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const touchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const rotationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Ref to store latest durations array to avoid stale closures
  const imageDurationsRef = React.useRef<number[]>([]);
  // Refs to store latest arrays to avoid stale closures in recursive function
  const dynamicImagesRef = React.useRef<string[]>([]);
  const upcomingEventsRef = React.useRef<EventWithMediaExtended[]>([]);
  // Ref to store latest isPaused state to avoid stale closures
  const isPausedRef = React.useRef<boolean>(false);
  // Ref to track the last scheduled image index to prevent duplicate scheduling
  const lastScheduledIndexRef = React.useRef<number | null>(null);

  // Defer hero event data fetching until after initial paint + 500ms
  const heroFetchEnabled = useDeferredFetch(500);
  const { filteredEvents, isLoading: eventsLoading, error } = useFilteredEvents('hero', heroFetchEnabled);

  const defaultImage = "/images/hero_section/default_hero_section_second_column_poster.jpeg";

  const CACHE_KEY = getHomepageCacheKey('homepage_hero_section_cache');
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes (same as other homepage sections)

  // Run cache read before paint so hero images and rotation show immediately on refresh (per HOMEPAGE_CACHE_IMPLEMENTATION_PLAN)
  useLayoutEffect(() => {
    try {
      const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CACHE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as { dynamicImages?: string[]; upcomingEvents?: EventWithMediaExtended[]; imageDurations?: number[]; timestamp?: number };
      if (
        parsed.timestamp != null &&
        Date.now() - parsed.timestamp < CACHE_DURATION_MS &&
        Array.isArray(parsed.dynamicImages) &&
        parsed.dynamicImages.length > 0 &&
        Array.isArray(parsed.imageDurations) &&
        parsed.imageDurations.length === parsed.dynamicImages.length
      ) {
        setDynamicImages(parsed.dynamicImages);
        setUpcomingEvents(Array.isArray(parsed.upcomingEvents) ? parsed.upcomingEvents : []);
        setImageDurations(parsed.imageDurations);
        dynamicImagesRef.current = parsed.dynamicImages;
        upcomingEventsRef.current = Array.isArray(parsed.upcomingEvents) ? parsed.upcomingEvents : [];
        imageDurationsRef.current = parsed.imageDurations;
        setIsInitialized(true);
      }
    } catch (_) {
      /* ignore */
    }
  }, [CACHE_KEY]);

  // Store onEventChange in a ref to avoid dependency issues in the rotation effect
  const onEventChangeRef = React.useRef(onEventChange);
  React.useEffect(() => {
    onEventChangeRef.current = onEventChange;
  }, [onEventChange]);

  // Initialize hero images (4-month rule: no events in 4 months → up to 6 event-assigned hero images; events in 4 months → event images + up to 2 standalone)
  useEffect(() => {
    const initializeHeroImages = async () => {
      try {
        const imageUrls: string[] = [];
        let processedEvents: EventWithMediaExtended[] = [];
        const durations: number[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fourMonthsFromNow = new Date();
        fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);

        if (filteredEvents && filteredEvents.length > 0) {
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(today.getFullYear() + 1);
          const recurringSeriesMap = new Map<number, EventWithMediaExtended>();

          filteredEvents.forEach(({ event, media }) => {
            const durationSeconds = media.homePageHeroDisplayDurationSeconds;
            const durationMs = durationSeconds != null && durationSeconds > 0
              ? Math.max(1000, Math.min(600000, durationSeconds * 1000))
              : 8000;

            const eventWithMedia: EventWithMediaExtended = {
              ...event,
              thumbnailUrl: media.fileUrl,
              media: [media],
              heroDisplayDurationMs: durationMs
            } as EventWithMediaExtended & { heroDisplayDurationMs: number };

            if (isRecurringEvent(event)) {
              const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;
              const nextOccurrence = getNextOccurrenceDate(event, today);
              if (!nextOccurrence || nextOccurrence > oneYearFromNow) return;
              const nextOccurrenceStr = nextOccurrence.toISOString().split('T')[0];
              eventWithMedia.startDate = nextOccurrenceStr;
              const existingSeriesEvent = recurringSeriesMap.get(seriesId);
              if (!existingSeriesEvent) {
                recurringSeriesMap.set(seriesId, eventWithMedia);
              } else {
                const existingDate = new Date(existingSeriesEvent.startDate!);
                if (nextOccurrence < existingDate) {
                  recurringSeriesMap.set(seriesId, eventWithMedia);
                }
              }
            } else {
              processedEvents.push(eventWithMedia);
            }
          });

          recurringSeriesMap.forEach((event) => processedEvents.push(event));
          processedEvents.sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          });
        }

        const hasEventsInNext4Months = processedEvents.some((e) => {
          const d = e.startDate ? new Date(e.startDate) : null;
          if (!d) return false;
          return d >= today && d <= fourMonthsFromNow;
        });

        if (!hasEventsInNext4Months) {
          // No events in next 4 months: use up to STANDALONE_HERO_CAP standalone hero images (event_id NULL, is_hero_image OR is_home_page_hero_image); fetch by hero flags then filter client-side
          const STANDALONE_HERO_CAP = 24;
          const STANDALONE_FETCH_SIZE = 100;
          try {
            const tenantId = getTenantId();
            const seenIds = new Set<number>();
            const mergeStandalone = (raw: (EventMediaDTO & MediaWithSnake)[]) =>
              raw
                .filter((m) => isStandaloneHeroMedia(m) && isStandaloneHeroEligible(m) && isHeroMediaDisplayDateValid(m))
                .filter((m) => {
                  const id = m.id;
                  if (id == null || seenIds.has(id)) return false;
                  seenIds.add(id);
                  return true;
                });
            let list: (EventMediaDTO & MediaWithSnake)[] = [];
            let res = await fetch(
              `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&isHeroImage.equals=true&size=${STANDALONE_FETCH_SIZE}&sort=displayOrder,asc`,
              { cache: 'no-store' }
            );
            if (res.ok) {
              const data = await res.json();
              const normalized = normalizeEventMediasResponse(data) as (EventMediaDTO & MediaWithSnake)[];
              list = mergeStandalone(normalized);
              if (normalized.length > 0) {
                const excludedCount = normalized.filter((m) => !isStandaloneHeroMedia(m) || !isStandaloneHeroEligible(m) || !isHeroMediaDisplayDateValid(m)).length;
                if (excludedCount > 0) {
                  console.log('[HeroSection] Standalone hero fetch (isHeroImage):', { fetched: normalized.length, passedFilter: list.length, excluded: excludedCount, tip: 'Excluded if linked to an event, or "Start displaying from date" is in the future.' });
                }
              }
            }
            // Always fetch isHomePageHeroImage too so media with only is_home_page_hero_image=true (and not is_hero_image) are included
            res = await fetch(
              `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&isHomePageHeroImage.equals=true&size=${STANDALONE_FETCH_SIZE}&sort=displayOrder,asc`,
              { cache: 'no-store' }
            );
            if (res.ok) {
              const data = await res.json();
              const more = mergeStandalone(normalizeEventMediasResponse(data) as (EventMediaDTO & MediaWithSnake)[]);
              list = [...list, ...more].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            }
            const beforeCap = list.length;
            const standalone = list.slice(0, STANDALONE_HERO_CAP);
            if (beforeCap > STANDALONE_HERO_CAP) {
              console.log('[HeroSection] Standalone hero cap applied:', { totalEligible: beforeCap, cap: STANDALONE_HERO_CAP, showing: standalone.length, omitted: beforeCap - STANDALONE_HERO_CAP, tip: 'Set Display Order lower (e.g. 0–5) in Admin → Media so preferred images show first.' });
            }
            processedEvents = [];
            standalone.forEach((m) => {
              const url = getHeroMediaUrl(m);
              if (url) {
                imageUrls.push(url);
                durations.push(getHeroMediaDurationMs(m));
              } else {
                console.warn('[HeroSection] Standalone hero media skipped (no fileUrl):', { id: m.id, title: m.title });
              }
            });
          } catch (err) {
            console.warn('[HeroSection] Fallback hero media fetch failed:', err);
          }
        } else {
          // Events in next 4 months: event-based images first, then up to STANDALONE_HERO_CAP_WITH_EVENTS standalone (event_id NULL)
          const STANDALONE_HERO_CAP_WITH_EVENTS = 12;
          const STANDALONE_FETCH_SIZE_WITH_EVENTS = 50;
          processedEvents.forEach((e, index) => {
            if (e.thumbnailUrl) {
              imageUrls.push(e.thumbnailUrl);
              const eventDuration = (e as EventWithMediaExtended & { heroDisplayDurationMs?: number }).heroDisplayDurationMs ?? 8000;
              durations.push(eventDuration);
              console.log(`[HeroSection] Event ${index + 1} duration: ${eventDuration}ms (${eventDuration / 1000}s)`, {
                eventId: e.id,
                eventTitle: e.title,
              });
            }
          });

          try {
            const tenantId = getTenantId();
            // Standalone = event_id null AND (is_hero_image OR is_home_page_hero_image). Fetch hero-flagged media then filter client-side for no event (backend may not support eventId.specified=false).
            const seenIds = new Set<number>();
            const mergeStandalone = (raw: (EventMediaDTO & MediaWithSnake)[]) => {
              return raw
                .filter((m) => isStandaloneHeroMedia(m) && isStandaloneHeroEligible(m) && isHeroMediaDisplayDateValid(m))
                .filter((m) => {
                  const id = m.id;
                  if (id == null || seenIds.has(id)) return false;
                  seenIds.add(id);
                  return true;
                });
            };
            let list: (EventMediaDTO & MediaWithSnake)[] = [];
            // 1) Fetch by isHeroImage=true (includes standalone rows with is_hero_image=true)
            let res = await fetch(
              `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&isHeroImage.equals=true&size=${STANDALONE_FETCH_SIZE_WITH_EVENTS}&sort=displayOrder,asc`,
              { cache: 'no-store' }
            );
            if (res.ok) {
              const data = await res.json();
              const raw = normalizeEventMediasResponse(data) as (EventMediaDTO & MediaWithSnake)[];
              list = mergeStandalone(raw);
            }
            // 2) Always fetch by isHomePageHeroImage=true and merge so media with only is_home_page_hero_image (and not is_hero_image) are included
            res = await fetch(
              `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&isHomePageHeroImage.equals=true&size=${STANDALONE_FETCH_SIZE_WITH_EVENTS}&sort=displayOrder,asc`,
              { cache: 'no-store' }
            );
            if (res.ok) {
              const data = await res.json();
              const raw = normalizeEventMediasResponse(data) as (EventMediaDTO & MediaWithSnake)[];
              list = [...list, ...mergeStandalone(raw)].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            }
            const beforeCap = list.length;
            const standalone = list.slice(0, STANDALONE_HERO_CAP_WITH_EVENTS);
            if (beforeCap > STANDALONE_HERO_CAP_WITH_EVENTS) {
              console.log('[HeroSection] Standalone hero cap (with events in 4mo):', { totalEligible: beforeCap, cap: STANDALONE_HERO_CAP_WITH_EVENTS, showing: standalone.length, omitted: beforeCap - STANDALONE_HERO_CAP_WITH_EVENTS });
            }
            if (standalone.length === 0) {
              console.warn(
                '[HeroSection] No standalone hero images (event_id null) found. Add media in Admin with no event selected (event_id NULL) and either "Home Page Hero Image" or "Hero Image" checked.'
              );
            }
            standalone.forEach((m) => {
              const url = getHeroMediaUrl(m);
              if (url) {
                imageUrls.push(url);
                durations.push(getHeroMediaDurationMs(m));
              }
            });
          } catch (err) {
            console.warn('[HeroSection] Standalone hero media fetch failed:', err);
          }
        }

        // ALWAYS add default image at the end of the rotation (use default 8 seconds)
        imageUrls.push(defaultImage);
        durations.push(8000);

        console.log('[HeroSection] Image rotation initialized:', {
          totalImages: imageUrls.length,
          eventImages: imageUrls.length - 1,
          hasDefaultImage: true,
          hasEventsInNext4Months,
          durations: durations.map((d) => `${d}ms (${d / 1000}s)`),
        });

        setUpcomingEvents(processedEvents);
        setDynamicImages(imageUrls);
        setImageDurations(durations);
        imageDurationsRef.current = durations;
        dynamicImagesRef.current = imageUrls;
        upcomingEventsRef.current = processedEvents;
        setIsInitialized(true);

        if (processedEvents.length > 0 && onEventChangeRef.current) {
          onEventChangeRef.current(processedEvents[0]);
        } else if (onEventChangeRef.current) {
          onEventChangeRef.current(null);
        }

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              dynamicImages: imageUrls,
              upcomingEvents: processedEvents,
              imageDurations: durations,
              timestamp: Date.now(),
            })
          );
        } catch (_) {
          /* ignore */
        }
      } catch (error) {
        console.error('Failed to initialize hero images:', error);
        setDynamicImages([defaultImage]);
        setImageDurations([8000]);
        setUpcomingEvents([]);
        setIsInitialized(true);
      }
    };

    if (!eventsLoading && !error) {
      initializeHeroImages();
    }
  }, [filteredEvents, eventsLoading, error]);

  // Update refs whenever state changes to avoid stale closures
  useEffect(() => {
    imageDurationsRef.current = imageDurations;
  }, [imageDurations]);

  useEffect(() => {
    dynamicImagesRef.current = dynamicImages;
  }, [dynamicImages]);

  useEffect(() => {
    upcomingEventsRef.current = upcomingEvents;
  }, [upcomingEvents]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Store scheduleNextRotation in a ref to avoid dependency issues
  const scheduleNextRotationRef = React.useRef<((imageIndex: number) => void) | null>(null);

  // Shared recursive function to rotate to next image with dynamic duration
  // Use refs to access the latest arrays to avoid stale closures
  // This function is used both by the rotation effect and manual navigation
  const scheduleNextRotation = React.useCallback((imageIndex: number) => {
    // CRITICAL: Prevent duplicate scheduling for the same image index
    if (lastScheduledIndexRef.current === imageIndex && rotationTimeoutRef.current !== null) {
      console.log('[HeroSection] Duplicate schedule prevented for index', imageIndex);
      return;
    }

    // CRITICAL: Clear any existing timeout before scheduling a new one to prevent duplicates
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }

    // Don't schedule if paused or not initialized - use refs to get latest values
    if (isPausedRef.current || !isInitialized) {
      lastScheduledIndexRef.current = null;
      return;
    }

    // Mark this index as scheduled
    lastScheduledIndexRef.current = imageIndex;

    // CRITICAL: Access all arrays from refs to get the latest values, not from closure
    const currentDurations = imageDurationsRef.current;
    const currentImages = dynamicImagesRef.current;
    const currentEvents = upcomingEventsRef.current;

    // Safety check
    if (!currentImages || currentImages.length < 2) {
      return;
    }

    // Get duration for the specified image (default to 8 seconds if not available)
    const imageDuration = (currentDurations && currentDurations[imageIndex]) ? currentDurations[imageIndex] : 8000;

    console.log('[HeroSection] Scheduling next rotation:', {
      currentIndex: imageIndex,
      currentDurationMs: imageDuration,
      currentDurationSec: imageDuration / 1000,
      totalImages: currentImages.length,
      imageUrl: currentImages[imageIndex] || 'default',
      durationsArray: currentDurations,
      durationsArrayLength: currentDurations?.length
    });

    rotationTimeoutRef.current = setTimeout(() => {
      // Clear the scheduled index ref when timeout executes
      lastScheduledIndexRef.current = null;

      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => {
          // CRITICAL: Get latest arrays from refs, not closure
          const latestDurations = imageDurationsRef.current;
          const latestImages = dynamicImagesRef.current;
          const latestEvents = upcomingEventsRef.current;

          const nextIndex = (prevIndex + 1) % latestImages.length;
          const nextDuration = (latestDurations && latestDurations[nextIndex]) ? latestDurations[nextIndex] : 8000;

          console.log('[HeroSection] Rotating to image', nextIndex + 1, 'of', latestImages.length, {
            previousIndex: prevIndex,
            nextIndex,
            nextDurationMs: nextDuration,
            nextDurationSec: nextDuration / 1000,
            nextImageUrl: latestImages[nextIndex] || 'default',
            durationsArray: latestDurations,
            durationsArrayLength: latestDurations?.length
          });

          // Defer parent update to avoid "Cannot update component while rendering another"
          const nextEvent = nextIndex < latestEvents.length ? latestEvents[nextIndex] : null;
          const cb = onEventChangeRef.current;
          if (cb) {
            setTimeout(() => cb(nextEvent), 0);
          }

          // Schedule next rotation with the new image's duration (use nextIndex)
          // Access latest arrays from refs in the next schedule call
          // Use ref to check pause state to avoid stale closure
          // Use the ref to call the function to avoid closure issues
          // Schedule after a small delay to ensure state update completes
          setTimeout(() => {
            if (!isPausedRef.current && scheduleNextRotationRef.current) {
              scheduleNextRotationRef.current(nextIndex);
            }
          }, 10);

          return nextIndex;
        });

        // Remove transition class after image changes
        setTimeout(() => setIsTransitioning(false), 50);
      }, 400);
    }, imageDuration);
  }, [isInitialized]);

  // Update the ref whenever the function changes
  useEffect(() => {
    scheduleNextRotationRef.current = scheduleNextRotation;
  }, [scheduleNextRotation]);

  // Image rotation effect - continuous loop with per-image durations (pauses when isPaused is true)
  useEffect(() => {
    // Don't start rotation until initialized and we have at least 2 images
    if (!isInitialized || dynamicImages.length < 2 || isPaused) {
      console.log('[HeroSection] Rotation not started:', { isInitialized, imageCount: dynamicImages.length, isPaused });
      // Clear any existing timeout when paused
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
        rotationTimeoutRef.current = null;
      }
      return;
    }

    console.log('[HeroSection] Starting image rotation with', dynamicImages.length, 'images');
    console.log('[HeroSection] Image durations:', imageDurations.map((d, i) => `Image ${i + 1}: ${d}ms (${d / 1000}s)`));

    // CRITICAL: Clear any existing timeout before starting new rotation to prevent duplicates
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }

    // Reset the scheduled index guard when starting fresh rotation
    lastScheduledIndexRef.current = null;

    // Start the rotation cycle with the current image index (0 for first image)
    // Use the ref to call the function to avoid dependency issues
    // Use setTimeout to ensure this runs after any pending state updates
    setTimeout(() => {
      if (scheduleNextRotationRef.current && !isPausedRef.current) {
        scheduleNextRotationRef.current(currentImageIndex);
      }
    }, 0);

    return () => {
      console.log('[HeroSection] Cleaning up rotation timeout');
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
        rotationTimeoutRef.current = null;
      }
      lastScheduledIndexRef.current = null;
    };
  }, [isInitialized, dynamicImages.length, upcomingEvents.length, isPaused]);

  // Navigation functions
  const goToPrevious = () => {
    // Clear existing rotation timeout when manually navigating
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
    lastScheduledIndexRef.current = null;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        // Use refs to get latest arrays
        const latestImages = dynamicImagesRef.current;
        const latestEvents = upcomingEventsRef.current;

        const newIndex = (prevIndex - 1 + latestImages.length) % latestImages.length;

        const newEvent = newIndex < latestEvents.length ? latestEvents[newIndex] : null;
        const cb = onEventChangeRef.current;
        if (cb) setTimeout(() => cb(newEvent), 0);

        // Restart rotation from new index after navigation completes
        // Use ref to call the function to avoid closure issues
        setTimeout(() => {
          if (scheduleNextRotationRef.current) {
            scheduleNextRotationRef.current(newIndex);
          }
        }, 100);

        return newIndex;
      });
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const goToNext = () => {
    // Clear existing rotation timeout when manually navigating
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
    lastScheduledIndexRef.current = null;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        // Use refs to get latest arrays
        const latestImages = dynamicImagesRef.current;
        const latestEvents = upcomingEventsRef.current;

        const nextIndex = (prevIndex + 1) % latestImages.length;

        const nextEvent = nextIndex < latestEvents.length ? latestEvents[nextIndex] : null;
        const cb = onEventChangeRef.current;
        if (cb) setTimeout(() => cb(nextEvent), 0);

        // Restart rotation from new index after navigation completes
        // Use ref to call the function to avoid closure issues
        setTimeout(() => {
          if (scheduleNextRotationRef.current) {
            scheduleNextRotationRef.current(nextIndex);
          }
        }, 100);

        return nextIndex;
      });
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };

  const togglePlayPause = () => {
    setIsPaused((prev) => !prev);
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setIsTouched(true);
    // Clear existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    // Hide controls after 3 seconds if no interaction
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouched(false);
      touchTimeoutRef.current = null;
    }, 3000);
  };

  // Keep controls visible on touch interaction
  const handleTouchInteraction = () => {
    setIsTouched(true);
    // Clear existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    // Reset timeout on any touch interaction
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouched(false);
      touchTimeoutRef.current = null;
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const currentImage = dynamicImages[currentImageIndex] || defaultImage;
  const showControls = isHovered || isTouched;
  const hasMultipleImages = dynamicImages.length > 1;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
    >
      <Image
        src={currentImage}
        alt="Featured Event"
        width={1200}
        height={800}
        className={`w-full h-full object-contain hero-image-transition ${isTransitioning ? 'transitioning' : ''}`}
        sizes="(max-width: 768px) 100vw, 65vw"
        priority
        style={{
          backgroundColor: 'transparent',
          borderRadius: '1rem'
        }}
      />

      {/* Slider Controls - Show on hover or touch */}
      {/* Controls positioned above image and Buy Tickets overlay (z-20) */}
      {hasMultipleImages && showControls && (
        <div
          className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none"
          onTouchStart={handleTouchInteraction}
        >
          {/* Previous Button - Left */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title="Previous Image"
            aria-label="Previous Image"
            type="button"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Play/Pause Button - Center */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePlayPause();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title={isPaused ? 'Play' : 'Pause'}
            aria-label={isPaused ? 'Play' : 'Pause'}
            type="button"
          >
            {isPaused ? (
              <Play className="w-6 h-6 text-gray-700 ml-0.5" />
            ) : (
              <Pause className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Next Button - Right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            onTouchStart={handleTouchInteraction}
            className="pointer-events-auto flex-shrink-0 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:bg-white backdrop-blur-sm shadow-lg border-2 border-gray-300 hover:border-blue-500 active:border-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            title="Next Image"
            aria-label="Next Image"
            type="button"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

const HeroSection: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<EventWithMediaExtended | null>(null);

  // Determine overlay image and route based on event type (matching events page logic)
  const overlayInfo = getOverlayInfo(currentEvent);

  return (
    <section className="hero-container-split">
      {/* === TOP ROW: Two-Column Hero Layout === */}
      <div className="hero-split-row">
        {/* LEFT PANEL (Section 1): Static Kerala Image - Full visibility, elegant frame */}
        <div className="hero-left-panel">
          {/* Image container - object-contain for full image visibility, centered */}
          <div className="hero-left-image flex items-center justify-center">
            <Image
              src="/images/hero_section/wooden-boat-under-coconut-tree-riverside_ver_2.jpg"
              alt="Malayalees.US - Kerala Backwaters"
              width={600}
              height={800}
              className="w-full h-full object-contain object-center"
              sizes="(max-width: 768px) 100vw, 35vw"
              priority
              style={{
                backgroundColor: 'transparent',
                borderRadius: '1rem'
              }}
            />
          </div>
        </div>

        {/* RIGHT PANEL (Section 2): Dynamic Slideshow - Full image visibility */}
        <div className="hero-right-panel">
          <div className="hero-slideshow-wrapper">
            <DynamicHeroImage onEventChange={setCurrentEvent} />
          </div>

          {/* Buy Tickets Overlay Image - Bottom Right Corner of Section 2 */}
          {overlayInfo && (
            <div className="hero-ticket-overlay">
              <Link
                href={overlayInfo.href}
                className="block cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                onClick={(e) => e.stopPropagation()}
                title={overlayInfo.alt}
                aria-label={overlayInfo.alt}
              >
                <img
                  src={overlayInfo.image}
                  alt={overlayInfo.alt}
                  className="object-contain w-[140px] h-[48px] sm:w-[180px] sm:h-[62px] md:w-[200px] md:h-[70px]"
                />
              </Link>
            </div>
          )}
        </div>

        {/* Elegant vertical divider between sections */}
        <div className="hero-split-divider" />
      </div>

      {/* === BOTTOM ROW: Two Cards (Section 3 & 4) === */}
      <div className="hero-bottom-row">
        {/* Section 3: Unite India Logo + Mission */}
        <Link href="/#about-us" className="hero-bottom-card hero-bottom-card-mission group">
          <div className="hero-mission-bg">
            <Image
              src="/images/logos/Malayalees_US/image.png"
              alt="Unite India - A Nonprofit Corporation"
              fill
              className="object-cover object-left transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="hero-mission-overlay" />
          <div className="hero-mission-content">
            <p className="hero-card-label">About</p>
            <p className="hero-card-title">Our Mission</p>
          </div>
        </Link>

        {/* Section 4: Donate Button - Compact horizontal layout */}
        <div className="hero-bottom-card hero-bottom-card-donate">
          <div className="hero-donate-bg" />
          <div className="hero-donate-glow" />
          <div className="hero-donate-content">
            <div className="hero-donate-text-group">
              <p className="hero-donate-heading">Support Our Community</p>
              <p className="hero-donate-subtext">Help us make a difference</p>
            </div>
            <GivebutterDonateButton
              className="hero-donate-button"
            >
              <Heart size={16} className="fill-white" />
              <span>Donate Now</span>
            </GivebutterDonateButton>
          </div>
        </div>
      </div>

      {/* Browse All Events Link */}
      <div className="hero-browse-container">
        <Link href="/browse-events" className="hero-browse-link">
          <span>Browse all upcoming events</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
