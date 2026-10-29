/**
 * One-off seed: four published leagues for tenant md_strikers_10.
 * Safe to re-run — skips a league when its slug already exists.
 */
const BASE = 'http://localhost:3005/api/proxy';
const TENANT = 'md_strikers_10';

const VENUES = [
  'Maryland SoccerPlex, Germantown',
  'Othello Regional Park',
  'Paint Branch Turf',
  'Cedar Lane Park',
  'Burke Lake Park',
  'Ridgley Park',
];

const leagues = [
  {
    name: 'Fall Cup 2024',
    slug: 'fall-cup-2024',
    seasonLabel: 'Fall 2024',
    description: 'Completed fall cup for Maryland Strikers and DMV clubs.',
    startDate: '2024-09-07',
    endDate: '2024-11-16',
    status: 'COMPLETED',
    homepageDisplayOrder: 3,
    clubs: [
      ['Maryland Strikers', 'MDS', true],
      ['Capital United', 'CAP', false],
      ['Frederick Royals', 'FRD', false],
      ['Germantown FC', 'GER', false],
      ['Baltimore Malayalees', 'BAL', false],
      ['Rockville Athletic', 'ROC', false],
    ],
    matches: [
      ['Maryland Strikers', 'Capital United', 3, 1, '2024-09-14T18:00:00Z', 'PLAYED'],
      ['Frederick Royals', 'Germantown FC', 1, 0, '2024-09-14T20:00:00Z', 'PLAYED'],
      ['Baltimore Malayalees', 'Rockville Athletic', 1, 2, '2024-09-15T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Frederick Royals', 2, 0, '2024-09-21T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Germantown FC', 1, 1, '2024-09-21T20:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Germantown FC', 4, 1, '2024-09-28T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Baltimore Malayalees', 3, 0, '2024-09-28T20:00:00Z', 'PLAYED'],
      ['Frederick Royals', 'Rockville Athletic', 1, 0, '2024-10-05T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Baltimore Malayalees', 2, 2, '2024-10-12T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Frederick Royals', 2, 1, '2024-10-12T20:00:00Z', 'PLAYED'],
      ['Germantown FC', 'Rockville Athletic', 0, 0, '2024-10-19T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Rockville Athletic', 3, 0, '2024-10-26T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Rockville Athletic', 2, 0, '2024-11-02T18:00:00Z', 'PLAYED'],
      ['Frederick Royals', 'Baltimore Malayalees', 2, 2, '2024-11-02T20:00:00Z', 'PLAYED'],
      ['Germantown FC', 'Baltimore Malayalees', 2, 1, '2024-11-09T18:00:00Z', 'PLAYED'],
    ],
  },
  {
    name: 'Spring League 2025',
    slug: 'spring-league-2025',
    seasonLabel: 'Spring 2025',
    description: 'Completed spring league. Howard County United finished first.',
    startDate: '2025-03-01',
    endDate: '2025-05-24',
    status: 'COMPLETED',
    homepageDisplayOrder: 2,
    clubs: [
      ['Maryland Strikers', 'MDS', true],
      ['Howard County United', 'HOW', false],
      ['Annapolis Mariners', 'ANN', false],
      ['Silver Spring FC', 'SIL', false],
      ['Columbia Athletic', 'COL', false],
      ['Laurel FC', 'LAU', false],
    ],
    matches: [
      ['Howard County United', 'Maryland Strikers', 2, 1, '2025-03-08T18:00:00Z', 'PLAYED'],
      ['Annapolis Mariners', 'Silver Spring FC', 1, 1, '2025-03-08T20:00:00Z', 'PLAYED'],
      ['Columbia Athletic', 'Laurel FC', 0, 1, '2025-03-09T18:00:00Z', 'PLAYED'],
      ['Howard County United', 'Annapolis Mariners', 3, 0, '2025-03-15T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Silver Spring FC', 3, 1, '2025-03-15T20:00:00Z', 'PLAYED'],
      ['Howard County United', 'Silver Spring FC', 2, 1, '2025-03-22T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Annapolis Mariners', 2, 0, '2025-03-22T20:00:00Z', 'PLAYED'],
      ['Howard County United', 'Columbia Athletic', 4, 0, '2025-03-29T18:00:00Z', 'PLAYED'],
      ['Annapolis Mariners', 'Laurel FC', 0, 0, '2025-03-29T20:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Columbia Athletic', 2, 2, '2025-04-05T18:00:00Z', 'PLAYED'],
      ['Silver Spring FC', 'Laurel FC', 1, 1, '2025-04-05T20:00:00Z', 'PLAYED'],
      ['Howard County United', 'Laurel FC', 1, 0, '2025-04-12T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Laurel FC', 1, 0, '2025-04-19T18:00:00Z', 'PLAYED'],
      ['Annapolis Mariners', 'Columbia Athletic', 2, 1, '2025-04-26T18:00:00Z', 'PLAYED'],
      ['Silver Spring FC', 'Columbia Athletic', 2, 0, '2025-05-03T18:00:00Z', 'PLAYED'],
    ],
  },
  {
    name: 'Fall League 2026',
    slug: 'fall-league-2026',
    seasonLabel: 'Fall 2026',
    description: 'Current season. Eight matches played, seven still to come.',
    startDate: '2026-09-05',
    endDate: '2026-12-12',
    status: 'ACTIVE',
    homepageDisplayOrder: 0,
    clubs: [
      ['Maryland Strikers', 'MDS', true],
      ['Capital United', 'CAP', false],
      ['Frederick Royals', 'FRD', false],
      ['Germantown FC', 'GER', false],
      ['Baltimore Malayalees', 'BAL', false],
      ['Rockville Athletic', 'ROC', false],
    ],
    matches: [
      ['Maryland Strikers', 'Capital United', 2, 1, '2026-09-12T18:00:00Z', 'PLAYED'],
      ['Frederick Royals', 'Rockville Athletic', 2, 1, '2026-09-12T20:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Frederick Royals', 1, 1, '2026-09-19T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Baltimore Malayalees', 1, 1, '2026-09-19T20:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Germantown FC', 3, 0, '2026-09-26T18:00:00Z', 'PLAYED'],
      ['Baltimore Malayalees', 'Rockville Athletic', 0, 2, '2026-10-03T18:00:00Z', 'PLAYED'],
      ['Capital United', 'Frederick Royals', 2, 0, '2026-10-10T18:00:00Z', 'PLAYED'],
      ['Germantown FC', 'Baltimore Malayalees', 1, 0, '2026-10-17T18:00:00Z', 'PLAYED'],
      ['Maryland Strikers', 'Baltimore Malayalees', null, null, '2026-11-07T18:00:00Z', 'SCHEDULED'],
      ['Capital United', 'Germantown FC', null, null, '2026-11-07T20:00:00Z', 'SCHEDULED'],
      ['Frederick Royals', 'Germantown FC', null, null, '2026-11-14T18:00:00Z', 'SCHEDULED'],
      ['Maryland Strikers', 'Rockville Athletic', null, null, '2026-11-14T20:00:00Z', 'SCHEDULED'],
      ['Capital United', 'Rockville Athletic', null, null, '2026-11-21T18:00:00Z', 'SCHEDULED'],
      ['Frederick Royals', 'Baltimore Malayalees', null, null, '2026-11-28T18:00:00Z', 'SCHEDULED'],
      ['Germantown FC', 'Rockville Athletic', null, null, '2026-12-05T18:00:00Z', 'SCHEDULED'],
    ],
  },
  {
    name: 'Spring League 2027',
    slug: 'spring-league-2027',
    seasonLabel: 'Spring 2027',
    description: 'Upcoming season. Fixtures are set and no matches have been played.',
    startDate: '2027-03-06',
    endDate: '2027-05-22',
    status: 'UPCOMING',
    homepageDisplayOrder: 1,
    clubs: [
      ['Maryland Strikers', 'MDS', true],
      ['Capital United', 'CAP', false],
      ['Howard County United', 'HOW', false],
      ['Frederick Royals', 'FRD', false],
      ['Germantown FC', 'GER', false],
      ['Annapolis Mariners', 'ANN', false],
    ],
    matches: [
      ['Maryland Strikers', 'Howard County United', null, null, '2027-03-13T18:00:00Z', 'SCHEDULED'],
      ['Capital United', 'Frederick Royals', null, null, '2027-03-13T20:00:00Z', 'SCHEDULED'],
      ['Germantown FC', 'Annapolis Mariners', null, null, '2027-03-14T18:00:00Z', 'SCHEDULED'],
      ['Maryland Strikers', 'Annapolis Mariners', null, null, '2027-03-27T18:00:00Z', 'SCHEDULED'],
      ['Howard County United', 'Frederick Royals', null, null, '2027-04-03T18:00:00Z', 'SCHEDULED'],
      ['Capital United', 'Germantown FC', null, null, '2027-04-10T18:00:00Z', 'SCHEDULED'],
    ],
  },
];

