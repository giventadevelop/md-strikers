import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  fcUnitedAboutNamslUrl,
  fcUnitedAboutP1,
  fcUnitedAboutP2BeforeNamslLink,
  fcUnitedAboutP3,
  fcUnitedAboutTitle,
  mdStrikersBecomeASponsorBody,
  mdStrikersBecomeASponsorHeading,
  mdStrikersHistoryBody,
  mdStrikersHistoryHeading,
  mdStrikersIndexTagline,
  mdStrikersLearnMoreHeading,
  mdStrikersMemorableMomentTiles,
  mdStrikersNewsHeading,
  mdStrikersNewsParagraphs,
  mdStrikersSupportersHeading,
  mdStrikersSupportersParagraphs,
  mdStrikersThankYouSponsorsLine,
  mdStrikersWhatWeDoBody,
  mdStrikersWhatWeDoHeading,
} from './fcUnitedAboutContent';
import { encodePublicPath } from './fcUnitedGalleryData';
import { fcPublicShell } from './fcUnitedFonts';
import { pitchPageInset } from './pitchUi';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcMemorableMomentsSection } from './FcMemorableMomentsSection';
import { FcUnitedHeader } from './FcUnitedHeader';
import { AboutFoundedYear, AboutPageSubnav } from './AboutPageNav';

const MD_STRIKERS_LOGO_ABOUT =
  '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png';
const ABOUT_HERO_IMAGE = '/images/hero_section/stadium-night.jpg';

const historyMarks = [
  { year: '2009', label: 'Founded' },
  { year: '', label: 'Established' },
  { year: '', label: 'Pick-up games' },
  { year: '', label: 'Seasonal leagues' },
  { year: '', label: 'Today' },
] as const;

function historySentences(body: string) {
  const marker = '\u0000';
  return body
    .replaceAll('D.C.', `D${marker}C${marker}`)
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.replaceAll(marker, '.').trim())
    .filter(Boolean);
}

const themeCards = [
  {
    title: 'Player Development',
    text: 'Offering quality training, development programs, and opportunities to compete at various levels.',
  },
  {
    title: 'Competitive Football',
    text: 'A supportive and competitive soccer environment for players of all ages and skill levels.',
  },
  {
    title: 'Teamwork & Sportsmanship',
    text: 'Fostering teamwork, sportsmanship, and personal growth, both on and off the field.',
  },
  {
    title: 'Community Engagement',
    text: 'Through community involvement and partnerships, we strive to inspire a lifelong love for the game while shaping future leaders.',
  },
] as const;

const valueCards = [
  {
    title: 'Community',
    text: 'MD Strikers is proud to be supported by a dedicated community of sponsors and partners who share our passion for recreational soccer.',
  },
  {
    title: 'Teamwork',
    text: 'Fostering a strong sense of camaraderie among its members.',
  },
  {
    title: 'Sportsmanship',
    text: 'Soccer fans and community members are invited to attend and support local talent, enjoying a day filled with exciting matches and sportsmanship.',
  },
  {
    title: 'Player Development',
    text: 'We focus on fostering teamwork, sportsmanship, and personal growth, both on and off the field.',
  },
  {
    title: 'Passion for Football',
    text: 'Develop your skills, compete with heart, enjoy the game.',
  },
  {
    title: 'Inclusivity',
    text: 'A fun, inclusive environment where the community could enjoy the game without the pressures of competitive leagues.',
  },
] as const;

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(pitchPageInset, className)}>{children}</div>;
}

function ThemeIcon({ name }: { name: string }) {
  const common = {
    className: 'md-about-icon__svg',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };
  if (name === 'Player Development') {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l2.2 4.6L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.6L12 3z" />
      </svg>
    );
  }
  if (name === 'Competitive Football' || name === 'Passion for Football') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" />
      </svg>
    );
  }
  if (name === 'Teamwork & Sportsmanship' || name === 'Teamwork' || name === 'Sportsmanship') {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14a3 3 0 100-6 3 3 0 000 6zM16 14a3 3 0 100-6 3 3 0 000 6zM8.5 13.5l7 0M6 18c.6-1.6 2-2.5 4-2.5M14 15.5c2 0 3.4.9 4 2.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10l8-6 8 6v8a1 1 0 01-1 1h-5v-5H10v5H5a1 1 0 01-1-1v-8z" />
    </svg>
  );
}

