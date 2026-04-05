'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';
import { FC_UNITED_NAV_LINKS, type FcNavKey } from './fcUnitedNavLinks';

const navHoverActive =
  'cursor-pointer text-base font-bold text-[#e31837] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]';
const navActive = 'text-white';

export function FcUnitedMobileNav({ active }: { active?: FcNavKey }) {
  const [open, setOpen] = useState(false);
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
    <div className="relative flex-shrink-0 md:hidden">
      {open && (
        <div
          className="fixed bottom-0 left-0 right-0 top-[calc(3.25rem+45px+20px+1.5rem+15px)] z-40 cursor-pointer bg-black/50 sm:top-[calc(4rem+45px+20px+1.5rem+15px)] md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative z-50 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[3px] text-white transition-colors hover:bg-white/[0.08] hover:text-[#e31837] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31837]"
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
          'absolute left-1/2 top-full z-50 mt-0 w-screen max-w-[100vw] -translate-x-1/2 border-t border-white/[0.1] shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:hidden',
          open ? 'block' : 'hidden',
        )}
        style={{ backgroundColor: b.navy }}
        aria-label="Primary"
      >
        <ul className="flex flex-col px-4 py-3">
          {FC_UNITED_NAV_LINKS.map(({ href, label, key }) => (
            <li key={key}>
              <Link
                href={href}
                className={cn(
                  'block rounded-[3px] px-3 py-3',
                  navHoverActive,
                  active === key && navActive,
                )}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
