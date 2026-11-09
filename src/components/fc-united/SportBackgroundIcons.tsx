'use client';

import type { PointerEvent, ReactNode } from 'react';

/**
 * Sports outlines on `.md-sport-bg`. Each icon travels in its own circle.
 * Hovering one nudges it away from the pointer for a second, then it
 * returns to the circle. Decorative: the layer ignores the pointer, and
 * each icon accepts it only where page content does not sit on top.
 */

type Drift = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

const ORBITS: Record<Drift, { name: string; duration: string; delay: string; direction: 'normal' | 'reverse' }> = {
  a: { name: 'md-sport-icon-circle-a', duration: '9s', delay: '0s', direction: 'normal' },
  b: { name: 'md-sport-icon-circle-b', duration: '7.5s', delay: '-1s', direction: 'normal' },
  c: { name: 'md-sport-icon-circle-c', duration: '11s', delay: '-2s', direction: 'normal' },
  d: { name: 'md-sport-icon-circle-a', duration: '8s', delay: '-2.4s', direction: 'reverse' },
  e: { name: 'md-sport-icon-circle-b', duration: '10s', delay: '-1.2s', direction: 'reverse' },
  f: { name: 'md-sport-icon-circle-c', duration: '6.5s', delay: '-3s', direction: 'normal' },
};

type IconSpec = {
  name: string;
  x: string;
  y: string;
  size: number;
  drift: Drift;
  glyph: ReactNode;
};

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS: IconSpec[] = [
  {
    name: 'Football',
    x: '92%',
    y: '10%',
    size: 120,
    drift: 'a',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="32" cy="32" r="29" />
        <path d="M32 18l11 8-4 13H25l-4-13z" />
        <path d="M32 18V4M43 26l14-5M39 39l9 12M25 39l-9 12M21 26L7 21" />
      </svg>
    ),
  },
  {
    name: 'Trophy',
    x: '6%',
    y: '20%',
    size: 72,
    drift: 'b',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M20 10h24v10a12 12 0 01-24 0z" />
        <path d="M20 14h-8v4a9 9 0 009 9M44 14h8v4a9 9 0 01-9 9M32 32v10M22 54h20M25 42h14v12H25z" />
      </svg>
    ),
  },
  {
    name: 'Whistle',
    x: '80%',
    y: '86%',
    size: 60,
    drift: 'c',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="22" cy="38" r="14" />
        <path d="M30 27l26-9v12l-22 6" />
        <circle cx="22" cy="38" r="4" />
      </svg>
    ),
  },
  {
    name: 'Goal',
    x: '16%',
    y: '90%',
    size: 112,
    drift: 'd',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M6 50V14h52v36" />
        <path d="M6 14l8 8h36l8-8M14 22v28M50 22v28M24 22v28M32 22v28M40 22v28M14 32h36M14 41h36" />
      </svg>
    ),
  },
  {
    name: 'Boot',
    x: '50%',
    y: '6%',
    size: 68,
    drift: 'e',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M12 10h14v16l20 9a8 8 0 016 8v3H12z" />
        <path d="M12 46h40M18 52v-6M28 52v-6M38 52v-6M48 52v-6" />
      </svg>
    ),
  },
  {
    name: 'Star',
    x: '34%',
    y: '42%',
    size: 34,
    drift: 'f',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M32 6l7.6 16 17.4 2.2-12.8 12 3.4 17.3L32 45l-15.6 8.5 3.4-17.3L7 24.2 24.4 22z" />
      </svg>
    ),
  },
  {
    name: 'Medal',
    x: '66%',
    y: '52%',
    size: 54,
    drift: 'a',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="32" cy="40" r="14" />
        <path d="M22 6l10 20 10-20M26 40l4 4 8-8" />
      </svg>
    ),
  },
  {
    name: 'Player',
    x: '4%',
    y: '48%',
    size: 92,
    drift: 'b',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="22" cy="10" r="5" />
        <path d="M22 15v15" />
        <path d="M22 22L10 28M22 22l12 3" />
        <path d="M22 30L10 48" />
        <path d="M22 30l16 8 12-8" />
        <circle cx="54" cy="26" r="5" />
      </svg>
    ),
  },
  {
    name: 'Jersey',
    x: '28%',
    y: '14%',
    size: 64,
    drift: 'c',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M22 18h7l3-7 3 7h7l8 8-6 5v24H20V31l-6-5z" />
        <path d="M28 18l4 8 4-8" />
        <path d="M26 36l6 6 6-6" />
      </svg>
    ),
  },
  {
    name: 'Match ball',
    x: '84%',
    y: '36%',
    size: 48,
    drift: 'd',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="32" cy="32" r="29" />
        <path d="M32 18l11 8-4 13H25l-4-13z" />
        <path d="M32 18V4M43 26l14-5M39 39l9 12M25 39l-9 12M21 26L7 21" />
      </svg>
    ),
  },
  {
    name: 'Corner flag',
    x: '60%',
    y: '78%',
    size: 56,
    drift: 'e',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M16 58V8" />
        <path d="M16 8h32l-8 9 8 9H16" />
      </svg>
    ),
  },
  {
    name: 'Stopwatch',
    x: '42%',
    y: '88%',
    size: 50,
    drift: 'f',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <circle cx="32" cy="38" r="16" />
        <path d="M27 18h10v5H27z" />
        <path d="M32 18V11M25 11h14" />
        <path d="M32 38V27M32 38l8 6" />
      </svg>
    ),
  },
  {
    name: 'Cone',
    x: '96%',
    y: '58%',
    size: 44,
    drift: 'a',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M32 8L52 56H12z" />
        <path d="M20 40h24M25 28h14" />
      </svg>
    ),
  },
  {
    name: 'Glove',
    x: '18%',
    y: '34%',
    size: 52,
    drift: 'b',
    glyph: (
      <svg viewBox="0 0 64 64" {...stroke}>
        <path d="M16 38c0-10 5-16 9-16 2 0 3 4 4 7 1-6 4-9 7-9s5 4 6 9c1-5 3-7 6-7 4 0 6 6 6 14 0 14-7 24-16 26-11 2-22-6-22-24z" />
        <path d="M25 30v12M33 27v14M41 30v12" />
      </svg>
    ),
  },
];

