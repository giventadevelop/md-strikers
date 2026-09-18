'use server';

import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { LastMatchDTO, TeamGroupDTO, TeamMemberDTO } from '@/types';
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
  matchKind: 'PAST' | 'UPCOMING';
};

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
        return {
          id: m.id as number,
          home: m.homeLogoUrl.trim(),
          away: m.awayLogoUrl.trim(),
          date: m.matchDateLabel.trim(),
          score: [String(m.homeScore), String(m.awayScore)] as [string, string],
          league: (m.leagueName && m.leagueName.trim()) || '',
          title: m.title.trim(),
          matchKind,
        };
      });
  } catch (error) {
    console.error('[fetchLastMatchesServer] Error:', error);
    return [];
  }
}
