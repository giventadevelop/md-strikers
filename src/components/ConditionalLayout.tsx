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
  '/gallery',
  '/contacts',
  '/volunteer',
];

/**
 * FC United mirror routes supply their own header/footer.
 * Skip global Header/Footer so those pages match the static wget design.
 */
export default function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const hideGlobalChrome = pathname != null && FC_UNITED_FULL_WIDTH.includes(pathname);

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
