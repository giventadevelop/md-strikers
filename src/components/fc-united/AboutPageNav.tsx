'use client';

import { useEffect, useState, type MouseEvent } from 'react';

const ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'what-we-do', label: 'What we do' },
  { id: 'history', label: 'History' },
  { id: 'news', label: 'News' },
  { id: 'supporters', label: 'Supporters' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'gallery', label: 'Gallery' },
] as const;

export function AboutPageSubnav() {
  const [active, setActive] = useState<(typeof ITEMS)[number]['id']>('overview');
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.id;
        if (id && ITEMS.some((item) => item.id === id)) {
          setActive(id as (typeof ITEMS)[number]['id']);
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0.12, 0.35, 0.6] },
    );
    sections.forEach((section) => sectionObserver.observe(section));

    const reveals = document.querySelectorAll('.md-about-reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-in');
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );
    reveals.forEach((node) => revealObserver.observe(node));

    const onScroll = () => setStuck(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const root = document.documentElement;
    const previousScroll = root.style.scrollBehavior;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.style.scrollBehavior = 'smooth';
    }

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      root.style.scrollBehavior = previousScroll;
    };
  }, []);

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      className={`md-about-jump${stuck ? ' is-stuck' : ''}`}
      aria-label="Jump to section on this page"
    >
      <ul>
        {ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`md-about-jump__link${active === item.id ? ' is-active' : ''}`}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(event) => jump(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Counts up to the founding year already stated in the club history. */
export function AboutFoundedYear({ year = 2009 }: { year?: number }) {
  const [value, setValue] = useState(year);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(year);
      return;
    }
    const from = year - 19;
    let start: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / 900);
      setValue(Math.round(from + (year - from) * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [year]);

  return <span>{value}</span>;
}