async function api(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': options.method === 'PATCH' ? 'application/merge-patch+json' : 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`${options.method || 'GET'} ${path} ${response.status} ${detail.slice(0, 600)}`);
  }
  return data;
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

async function enableHomepageFlag() {
  const existing = asList(await api('/tenant-settings?size=5'));
  const settings = existing.find((row) => row.tenantId === TENANT) || existing[0];
  if (!settings?.id) {
    console.warn('No tenant settings row found; homepage flag was not updated.');
    return;
  }
  if (settings.showLeagueStandingsSectionInHomePage === true) {
    console.log(`Tenant settings ${settings.id} already show league tables on the homepage.`);
    return;
  }
  await api(`/tenant-settings/${settings.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      id: settings.id,
      tenantId: TENANT,
      showLeagueStandingsSectionInHomePage: true,
    }),
  });
  console.log(`Turned on showLeagueStandingsSectionInHomePage for settings ${settings.id}.`);
}

async function seedLeague(spec) {
  const league = await api('/leagues', {
    method: 'POST',
    body: JSON.stringify({
      tenantId: TENANT,
      name: spec.name,
      slug: spec.slug,
      seasonLabel: spec.seasonLabel,
      description: spec.description,
      startDate: spec.startDate,
      endDate: spec.endDate,
      status: spec.status,
      isPublished: true,
      showOnHomepage: true,
      homepageDisplayOrder: spec.homepageDisplayOrder,
      standingsSource: 'CALCULATED',
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    }),
  });
  const leagueId = league.id;
  if (!leagueId) throw new Error(`League ${spec.slug} was created without an id.`);

  const clubIds = new Map();
  for (let index = 0; index < spec.clubs.length; index += 1) {
    const [name, shortName, isHomeClub] = spec.clubs[index];
    const club = await api('/league-clubs', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: TENANT,
        leagueId,
        name,
        shortName,
        isHomeClub,
        displayOrder: index,
      }),
    });
    clubIds.set(name, club.id);
  }

  for (let index = 0; index < spec.matches.length; index += 1) {
    const [home, away, homeScore, awayScore, playedAt, status] = spec.matches[index];
    await api('/league-matches', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: TENANT,
        leagueId,
        homeClubId: clubIds.get(home),
        awayClubId: clubIds.get(away),
        homeScore,
        awayScore,
        playedAt,
        status,
        venue: VENUES[index % VENUES.length],
      }),
    });
  }

  const table = asList(await api(`/leagues/${leagueId}/standings-table`));
  console.log(
    `${spec.status} ${spec.name} (#${leagueId}): ${table
      .map((row) => `${row.position}. ${row.clubName} ${row.points}pts`)
      .join(' | ')}`,
  );
}

const existing = asList(await api('/leagues?size=50'));
const existingSlugs = new Set(existing.map((league) => league.slug));
for (const spec of leagues) {
  if (existingSlugs.has(spec.slug)) {
    console.log(`Skip ${spec.slug}; it already exists.`);
    continue;
  }
  await seedLeague(spec);
}
await enableHomepageFlag();
