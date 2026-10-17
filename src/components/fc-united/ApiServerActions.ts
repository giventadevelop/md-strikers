'use server';

import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type {
  EventDetailsDTO,
  EventSponsorsDTO,
  ExecutiveCommitteeTeamMemberDTO,
  LastMatchDTO,
  TeamGroupDTO,
  TeamMemberDTO,
} from '@/types';
import { getNextOccurrenceDate, isRecurringEvent } from '@/lib/eventUtils';
import { mediaImageUrl } from '@/lib/homepage/featuredEvents';
import { usableImageUrl } from '@/lib/presignedUrl';
import { normalizeEventDetailsList, normalizeEventMediasList } from '@/lib/homepage/homepageApiNormalize';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import type { FcSquadPlayer } from './FcSquadCarousel';

const FIRST_TEAM_SLUG = 'first-team';

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

/**
 * Load First Team squad for the homepage carousel from the backend API.
 * Images are expected as absolute S3 URLs in profileImageUrl.
 */
export async function fetchFirstTeamSquadPlayersServer(): Promise<FcSquadPlayer[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchFirstTeamSquadPlayersServer] API base URL not configured');
      return [];
    }

    const tenantId = getTenantId();
    const groupParams = new URLSearchParams({
      'slug.equals': FIRST_TEAM_SLUG,
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      size: '1',
    });

    const groupRes = await fetchWithJwtRetry(
      `${apiBase}/api/team-groups?${groupParams.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'first-team-group',
    );

    if (!groupRes.ok) {
      console.error('[fetchFirstTeamSquadPlayersServer] team-groups failed:', groupRes.status);
      return [];
    }

    const groups = asList<TeamGroupDTO>(await groupRes.json());
    const group = groups[0];
    if (!group?.id) {
      console.warn('[fetchFirstTeamSquadPlayersServer] No first-team group found');
      return [];
    }

    const memberParams = new URLSearchParams({
      'teamGroupId.equals': String(group.id),
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '100',
    });

    const memberRes = await fetchWithJwtRetry(
      `${apiBase}/api/team-members?${memberParams.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'first-team-members',
    );

    if (!memberRes.ok) {
      console.error('[fetchFirstTeamSquadPlayersServer] team-members failed:', memberRes.status);
      return [];
    }

    const members = asList<TeamMemberDTO>(await memberRes.json());
    return members
      .filter((m) => m.profileImageUrl && m.profileImageUrl.trim().length > 0)
      .map((m, index) => {
        const numFromJersey =
          m.jerseyNumber != null && Number.isFinite(m.jerseyNumber)
            ? String(m.jerseyNumber).padStart(2, '0')
            : String(index + 1).padStart(2, '0');
        const name =
          (m.title && m.title.trim()) ||
          [m.firstName, m.lastName].filter(Boolean).join(' ').trim() ||
          `Player ${numFromJersey}`;
        const role =
          (m.lineupSubtitle && m.lineupSubtitle.trim()) ||
          (m.designation && m.designation.trim()) ||
          'First Team';
        return {
          img: m.profileImageUrl!.trim(),
          num: numFromJersey,
          name,
          role,
        };
      });
  } catch (error) {
    console.error('[fetchFirstTeamSquadPlayersServer] Error:', error);
    return [];
  }
}

export type TeamMemberImageTitle = {
  id: number;
  title: string;
  designation: string;
  profileImageUrl: string;
};

export type LastMatchCard = {
  id: number;
  home: string;
  away: string;
  date: string;
  score: [string, string];
  league: string;
  title: string;
  homeName: string;
  awayName: string;
  matchKind: 'PAST' | 'UPCOMING';
};

/** Team names come from last_matches.title written as "Home vs Away". */
function splitMatchTitle(title: string): [string, string] {
  const parts = title.split(/\s+vs\.?\s+/i);
  return parts.length === 2 ? [parts[0].trim(), parts[1].trim()] : ['', ''];
}

/**
 * Raw team_members rows for display: profile image, title, designation (no UI copy).
 */
