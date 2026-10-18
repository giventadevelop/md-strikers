import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export type PublicTournament = {
  id?: number;
  title: string;
  shortLabel?: string | null;
  editionYear?: number | null;
  slug: string;
  showInHeader?: boolean;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | string;
  startDate?: string | null;
  endDate?: string | null;
  isPublished?: boolean;
  welcomeText?: string | null;
  aboutText?: string | null;
  detailsText?: string | null;
  ageGroupLabel?: string | null;
  chiefGuestName?: string | null;
  chiefGuestImageUrl?: string | null;
  heroImageUrl?: string | null;
  fixturesImageUrl?: string | null;
  registrationEmail?: string | null;
  externalResultsUrl?: string | null;
  externalResultsLabel?: string | null;
  legacyPageUrl?: string | null;
  winnerName?: string | null;
  runnerUpName?: string | null;
  thirdPlaceName?: string | null;
};

function asList(data: unknown): PublicTournament[] {
  if (Array.isArray(data)) return data as PublicTournament[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: PublicTournament[] }).content;
  }
  return [];
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetchWithJwtRetry(`${getApiBaseUrl()}${path}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

/** Menu item. The short label is unique per tenant and is not built from a year. */
export function menuLabel(tournament: Pick<PublicTournament, 'title' | 'shortLabel'>): string {
  return (tournament.shortLabel || tournament.title || '').trim();
}

function firstRow(data: unknown): { showHeaderTournament?: boolean | null } | null {
  if (Array.isArray(data)) return (data[0] as { showHeaderTournament?: boolean | null }) || null;
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown[] }).content)) {
    return ((data as { content: { showHeaderTournament?: boolean | null }[] }).content[0]) || null;
  }
  if (data && typeof data === 'object') return data as { showHeaderTournament?: boolean | null };
  return null;
}

export async function isTournamentHeaderEnabled(): Promise<boolean> {
  try {
    const tenantId = getTenantId();
    const data = await getJson(
      `/api/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}&size=1`
    );
    return firstRow(data)?.showHeaderTournament === true;
  } catch (error) {
    console.error('[isTournamentHeaderEnabled]', error);
    return false;
  }
}

export async function fetchPublishedTournaments(): Promise<PublicTournament[]> {
  try {
    const tenantId = getTenantId();
    const data = await getJson(
      `/api/tenant-tournaments?tenantId.equals=${encodeURIComponent(tenantId)}&isPublished.equals=true&sort=id,desc&size=50`
    );
    return asList(data);
  } catch (error) {
    console.error('[fetchPublishedTournaments]', error);
    return [];
  }
}

export async function fetchFeaturedTournament(): Promise<PublicTournament | null> {
  const enabled = await isTournamentHeaderEnabled();
  if (!enabled) return null;
  const published = await fetchPublishedTournaments();
  return published.find((row) => row.showInHeader) || null;
}

export async function fetchTournamentBySlug(slug: string): Promise<PublicTournament | null> {
  try {
    const tenantId = getTenantId();
    const data = await getJson(
      `/api/tenant-tournaments?tenantId.equals=${encodeURIComponent(tenantId)}&slug.equals=${encodeURIComponent(slug)}&size=1`
    );
    const row = asList(data)[0];
    if (!row || row.isPublished === false) return null;
    return row;
  } catch (error) {
    console.error('[fetchTournamentBySlug]', error);
    return null;
  }
}
