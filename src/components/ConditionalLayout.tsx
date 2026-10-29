'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

const FC_UNITED_FULL_WIDTH = [
  '/',
  '/about',
  '/events',
  '/matches',
  '/team',
  '/executive-team',
  '/sponsors',
  '/gallery',
  '/news',
  '/contacts',
  '/volunteer',
];

function isFcUnitedStandaloneRoute(pathname: string): boolean {
  if (FC_UNITED_FULL_WIDTH.includes(pathname)) return true;
  /** Capital Cup year pages — same MD Strikers chrome as home/about; must not nest inside global Header/Footer */
  if (pathname.startsWith('/capital-cup-')) return true;
  if (pathname === '/tournaments' || pathname.startsWith('/tournaments/')) return true;
  if (pathname === '/leagues' || pathname.startsWith('/leagues/')) return true;
  if (pathname.startsWith('/sponsors/')) return true;
  if (pathname.startsWith('/news/')) return true;
  if (pathname.startsWith('/team/')) return true;
  return false;
}

/**
 * FC United mirror routes supply their own header/footer.
 * Skip global Header/Footer so those pages match the static wget design.
 */
export default function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const hideGlobalChrome = pathname != null && isFcUnitedStandaloneRoute(pathname);

  if (hideGlobalChrome) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {footer}
    </>
  );
}