/** Push the icon away from the pointer, then let it fall back into its circle. */
function dodgeFromPointer(event: PointerEvent<HTMLSpanElement>) {
  const dodge = event.currentTarget.querySelector<HTMLElement>('.md-sport-icon-dodge');
  if (!dodge || dodge.getAnimations().length > 0) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - event.clientX;
  const dy = rect.top + rect.height / 2 - event.clientY;
  const len = Math.hypot(dx, dy);
  const distance = 48;
  const ox = len < 1 ? 0 : (dx / len) * distance;
  const oy = len < 1 ? -distance : (dy / len) * distance;

  dodge.animate(
    [
      { transform: 'translate(0px, 0px)' },
      { transform: `translate(${ox}px, ${oy}px)`, offset: 0.35 },
      { transform: 'translate(0px, 0px)' },
    ],
    { duration: 1000, easing: 'ease-out', fill: 'none' },
  );
}

export function SportBackgroundIcons() {
  return (
    <div className="md-sport-icons" aria-hidden="true">
      {ICONS.map((icon) => (
        <span
          key={icon.name}
          className="md-sport-icon"
          title={icon.name}
          onPointerEnter={dodgeFromPointer}
          style={{
            ['--md-icon-x' as string]: icon.x,
            ['--md-icon-y' as string]: icon.y,
            ['--md-icon-size' as string]: `${icon.size}px`,
          }}
        >
          <span
            className="md-sport-icon-motion"
            style={{
              animationName: ORBITS[icon.drift].name,
              animationDuration: ORBITS[icon.drift].duration,
              animationTimingFunction: 'linear',
              animationDelay: ORBITS[icon.drift].delay,
              animationIterationCount: 'infinite',
              animationDirection: ORBITS[icon.drift].direction,
            }}
          >
            <span className="md-sport-icon-dodge">{icon.glyph}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