export async function fetchTeamMembersImageTitleServer(): Promise<TeamMemberImageTitle[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchTeamMembersImageTitleServer] API base URL not configured');
      return [];
    }

    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '100',
    });

    const res = await fetchWithJwtRetry(
      `${apiBase}/api/team-members?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'team-members-image-title',
    );

    if (!res.ok) {
      console.error('[fetchTeamMembersImageTitleServer] team-members failed:', res.status);
      return [];
    }

    const members = asList<TeamMemberDTO>(await res.json());
    return members
      .filter(
        (m) =>
          m.id != null &&
          m.profileImageUrl &&
          m.profileImageUrl.trim().length > 0 &&
          m.title &&
          m.title.trim().length > 0,
      )
      .map((m) => ({
        id: m.id as number,
        title: m.title!.trim(),
        designation: (m.designation && m.designation.trim()) || '',
        profileImageUrl: m.profileImageUrl!.trim(),
      }));
  } catch (error) {
    console.error('[fetchTeamMembersImageTitleServer] Error:', error);
    return [];
  }
}

/**
 * Homepage Last Match cards from last_matches (S3 logo URLs).
 * Includes PAST and UPCOMING; client toggle filters by matchKind.
 */
export async function fetchLastMatchesServer(): Promise<LastMatchCard[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchLastMatchesServer] API base URL not configured');
      return [];
    }

    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '50',
    });

    const res = await fetchWithJwtRetry(
      `${apiBase}/api/last-matches?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'last-matches',
    );

    if (!res.ok) {
      console.error('[fetchLastMatchesServer] last-matches failed:', res.status);
      return [];
    }

    const rows = asList<LastMatchDTO>(await res.json());
    return rows
      .filter(
        (m) =>
          m.id != null &&
          m.homeLogoUrl &&
          m.awayLogoUrl &&
          m.title &&
          m.matchDateLabel,
      )
      .map((m) => {
        const kindRaw = (m.matchKind || 'PAST').toUpperCase();
        const matchKind: 'PAST' | 'UPCOMING' = kindRaw === 'UPCOMING' ? 'UPCOMING' : 'PAST';
        const [homeName, awayName] = splitMatchTitle(m.title.trim());
        return {
          id: m.id as number,
          home: m.homeLogoUrl.trim(),
          away: m.awayLogoUrl.trim(),
          date: m.matchDateLabel.trim(),
          score: [String(m.homeScore), String(m.awayScore)] as [string, string],
          league: (m.leagueName && m.leagueName.trim()) || '',
          title: m.title.trim(),
          homeName,
          awayName,
          matchKind,
        };
      });
  } catch (error) {
    console.error('[fetchLastMatchesServer] Error:', error);
    return [];
  }
}

const MAX_HOMEPAGE_EVENTS = 6;

export type HomepageEventWithImage = { event: EventDetailsDTO; imageUrl: string | null };

/** `reachable` is false when event-details could not be loaded at all (backend down / misconfigured). */
export type HomepageEventList = {
  reachable: boolean;
  isUpcoming: boolean;
  items: HomepageEventWithImage[];
};

function localIsoDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/**
 * One row per recurring series (its next occurrence within a year); child occurrences dropped.
 * `keepFinishedSeries` keeps the stored date of a series with no next occurrence (past list).
 */
function collapseRecurringEvents(list: EventDetailsDTO[], keepFinishedSeries: boolean): EventDetailsDTO[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  oneYearFromNow.setHours(23, 59, 59, 999);

  const single: EventDetailsDTO[] = [];
  const series = new Map<unknown, EventDetailsDTO>();

  for (const event of list) {
    if (isRecurringEvent(event)) {
      const seriesId = event.recurrenceSeriesId || event.parentEventId || event.id;
      const next = getNextOccurrenceDate(event, today);
      if (!next) {
        if (keepFinishedSeries) single.push(event);
        continue;
      }
      if (next > oneYearFromNow) continue;
      const existing = series.get(seriesId);
      if (!existing || localIsoDate(next) < existing.startDate) {
        series.set(seriesId, { ...event, startDate: localIsoDate(next) });
      }
    } else if (!(event.recurrenceSeriesId || event.parentEventId)) {
      single.push(event);
    }
  }

  return [...single, ...series.values()];
}

