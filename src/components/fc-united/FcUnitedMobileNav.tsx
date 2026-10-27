'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FcUnitedAuthMobile } from './FcUnitedAuth';
import { FC_UNITED_NAV_LINKS, isFcNavItemActive, isFcNavLinkActive, type FcNavItem, type FcNavKey } from './fcUnitedNavLinks';

const navHoverActive =
  'cursor-pointer text-base font-semibold text-pitch-stone transition-colors duration-200 hover:bg-pitch-chalk/5 hover:text-pitch-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime';
const navActive = 'bg-pitch-chalk/5 text-pitch-chalk shadow-[inset_2px_0_0_theme(colors.pitch.lime)]';

export function FcUnitedMobileNav({ active, links = FC_UNITED_NAV_LINKS }: { active?: FcNavKey; links?: FcNavItem[] }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative flex-shrink-0 xl:hidden">
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-[var(--md-header-h)] z-40 cursor-pointer bg-pitch-charcoal/60 backdrop-blur-sm xl:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-pitch-chalk/15 text-pitch-chalk transition-colors duration-300 hover:border-pitch-chalk/40 hover:bg-pitch-chalk/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-lime"
        aria-expanded={open}
        aria-controls="fc-united-mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <nav
        id="fc-united-mobile-menu"
        className={cn(
          'fixed inset-x-0 top-[var(--md-header-h)] z-50 max-h-[calc(100dvh-var(--md-header-h))] overflow-y-auto border-t border-pitch-chalk/10 bg-pitch-charcoal shadow-pitch xl:hidden',
          open ? 'block' : 'hidden',
        )}
        aria-label="Primary"
      >
        <ul className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {links.map((item) =>
            item.children && item.children.length > 0 ? (
              <li key={item.key}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-4 py-3',
                    navHoverActive,
                    isFcNavItemActive(item, pathname, active) && navActive
                  )}
                  aria-expanded={!!openGroups[item.key]}
                  onClick={() => setOpenGroups((current) => ({ ...current, [item.key]: !current[item.key] }))}
                >
                  {item.label}
                  <svg className={cn('h-4 w-4 transition-transform', openGroups[item.key] && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openGroups[item.key] && (
                  <ul className="flex flex-col gap-1 pb-2 pl-4">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <Link
                          href={child.href}
                          className={cn(
                            'block rounded-xl px-4 py-3 text-sm',
                            navHoverActive,
                            isFcNavLinkActive(child, pathname, active) && navActive
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.key}>
                <Link
                  href={item.href || '/'}
                  className={cn(
                    'block rounded-xl px-4 py-3',
                    navHoverActive,
                    isFcNavItemActive(item, pathname, active) && navActive,
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
        <FcUnitedAuthMobile onNavigate={() => setOpen(false)} />
      </nav>
    </div>
  );
}
