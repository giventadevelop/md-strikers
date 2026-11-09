'use client';

import { useEffect } from 'react';

/**
 * Makes the `.md-sport-bg` icon layer lean gently toward the pointer by setting
 * `--md-px` / `--md-py` (−1…1) on <html>. Mouse/pen only; off for reduced motion.
 */
export function useSportsParallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const root = document.documentElement;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty('--md-px', ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        root.style.setProperty('--md-py', ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty('--md-px');
      root.style.removeProperty('--md-py');
    };
  }, []);
}

const CARD_VARS = ['--rx', '--ry', '--mx', '--my'];

/**
 * Tilt + spotlight for every `.md-live-card` on the page (server-rendered ones included):
 * one delegated pointer listener sets --rx/--ry/--mx/--my on the hovered card.
 * `.md-live-card--soft` tilts a little less. Mouse/pen only.
 */
export function useLiveCards() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement) => CARD_VARS.forEach((name) => el.style.removeProperty(name));

    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.md-live-card') ?? null;
      if (current && current !== card) reset(current);
      current = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      const k = card.classList.contains('md-live-card--soft') ? 0.6 : 1;
      card.style.setProperty('--rx', `${((0.5 - y) * 16 * k).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((x - 0.5) * 22 * k).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    };
    const onLeaveWindow = () => {
      if (current) reset(current);
      current = null;
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
      if (current) reset(current);
    };
  }, []);
}
