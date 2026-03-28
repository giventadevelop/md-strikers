import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';

/** Matches mdStrikersBrand.accent — full class strings for Tailwind JIT */
const navHoverActive = 'transition-colors duration-200 hover:text-[#e31837]';
const navActive = 'text-[#e31837]';

export type FcNavKey = 'home' | 'events' | 'matches' | 'team' | 'gallery' | 'contacts';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-3 sm:px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export function FcUnitedHeader({ active }: { active?: FcNavKey }) {

  const headerStyle: CSSProperties = {
    backgroundColor: b.navy,
    ['--md-accent' as string]: b.accent,
    ['--md-gold' as string]: b.gold,
    ['--md-text' as string]: b.text,
    ['--md-text-muted' as string]: b.textMuted,
  };

  return (
    <header
      className="md-strikers-header sticky top-0 z-50 border-b border-white/[0.06] text-[var(--md-text-muted)] shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      style={headerStyle}
    >
      <Shell className="flex min-h-[4.25rem] items-center justify-between gap-3 py-2.5 sm:min-h-[4.75rem] sm:gap-5 sm:py-3 md:min-h-20 md:gap-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5"
          aria-label="Maryland Strikers — Home"
        >
          <div className="relative flex h-[3.25rem] w-[3.25rem] flex-shrink-0 items-center justify-center sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem] lg:h-[5.25rem] lg:w-[5.25rem] xl:h-[5.75rem] xl:w-[5.75rem]">
            <Image
              src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
              alt=""
              width={280}
              height={280}
              sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 184px"
              className="h-full w-full object-contain object-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center leading-none">
            <span
              className={cn(
                'font-bold tracking-tight text-white',
                'text-[0.95rem] leading-tight sm:text-lg md:text-xl lg:text-2xl xl:text-[1.65rem]',
                '[text-shadow:0_1px_2px_rgba(0,0,0,0.55)]',
              )}
            >
              <span className="inline sm:hidden">MD Strikers</span>
              <span className="hidden sm:inline">Maryland Strikers</span>
            </span>
            <span
              className={cn(
                'mt-1 font-semibold uppercase tracking-[0.18em] sm:mt-1.5',
                'text-[0.5625rem] sm:text-[0.625rem] md:text-xs',
              )}
              style={{ color: b.gold }}
            >
              Sports Club
            </span>
          </div>
        </Link>
        <nav
          className="hidden items-center gap-5 text-sm font-semibold text-white md:flex lg:gap-8 lg:text-[0.9375rem]"
          aria-label="Primary"
        >
          <Link href="/" className={cn(navHoverActive, active === 'home' && navActive)}>
            Home
          </Link>
          <Link href="/events" className={cn(navHoverActive, active === 'events' && navActive)}>
            Events
          </Link>
          <Link href="/matches" className={cn(navHoverActive, active === 'matches' && navActive)}>
            Matches
          </Link>
          <Link href="/team" className={cn(navHoverActive, active === 'team' && navActive)}>
            Team
          </Link>
          <Link href="/gallery" className={cn(navHoverActive, active === 'gallery' && navActive)}>
            Gallery
          </Link>
          <Link href="/contacts" className={cn(navHoverActive, active === 'contacts' && navActive)}>
            Contacts
          </Link>
        </nav>
        <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] text-white transition-colors hover:bg-white/[0.06] hover:text-[#e31837] sm:h-10 sm:w-10"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] text-white transition-colors hover:bg-white/[0.06] hover:text-[#e31837] sm:h-10 sm:w-10"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7M13.73 21a2 2 0 01-3.46 0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Shell>
    </header>
  );
}
