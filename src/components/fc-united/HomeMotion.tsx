'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Fades homepage sections in once as they enter the viewport. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>('main > section:not(.md-hero-stage)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('md-reveal-on');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((node) => {
      node.classList.add('md-reveal');
      io.observe(node);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
