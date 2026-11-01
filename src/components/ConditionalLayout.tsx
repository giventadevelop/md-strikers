'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { isFcUnitedStandaloneRoute } from '@/lib/fcUnitedRoutes';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
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
