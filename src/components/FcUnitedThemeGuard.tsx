'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isFcUnitedStandaloneRoute, MD_PUBLIC_BODY_CLASS } from '@/lib/fcUnitedRoutes';

/**
 * Keeps `md-public` on <body> in sync with the URL after client navigations.
 * The root layout sets the class for the first document; this layout does not re-render on SPA moves.
 */
export default function FcUnitedThemeGuard() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    document.body.classList.toggle(MD_PUBLIC_BODY_CLASS, pathname != null && isFcUnitedStandaloneRoute(pathname));
  }, [pathname]);

  return null;
}
