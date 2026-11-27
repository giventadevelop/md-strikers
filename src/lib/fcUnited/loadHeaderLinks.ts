import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import {
  buildFcUnitedNavLinks,
  type FcHeaderMenuVisibility,
  type FcNavItem,
  type FeaturedTournamentLink,
  type LeagueNavLink,
  type TeamNavLink,
} from '@/components/fc-united/fcUnitedNavLinks';

function asListRows<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

function firstRow(data: unknown): Record<string, unknown> | null {
  const rows = asListRows<Record<string, unknown>>(data);
  if (rows.length > 0) return rows[0];
  if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
  return null;
}

function flag(value: unknown): boolean | null | undefined {
  if (value === true || value === false || value == null) return value;
  return undefined;
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetchWithJwtRetry(`${getApiBaseUrl()}${path}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Full primary navigation for the first paint. Built on the server so the
 * header does not start with the short static menu and fill in after load.
 */
export async function loadFcUnitedHeaderLinks(): Promise<FcNavItem[]> {
  try {
    const tenantId = getTenantId();
    const tenant = encodeURIComponent(tenantId);
    const settings = firstRow(
      await getJson(`/api/tenant-settings?tenantId.equals=${tenant}&size=1`)
    );

    const visibility: FcHeaderMenuVisibility = {
      home: flag(settings?.showHeaderHome),
      about: flag(settings?.showHeaderAbout),
      events: flag(settings?.showHeaderEvents),
      news: flag(settings?.showHeaderNews),
      gallery: flag(settings?.showHeaderGallery),
      contacts: flag(settings?.showHeaderContact),
      team: flag(settings?.showTeamMembersSectionInHomePage),
      executive: flag(settings?.showExecutiveCommitteeSectionInHomePage),
      sponsors: flag(settings?.showSponsorsSectionInHomePage),
    };
    const showTournaments = settings?.showHeaderTournament === true;
    const showLeagues = settings?.showHeaderLeagues === true;
    const showSportsTeam = settings?.showTeamMembersSectionInHomePage !== false;

    const [featured, leagues, teams] = await Promise.all([
      showTournaments ? loadFeatured(tenant) : Promise.resolve([] as FeaturedTournamentLink[]),
      showLeagues ? loadLeagues(tenant) : Promise.resolve([] as LeagueNavLink[]),
      showSportsTeam ? loadTeams(tenant) : Promise.resolve([] as TeamNavLink[]),
    ]);

    return buildFcUnitedNavLinks(featured, visibility, showTournaments, leagues, teams);
  } catch (error) {
    console.error('[loadFcUnitedHeaderLinks]', error);
    return buildFcUnitedNavLinks();
  }
}

async function loadFeatured(tenant: string): Promise<FeaturedTournamentLink[]> {
  const data = await getJson(
    `/api/tenant-tournaments?tenantId.equals=${tenant}&isPublished.equals=true&showInHeader.equals=true&size=20`
  );
  const featured: FeaturedTournamentLink[] = [];
  for (const row of asListRows<{ slug?: string; title?: string; shortLabel?: string | null; showInHeader?: boolean }>(data)) {
    if (!row.slug || row.showInHeader === false) continue;
    const label = `${row.shortLabel || row.title || ''}`.trim();
    if (!label) continue;
    featured.push({ href: `/tournaments/${row.slug}`, label, slug: row.slug });
  }
  return featured;
}

async function loadLeagues(tenant: string): Promise<LeagueNavLink[]> {
  const data = await getJson(
    `/api/leagues?tenantId.equals=${tenant}&isPublished.equals=true&sort=homepageDisplayOrder,asc&size=50`
  );
  const leagues: LeagueNavLink[] = [];
  for (const row of asListRows<{ slug?: string; name?: string }>(data)) {
    const slug = `${row.slug || ''}`.trim();
    const label = `${row.name || ''}`.trim();
    if (!slug || !label) continue;
    leagues.push({ href: `/leagues/${slug}`, label, slug });
  }
  return leagues;
}

async function loadTeams(tenant: string): Promise<TeamNavLink[]> {
  const data = await getJson(
    `/api/team-groups?tenantId.equals=${tenant}&isActive.equals=true&sort=displayOrder,asc&size=50`
  );
  const teams: TeamNavLink[] = [];
  for (const row of asListRows<{ slug?: string; name?: string; categoryLabel?: string }>(data)) {
    const slug = `${row.slug || ''}`.trim();
    const name = `${row.name || ''}`.trim();
    const category = `${row.categoryLabel || ''}`.trim();
    if (!slug || !name) continue;
    teams.push({
      href: `/team?squad=${encodeURIComponent(slug)}`,
      label: category ? `${name} · ${category}` : name,
      slug,
    });
  }
  return teams;
}
