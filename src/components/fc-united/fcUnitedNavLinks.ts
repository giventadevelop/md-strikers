/**
 * Primary FC United / MD Strikers header navigation (desktop + mobile).
 * `matches` is only used for active state on `/matches` — not shown in the nav bar.
 */
export type FcNavKey = 'home' | 'about' | 'events' | 'matches' | 'team' | 'gallery' | 'contacts';

export const FC_UNITED_NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  key: Exclude<FcNavKey, 'matches'>;
}> = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/events', label: 'Events', key: 'events' },
  { href: '/team', label: 'Team', key: 'team' },
  { href: '/gallery', label: 'Gallery', key: 'gallery' },
  { href: '/contacts', label: 'Contacts', key: 'contacts' },
];
