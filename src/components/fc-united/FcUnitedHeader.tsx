import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type FcNavKey = 'home' | 'events' | 'matches' | 'gallery' | 'contacts';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

const navLink = 'transition-colors hover:text-[#ff0000]';

export function FcUnitedHeader({ active }: { active?: FcNavKey }) {
  return (
    <header className="sticky top-0 z-50 bg-[#081224] text-[#848992]">
      <Shell className="flex min-h-16 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-baseline gap-3 transition-colors hover:text-[#ff0000]">
          <Image
            src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
            alt="MD Strikers"
            width={160}
            height={46}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white md:flex lg:gap-8" aria-label="Primary">
          <Link href="/" className={cn(navLink, active === 'home' && 'text-[#ff0000]')}>
            Home
          </Link>
          <Link href="/events" className={cn(navLink, active === 'events' && 'text-[#ff0000]')}>
            Events
          </Link>
          <Link href="/matches" className={cn(navLink, active === 'matches' && 'text-[#ff0000]')}>
            Matches
          </Link>
          <Link href="/gallery" className={cn(navLink, active === 'gallery' && 'text-[#ff0000]')}>
            Gallery
          </Link>
          <Link href="/contacts" className={cn(navLink, active === 'contacts' && 'text-[#ff0000]')}>
            Contacts
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] text-white transition-colors hover:bg-white/[0.06] hover:text-[#ff0000]"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] text-white transition-colors hover:bg-white/[0.06] hover:text-[#ff0000]"
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
