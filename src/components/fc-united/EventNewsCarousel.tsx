'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react';
import { cn } from '@/lib/utils';
import { pitchFocus } from './pitchUi';

export type EventNewsCard = {
  key: string;
  title: string;
  src: string;
  dateTime: string;
  venue: string;
  href: string;
  isTicketed: boolean;
};

const SLIDE_MS = 1250;

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

function EventCard({ event }: { event: EventNewsCard }) {
  return (
    <article className="md-event-news-card">
      <Link href={event.href} className={cn('md-event-news-card__main', pitchFocus)}>
        <span className="md-event-news-card__media">
          <Image
            src={event.src}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:1023px) 46vw, 34vw"
          />
        </span>
        <span className="md-event-news-card__copy">
          {event.dateTime ? <p className="md-event-news-card__when">{event.dateTime}</p> : null}
          <h3 className="md-event-news-card__title">{event.title}</h3>
          {event.venue ? <p className="md-event-news-card__venue">{event.venue}</p> : null}
          <span className="md-event-news-card__more">
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
            Event details
          </span>
        </span>
      </Link>
      {event.isTicketed ? (
        <Link href={event.href} className={cn('md-event-news-card__tickets', pitchFocus)}>
          Tickets
        </Link>
      ) : null}
    </article>
  );
}

/** Three upcoming events, fully visible. The row glides one place every 3 seconds. */
export function EventNewsCarousel({ events }: { events: EventNewsCard[] }) {
  const pausedRef = useRef(false);
  const busyRef = useRef(false);
  const [active, setActive] = useState(() => (events.length > 2 ? 1 : 0));
  const [phase, setPhase] = useState<'rest' | 'prep' | 'run'>('rest');
  const [dir, setDir] = useState<-1 | 1>(1);

  const go = useCallback((nextDir: -1 | 1) => {
    if (events.length < 3 || busyRef.current) return;
    busyRef.current = true;
    setDir(nextDir);
    setPhase('prep');
  }, [events.length]);

  useEffect(() => {
    if (phase !== 'prep') return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase('run'));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [phase]);

  useEffect(() => {
    if (events.length < 3) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      go(1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [events.length, go]);

  const finish = useCallback((event?: TransitionEvent<HTMLUListElement>) => {
    if (event && (event.target !== event.currentTarget || event.propertyName !== 'transform')) return;
    if (!busyRef.current) return;
    busyRef.current = false;
    setActive((current) => mod(current + dir, events.length));
    setPhase('rest');
  }, [dir, events.length]);

  useEffect(() => {
    if (phase !== 'run') return;
    const timer = window.setTimeout(() => finish(), SLIDE_MS + 80);
    return () => window.clearTimeout(timer);
  }, [phase, finish]);

  if (events.length === 0) return null;

  const loop = events.length >= 3;
  const sliding = loop && phase !== 'rest';
  const slots = sliding ? 4 : Math.min(3, events.length);
  const first = !loop ? 0 : sliding && dir === -1 ? active - 2 : active - 1;
  const cards = Array.from({ length: loop ? slots : events.length }, (_, slot) => {
    const index = loop ? mod(first + slot, events.length) : slot;
    return { event: events[index], key: loop ? first + slot : events[index].key, index };
  });
  const centerIndex = phase === 'run' ? mod(active + dir, events.length) : mod(active, events.length);
  const shift = phase === 'run' ? (dir === 1 ? 1 : 0) : phase === 'prep' && dir === -1 ? 1 : 0;

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
      {loop ? (
        <div className="md-event-news-nav">
          <button type="button" aria-label="Previous events" title="Previous" onClick={() => go(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" aria-label="Next events" title="Next" onClick={() => go(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : null}
      <div className="md-event-stage">
        <ul
          className={cn('md-event-news', loop && 'is-featured', phase === 'run' && 'is-running')}
          style={{
            '--event-slots': slots,
            transform: loop && slots > 1 ? `translateX(calc(${-shift} * 100% / ${slots}))` : undefined,
          } as CSSProperties}
          onTransitionEnd={finish}
        >
          {cards.map((card) => (
            <li key={card.key} className={cn(loop && card.index === centerIndex && 'is-center')}>
              <EventCard event={card.event} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
