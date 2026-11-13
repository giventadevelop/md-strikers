'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcPublicShell } from './fcUnitedFonts';
import { pitchPageInset } from './pitchUi';
import { encodePublicPath } from './fcUnitedGalleryData';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import type { PublicPlayerDetail } from './ApiServerActions';
import type { SportProfileView } from './playerSportProfiles';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(pitchPageInset, className)}>{children}</div>;
}

function formatCount(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function resultLabel(result: string): string {
  if (result === 'WIN') return 'Win';
  if (result === 'LOSS') return 'Loss';
  if (result === 'DRAW') return 'Draw';
  return result || 'Played';
}

function resultTone(result: string): 'win' | 'loss' | 'draw' {
  if (result === 'WIN') return 'win';
  if (result === 'LOSS') return 'loss';
  return 'draw';
}

function parseFigure(display: string): { value: number; digits: number; suffix: string } | null {
  const match = display.trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const digits = match[1].includes('.') ? match[1].split('.')[1].length : 0;
  return { value: Number(match[1]), digits, suffix: match[2] };
}

function CountUp({ display }: { display: string }) {
  const figure = parseFigure(display);
  const [shown, setShown] = useState(figure && figure.value > 20 ? 0 : (figure?.value ?? 0));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const parsed = parseFigure(display);
    if (!parsed) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || parsed.value <= 20) {
      setShown(parsed.value);
      return;
    }
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 900);
          const eased = 1 - (1 - progress) ** 3;
          setShown(parsed.value * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [display]);

  if (!figure) return <span>{display}</span>;
  const text = figure.digits
    ? shown.toFixed(figure.digits)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(shown));
  return (
    <span ref={ref}>
      {text}
      {figure.suffix}
    </span>
  );
}

