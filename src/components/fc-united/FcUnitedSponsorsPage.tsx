import Image from 'next/image';
import Link from 'next/link';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedSponsorsCatalogClient } from './FcUnitedSponsorsCatalogClient';
import { pitchPageInset } from './pitchUi';
import {
  mdStrikersBecomeASponsorBody,
  mdStrikersBecomeASponsorHeading,
  mdStrikersSupportersParagraphs,
  mdStrikersThankYouSponsorsLine,
} from './fcUnitedAboutContent';

const HERO_IMAGE = '/images/hero_section/stadium-night.jpg';

const partnershipNotes = [
  {
    title: 'Community engagement',
    text: 'A fun, inclusive environment for players of all skill levels.',
  },
  {
    title: 'Sports development',
    text: 'Quality facilities, equipment, field rentals, and club programs.',
  },
  {
    title: 'Brand visibility',
    text: 'Their support is showcased through events, social media, and club activities.',
  },
  {
    title: 'Local sports support',
    text: 'Partnerships that help grow the game in the community.',
  },
] as const;

export default function FcUnitedSponsorsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="sponsors" />
      <section className="md-partners-hero md-sport-bg" aria-label="Sponsors">
        <div className="md-partners-hero__media" aria-hidden>
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover object-[center_40%]" sizes="100vw" />
        </div>
        <div className="md-partners-hero__shade" aria-hidden />
        <div className={`${pitchPageInset} md-partners-hero__content`}>
          <nav className="md-partners-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span>Sponsors</span>
          </nav>
          <p className="md-partners-kicker">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 11V7a2 2 0 114 0v4M4 12h8v7H4zM12 14h5a2 2 0 012 2v3h-7" />
            </svg>
            Our partners &amp; sponsors
          </p>
          <h1>Stronger Together. Growing Together.</h1>
          <span className="md-partners-rule" aria-hidden />
          <p>Businesses that support Maryland Strikers, Capital Cup, and club programs.</p>
        </div>
      </section>

      <main className="md-partners-main">
        <section className={`${pitchPageInset} md-partners-intro`}>
          <div>
            <p className="md-partners-kicker md-partners-kicker--ink">Partnership</p>
            <h2>The power of partnership</h2>
            <span className="md-partners-rule" aria-hidden />
            {mdStrikersSupportersParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <figure>
            <Image src={HERO_IMAGE} alt="Football stadium" width={960} height={640} className="md-partners-intro__photo" />
          </figure>
        </section>

        <FcUnitedSponsorsCatalogClient />

        <section className={`${pitchPageInset} md-partners-value`}>
          <p className="md-partners-kicker md-partners-kicker--ink">Partnership</p>
          <h2>Why partner with MD Strikers?</h2>
          <span className="md-partners-rule" aria-hidden />
          <ul>
            {partnershipNotes.map((note) => (
              <li key={note.title}>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </li>
            ))}
          </ul>
        </section>

      </main>
      <section className="md-partners-cta">
          <div className="md-partners-cta__media" aria-hidden>
            <Image src={HERO_IMAGE} alt="" fill className="object-cover object-[center_45%]" sizes="100vw" />
          </div>
          <div className="md-partners-cta__shade" aria-hidden />
          <div className={`${pitchPageInset} md-partners-cta__content`}>
            <p className="md-partners-kicker">{mdStrikersBecomeASponsorHeading}</p>
            <h2>Become a part of our journey.</h2>
            <span className="md-partners-rule" aria-hidden />
            <p>{mdStrikersThankYouSponsorsLine}</p>
            <p>{mdStrikersBecomeASponsorBody}</p>
            <Link href="/contacts" className="md-partners-cta__button">
              Contact us
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
      </section>
      <FcUnitedFooter />
    </div>
  );
}
