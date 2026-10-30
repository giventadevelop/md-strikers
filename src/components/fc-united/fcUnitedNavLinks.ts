/**
 * Primary FC United / MD Strikers header navigation (desktop + mobile).
 */
export type FcNavKey =
  | 'home'
  | 'about'
  | 'events'
  | 'matches'
  | 'leagues'
  | 'tournaments'
  | 'team'
  | 'executive'
  | 'gallery'
  | 'news'
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

export type LeagueNavLink = {
  href: string;
  label: string;
  slug: string;
};

export type TeamNavLink = {
  href: string;
  label: string;
  slug: string;
};

const BASE_LINKS: FcNavLink[] = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/events', label: 'Events', key: 'events' },
  { href: '/matches', label: 'Matches', key: 'matches' },
  { href: '/news', label: 'News', key: 'news' },
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
  news?: boolean | null;
  gallery?: boolean | null;
  contacts?: boolean | null;
  team?: boolean | null;
  executive?: boolean | null;
  sponsors?: boolean | null;
};

function isHeaderItemVisible(key: string, visibility?: FcHeaderMenuVisibility): boolean {
  if (key === 'matches') return true;
  // News follows the admin Header Menu switch: hidden until showHeaderNews is turned on.
  if (key === 'news') return visibility?.news === true;
  if (!visibility || !(key in visibility)) return true;
  const flag = visibility[key as keyof FcHeaderMenuVisibility];
  return flag !== false;
}

const ABOUT_CHILD_KEYS = ['about', 'gallery', 'sponsors', 'contacts'] as const;

function groupMenu(label: string, key: string, children: FcNavLink[]): FcNavItem | null {
  if (children.length === 0) return null;
  if (children.length === 1 && children[0].key === key) return children[0];
  return { key, label, children };
}

/**
 * Top bar stays short: club pages under About, each fixture and cup on its own,
 * published leagues under Leagues, and each squad under Team.
 */
export function buildFcUnitedNavLinks(
  featured: FeaturedTournamentLink[] = [],
  visibility?: FcHeaderMenuVisibility,
  showTournaments = false,
  leagues: LeagueNavLink[] = [],
  teams: TeamNavLink[] = []
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

  const leagueChildren: FcNavLink[] = leagues.flatMap((league) => {
    const label = league.label.trim();
    if (!league.href || !league.slug || !label) return [];
    return [{ href: league.href, label, key: `league-${league.slug}` }];
  });
  if (leagueChildren.length > 0) {
    items.push({
      key: 'leagues',
      label: 'Leagues',
      children: [{ href: '/leagues', label: 'All leagues', key: 'leagues-all' }, ...leagueChildren],
    });
  }

  const news = visible.get('news');
  if (news) items.push(news);

  const squadChildren: FcNavLink[] = teams.flatMap((team) => {
    const label = team.label.trim();
    if (!team.href || !team.slug || !label) return [];
    return [{ href: team.href, label, key: `team-squad-${team.slug}` }];
  });
  const teamChildren: FcNavLink[] = [];
  if (squadChildren.length > 0) {
    teamChildren.push({ href: '/team', label: 'All teams', key: 'teams-all' }, ...squadChildren);
  } else {
    const sports = visible.get('team');
    if (sports) teamChildren.push(sports);
  }
  const executive = visible.get('executive');
  if (executive) teamChildren.push(executive);
  const teamMenu = groupMenu('Team', 'team', teamChildren);
  if (teamMenu) items.push(teamMenu);

  return items;
}

function squadSlug(search: string | null | undefined): string {
  return new URLSearchParams(search || '').get('squad') || '';
}

export function isFcNavItemActive(item: FcNavItem, pathname: string | null, active?: string, search?: string | null): boolean {
  if (item.children?.some((child) => isFcNavLinkActive(child, pathname, active, search))) return true;
  if (!item.href) return active === item.key;
  return isFcNavLinkActive({ href: item.href, label: item.label, key: item.key }, pathname, active, search);
}

/** Catalog is active only on /tournaments. Featured cups, each league, and each squad are active on their own page. */
export function isFcNavLinkActive(link: FcNavLink, pathname: string | null, active?: string, search?: string | null): boolean {
  if (link.href === '/tournaments') return pathname === '/tournaments' || active === 'tournaments';
  if (link.href === '/leagues') return pathname === '/leagues';
  if (link.key === 'teams-all') return pathname === '/team' && !squadSlug(search);
  if (link.key.startsWith('team-squad-')) return pathname === '/team' && squadSlug(search) === squadSlug(link.href.split('?')[1]);
  if (link.key.startsWith('league-') || link.key.startsWith('featured-')) return pathname === link.href;
  if (pathname) {
    if (link.href === '/') return pathname === '/';
    if (pathname === link.href || pathname.startsWith(`${link.href}/`)) return true;
  }
  return active === link.key;
}

export const FC_UNITED_NAV_LINKS = buildFcUnitedNavLinks();
