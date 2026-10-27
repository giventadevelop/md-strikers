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
import { HOMEPAGE_SPONSOR_LIMIT } from './homepageLimits';
import { buildSportProfiles, type SportProfileView } from './playerSportProfiles';

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

export type PublicRosterPlayer = {
  id: number;
  name: string;
  givenName: string;
  familyName: string;
  role: string;
  position: string;
  jersey: string;
  imageUrl: string;
};

export type PublicPlayerAchievement = {
  id: number;
  title: string;
  description: string;
  achievementDate: string;
  category: string;
  categoryLabel: string;
  issuer: string;
};

export type PublicAchievementGroup = {
  heading: string;
  items: PublicPlayerAchievement[];
};

export type PublicPlayerMatch = {
  dateLabel: string;
  opponent: string;
  competition: string;
  home: boolean;
  homeScore: number;
  awayScore: number;
  result: string;
  goals: number;
  assists: number;
  minutes: number;
  passAccuracy: number | null;
  kickoff: string;
};

export type PublicPlayerDetail = PublicRosterPlayer & {
  fullName: string;
  preferredName: string;
  bio: string;
  skills: string[];
  nationality: string;
  dateOfBirth: string;
  ageLabel: string;
  spokenLanguages: string;
  preferredFoot: string;
  heightLabel: string;
  weightLabel: string;
  bodyBuild: string;
  clubName: string;
  leagueDivision: string;
  secondaryPositions: string;
  seasonLabel: string;
  seasonAppearances: number | null;
  seasonGoals: number | null;
  seasonAssists: number | null;
  seasonMinutes: number | null;
  seasonWins: number | null;
  seasonDraws: number | null;
  seasonLosses: number | null;
  passAccuracy: number | null;
  shotAccuracy: number | null;
  topSpeedKmh: number | null;
  careerAppearances: number | null;
  careerGoals: number | null;
  careerAssists: number | null;
  gpaLabel: string;
  academicScore: string;
  coachName: string;
  coachEmail: string;
  coachPhone: string;
  joinDate: string;
  links: { label: string; href: string }[];
  achievements: PublicPlayerAchievement[];
  achievementGroups: PublicAchievementGroup[];
  matches: PublicPlayerMatch[];
  sports: SportProfileView[];
};

function playerName(member: TeamMemberDTO): string {
  const titled = member.title?.trim();
  if (titled) return titled;
  const joined = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
  return joined || 'Player';
}

function playerRole(member: TeamMemberDTO): string {
  return member.designation?.trim() || member.lineupSubtitle?.trim() || '';
}

function parseSkills(raw?: string): string[] {
  if (!raw?.trim()) return [];
  if (raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [raw.trim()];
    }
  }
  return raw
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function footLabel(value?: string): string {
  if (value === 'LEFT') return 'Left';
  if (value === 'RIGHT') return 'Right';
  if (value === 'BOTH') return 'Both';
  return '';
}

function formatIsoDate(value?: string): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function shortMatchDate(value?: string): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function finiteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ageLabel(value?: string): string {
  if (!value) return '';
  const dob = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age > 0 && age < 80 ? `${age} years` : '';
}

function detailName(member: TeamMemberDTO): string {
  const first = member.firstName?.trim() || '';
  const last = member.lastName?.trim() || '';
  const full = [first, last].filter(Boolean).join(' ');
  if (full && first.toLowerCase() !== 'player') return full;
  return member.preferredName?.trim() || playerName(member);
}

function parseMatches(raw?: string): PublicPlayerMatch[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      const opponent = String(row.opponent || '').trim();
      if (!opponent) return [];
      const result = String(row.result || '').trim().toUpperCase();
      return [
        {
          dateLabel: shortMatchDate(String(row.date || '')),
          opponent,
          competition: String(row.competition || '').trim(),
          home: row.home !== false,
          homeScore: finiteNumber(row.homeScore) ?? 0,
          awayScore: finiteNumber(row.awayScore) ?? 0,
          result: result === 'WIN' || result === 'LOSS' || result === 'DRAW' ? result : '',
          goals: finiteNumber(row.goals) ?? 0,
          assists: finiteNumber(row.assists) ?? 0,
          minutes: finiteNumber(row.minutes) ?? 0,
          passAccuracy: finiteNumber(row.passAccuracy),
          kickoff: String(row.kickoff || '').trim(),
        },
      ];
    });
  } catch {
    return [];
  }
}

