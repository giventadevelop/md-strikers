import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBebas } from './fcUnitedFonts';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export function FcUnitedFooter() {
  return (
    <footer className="bg-[#262f3e] px-4 py-12 text-[#848992] md:px-7 lg:px-12">
      <Shell>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">Stay ahead</span>
            <p className={cn(fcBebas.className, 'text-3xl text-white')}>Club updates</p>
          </div>
          <p className="max-w-sm text-sm">Join the mailing list for match announcements — form disabled in static demo.</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              placeholder="Email"
              disabled
              className="min-w-[160px] flex-1 rounded-[32px] border border-white/20 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-[#848992]"
            />
            <button
              type="button"
              disabled
              className="rounded-[32px] bg-[#ff0000]/50 px-6 py-3 text-sm font-semibold text-white"
            >
              Subscribe
            </button>
          </div>
        </div>
        <div className="my-8 h-0.5 bg-white/[0.08]" />
        <div className="flex flex-col flex-wrap items-start justify-between gap-4 text-sm md:flex-row md:items-center">
          <div className="flex flex-wrap gap-5">
            <Link href="/" className="font-medium text-white transition-colors hover:text-[#ff0000]">
              Home
            </Link>
            <Link href="/events" className="font-medium text-white transition-colors hover:text-[#ff0000]">
              Events
            </Link>
            <Link href="/matches" className="font-medium text-white transition-colors hover:text-[#ff0000]">
              Matches
            </Link>
            <Link href="/gallery" className="font-medium text-white transition-colors hover:text-[#ff0000]">
              Gallery
            </Link>
            <Link href="/contacts" className="font-medium text-white transition-colors hover:text-[#ff0000]">
              Contacts
            </Link>
          </div>
          <p className="text-xs text-[#848992]">mdStrikers design system · static demo</p>
        </div>
      </Shell>
    </footer>
  );
}
