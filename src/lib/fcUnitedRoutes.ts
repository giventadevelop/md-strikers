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

/** Routes that render the MD Strikers shell and must not use the global header/footer. */
export function isFcUnitedStandaloneRoute(pathname: string): boolean {
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

/** Body class for sports public routes. Unlayered CSS paints the pitch shell on first paint. */
export const MD_PUBLIC_BODY_CLASS = 'md-public';
