'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { stepLoop } from './loopCarousel';
import { pitchFocus } from './pitchUi';

export type EventNewsCard = {
  key: string;
  title: string;
  src: string;
  details: string;
  href: string;
};

/** Remaining upcoming events. Advances one card every 2 seconds and loops. */
export function EventNewsCarousel({ events }: { events: EventNewsCard[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const slides = events.length > 1 ? [...events, ...events] : events;

  const scrollStep = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    stepLoop(el, dir, events.length);
  }, [events.length]);

  useEffect(() => {
    if (events.length < 2) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      stepLoop(el, 1, events.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <div
      className="md-event-news-wrap"
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
    >
      {events.length > 1 ? (
        <div className="md-event-news-nav">
          <button type="button" aria-label="Previous events" title="Previous" onClick={() => scrollStep(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" aria-label="Next events" title="Next" onClick={() => scrollStep(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : null}
    <ul
      ref={scrollerRef}
      className="md-event-news"
    >
      {slides.map((event, index) => (
        <li key={`${event.key}-${index}`} data-carousel-card>
          <Link href={event.href} className={cn('md-event-news-card', pitchFocus)}>
            <span className="md-event-news-card__media">
              <Image
                src={event.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:639px) 82vw, (max-width:1023px) 50vw, 25vw"
              />
            </span>
            <span className="md-event-news-card__copy">
              <span className="md-event-news-card__shift">
                <h3 className="md-event-news-card__title">{event.title}</h3>
                {event.details ? <p className="md-event-news-card__details">{event.details}</p> : null}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
    </div>
  );
}
