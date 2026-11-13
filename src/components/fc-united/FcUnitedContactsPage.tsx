import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcPublicShell } from './fcUnitedFonts';
import { pitchPageInset } from './pitchUi';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedContactForm } from './FcUnitedContactForm';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(pitchPageInset, className)}>{children}</div>;
}

/** Map pin + primary venue (embed uses same query for one marker). */
const CONTACT_MAP_QUERY = '13881 Hopkins Rd, Germantown, MD 20874';

const CONTACT_MAP_EMBED_SRC = `https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=16&q=${encodeURIComponent(CONTACT_MAP_QUERY)}`;

const CONTACT_MAP_LINK = `https://maps.google.com/maps?q=${encodeURIComponent(CONTACT_MAP_QUERY)}`;

const DETAIL_CONTACT_EMAIL = 'mdstrikersinc@gmail.com';

const HERO_IMAGE = '/images/hero_section/stadium-night.jpg';

const detailContacts = [
  { name: 'Noble Joseph', tel: '+13013468631', displayPhone: '301 346 8631' },
  { name: 'Reji Thomas', tel: '+12405938510', displayPhone: '240 593 8510' },
] as const;

const communityLinks = [
  { href: '/team', label: 'Sports Team' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/membership', label: 'Membership' },
  { href: '/volunteer', label: 'Volunteer' },
] as const;

export default function FcUnitedContactsPage() {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="contacts" />
      <section className="md-contact-hero md-sport-bg" aria-label="Contacts">
        <div className="md-contact-hero__media" aria-hidden>
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover object-[center_40%]" sizes="100vw" />
        </div>
        <div className="md-contact-hero__shade" aria-hidden />
        <div className={`${pitchPageInset} md-contact-hero__content`}>
          <nav className="md-contact-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span>Contacts</span>
          </nav>
          <p className="md-contact-kicker">Get in touch with MD Strikers</p>
          <h1>Let&apos;s Connect.</h1>
          <span className="md-contact-rule" aria-hidden />
          <p>Have a question, want to collaborate, or interested in becoming part of our journey? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <main className="md-contact-main">
        <section className={pitchPageInset}>
          <p className="md-contact-kicker md-contact-kicker--ink">For details contact</p>
          <h2>Club contact</h2>
          <span className="md-contact-rule" aria-hidden />
          <div className="md-contact-cards">
            <a className="md-contact-card" href={`mailto:${DETAIL_CONTACT_EMAIL}`} title="Email Maryland Strikers">
              <span className="md-contact-card__icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4zM4 7l8 6 8-6" />
                </svg>
              </span>
              <span>
                <strong>Email</strong>
                <span>{DETAIL_CONTACT_EMAIL}</span>
              </span>
            </a>
            <article className="md-contact-card">
              <span className="md-contact-card__icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M7 4h3l1.5 3.5-2 1.2a12 12 0 006.8 6.8l1.2-2L20 15v3a2 2 0 01-2 2A15 15 0 015 6a2 2 0 012-2z" />
                </svg>
              </span>
              <span>
                <strong>Phone</strong>
                {detailContacts.map((contact) => (
                  <a key={contact.tel} href={`tel:${contact.tel}`} title={`Call ${contact.name}`}>
                    {contact.name} · {contact.displayPhone}
                  </a>
                ))}
              </span>
            </article>
            <a className="md-contact-card" href="#find-us" title="Club address">
              <span className="md-contact-card__icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <span>
                <strong>Address</strong>
                <span>13881 Hopkins Rd<br />Germantown, MD 20874</span>
              </span>
            </a>
          </div>
        </section>

        <section className={`${pitchPageInset} md-contact-formband`}>
          <div className="md-contact-formband__copy">
            <p className="md-contact-kicker md-contact-kicker--ink">have a question?</p>
            <h2>Send Us a Message</h2>
            <span className="md-contact-rule" aria-hidden />
            <p className="md-contact-formband__line">drop a line</p>
            <p>For details contact {detailContacts.map((contact) => contact.name).join(' or ')}.</p>
            <a href={`mailto:${DETAIL_CONTACT_EMAIL}`}>{DETAIL_CONTACT_EMAIL}</a>
            <figure>
              <Image src={HERO_IMAGE} alt="Football stadium" width={720} height={420} />
            </figure>
          </div>
          <FcUnitedContactForm />
        </section>

        <section id="find-us" className={`${pitchPageInset} md-contact-locate`}>
          <div>
            <p className="md-contact-kicker md-contact-kicker--ink">Location</p>
            <h2>Find us</h2>
            <span className="md-contact-rule" aria-hidden />
            <p className="md-contact-locate__address">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>
                13881 Hopkins Rd
                <br />
                Germantown, MD 20874
              </span>
            </p>
            <a href={CONTACT_MAP_LINK} target="_blank" rel="noopener noreferrer">
              Directions
            </a>
          </div>
          <div className="md-contact-map">
            <iframe
              title="Maryland Strikers — location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={CONTACT_MAP_EMBED_SRC}
            />
          </div>
        </section>

        <section className="md-contact-logos">
          <Shell>
            <div>
              {fcSponsors.map((src) => (
                <div key={src}>
                  <Image src={src} alt="" fill className="object-contain" sizes="128px" />
                </div>
              ))}
            </div>
          </Shell>
        </section>
      </main>

      <section className="md-contact-cta">
        <div className="md-contact-cta__media" aria-hidden>
          <Image src={HERO_IMAGE} alt="" fill className="object-cover object-[center_45%]" sizes="100vw" />
        </div>
        <div className="md-contact-cta__shade" aria-hidden />
        <div className={`${pitchPageInset} md-contact-cta__content`}>
          <h2>More than football. One community.</h2>
          <span className="md-contact-rule" aria-hidden />
          <p>Whether you&apos;re a player, supporter, partner or football enthusiast, there&apos;s always a place for you in the MD Strikers community.</p>
          <div className="md-contact-cta__links">
            {communityLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
