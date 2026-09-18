import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';
import type { FcNavKey } from './fcUnitedNavLinks';
import { FC_UNITED_NAV_LINKS } from './fcUnitedNavLinks';
import { FcUnitedMobileNav } from './FcUnitedMobileNav';

/** Inverted from classic: accent by default, white on hover/active — bold for readability */
const navHoverActive =
  'cursor-pointer text-base font-bold text-[#e31837] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628] lg:text-[1.0625rem]';
const navActive = 'text-white';

export type { FcNavKey };

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
      className="md-strikers-header relative z-50 shrink-0 border-b border-white/[0.06] text-[var(--md-text-muted)] shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      style={headerStyle}
    >
      <Shell className="flex items-center justify-center gap-3 py-7 sm:gap-5 sm:py-8 md:gap-6 md:py-9">
        <div className="flex flex-shrink-0 items-center gap-0">
          <nav
            className="hidden items-center gap-5 md:flex lg:gap-8"
            aria-label="Primary"
          >
            {FC_UNITED_NAV_LINKS.map(({ href, label, key }) => (
              <Link key={key} href={href} className={cn(navHoverActive, active === key && navActive)}>
                {label}
              </Link>
            ))}
          </nav>
          <FcUnitedMobileNav active={active} />
        </div>
      </Shell>
    </header>
  );
}