async function loadFirstTeamGroupId(): Promise<number | null> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return null;
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
  if (!groupRes.ok) return null;
  const groups = asList<TeamGroupDTO>(await groupRes.json());
  return groups[0]?.id ?? null;
}

/** Active First Team roster for the public listing. */
export async function fetchPublicRosterServer(): Promise<PublicRosterPlayer[]> {
  try {
    const apiBase = getApiBaseUrl();
    const groupId = await loadFirstTeamGroupId();
    if (!apiBase || groupId == null) return [];
    const tenantId = getTenantId();
    const memberParams = new URLSearchParams({
      'teamGroupId.equals': String(groupId),
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '200',
    });
    const memberRes = await fetchWithJwtRetry(
      `${apiBase}/api/team-members?${memberParams.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'public-roster',
    );
    if (!memberRes.ok) return [];
    return asList<TeamMemberDTO>(await memberRes.json())
      .filter((member) => member.id != null)
      .map((member) => ({
        id: member.id as number,
        name: playerName(member),
        givenName: member.firstName?.trim() || '',
        familyName: member.lastName?.trim() || '',
        role: playerRole(member),
        position: member.position?.trim() || '',
        jersey:
          member.jerseyNumber != null && Number.isFinite(member.jerseyNumber) ? String(member.jerseyNumber) : '',
        imageUrl: member.profileImageUrl?.trim() || '',
      }));
  } catch (error) {
    console.error('[fetchPublicRosterServer] Error:', error);
    return [];
  }
}

const ACHIEVEMENT_SECTIONS: Record<string, { heading: string; order: number }> = {
  MEDAL: { heading: 'Medals', order: 1 },
  TROPHY: { heading: 'Trophies', order: 2 },
  RECOGNITION: { heading: 'Recognition', order: 3 },
  HONOR: { heading: 'Recognition', order: 3 },
  AWARD: { heading: 'Awards', order: 4 },
  CAP: { heading: 'Caps', order: 5 },
  OTHER: { heading: 'Other', order: 9 },
};

function readableCategory(code: string): string {
  const labels: Record<string, string> = {
    MEDAL: 'Medal',
    TROPHY: 'Trophy',
    RECOGNITION: 'Recognition',
    HONOR: 'Honor',
    AWARD: 'Award',
    CAP: 'Cap',
    OTHER: 'Other',
  };
  if (labels[code]) return labels[code];
  if (!code) return '';
  return code
    .toLowerCase()
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function groupAchievements(items: PublicPlayerAchievement[]): PublicAchievementGroup[] {
  const groups = new Map<string, PublicAchievementGroup & { order: number }>();
  for (const item of items) {
    const known = ACHIEVEMENT_SECTIONS[item.category];
    const heading = known?.heading || item.categoryLabel || 'Other';
    const order = known?.order ?? 8;
    const existing = groups.get(heading);
    if (existing) existing.items.push(item);
    else groups.set(heading, { heading, order, items: [item] });
  }
  return [...groups.values()].sort((a, b) => a.order - b.order).map(({ heading, items: rows }) => ({ heading, items: rows }));
}

export async function fetchPublicPlayerServer(id: number): Promise<PublicPlayerDetail | null> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase || !Number.isFinite(id)) return null;
    const tenantId = getTenantId();
    const res = await fetchWithJwtRetry(
      `${apiBase}/api/team-members/${id}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'public-player',
    );
    if (!res.ok) return null;
    const member = (await res.json()) as TeamMemberDTO;
    if (!member?.id || member.tenantId !== tenantId || member.isActive === false) return null;

    let achievements: PublicPlayerAchievement[] = [];
    const achievementParams = new URLSearchParams({
      'teamMemberId.equals': String(member.id),
      'tenantId.equals': tenantId,
      sort: 'displayOrder,asc',
      size: '100',
    });
    const [achievementRes, categoryRes] = await Promise.all([
      fetchWithJwtRetry(
        `${apiBase}/api/team-member-achievements?${achievementParams.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
        'public-player-achievements',
      ),
      fetchWithJwtRetry(
        `${apiBase}/api/achievement-categories?size=500&sort=sortOrder,asc`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
          cache: 'no-store',
        },
        'public-achievement-categories',
      ),
    ]);
    const categoryLabels = new Map<string, string>();
    if (categoryRes.ok) {
      const rows = asList<{ code?: string; label?: string; tenantId?: string | null }>(await categoryRes.json());
      for (const row of rows) {
        const code = row.code?.trim();
        const label = row.label?.trim();
        if (!code || !label) continue;
        if (!categoryLabels.has(code) || row.tenantId === tenantId) categoryLabels.set(code, label);
      }
    }
    if (achievementRes.ok) {
      achievements = asList<{
        id?: number;
        title?: string;
        description?: string;
        achievementDate?: string;
        category?: string;
        issuer?: string;
      }>(await achievementRes.json())
        .filter((row) => row.id != null && row.title?.trim())
        .map((row) => {
          const category = row.category?.trim() || '';
          return {
            id: row.id as number,
            title: row.title!.trim(),
            description: row.description?.trim() || '',
            achievementDate: formatIsoDate(row.achievementDate),
            category,
            categoryLabel: categoryLabels.get(category) || readableCategory(category),
            issuer: row.issuer?.trim() || '',
          };
        });
    }
    const achievementGroups = groupAchievements(achievements);

    const links = [
      member.instagramUrl?.trim() ? { label: 'Instagram', href: member.instagramUrl.trim() } : null,
      member.linkedinUrl?.trim() ? { label: 'LinkedIn', href: member.linkedinUrl.trim() } : null,
      member.twitterUrl?.trim() ? { label: 'X', href: member.twitterUrl.trim() } : null,
      member.websiteUrl?.trim() ? { label: 'Website', href: member.websiteUrl.trim() } : null,
    ].filter((link): link is { label: string; href: string } => link != null);

    const heightCm = finiteNumber(member.heightCm);
    const weightKg = finiteNumber(member.weightKg);
    const gpa = finiteNumber(member.gpa);
    const fullName = [member.firstName, member.lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ');

    return {
      id: member.id,
      name: detailName(member),
      givenName: member.firstName?.trim() || '',
      familyName: member.lastName?.trim() || '',
      fullName: fullName && member.firstName?.trim().toLowerCase() !== 'player' ? fullName : detailName(member),
      preferredName: member.preferredName?.trim() || '',
      role: playerRole(member),
      position: member.position?.trim() || '',
      jersey:
        member.jerseyNumber != null && Number.isFinite(member.jerseyNumber) ? String(member.jerseyNumber) : '',
      imageUrl: member.profileImageUrl?.trim() || '',
      bio: member.bio?.trim() || '',
      skills: parseSkills(member.expertise),
      nationality: member.nationality?.trim() || '',
      dateOfBirth: formatIsoDate(member.dateOfBirth),
      ageLabel: ageLabel(member.dateOfBirth),
      spokenLanguages: member.spokenLanguages?.trim() || '',
      preferredFoot: footLabel(member.preferredFoot),
      heightLabel: heightCm != null ? `${(heightCm / 100).toFixed(2)} m` : '',
      weightLabel: weightKg != null ? `${weightKg} kg` : '',
      bodyBuild: member.bodyBuild?.trim() || '',
      clubName: member.clubName?.trim() || '',
      leagueDivision: member.leagueDivision?.trim() || '',
      secondaryPositions: member.secondaryPositions?.trim() || '',
      seasonLabel: member.seasonLabel?.trim() || '',
      seasonAppearances: finiteNumber(member.seasonAppearances),
      seasonGoals: finiteNumber(member.seasonGoals),
      seasonAssists: finiteNumber(member.seasonAssists),
      seasonMinutes: finiteNumber(member.seasonMinutes),
      seasonWins: finiteNumber(member.seasonWins),
      seasonDraws: finiteNumber(member.seasonDraws),
      seasonLosses: finiteNumber(member.seasonLosses),
      passAccuracy: finiteNumber(member.passAccuracyPct),
      shotAccuracy: finiteNumber(member.shotAccuracyPct),
      topSpeedKmh: finiteNumber(member.topSpeedKmh),
      careerAppearances: finiteNumber(member.careerAppearances),
      careerGoals: finiteNumber(member.careerGoals),
      careerAssists: finiteNumber(member.careerAssists),
      gpaLabel: gpa != null ? gpa.toFixed(2) : '',
      academicScore: member.academicScore?.trim() || '',
      coachName: member.coachName?.trim() || '',
      coachEmail: member.coachEmail?.trim() || '',
      coachPhone: member.coachPhone?.trim() || '',
      joinDate: formatIsoDate(member.joinDate),
      links,
      achievements,
      achievementGroups,
      matches: parseMatches(member.recentMatches),
      sports: buildSportProfiles(member.sportProfiles, {
        position: member.position?.trim() || '',
        secondaryPositions: member.secondaryPositions?.trim() || '',
        jersey:
          member.jerseyNumber != null && Number.isFinite(member.jerseyNumber) ? String(member.jerseyNumber) : '',
        seasonLabel: member.seasonLabel?.trim() || '',
        seasonWins: finiteNumber(member.seasonWins),
        seasonLosses: finiteNumber(member.seasonLosses),
        seasonDraws: finiteNumber(member.seasonDraws),
        seasonGoals: finiteNumber(member.seasonGoals),
        seasonAssists: finiteNumber(member.seasonAssists),
        seasonAppearances: finiteNumber(member.seasonAppearances),
        seasonMinutes: finiteNumber(member.seasonMinutes),
        passAccuracy: finiteNumber(member.passAccuracyPct),
        shotAccuracy: finiteNumber(member.shotAccuracyPct),
        topSpeedKmh: finiteNumber(member.topSpeedKmh),
        careerAppearances: finiteNumber(member.careerAppearances),
        careerGoals: finiteNumber(member.careerGoals),
        careerAssists: finiteNumber(member.careerAssists),
        preferredFoot: footLabel(member.preferredFoot),
        bodyBuild: member.bodyBuild?.trim() || '',
        leagueDivision: member.leagueDivision?.trim() || '',
        role: playerRole(member),
        dateOfBirth: formatIsoDate(member.dateOfBirth),
        spokenLanguages: member.spokenLanguages?.trim() || '',
        gpaLabel: gpa != null ? gpa.toFixed(2) : '',
        academicScore: member.academicScore?.trim() || '',
        coachName: member.coachName?.trim() || '',
        coachPhone: member.coachPhone?.trim() || '',
        skills: parseSkills(member.expertise),
        matches: parseMatches(member.recentMatches),
      }),
    };
  } catch (error) {
    console.error('[fetchPublicPlayerServer] Error:', error);
    return null;
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
    const pageSize = 100;
    const maxRows = 400;
    const rows: LastMatchDTO[] = [];
    let page = 0;
    let total = Number.POSITIVE_INFINITY;
    while (rows.length < maxRows && rows.length < total && page < 10) {
      const params = new URLSearchParams({
        'tenantId.equals': tenantId,
        'isActive.equals': 'true',
        sort: 'priorityOrder,asc',
        page: String(page),
        size: String(pageSize),
      });
      const res = await fetchWithJwtRetry(
        `${apiBase}/api/last-matches?${params.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
        'last-matches',
      );
      if (!res.ok) {
        console.error('[fetchLastMatchesServer] last-matches failed:', res.status);
        if (page === 0) return [];
        break;
      }
      const reported = Number.parseInt(res.headers.get('x-total-count') || '', 10);
      if (Number.isFinite(reported)) total = reported;
      const batch = asList<LastMatchDTO>(await res.json());
      rows.push(...batch);
      if (batch.length < pageSize) break;
      page += 1;
    }
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

export type SponsorsCatalogResult = {
  sponsors: HomepageSponsor[];
  totalCount: number;
};

/**
 * Active sponsors by priority, one page at a time.
 * Image: SPONSOR_BANNER media → banner → hero → logo.
 */
export async function fetchSponsorsCatalogServer(input: {
  page: number;
  size: number;
  name?: string;
}): Promise<SponsorsCatalogResult> {
  const empty: SponsorsCatalogResult = { sponsors: [], totalCount: 0 };
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchSponsorsCatalogServer] API base URL not configured');
      return empty;
    }

    const page = Math.max(0, input.page);
    const size = Math.max(1, input.size);
    const tenantId = getTenantId();
    const params = new URLSearchParams({
      'tenantId.equals': tenantId,
      'isActive.equals': 'true',
      sort: 'priorityRanking,asc',
      page: String(page),
      size: String(size),
    });
    const name = input.name?.trim();
    if (name) params.append('name.contains', name);

    const res = await fetchWithJwtRetry(
      `${apiBase}/api/event-sponsors?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      'sponsors-catalog',
    );

    if (!res.ok) {
      console.error('[fetchSponsorsCatalogServer] event-sponsors failed:', res.status);
      return empty;
    }

    const totalHeader = res.headers.get('x-total-count');
    const sponsors = asList<EventSponsorsDTO>(await res.json());
    const totalCount = totalHeader ? parseInt(totalHeader, 10) : sponsors.length;

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
          'sponsor-banner',
        );
        if (!mediaRes.ok) return undefined;
        return normalizeEventMediasList(await mediaRes.json()).map(mediaImageUrl).find(Boolean);
      } catch {
        return undefined;
      }
    };

    const mapped = await Promise.all(
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

    return {
      sponsors: mapped,
      totalCount: Number.isFinite(totalCount) ? totalCount : mapped.length,
    };
  } catch (error) {
    console.error('[fetchSponsorsCatalogServer] Error:', error);
    return empty;
  }
}

/**
 * Active sponsors for the homepage. Never returns more than HOMEPAGE_SPONSOR_LIMIT.
 */
export async function fetchHomepageSponsorsServer(
  limit = HOMEPAGE_SPONSOR_LIMIT,
): Promise<HomepageSponsor[]> {
  const capped = Math.min(Math.max(1, limit), HOMEPAGE_SPONSOR_LIMIT);
  const { sponsors } = await fetchSponsorsCatalogServer({ page: 0, size: capped });
  return sponsors.slice(0, HOMEPAGE_SPONSOR_LIMIT);
}

/** Active executive committee (organization committee) members by priority. */
export async function fetchExecutiveTeamServer(size = 6): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error('[fetchExecutiveTeamServer] API base URL not configured');
      return [];
    }

    const pageSize = Math.min(size, 100);
    const rows: ExecutiveCommitteeTeamMemberDTO[] = [];
    let page = 0;
    let total = Number.POSITIVE_INFINITY;
    while (rows.length < size && rows.length < total && page < 10) {
      const params = new URLSearchParams({
        'tenantId.equals': getTenantId(),
        'isActive.equals': 'true',
        sort: 'priorityOrder,asc',
        page: String(page),
        size: String(pageSize),
      });
      const res = await fetchWithJwtRetry(
        `${apiBase}/api/executive-committee-team-members?${params.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
        'homepage-executive-team',
      );
      if (!res.ok) {
        console.error('[fetchExecutiveTeamServer] executive-committee-team-members failed:', res.status);
        if (page === 0) return [];
        break;
      }
      const reported = Number.parseInt(res.headers.get('x-total-count') || '', 10);
      if (Number.isFinite(reported)) total = reported;
      const batch = parseExecutiveCommitteeTeamMembersResponse(await res.json());
      rows.push(...batch);
      if (batch.length < pageSize) break;
      page += 1;
    }

    return rows.slice(0, size);
  } catch (error) {
    console.error('[fetchExecutiveTeamServer] Error:', error);
    return [];
  }
}