function SportIcon({ id }: { id: string }) {
  const props = {
    className: 'md-athlete-sport__icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    'aria-hidden': true as const,
  };
  if (id === 'football') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4.2l2.2 3.2H9.8L12 4.2zM8.2 9.2L6.4 14h3.2l-1.4-4.8zM15.8 9.2L17.6 14h-3.2l1.4-4.8zM9.2 16.2L12 19.6l2.8-3.4H9.2z" />
      </svg>
    );
  }
  if (id === 'cricket') {
    return (
      <svg {...props}>
        <path d="M7 3.5l2.2 1.2-4.6 14.2-2.2-1.2L7 3.5z" />
        <circle cx="16.5" cy="16.5" r="3.2" />
      </svg>
    );
  }
  if (id === 'basketball') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M4.2 12h15.6M12 4.2c2.4 2.6 2.4 12.8 0 15.6M12 4.2c-2.4 2.6-2.4 12.8 0 15.6" />
      </svg>
    );
  }
  if (id === 'badminton') {
    return (
      <svg {...props}>
        <path d="M14 4l6 6-7.2 7.2-2.4-2.4L14 4z" />
        <path d="M8.2 13.4L4.6 19.4M10.4 15.6l-2.2 3.6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RadarChart({
  jersey,
  axes,
}: {
  jersey: string;
  axes: { label: string; value: number; display: string }[];
}) {
  const cx = 150;
  const cy = 132;
  const radius = 78;
  const count = axes.length || 1;
  const point = (index: number, amount: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return [cx + Math.cos(angle) * radius * amount, cy + Math.sin(angle) * radius * amount];
  };
  const ring = (amount: number) => axes.map((_, index) => point(index, amount).join(',')).join(' ');
  const shape = axes.map((axis, index) => point(index, Math.max(0.12, axis.value / 100)).join(',')).join(' ');

  return (
    <svg viewBox="0 0 300 280" className="md-athlete-radar" role="img" aria-label="Season form chart">
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#164c83" fillOpacity="0.16" fontSize="92" fontWeight="700">
        {jersey || '—'}
      </text>
      {[0.35, 0.6, 0.85, 1].map((amount) => (
        <polygon key={amount} points={ring(amount)} fill="none" stroke="#164c83" strokeOpacity="0.22" />
      ))}
      {axes.map((_, index) => {
        const [x, y] = point(index, 1);
        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke="#164c83" strokeOpacity="0.18" />;
      })}
      <polygon points={shape} fill="rgba(22,76,131,0.16)" stroke="#f5b82e" strokeWidth="2.4" />
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1.28);
        return (
          <text key={axis.label} x={x} y={y} textAnchor="middle" fill="#071b35" fontSize="11" fontWeight="700">
            <tspan x={x} dy="-0.2em">
              {axis.label}
            </tspan>
            <tspan x={x} dy="1.25em" fill="#164c83">
              {axis.display}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function statCards(sport: SportProfileView) {
  const cards: { label: string; display: string }[] = [];
  if (sport.wins != null) cards.push({ label: 'Wins', display: formatCount(sport.wins) });
  if (sport.losses != null) cards.push({ label: 'Losses', display: formatCount(sport.losses) });
  if (sport.winRateLabel && sport.winRateLabel !== '—') cards.push({ label: 'Winning %', display: sport.winRateLabel });
  if (sport.matches.length > 0) cards.push({ label: 'Matches', display: String(sport.matches.length) });
  for (const axis of sport.axes) {
    if (axis.display && axis.display !== '—') cards.push({ label: axis.label, display: axis.display });
  }
  return cards;
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  const text = value?.trim();
  if (!text) return null;
  return (
    <div className="md-athlete-fact">
      <dt>{label}</dt>
      <dd>{text}</dd>
    </div>
  );
}

export default function FcUnitedPlayerPage({ player }: { player: PublicPlayerDetail }) {
  const [sportId, setSportId] = useState(player.sports[0]?.id ?? 'football');
  const sport = player.sports.find((item) => item.id === sportId) ?? player.sports[0];
  const nameParts = player.fullName.trim().split(/\s+/);
  const firstLine = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : player.fullName;
  const lastLine = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const club = player.clubName || 'Maryland Strikers';
  const clubShort = club.split(' - ')[0] || club;
  const jersey = sport?.jersey || player.jersey;
  const honours = player.achievementGroups.flatMap((group) => group.items).slice(0, 3);
  const cards = sport ? statCards(sport) : [];
  const chartAxes = (sport?.axes ?? []).filter((axis) => axis.display && axis.display !== '—' && axis.value > 0);
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'details', label: 'Player Details' },
    { id: 'matches', label: 'Match History' },
    ...(player.achievementGroups.length > 0 ? [{ id: 'honours', label: 'Achievements' }] : []),
  ];

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="team" />
      <main className="md-athlete">
        <section className="md-athlete-hero" aria-label={player.fullName}>
          <Shell>
            <nav className="md-athlete-crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/team">Team</Link>
              <span aria-hidden>/</span>
              <span>{player.name}</span>
            </nav>
            <div className="md-athlete-hero__grid">
              <div className="md-athlete-hero__copy">
                <p className="md-athlete-kicker">Player profile</p>
                <div className="md-athlete-hero__name">
                  <h1>
                    <span>{firstLine}</span>
                    {lastLine ? <span>{lastLine}</span> : null}
                  </h1>
                  {jersey ? <p className="md-athlete-hero__jersey">{jersey}</p> : null}
                </div>
                <p className="md-athlete-hero__club">{club}</p>
                <ul className="md-athlete-badges">
                  {sport?.label ? <li>{sport.label}</li> : null}
                  {sport?.positionLine ? <li>{sport.positionLine}</li> : null}
                  {player.nationality ? <li>{player.nationality}</li> : null}
                  {sport?.seasonLabel ? <li>{sport.seasonLabel}</li> : null}
                </ul>
                <Link href="/team" className="md-athlete-back">
                  Back to roster
                </Link>
                {honours.length > 0 ? (
                  <ul className="md-athlete-honour-strip">
                    {honours.map((item) => (
                      <li key={item.id}>
                        <a href="#honours">{item.title}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="md-athlete-hero__photo">
                <span className="md-athlete-hero__spot" aria-hidden />
                {player.imageUrl ? (
                  <Image
                    src={encodePublicPath(player.imageUrl)}
                    alt={player.fullName}
                    width={720}
                    height={900}
                    className="md-athlete-hero__img"
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    priority
                  />
                ) : (
                  <div className="md-athlete-hero__fallback" aria-hidden>
                    {player.fullName.slice(0, 1)}
                  </div>
                )}
              </div>
            </div>
          </Shell>
        </section>

        <nav className="md-athlete-dock" aria-label="Player sections">
          <Shell className="md-athlete-dock__inner">
            <div className="md-athlete-sports" role="group" aria-label="Sport">
              {player.sports.map((item) => {
                const active = item.id === sport?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn('md-athlete-sport', active && 'is-active')}
                    onClick={() => setSportId(item.id)}
                    aria-pressed={active}
                  >
                    <SportIcon id={item.id} />
                    {item.label}
                  </button>
                );
              })}
              <label className="md-athlete-sport-select">
                <span>Sport</span>
                <select
                  value={sport?.id ?? 'football'}
                  onChange={(event) => setSportId(event.target.value as typeof sportId)}
                  aria-label="Sport category"
                >
                  {player.sports.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="md-athlete-jumps">
              {sections.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </Shell>
        </nav>

        <section id="overview" className="md-athlete-band">
          <Shell>
            <p className="md-athlete-kicker md-athlete-kicker--ink">Performance</p>
            <h2>Season overview</h2>
            {cards.length > 0 ? (
              <div className="md-athlete-stats">
                {cards.map((card) => (
                  <article key={card.label} className="md-athlete-stat">
                    <p>{card.label}</p>
                    <strong>
                      <CountUp display={card.display} />
                    </strong>
                  </article>
                ))}
              </div>
            ) : (
              <p className="md-athlete-empty">{sport?.seasonLine || 'No performance record for this sport yet.'}</p>
            )}
          </Shell>
        </section>

        <section id="statistics" className="md-athlete-band md-athlete-band--grey">
          <Shell>
            <p className="md-athlete-kicker md-athlete-kicker--ink">Record</p>
            <h2>Season and career</h2>
            <div className="md-athlete-split">
              <article className="md-athlete-panel">
                <h3>Current season</h3>
                {sport?.seasonLabel ? <p className="md-athlete-panel__meta">{sport.seasonLabel}</p> : null}
                <p>{sport?.seasonLine || 'No season record yet.'}</p>
                {chartAxes.length > 0 ? (
                  <ul className="md-athlete-bars">
                    {chartAxes.map((axis) => (
                      <li key={axis.label}>
                        <span>{axis.label}</span>
                        <span className="md-athlete-bars__track">
                          <span style={{ width: `${Math.max(8, Math.min(100, axis.value))}%` }} />
                        </span>
                        <strong>{axis.display}</strong>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
              <article className="md-athlete-panel">
                <h3>Career</h3>
                <p>{sport?.careerLine || 'No career totals for this sport yet.'}</p>
                {chartAxes.length > 2 ? <RadarChart jersey={jersey} axes={chartAxes} /> : null}
              </article>
            </div>
          </Shell>
        </section>

        <section id="details" className="md-athlete-band">
          <Shell>
            <p className="md-athlete-kicker md-athlete-kicker--ink">Profile</p>
            <h2>Player details</h2>
            <div className="md-athlete-split">
              <article className="md-athlete-panel">
                <h3>Personal</h3>
                <dl className="md-athlete-facts">
                  <Fact label="Age" value={player.ageLabel} />
                  <Fact label="Country" value={player.nationality} />
                  <Fact label="Date of birth" value={player.dateOfBirth} />
                  <Fact label="Languages" value={player.spokenLanguages} />
                  <Fact label="Jersey" value={jersey} />
                  <Fact label="Preferred name" value={player.preferredName !== firstLine ? player.preferredName : ''} />
                  <Fact label="Joined" value={player.joinDate} />
                </dl>
                {sport?.personal ? <p className="md-athlete-note">{sport.personal}</p> : null}
              </article>
              <article className="md-athlete-panel">
                <h3>Playing profile</h3>
                <dl className="md-athlete-facts">
                  <Fact label="Height" value={player.heightLabel} />
                  <Fact label="Weight" value={player.weightLabel} />
                  <Fact label="Position" value={sport?.positionLine || player.position} />
                  <Fact label="Role" value={player.role} />
                  <Fact label="Foot" value={player.preferredFoot} />
                  <Fact label="Build" value={player.bodyBuild} />
                  <Fact label="Team" value={sport?.team || player.leagueDivision} />
                  <Fact label="Coach" value={player.coachName} />
                </dl>
                {sport?.physical ? <p className="md-athlete-note">{sport.physical}</p> : null}
                {player.coachEmail || player.coachPhone ? (
                  <p className="md-athlete-note">
                    {player.coachEmail ? <a href={`mailto:${player.coachEmail}`}>{player.coachEmail}</a> : null}
                    {player.coachEmail && player.coachPhone ? ' · ' : null}
                    {player.coachPhone ? <a href={`tel:${player.coachPhone}`}>{player.coachPhone}</a> : null}
                  </p>
                ) : null}
              </article>
            </div>
            <div className="md-athlete-split md-athlete-split--next">
              <article className="md-athlete-panel">
                <h3>Academics and contact</h3>
                <dl className="md-athlete-facts">
                  <Fact label="GPA" value={player.gpaLabel} />
                  <Fact label="Academics" value={player.academicScore} />
                </dl>
                {sport?.academics ? <p className="md-athlete-note">{sport.academics}</p> : null}
                {player.links.length > 0 ? (
                  <ul className="md-athlete-links">
                    {player.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
              <article className="md-athlete-panel">
                <h3>Background</h3>
                {player.bio ? <p>{player.bio}</p> : <p>No biography listed.</p>}
                {(sport?.skills.length ?? 0) > 0 ? (
                  <ul className="md-athlete-skills">
                    {sport?.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </div>
          </Shell>
        </section>

        <section id="matches" className="md-athlete-band md-athlete-band--grey">
          <Shell>
            <p className="md-athlete-kicker md-athlete-kicker--ink">Results</p>
            <h2>Match history</h2>
            {(sport?.matches.length ?? 0) === 0 ? (
              <p className="md-athlete-empty">{sport?.available === false ? sport.seasonLine : 'No match log yet'}</p>
            ) : (
              <div className="md-athlete-matches">
                {sport?.matches.map((match) => {
                  const ours = match.home ? match.homeScore : match.awayScore;
                  const theirs = match.home ? match.awayScore : match.homeScore;
                  return (
                    <article
                      key={`${match.dateLabel}-${match.opponent}-${match.kickoff}`}
                      className={cn('md-athlete-match', `is-${resultTone(match.result)}`)}
                    >
                      <div>
                        <p className="md-athlete-match__date">
                          {match.dateLabel}
                          {match.kickoff ? ` · ${match.kickoff}` : ''}
                        </p>
                        <p className="md-athlete-match__teams">
                          <span>{clubShort}</span>
                          <span>vs</span>
                          <span>{match.opponent}</span>
                        </p>
                      </div>
                      <p className="md-athlete-match__score">
                        {ours} – {theirs}
                      </p>
                      <div className="md-athlete-match__meta">
                        <span className={cn('md-athlete-result', `is-${resultTone(match.result)}`)}>{resultLabel(match.result)}</span>
                        <span className="md-athlete-venue">{match.home ? 'Home' : 'Away'}</span>
                      </div>
                      <ul className="md-athlete-match__cells">
                        {match.cells.map((cell, index) => (
                          <li key={`${match.opponent}-${sport.tableHeaders[index]}`}>
                            <span>{sport.tableHeaders[index]}</span>
                            <strong>{cell}</strong>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            )}
          </Shell>
        </section>

        {player.achievementGroups.length > 0 ? (
          <section id="honours" className="md-athlete-band">
            <Shell>
              <p className="md-athlete-kicker md-athlete-kicker--ink">Honours</p>
              <h2>Achievements</h2>
              <div className="md-athlete-honour-groups">
                {player.achievementGroups.map((group) => (
                  <section key={group.heading}>
                    <h3>{group.heading}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.id} className="md-athlete-honour">
                          <span className="md-athlete-honour__icon" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                              <circle cx="12" cy="9" r="5" />
                              <path d="M8.5 13.5L7 21l5-2.4L17 21l-1.5-7.5" />
                            </svg>
                          </span>
                          <p className="md-athlete-honour__meta">
                            {[item.categoryLabel, item.achievementDate].filter(Boolean).join(' · ')}
                          </p>
                          <h4>{item.title}</h4>
                          {item.description ? <p>{item.description}</p> : null}
                          {item.issuer ? <p className="md-athlete-honour__by">Given by {item.issuer}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </Shell>
          </section>
        ) : null}

        <section className="md-athlete-sponsors" aria-label="Sponsors">
          <Shell>
            <div className="md-athlete-sponsors__row">
              {fcSponsors.map((src) => (
                <div key={src} className="relative h-12 w-28 md:h-14 md:w-32">
                  <Image src={src} alt="" fill className="object-contain opacity-90" sizes="128px" />
                </div>
              ))}
            </div>
          </Shell>
        </section>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
