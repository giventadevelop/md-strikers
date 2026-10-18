'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';
import type { FcHeaderMenuVisibility, FcNavItem, FcNavKey, FeaturedTournamentLink } from './fcUnitedNavLinks';
import { buildFcUnitedNavLinks, FC_UNITED_NAV_LINKS, isFcNavItemActive, isFcNavLinkActive } from './fcUnitedNavLinks';
import { FcUnitedAuthDesktop } from './FcUnitedAuth';
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

function asTournamentRows(data: unknown): Array<{ slug?: string; title?: string; shortLabel?: string | null; showInHeader?: boolean }> {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: Array<{ slug?: string; title?: string; shortLabel?: string | null; showInHeader?: boolean }> }).content;
  }
  return [];
}

export function FcUnitedHeader({ active }: { active?: FcNavKey }) {
  const pathname = usePathname();
  const [links, setLinks] = useState<FcNavItem[]>(FC_UNITED_NAV_LINKS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settingsRes = await fetch('/api/proxy/tenant-settings?size=1', { cache: 'no-store' });
        if (!settingsRes.ok) return;
        const settingsData = await settingsRes.json();
        const settings = Array.isArray(settingsData)
          ? settingsData[0]
          : settingsData?.content?.[0] || settingsData;
        if (cancelled) return;

        const visibility: FcHeaderMenuVisibility = {
          home: settings?.showHeaderHome,
          about: settings?.showHeaderAbout,
          events: settings?.showHeaderEvents,
          gallery: settings?.showHeaderGallery,
          contacts: settings?.showHeaderContact,
          team: settings?.showTeamMembersSectionInHomePage,
          executive: settings?.showExecutiveCommitteeSectionInHomePage,
          sponsors: settings?.showSponsorsSectionInHomePage,
        };
        const showTournaments = settings?.showHeaderTournament === true;
        const featured: FeaturedTournamentLink[] = [];
        if (showTournaments) {
          const res = await fetch(
            '/api/proxy/tenant-tournaments?isPublished.equals=true&showInHeader.equals=true&size=20',
            { cache: 'no-store' }
          );
          if (res.ok) {
            for (const row of asTournamentRows(await res.json())) {
              if (!row.slug || row.showInHeader === false) continue;
              const label = `${row.shortLabel || row.title || ''}`.trim();
              if (!label) continue;
              featured.push({ href: `/tournaments/${row.slug}`, label, slug: row.slug });
            }
          }
        }
        if (!cancelled) setLinks(buildFcUnitedNavLinks(featured, visibility, showTournaments));
      } catch {
        // Keep the base navigation when the tournament API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
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
      <Shell className="flex items-center gap-3 py-7 sm:gap-5 sm:py-8 md:gap-4 md:py-9">
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex lg:gap-6"
          aria-label="Primary"
        >
          {links.map((item) =>
            item.children && item.children.length > 0 ? (
              <div key={item.key} className="group relative">
                <button
                  type="button"
                  className={cn(
                    navHoverActive,
                    'inline-flex items-center gap-1 whitespace-nowrap',
                    isFcNavItemActive(item, pathname, active) && navActive
                  )}
                  aria-haspopup="true"
                >
                  {item.label}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="invisible absolute left-0 top-full z-50 min-w-[12rem] pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-xl border border-[#e3e3e3] bg-white py-2 text-[#262f3e] shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        href={child.href}
                        className={cn(
                          'block whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-[#262f3e] hover:bg-[#f4f4f4] hover:text-[#e31837]',
                          isFcNavLinkActive(child, pathname, active) && 'text-[#e31837]'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.key}
                href={item.href || '/'}
                className={cn(
                  navHoverActive,
                  'whitespace-nowrap',
                  isFcNavItemActive(item, pathname, active) && navActive
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <FcUnitedAuthDesktop />
        <FcUnitedMobileNav active={active} links={links} />
      </Shell>
    </header>
  );
}
