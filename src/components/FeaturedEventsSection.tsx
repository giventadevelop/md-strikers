'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { getOverlayInfo } from '@/lib/heroOverlay';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';
import {
  MAX_FEATURED_EVENTS_HOMEPAGE,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';

const MAX_FEATURED_EVENTS = MAX_FEATURED_EVENTS_HOMEPAGE;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes (same as UpcomingEventsSection)

type FeaturedEventsSectionProps = {
  /** SSR seed — same shape as client filter; shows in first paint when provided */
  initialFeaturedEvents?: FeaturedEventWithMedia[];
};

const FeaturedEventsSection: React.FC<FeaturedEventsSectionProps> = ({
  initialFeaturedEvents = [],
}) => {
  const [isVisible, setIsVisible] = useState(() => initialFeaturedEvents.length > 0);
  const [displayedEvents, setDisplayedEvents] = useState<FeaturedEventWithMedia[]>(() =>
    initialFeaturedEvents.slice(0, MAX_FEATURED_EVENTS)
  );
  const featuredFetchEnabled = useDeferredFetch(0);
  const { filteredEvents, isLoading } = useFilteredEvents('featured', featuredFetchEnabled);

  const CACHE_KEY = getHomepageCacheKey('homepage_featured_events_cache');

  // Run cache read before paint so cached data shows immediately (no delay on refresh)
  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_DURATION_MS && Array.isArray(data) && data.length > 0) {
        setDisplayedEvents(data.slice(0, MAX_FEATURED_EVENTS));
        setIsVisible(true);
      }
    } catch (_) {
      /* ignore */
    }
  }, [CACHE_KEY]);

  // When useFilteredEvents has data: update displayed list, write cache, show immediately (no 300ms delay)
  useEffect(() => {
    if (isLoading || filteredEvents.length === 0) return;

    const next = filteredEvents.slice(0, MAX_FEATURED_EVENTS);
    setDisplayedEvents(next);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, timestamp: Date.now() }));
    } catch (_) {
      /* ignore */
    }

    if (!isVisible) {
      setIsVisible(true);
    }
  }, [isLoading, filteredEvents, CACHE_KEY, isVisible]);

  // Helper to generate Google Calendar URL
  function toGoogleCalendarDate(date: string, time: string) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let ampm = '';
    if (minute && minute.includes(' ')) {
      [minute, ampm] = minute.split(' ');
    }
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute || '00'}00`;
  }

  // Don't render if no featured events to show (and not from cache)
  if (displayedEvents.length === 0) {
    return null;
  }

  // Don't render if not visible yet
  if (!isVisible) {
    return null;
  }

  return (
    <section className="py-0 md:py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Yellow bar and label only (h2 removed per request) */}
        <div className="mt-4 mb-4">
          <div className="flex items-center space-x-2 mb-0">
            <div className="w-5 h-2 bg-yellow-400 rounded"></div>
            <p className="text-gray-600">Featured</p>
          </div>
        </div>

        {/* Featured Events Strip - max 3 */}
        <div className="space-y-4 md:space-y-6">
          {displayedEvents.map((featuredEvent, index) => (
            <div
              key={featuredEvent.event.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-auto md:h-[200px]"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Column - Image only; 70% width on desktop; height = card (200px) */}
                <div className="w-full md:w-[70%] h-48 md:h-full relative overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
                  {featuredEvent.media.fileUrl ? (
                    <Image
                      src={featuredEvent.media.fileUrl}
                      alt={featuredEvent.media.altText || featuredEvent.event.title}
                      fill
                      className="object-cover"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      priority={index === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Featured Event Badge Overlay */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3">
                    <div className="flex items-center space-x-1.5 bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide">
                        Featured Event
                      </span>
                    </div>
                  </div>

                  {/* Buy Ticket / Fundraiser overlay - bottom right (same logic as hero) */}
                  {(() => {
                    const overlay = getOverlayInfo(featuredEvent.event);
                    if (!overlay) return null;
                    return (
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                        <Link
                          href={overlay.href}
                          className="block cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={(e) => e.stopPropagation()}
                          title={overlay.alt}
                          aria-label={overlay.alt}
                        >
                          <img
                            src={overlay.image}
                            alt={overlay.alt}
                            className="object-contain w-[100px] h-[34px] sm:w-[120px] sm:h-[42px] md:w-[130px] md:h-[44px]"
                          />
                        </Link>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column - Same height as image (200px); compact content, no scrollbar */}
                <div className="w-full md:w-[30%] md:h-full min-h-0 flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl relative">
                  {/* Subtle decorative accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-3 md:p-4 overflow-hidden">
                    <div className="space-y-1.5 min-w-0">
                    {/* Event Title - compact, single line on desktop */}
                    <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-1 leading-tight tracking-tight">
                      {featuredEvent.event.title}
                    </h3>

                    {/* Event Meta - compact icons and text */}
                    <div className="space-y-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium truncate">
                          {featuredEvent.event.timezone
                            ? formatInTimeZone(featuredEvent.event.startDate, featuredEvent.event.timezone, 'EEE, MMM d, yyyy')
                            : new Date(featuredEvent.event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>

                      {/* Time */}
                      {featuredEvent.event.startTime && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">{featuredEvent.event.startTime}</span>
                        </div>
                      )}

                      {/* Location */}
                      {featuredEvent.event.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium truncate">{featuredEvent.event.location}</span>
                        </div>
                      )}
                    </div>
                    </div>

                    {/* Action Buttons - compact */}
                    <div className="relative z-10 pt-2 flex flex-wrap gap-2 flex-shrink-0">
                      <Link
                        href={`/events/${featuredEvent.event.id}`}
                        className="flex-1 min-w-0 flex-shrink-0 h-9 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                        title="View Event Details"
                        aria-label="View Event Details"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-green-200 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-green-700 truncate">View</span>
                      </Link>
                      {(() => {
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        const eventDate = featuredEvent.event.startDate ? new Date(featuredEvent.event.startDate) : null;
                        if (eventDate) eventDate.setHours(0, 0, 0, 0);
                        const isUpcoming = eventDate && eventDate >= currentDate;

                        if (!isUpcoming || !featuredEvent.event.startDate || !featuredEvent.event.startTime) return null;

                        const start = toGoogleCalendarDate(featuredEvent.event.startDate, featuredEvent.event.startTime);
                        const end = toGoogleCalendarDate(featuredEvent.event.endDate || featuredEvent.event.startDate, featuredEvent.event.endTime || featuredEvent.event.startTime);
                        const text = encodeURIComponent(featuredEvent.event.title);
                        const details = encodeURIComponent(featuredEvent.event.description || '');
                        const location = encodeURIComponent(featuredEvent.event.location || '');
                        const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;

                        return (
                          <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 h-9 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-3"
                            title="Add to Calendar"
                            aria-label="Add to Calendar"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-orange-200 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs font-semibold text-orange-700">Calendar</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedEventsSection;
