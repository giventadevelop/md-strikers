import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';

const focusRing =
  'focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e31837] focus-visible:ring-offset-2 focus-visible:ring-offset-[#262f3e]';

const linkClass = cn(
  'block py-0.5 text-sm font-medium text-[#c3c7ce] transition-colors duration-300 hover:text-white',
  focusRing,
);

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/events', label: 'Events' },
  { href: '/matches', label: 'Matches' },
  { href: '/team', label: 'Sports Team' },
  { href: '/executive-team', label: 'Executive Team' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/contacts', label: 'Contact' },
];

const waysToHelp = [
  { href: '/sponsors', label: 'Corporate Sponsorship' },
  { href: '/membership', label: 'Membership' },
  { href: '/volunteer', label: 'Volunteer' },
];

const socialLinks: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: 'https://www.facebook.com/MD-Strikers-Soccer-Sports-Club-100075880582177/',
    label: 'MD Strikers on Facebook',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/mdstrikers',
    label: 'MD Strikers on Instagram',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@mdstrikersinc',
    label: 'MD Strikers on YouTube',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    ),
  },
];

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return <h6 className="mb-4 text-base font-semibold tracking-wide text-white md:mb-6 md:text-lg">{children}</h6>;
}

export function FcUnitedFooter() {
  return (
    <footer className="bg-[#262f3e] text-[#848992]">
      <Shell className="pt-10 pb-8 md:pt-16 md:pb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className={cn('mb-4 inline-block md:mb-6', focusRing)} aria-label="MD Strikers Home">
              <Image
                src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
                alt="MD Strikers"
                width={1003}
                height={858}
                className="h-32 w-auto sm:h-36 md:h-40 lg:h-44"
              />
            </Link>
            <ul className="flex items-center gap-3" aria-label="Social media">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-300 hover:scale-110 hover:border-[#e31837] hover:bg-[#e31837]',
                      focusRing,
                    )}
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Get in Touch</FooterHeading>
            <div className="space-y-3.5 md:space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  style={{ color: b.accent }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm leading-relaxed">
                  <span className="block font-medium text-white">MD Strikers</span>
                  <span className="block">Germantown Rd, Germantown, MD 20874, United States</span>
                  <span className="mt-1 block">Washington D.C., DC, United States, 20874</span>
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: b.accent }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-10 6L2 7" />
                </svg>
                <a href="mailto:mdstrikersinc@gmail.com" className={cn('break-all text-sm transition-colors duration-300 hover:text-white', focusRing)}>
                  mdstrikersinc@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:gap-8 md:contents">
            <div className="min-w-0">
              <FooterHeading>Quick Links</FooterHeading>
              <nav aria-label="Footer quick links">
                <ul className="space-y-2.5 md:space-y-3">
                  {quickLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="min-w-0">
              <FooterHeading>Ways to Help</FooterHeading>
              <nav aria-label="Footer ways to help">
                <ul className="space-y-2.5 md:space-y-3">
                  {waysToHelp.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </Shell>

      <div className="w-full border-t border-white/[0.08]">
        <Shell className="py-6 md:py-8">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="max-w-[28ch] text-xs leading-relaxed md:max-w-none md:text-sm">
              © {new Date().getFullYear()} MD Strikers
              <span className="block md:inline md:before:mx-1.5 md:before:content-['·']">Maryland Strikers Sports Club</span>
            </p>
            <p className="text-[11px] md:text-xs">
              Powered by{' '}
              <a
                href="https://www.giventa.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn('underline-offset-2 transition-colors duration-200 hover:text-white hover:underline', focusRing)}
              >
                Giventa Inc., USA
              </a>
              .
            </p>
            <p className="text-[11px] md:text-xs">
              <a
                href="https://www.giventa.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn('underline-offset-2 transition-colors duration-200 hover:text-white hover:underline', focusRing)}
              >
                www.giventa.com
              </a>
            </p>
          </div>
        </Shell>
      </div>
    </footer>
  );
}
