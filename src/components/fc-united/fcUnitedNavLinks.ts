/**
 * Primary FC United / MD Strikers header navigation (desktop + mobile).
 */
export type FcNavKey =
  | 'home'
  | 'about'
  | 'events'
  | 'matches'
  | 'tournaments'
  | 'team'
  | 'executive'
  | 'gallery'
  | 'sponsors'
  | 'contacts';

export type FcNavLink = {
  href: string;
  label: string;
  key: string;
};

export type FcNavItem = {
  href?: string;
  label: string;
  key: string;
  children?: FcNavLink[];
};

export type FeaturedTournamentLink = {
  href: string;
  label: string;
  slug: string;
};

const BASE_LINKS: FcNavLink[] = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/events', label: 'Events', key: 'events' },
  { href: '/matches', label: 'Matches', key: 'matches' },
  { href: '/team', label: 'Sports Team', key: 'team' },
  { href: '/executive-team', label: 'Executive Team', key: 'executive' },
  { href: '/gallery', label: 'Gallery', key: 'gallery' },
  { href: '/sponsors', label: 'Sponsors', key: 'sponsors' },
  { href: '/contacts', label: 'Contacts', key: 'contacts' },
];

/**
 * Header Menu flags plus homepage section flags for the club roster,
 * the organization committee, and sponsors. Unset flags stay visible.
 * Matches has no tenant flag, so it always stays.
 */
export type FcHeaderMenuVisibility = {
  home?: boolean | null;
  about?: boolean | null;
  events?: boolean | null;
  gallery?: boolean | null;
  contacts?: boolean | null;
  team?: boolean | null;
  executive?: boolean | null;
  sponsors?: boolean | null;
};

function isHeaderItemVisible(key: string, visibility?: FcHeaderMenuVisibility): boolean {
  if (key === 'matches') return true;
  if (!visibility || !(key in visibility)) return true;
  const flag = visibility[key as keyof FcHeaderMenuVisibility];
  return flag !== false;
}

const ABOUT_CHILD_KEYS = ['about', 'gallery', 'sponsors', 'contacts'] as const;
const TEAM_CHILD_KEYS = ['team', 'executive'] as const;

function groupMenu(label: string, key: string, children: FcNavLink[]): FcNavItem | null {
  if (children.length === 0) return null;
  if (children.length === 1 && children[0].key === key) return children[0];
  return { key, label, children };
}

/**
 * Top bar stays short: club pages sit under About, and the two rosters sit under Team.
 * Tournaments and each published header label stay on the top bar after Matches.
 */
export function buildFcUnitedNavLinks(
  featured: FeaturedTournamentLink[] = [],
  visibility?: FcHeaderMenuVisibility,
  showTournaments = false
): FcNavItem[] {
  const visible = new Map(
    BASE_LINKS.filter((link) => isHeaderItemVisible(link.key, visibility)).map((link) => [link.key, link])
  );
  const items: FcNavItem[] = [];

  const home = visible.get('home');
  if (home) items.push(home);

  const aboutChildren = ABOUT_CHILD_KEYS.flatMap((key) => {
    const link = visible.get(key);
    if (!link) return [];
    return [key === 'about' ? { ...link, label: 'About Us' } : link];
  });
  const aboutMenu = groupMenu('About', 'about', aboutChildren);
  if (aboutMenu) items.push(aboutMenu);

  const events = visible.get('events');
  if (events) items.push(events);
  const matches = visible.get('matches');
  if (matches) items.push(matches);

  if (showTournaments) {
    items.push({ href: '/tournaments', label: 'Tournaments', key: 'tournaments' });
    for (const item of featured) {
      const label = item.label.trim();
      if (!item.href || !item.slug || !label) continue;
      items.push({ href: item.href, label, key: `featured-${item.slug}` });
    }
  }

  const teamChildren = TEAM_CHILD_KEYS.flatMap((key) => {
    const link = visible.get(key);
    return link ? [link] : [];
  });
  const teamMenu = groupMenu('Team', 'team', teamChildren);
  if (teamMenu) items.push(teamMenu);

  return items;
}

export function isFcNavItemActive(item: FcNavItem, pathname: string | null, active?: string): boolean {
  if (item.children?.some((child) => isFcNavLinkActive(child, pathname, active))) return true;
  if (!item.href) return active === item.key;
  return isFcNavLinkActive({ href: item.href, label: item.label, key: item.key }, pathname, active);
}

/** Catalog is active only on /tournaments. A featured label is active on its own page. */
export function isFcNavLinkActive(link: FcNavLink, pathname: string | null, active?: string): boolean {
  if (link.href === '/tournaments') return pathname === '/tournaments';
  if (link.key.startsWith('featured-')) return pathname === link.href;
  if (pathname) {
    if (link.href === '/') return pathname === '/';
    if (pathname === link.href || pathname.startsWith(`${link.href}/`)) return true;
  }
  return active === link.key;
}

export const FC_UNITED_NAV_LINKS = buildFcUnitedNavLinks();
