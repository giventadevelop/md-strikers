'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import type { FcNavItem, FcNavKey } from './fcUnitedNavLinks';
import { buildFcUnitedNavLinks, isFcNavItemActive, isFcNavLinkActive } from './fcUnitedNavLinks';
import { FcUnitedAuthDesktop } from './FcUnitedAuth';
import { FcUnitedMobileNav } from './FcUnitedMobileNav';
import { useFcHeaderLinks } from './FcHeaderLinksProvider';
import { useLiveCards, useSportsParallax } from './useSportsParallax';

/** Muted by default, white on hover with a gold underline; the active section is orange with a red→orange underline. */
const navHoverActive =
  'relative cursor-pointer py-2 text-sm font-semibold text-pitch-stone transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-brand-gold after:to-brand-light after:transition-transform after:duration-300 hover:text-pitch-chalk hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime focus-visible:ring-offset-4 focus-visible:ring-offset-pitch-charcoal motion-reduce:after:transition-none';
const navActive = 'text-brand-gold-bright after:scale-x-100 after:from-brand-gold after:to-brand-gold-bright';

export type { FcNavKey };

const HEADER_LOGO = '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>
  );
}

export function FcUnitedHeader({ active }: { active?: FcNavKey }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useSportsParallax();
  useLiveCards();
  // The home hero shows the club logo, so the header drops it there.
  const showLogo = pathname !== '/';
  // Links arrive with the document from the server layout. The short static
  // menu is only a fallback when that payload is missing.
  const links: FcNavItem[] = useFcHeaderLinks() ?? buildFcUnitedNavLinks([], { news: false });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setScrolled(y > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      className={cn(
        fcBrand.className,
        'md-strikers-header sticky top-0 z-50 shrink-0 border-b-2 border-brand-gold/60 text-pitch-chalk',
        // Header height as a variable so the mobile menu opens right below it; taller where the logo shows.
        showLogo ? '[--md-header-h:112px] md:[--md-header-h:128px]' : '[--md-header-h:72px] md:[--md-header-h:80px]',
      )}
    >
      <Shell className="flex h-[var(--md-header-h)] items-center gap-6">
        {showLogo && (
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime"
            aria-label="MD Strikers Home"
          >
            <Image src={HEADER_LOGO} alt="" width={1003} height={858} priority className="h-[96px] w-auto md:h-[112px]" />
            <span className="hidden text-sm font-extrabold uppercase leading-tight tracking-[0.14em] text-pitch-chalk sm:block xl:hidden">
              MD Strikers
              <span className="block text-[10px] font-semibold tracking-[0.22em] text-pitch-stone">Sports Club</span>
            </span>
          </Link>
        )}
        <nav
          className="hidden h-full min-w-0 flex-1 items-center justify-center gap-4 self-stretch xl:flex 2xl:gap-5"
          aria-label="Primary"
        >
          {links.map((item) =>
            item.children && item.children.length > 0 ? (
              <div key={item.key} className="group relative">
                <button
                  type="button"
                  className={cn(
                    navHoverActive,
                    'inline-flex h-full items-center gap-1 whitespace-nowrap leading-none',
                    isFcNavItemActive(item, pathname, active, search) && navActive
                  )}
                  aria-haspopup="true"
                >
                  {item.label}
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 min-w-[13rem] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="rounded-xl border border-pitch-chalk/10 border-t-2 border-t-brand-gold bg-pitch-charcoal p-2 shadow-pitch">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        href={child.href}
                        className={cn(
                          'block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-pitch-stone transition-colors duration-200 hover:bg-pitch-chalk/5 hover:text-pitch-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime',
                          isFcNavLinkActive(child, pathname, active, search) && 'text-brand-gold-bright'
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
                  'inline-flex items-center whitespace-nowrap leading-none',
                  isFcNavItemActive(item, pathname, active, search) && navActive
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-4 pl-10">
          <FcUnitedAuthDesktop />
          <FcUnitedMobileNav active={active} links={links} />
        </div>
      </Shell>
    </header>
  );
}