export default function FcUnitedAboutPage() {
  const historySteps = historySentences(mdStrikersHistoryBody);
  const clubPhoto = mdStrikersMemorableMomentTiles[0];
  const [featuredNews, ...supportingNews] = mdStrikersNewsParagraphs;

  return (
    <div className={cn(fcPublicShell, 'md-club-about')}>
      <FcUnitedHeader active="about" />
      <main className="flex min-w-0 flex-1 flex-col">
        <section id="overview" className="md-club-about-hero md-sport-bg" aria-label="About">
          <div className="md-about-hero__media" aria-hidden>
            <Image src={ABOUT_HERO_IMAGE} alt="" fill priority className="object-cover object-[center_42%]" sizes="100vw" />
          </div>
          <div className="md-about-hero__shade" aria-hidden />
          <Shell className="md-about-hero__content">
            <nav className="md-about-crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <span>About</span>
            </nav>
            <p className="md-about-kicker">About MD Strikers</p>
            <h1>More Than a Club. A Community.</h1>
            <span className="md-about-rule" aria-hidden />
            <div className="md-about-hero__grid">
              <div className="md-about-hero__copy">
                <h2>{fcUnitedAboutTitle}</h2>
                <p className="md-about-hero__tagline">{mdStrikersIndexTagline}</p>
                <div className="md-about-hero__prose">
                  <p>{fcUnitedAboutP1}</p>
                  <p>
                    {fcUnitedAboutP2BeforeNamslLink}{' '}
                    <a href={fcUnitedAboutNamslUrl} className="md-about-gold" target="_blank" rel="noopener noreferrer">
                      namsl.com
                    </a>
                    .
                  </p>
                  <p>{fcUnitedAboutP3}</p>
                </div>
                <div className="md-about-hero__actions">
                  <a href="#what-we-do" className="md-about-cta">
                    What we do
                    <Arrow />
                  </a>
                  <a href="#history" className="md-about-cta md-about-cta--ghost">
                    History
                    <Arrow />
                  </a>
                </div>
              </div>
              <div className="md-about-hero__logo">
                <Image
                  src={MD_STRIKERS_LOGO_ABOUT}
                  alt="Maryland Strikers Sports Club logo"
                  width={960}
                  height={960}
                  priority
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 900px) 70vw, 380px"
                />
              </div>
            </div>
          </Shell>
        </section>

        <AboutPageSubnav />

        <section className="md-club-about-navy md-about-stats" aria-label="Founded in 2009">
          <Shell>
            <p className="md-about-kicker">Founded</p>
            <p className="md-about-stat">
              <AboutFoundedYear />
            </p>
            <p className="md-about-stat__place">DMV — D.C., Maryland, Virginia</p>
          </Shell>
        </section>

        <section className="md-club-about-band md-sport-bg">
          <Shell>
            <h2 className="md-about-display md-about-reveal">{mdStrikersLearnMoreHeading}</h2>
            <div id="what-we-do" className="md-about-split">
              <div className="md-about-reveal">
                <h3>{mdStrikersWhatWeDoHeading}</h3>
                <p>{mdStrikersWhatWeDoBody}</p>
              </div>
              <figure className="md-about-photo md-about-reveal">
                <Image
                  src={encodePublicPath(clubPhoto.src)}
                  alt={clubPhoto.caption}
                  width={1200}
                  height={800}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 900px) 100vw, 520px"
                />
                <figcaption>{clubPhoto.caption}</figcaption>
              </figure>
            </div>
            <ul className="md-about-cards">
              {themeCards.map((card) => (
                <li key={card.title} className="md-about-card md-about-reveal">
                  <span className="md-about-icon">
                    <ThemeIcon name={card.title} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </li>
              ))}
            </ul>
          </Shell>
        </section>

        <section className="md-club-about-band md-club-about-band--grey md-sport-bg" aria-label="Club identity">
          <Shell>
            <p className="md-about-kicker md-about-kicker--ink">Club identity</p>
            <h2 className="md-about-display">What makes us different</h2>
            <ul className="md-about-cards md-about-cards--values">
              {valueCards.map((card) => (
                <li key={card.title} className="md-about-card md-about-reveal">
                  <span className="md-about-icon">
                    <ThemeIcon name={card.title} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </li>
              ))}
            </ul>
          </Shell>
        </section>

        <section id="history" className="md-club-about-band md-sport-bg">
          <Shell>
            <h2 className="md-about-display">{mdStrikersHistoryHeading}</h2>
            <p className="md-about-lead">{mdStrikersHistoryBody}</p>
            <div className="md-about-timeline" aria-label="Club history">
              {historySteps.map((step, index) => {
                const mark = historyMarks[index];
                return (
                  <article key={step} className="md-about-milestone md-about-reveal">
                    <span className="md-about-milestone__dot" aria-hidden />
                    {mark?.year ? <p className="md-about-milestone__year">{mark.year}</p> : null}
                    <h3>{mark?.label ?? mdStrikersHistoryHeading}</h3>
                    <p>{step}</p>
                  </article>
                );
              })}
            </div>
          </Shell>
        </section>

        <section id="news" className="md-club-about-band md-club-about-band--grey md-sport-bg">
          <Shell>
            <h2 className="md-about-display">{mdStrikersNewsHeading}</h2>
            <div className="md-about-news">
              <article className="md-about-news__feature md-about-reveal">
                <p className="md-about-kicker md-about-kicker--gold">Saturday, May 23, 2026</p>
                <h3>Capital Cup 2026</h3>
                <p>{featuredNews}</p>
                <Link href="/tournaments/capital-cup-2026" className="md-about-more">
                  Capital Cup 2026
                  <Arrow />
                </Link>
              </article>
              <div className="md-about-news__list">
                {supportingNews.map((paragraph) => (
                  <article key={paragraph} className="md-about-news__item md-about-reveal">
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            </div>
          </Shell>
        </section>

        <section id="supporters" className="md-club-about-band md-sport-bg">
          <Shell>
            <p className="md-about-kicker md-about-kicker--ink">Our partners & supporters</p>
            <h2 className="md-about-display">{mdStrikersSupportersHeading}</h2>
            <div className="md-about-prose">
              {mdStrikersSupportersParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Shell>
        </section>

        <section id="sponsors" className="md-club-about-navy md-about-sponsor" aria-label={mdStrikersBecomeASponsorHeading}>
          <Shell>
            <p className="md-about-thanks">{mdStrikersThankYouSponsorsLine}</p>
            <p className="md-about-kicker">Be part of the MD Strikers community</p>
            <h2 className="md-about-display">{mdStrikersBecomeASponsorHeading}</h2>
            <p>{mdStrikersBecomeASponsorBody}</p>
            <Link href="/contacts" className="md-about-cta">
              Contact us
              <Arrow />
            </Link>
          </Shell>
        </section>

        <FcMemorableMomentsSection />
      </main>
      <FcUnitedFooter />
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="md-about-arrow">
      <path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
