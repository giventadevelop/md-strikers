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

  const column = 'flex w-full min-h-dvh flex-1 flex-col';

  if (hideGlobalChrome) {
    return <div className={column}>{children}</div>;
  }

  return (
    <div className={column}>
      {header}
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {footer}
    </div>
  );
}
