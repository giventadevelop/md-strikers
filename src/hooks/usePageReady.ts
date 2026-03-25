'use client';

import { useEffect, useState } from 'react';

/**
 * Becomes true after the first frames post-mount so network work can run after initial paint.
 */
export function usePageReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);
  return ready;
}

/**
 * Stays false until `delayMs` after the first animation frame, to stagger homepage fetches.
 */
export function useDeferredFetch(delayMs: number): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const rafId = requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) setEnabled(true);
      }, delayMs);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [delayMs]);
  return enabled;
}
