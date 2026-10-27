'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { EventMediaSlideshow } from './EventMediaSlideshow';
import type { GalleryEventWithMedia } from '../ApiServerActions';

interface GalleryEventCardProps {
  eventWithMedia: GalleryEventWithMedia;
  cardIndex?: number;
}

export function GalleryEventCard({ eventWithMedia, cardIndex = -1 }: GalleryEventCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { event, media, totalMediaCount } = eventWithMedia;
  const customFirstCardThumbnail = '/images/md_strikers_media/gallery_Thumbnail/Capital-Cup-2026.jpg';

  // Get preview images (first 4 media items)
  const previewMedia = media.slice(0, 4);
  const remainingCount = Math.max(0, totalMediaCount - 4);

  // Get hero image (prefer homepage hero, then regular hero, then first available)
  const heroImage = media.find(m => m.isHomePageHeroImage) ||
                   media.find(m => m.isHeroImage) ||
                   media.find(m => m.fileUrl);

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType.startsWith('video/')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  // Generate a colorful background based on event ID for consistency
  const getCardBackground = (eventId: number) => {
    const colors = ['bg-white'];
    return colors[eventId % colors.length];
  };

  return (
    <>
      <div className={`${getCardBackground(event.id!)} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/50 flex flex-col`}>
        {/* Hero Image - Clickable to open slideshow */}
        <div 
          className={`relative bg-pitch-charcoal/10 ${media.length > 0 ? 'cursor-pointer hover:opacity-90 transition-opacity duration-200' : ''}`}
          onClick={() => {
            if (media.length > 0) {
              console.log('Banner image clicked for event:', event.title, 'Media count:', media.length);
              setShowSlideshow(true);
            }
          }}
          role={media.length > 0 ? 'button' : undefined}
          tabIndex={media.length > 0 ? 0 : undefined}
          onKeyDown={(e) => {
            if (media.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              console.log('Banner image activated via keyboard for event:', event.title, 'Media count:', media.length);
              setShowSlideshow(true);
            }
          }}
          aria-label={media.length > 0 ? 'View Gallery' : undefined}
          title={media.length > 0 ? 'Click to view gallery' : undefined}
        >
          {heroImage?.fileUrl ? (
            <Image
              src={cardIndex === 0 ? customFirstCardThumbnail : heroImage.fileUrl}
              alt={heroImage.altText || event.title}
              width={800}
              height={600}
              className="block h-auto w-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-pitch-chalk">
              <div className="text-center text-pitch-charcoal/40">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}

          {/* Media count badge */}
          {totalMediaCount > 0 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-medium">
              {totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="font-semibold text-pitch-charcoal text-lg mb-2 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {event.title}
          </h3>

          <div className="flex items-center text-sm text-pitch-charcoal/70 mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(event.startDate)}
          </div>

          {event.caption && (
            <p className="text-sm text-pitch-charcoal/70 mb-3 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical'
            }}>
              {event.caption}
            </p>
          )}

          {/* Preview thumbnails */}
          {previewMedia.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-4 gap-1 h-16">
                {previewMedia.map((mediaItem, index) => (
                  <div key={mediaItem.id} className="relative bg-pitch-chalk rounded overflow-hidden">
                    {mediaItem.fileUrl ? (
                      <Image
                        src={mediaItem.fileUrl}
                        alt={mediaItem.altText || mediaItem.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-pitch-charcoal/40">
                        {getMediaTypeIcon(mediaItem.eventMediaType)}
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-pitch-forest text-white">
                      {getMediaTypeIcon(mediaItem.eventMediaType)}
                    </div>
                  </div>
                ))}

                {/* Show remaining count */}
                {remainingCount > 0 && (
                  <div className="flex items-center justify-center bg-pitch-chalk rounded text-xs font-medium text-pitch-charcoal/70">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Spacer to push buttons down */}
          <div className="flex-grow"></div>
        </div>

        {/* Action buttons - Per admin_action_buttons_styling.mdc */}
        <div className="flex space-x-3 p-6 pt-0 mt-auto">
            {/* View Gallery Button - Standard admin action button pattern */}
            <button
              onClick={() => {
                console.log('View Gallery clicked for event:', event.title, 'Media count:', media.length);
                setShowSlideshow(true);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pitch-forest px-7 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-in-out hover:bg-pitch-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
              title="View Gallery"
              aria-label="View Gallery"
              disabled={media.length === 0}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Gallery
            </button>

            {/* Event Details Button - Standard admin action button pattern */}
            <Link
              href={`/events/${event.id}`}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-pitch-olive/15 hover:bg-pitch-olive/25 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              title="Event Details"
              aria-label="Event Details"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pitch-olive/25 flex items-center justify-center">
                {/* External Link Icon - Inline SVG per admin_action_buttons_styling.mdc */}
                <svg className="w-6 h-6 text-pitch-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <span className="font-semibold text-pitch-olive">Event Details</span>
            </Link>
          </div>
      </div>

      {/* Slideshow Modal */}
      {showSlideshow && (
        <EventMediaSlideshow
          event={event}
          media={media}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}