async function resolveHomepageEventImageUrl(apiBase: string, tenantId: string, eventId: number): Promise<string | null> {
  for (const flag of ['isHomePageHeroImage', 'isHeroImage', 'isFeaturedEventImage']) {
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      'eventId.equals': String(eventId),
      [`${flag}.equals`]: 'true',
    });
    const res = await fetchWithJwtRetry(
      `${apiBase}/api/event-medias?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'homepage-event-media',
    );
    if (!res.ok) continue;
    const url = normalizeEventMediasList(await res.json()).map(mediaImageUrl).find(Boolean);
    if (url) return url;
  }
  return null;
}

/**
 * Same image resolution as the homepage event list (event_media hero / featured flags).
 * Used by /events catalog so cards match homepage for the same event_details row.
 */
export async function resolveEventImageUrlServer(eventId: number): Promise<string | null> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase || !eventId) return null;
    return await resolveHomepageEventImageUrl(apiBase, getTenantId(), eventId);
  } catch (error) {
    console.error('[resolveEventImageUrlServer] Error:', error);
    return null;
  }
}

export async function resolveEventImageUrlsServer(
  eventIds: number[],
): Promise<Record<number, string | null>> {
  const unique = [...new Set(eventIds.filter((id) => Number.isFinite(id)))];
  const entries = await Promise.all(
    unique.map(async (id) => [id, await resolveEventImageUrlServer(id)] as const),
  );
  return Object.fromEntries(entries);
}

/**
 * Homepage events list: active upcoming events (max 6); when none, past events (max 6).
 */
export async function fetchHomepageEventListServer(): Promise<HomepageEventList> {
  const unreachable: HomepageEventList = { reachable: false, isUpcoming: true, items: [] };
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchHomepageEventListServer] API base URL not configured');
      return unreachable;
    }

    const tenantId = getTenantId();
    const today = localIsoDate(new Date());

    const loadEvents = async (filters: Record<string, string>): Promise<EventDetailsDTO[] | null> => {
      const params = new URLSearchParams({
        'tenantId.equals': tenantId,
        'isActive.equals': 'true',
        page: '0',
        size: '15',
        ...filters,
      });
      const res = await fetchWithJwtRetry(
        `${apiBase}/api/event-details?${params.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
        'homepage-events',
      );
      if (!res.ok) {
        console.error('[fetchHomepageEventListServer] event-details failed:', res.status);
        return null;
      }
      return normalizeEventDetailsList(await res.json());
    };

    const upcoming = await loadEvents({ sort: 'startDate,asc', 'startDate.greaterThanOrEqual': today });
    if (!upcoming) return unreachable;

    let isUpcoming = true;
    let events = collapseRecurringEvents(upcoming, false)
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
      .slice(0, MAX_HOMEPAGE_EVENTS);

    if (events.length === 0) {
      isUpcoming = false;
      const past = await loadEvents({ sort: 'startDate,desc', 'endDate.lessThan': today });
      events = collapseRecurringEvents(past ?? [], true)
        .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
        .slice(0, MAX_HOMEPAGE_EVENTS);
    }

    const items = await Promise.all(
      events.map(async (event) => ({
        event,
        imageUrl:
          event.id != null
            ? await resolveHomepageEventImageUrl(apiBase, tenantId, event.id).catch(() => null)
            : null,
      })),
    );

    return { reachable: true, isUpcoming, items };
  } catch (error) {
    console.error('[fetchHomepageEventListServer] Error:', error);
    return unreachable;
  }
}

export type HomepageSponsor = {
  id: number | null;
  name: string;
  type: string;
  tagline: string;
  imageUrl: string;
  websiteHref: string | null;
};

function sponsorWebsiteHref(url?: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Active sponsors by priority (max 8). Image: SPONSOR_BANNER media → banner → hero → logo.
 */
export async function fetchHomepageSponsorsServer(): Promise<HomepageSponsor[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchHomepageSponsorsServer] API base URL not configured');
      return [];
    }

    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityRanking,asc',
      size: '8',
    });

    const res = await fetchWithJwtRetry(
      `${apiBase}/api/event-sponsors?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'homepage-sponsors',
    );

    if (!res.ok) {
      console.error('[fetchHomepageSponsorsServer] event-sponsors failed:', res.status);
      return [];
    }

    const sponsors = asList<EventSponsorsDTO>(await res.json()).slice(0, 8);

    const bannerUrl = async (sponsorId: number): Promise<string | undefined> => {
      try {
        const mediaParams = new URLSearchParams({
          'tenantId.equals': tenantId,
          'sponsorId.equals': String(sponsorId),
          'eventMediaType.equals': 'SPONSOR_BANNER',
          sort: 'priorityRanking,asc',
          size: '3',
        });
        const mediaRes = await fetchWithJwtRetry(
          `${apiBase}/api/event-medias?${mediaParams.toString()}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
          'homepage-sponsor-banner',
        );
        if (!mediaRes.ok) return undefined;
        return normalizeEventMediasList(await mediaRes.json()).map(mediaImageUrl).find(Boolean);
      } catch {
        return undefined;
      }
    };

    return Promise.all(
      sponsors.map(async (sp) => {
        const banner = sp.id != null ? await bannerUrl(sp.id) : undefined;
        return {
          id: sp.id ?? null,
          name: (sp.companyName || sp.name || '').trim(),
          type: (sp.type || '').trim(),
          tagline: (sp.tagline || '').trim(),
          imageUrl:
            banner ||
            usableImageUrl(sp.bannerImageUrl) ||
            usableImageUrl(sp.heroImageUrl) ||
            usableImageUrl(sp.logoUrl) ||
            '/images/default_placeholder_hero_image.jpeg',
          websiteHref: sponsorWebsiteHref(sp.websiteUrl),
        };
      }),
    );
  } catch (error) {
    console.error('[fetchHomepageSponsorsServer] Error:', error);
    return [];
  }
}

/** Active executive committee members by priority (max 6). */
export async function fetchExecutiveTeamServer(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchExecutiveTeamServer] API base URL not configured');
      return [];
    }

    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '6',
    });

    const res = await fetchWithJwtRetry(
      `${apiBase}/api/executive-committee-team-members?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'homepage-executive-team',
    );

    if (!res.ok) {
      console.error('[fetchExecutiveTeamServer] executive-committee-team-members failed:', res.status);
      return [];
    }

    return parseExecutiveCommitteeTeamMembersResponse(await res.json()).slice(0, 6);
  } catch (error) {
    console.error('[fetchExecutiveTeamServer] Error:', error);
    return [];
  }
}
