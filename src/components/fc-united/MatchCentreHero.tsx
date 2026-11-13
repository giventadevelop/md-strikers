'use client';

import { useRef, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { pitchPageInset } from './pitchUi';

const HERO_IMAGE = '/images/hero_section/stadium-night.jpg';

type Props = {
  total: number;
  upcoming: number;
  completed: number;
  teams: number;
};

export function MatchCentreHero({ total, upcoming, completed, teams }: Props) {
  const shade = useRef<HTMLDivElement>(null);

  const move = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !shade.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    shade.current.style.setProperty('--sx', `${event.clientX - box.left}px`);
    shade.current.style.setProperty('--sy', `${event.clientY - box.top}px`);
  };

  const stats = [
    { label: 'Total matches', value: total },
    { label: 'Upcoming', value: upcoming },
    { label: 'Completed', value: completed },
    ...(teams > 0 ? [{ label: 'Teams', value: teams }] : []),
  ];

  return (
    <section className="md-match-hero md-sport-bg" aria-label="Matches" onPointerMove={move}>
      <div className="md-match-hero__media" aria-hidden>
        <Image src={HERO_IMAGE} alt="" fill priority className="object-cover object-[center_40%]" sizes="100vw" />
      </div>
      <div ref={shade} className="md-match-hero__shade" aria-hidden />
      <div className={`${pitchPageInset} md-match-hero__content`}>
        <nav className="md-match-crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <span>Matches</span>
        </nav>
        <p className="md-match-kicker">Match centre</p>
        <h1>Match Centre</h1>
        <span className="md-match-rule" aria-hidden />
        <p>Every Match. Every Moment. Every Victory.</p>
        <ul className="md-match-stats">
          {stats.map((stat) => (
            <li key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
