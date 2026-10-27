export type SportId =
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'tennis-squash'
  | 'badminton'
  | 'table-tennis'
  | 'golf';

export type SportMatchView = {
  dateLabel: string;
  opponent: string;
  home: boolean;
  homeScore: number;
  awayScore: number;
  result: string;
  kickoff: string;
  cells: [string, string, string, string];
};

export type SportProfileView = {
  id: SportId;
  label: string;
  available: boolean;
  positionLine: string;
  jersey: string;
  seasonLabel: string;
  wins: number | null;
  losses: number | null;
  winRateLabel: string;
  axes: { label: string; value: number; display: string }[];
  tableHeaders: [string, string, string, string];
  matches: SportMatchView[];
  personal: string;
  physical: string;
  team: string;
  academics: string;
  seasonLine: string;
  careerLine: string;
  skills: string[];
};

type AxisSpec = { key: string; label: string; ceiling?: number; percent?: boolean };
type TableSpec = { key: string; label: string; digits?: number };

const SPORT_ORDER: SportId[] = [
  'cricket',
  'football',
  'basketball',
  'volleyball',
  'tennis-squash',
  'badminton',
  'table-tennis',
  'golf',
];

/** Sports shown when a member has no saved category list yet. */
const LEGACY_SPORT_ORDER: SportId[] = ['football', 'volleyball', 'basketball', 'cricket', 'badminton'];

const EXTRA_SPORTS: Record<Exclude<SportId, 'football'>, { label: string; axes: AxisSpec[]; table: TableSpec[] }> = {
  volleyball: {
    label: 'Volleyball',
    axes: [
      { key: 'kills', label: 'Kills', ceiling: 220 },
      { key: 'aces', label: 'Aces', ceiling: 40 },
      { key: 'blocks', label: 'Blocks', ceiling: 60 },
      { key: 'digs', label: 'Digs', ceiling: 180 },
      { key: 'attackPct', label: 'Attack%', percent: true },
      { key: 'servePct', label: 'Serve%', percent: true },
    ],
    table: [
      { key: 'kills', label: 'K' },
      { key: 'aces', label: 'Ace' },
      { key: 'blocks', label: 'Blk' },
      { key: 'digs', label: 'Dig' },
    ],
  },
  basketball: {
    label: 'Basketball',
    axes: [
      { key: 'points', label: 'Points', ceiling: 28 },
      { key: 'rebounds', label: 'Boards', ceiling: 14 },
      { key: 'assists', label: 'Assists', ceiling: 10 },
      { key: 'steals', label: 'Steals', ceiling: 4 },
      { key: 'fieldGoalPct', label: 'FG%', percent: true },
      { key: 'threePointPct', label: '3P%', percent: true },
    ],
    table: [
      { key: 'points', label: 'PTS' },
      { key: 'rebounds', label: 'REB' },
      { key: 'assists', label: 'AST' },
      { key: 'steals', label: 'STL' },
    ],
  },
  cricket: {
    label: 'Cricket',
    axes: [
      { key: 'runs', label: 'Runs', ceiling: 400 },
      { key: 'wickets', label: 'Wickets', ceiling: 16 },
      { key: 'catches', label: 'Catches', ceiling: 10 },
      { key: 'average', label: 'Avg', ceiling: 50 },
      { key: 'strikeRate', label: 'SR', ceiling: 160 },
      { key: 'economy', label: 'Econ', ceiling: 8 },
    ],
    table: [
      { key: 'runs', label: 'R' },
      { key: 'wickets', label: 'W' },
      { key: 'catches', label: 'Ct' },
      { key: 'economy', label: 'Econ', digits: 1 },
    ],
  },
  badminton: {
    label: 'Badminton',
    axes: [
      { key: 'points', label: 'Points', ceiling: 42 },
      { key: 'winners', label: 'Winners', ceiling: 24 },
      { key: 'smashes', label: 'Smashes', ceiling: 18 },
      { key: 'netPoints', label: 'Net', ceiling: 12 },
      { key: 'rallyWinPct', label: 'Rally%', percent: true },
      { key: 'errors', label: 'Errors', ceiling: 16 },
    ],
    table: [
      { key: 'points', label: 'Pts' },
      { key: 'winners', label: 'W' },
      { key: 'smashes', label: 'Sm' },
      { key: 'errors', label: 'Err' },
    ],
  },
  'tennis-squash': {
    label: 'Tennis & Squash',
    axes: [
      { key: 'wins', label: 'Wins', ceiling: 20 },
      { key: 'losses', label: 'Losses', ceiling: 20 },
      { key: 'aces', label: 'Aces', ceiling: 40 },
      { key: 'winners', label: 'Winners', ceiling: 30 },
      { key: 'firstServePct', label: '1st%', percent: true },
      { key: 'winPct', label: 'Win%', percent: true },
    ],
    table: [
      { key: 'aces', label: 'Ace' },
      { key: 'winners', label: 'W' },
      { key: 'wins', label: 'Win' },
      { key: 'losses', label: 'Loss' },
    ],
  },
  'table-tennis': {
    label: 'Table Tennis',
    axes: [
      { key: 'wins', label: 'Wins', ceiling: 20 },
      { key: 'losses', label: 'Losses', ceiling: 20 },
      { key: 'points', label: 'Points', ceiling: 40 },
      { key: 'winners', label: 'Winners', ceiling: 24 },
      { key: 'rallyWinPct', label: 'Rally%', percent: true },
      { key: 'winPct', label: 'Win%', percent: true },
    ],
    table: [
      { key: 'points', label: 'Pts' },
      { key: 'winners', label: 'W' },
      { key: 'wins', label: 'Win' },
      { key: 'losses', label: 'Loss' },
    ],
  },
  golf: {
    label: 'Golf',
    axes: [
      { key: 'rounds', label: 'Rounds', ceiling: 20 },
      { key: 'birdies', label: 'Birdies', ceiling: 20 },
      { key: 'pars', label: 'Pars', ceiling: 40 },
      { key: 'eagles', label: 'Eagles', ceiling: 6 },
      { key: 'fairwayPct', label: 'Fairway%', percent: true },
      { key: 'girPct', label: 'GIR%', percent: true },
    ],
    table: [
      { key: 'score', label: 'Scr' },
      { key: 'birdies', label: 'Bird' },
      { key: 'pars', label: 'Par' },
      { key: 'eagles', label: 'Egl' },
    ],
  },
};

function finiteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCount(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatRate(value: number | null): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

function scaleStat(value: number | null, ceiling: number): number {
  if (value == null || ceiling <= 0) return 0;
  return Math.max(0, Math.min(100, (value / ceiling) * 100));
}

function shortMatchDate(value?: string): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function cellValue(raw: unknown, digits = 0): string {
  const value = finiteNumber(raw);
  if (value == null) return '—';
  return digits > 0 ? value.toFixed(digits) : formatCount(value);
}

function winRateLabel(wins: number | null, losses: number | null, draws: number | null): string {
  const played = (wins ?? 0) + (losses ?? 0) + (draws ?? 0);
  if (played <= 0 || wins == null) return '—';
  return `${((wins / played) * 100).toFixed(1)}%`;
}

export type FootballSportInput = {
  position: string;
  secondaryPositions: string;
  jersey: string;
  seasonLabel: string;
  seasonWins: number | null;
  seasonLosses: number | null;
  seasonDraws: number | null;
  seasonGoals: number | null;
  seasonAssists: number | null;
  seasonAppearances: number | null;
  seasonMinutes: number | null;
  passAccuracy: number | null;
  shotAccuracy: number | null;
  topSpeedKmh: number | null;
  careerAppearances: number | null;
  careerGoals: number | null;
  careerAssists: number | null;
  preferredFoot: string;
  bodyBuild: string;
  leagueDivision: string;
  role: string;
  dateOfBirth: string;
  spokenLanguages: string;
  gpaLabel: string;
  academicScore: string;
  coachName: string;
  coachPhone: string;
  skills: string[];
  matches: {
    dateLabel: string;
    opponent: string;
    home: boolean;
    homeScore: number;
    awayScore: number;
    result: string;
    kickoff: string;
    goals: number;
    assists: number;
    minutes: number;
    passAccuracy: number | null;
  }[];
};

function footballView(player: FootballSportInput): SportProfileView {
  return {
    id: 'football',
    label: 'Football (Soccer)',
    available: true,
    positionLine: [player.position, player.secondaryPositions].filter(Boolean).join(' · '),
    jersey: player.jersey,
    seasonLabel: player.seasonLabel,
    wins: player.seasonWins,
    losses: player.seasonLosses,
    winRateLabel: winRateLabel(player.seasonWins, player.seasonLosses, player.seasonDraws),
    axes: [
      { label: 'Goals', value: scaleStat(player.seasonGoals, 22), display: formatCount(player.seasonGoals) },
      { label: 'Assists', value: scaleStat(player.seasonAssists, 14), display: formatCount(player.seasonAssists) },
      { label: 'Apps', value: scaleStat(player.seasonAppearances, 20), display: formatCount(player.seasonAppearances) },
      { label: 'Pass%', value: player.passAccuracy ?? 0, display: formatRate(player.passAccuracy) },
      { label: 'Shot%', value: player.shotAccuracy ?? 0, display: formatRate(player.shotAccuracy) },
      {
        label: 'Pace',
        value: scaleStat(player.topSpeedKmh, 36),
        display: player.topSpeedKmh != null ? player.topSpeedKmh.toFixed(1) : '—',
      },
    ],
    tableHeaders: ['G', 'A', 'MIN', 'Pass'],
    matches: player.matches.map((match) => ({
      dateLabel: match.dateLabel,
      opponent: match.opponent,
      home: match.home,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      result: match.result,
      kickoff: match.kickoff,
      cells: [
        formatCount(match.goals),
        formatCount(match.assists),
        formatCount(match.minutes),
        match.passAccuracy != null ? match.passAccuracy.toFixed(0) : '—',
      ],
    })),
    personal: [player.dateOfBirth && `Born ${player.dateOfBirth}`, player.spokenLanguages && `Languages ${player.spokenLanguages}`, player.jersey && `Jersey ${player.jersey}`]
      .filter(Boolean)
      .join(' · '),
    physical: [player.preferredFoot && `${player.preferredFoot} foot`, player.bodyBuild, player.topSpeedKmh != null && `${player.topSpeedKmh.toFixed(1)} km/h`]
      .filter(Boolean)
      .join(' · '),
    team: [player.leagueDivision, player.role, player.position].filter(Boolean).join(' · '),
    academics: [player.gpaLabel && `GPA ${player.gpaLabel}`, player.academicScore, player.coachName, player.coachPhone]
      .filter(Boolean)
      .join(' · '),
    seasonLine: `Season ${player.seasonLabel || '—'} · ${formatCount(player.seasonAppearances)} apps · ${formatCount(player.seasonGoals)} goals · ${formatCount(player.seasonAssists)} assists · ${formatCount(player.seasonMinutes)} min${player.seasonDraws != null ? ` · ${formatCount(player.seasonDraws)} draws` : ''}`,
    careerLine: `Career · ${formatCount(player.careerAppearances)} apps · ${formatCount(player.careerGoals)} goals · ${formatCount(player.careerAssists)} assists`,
    skills: player.skills,
  };
}

function emptyExtra(id: Exclude<SportId, 'football'>, shared: Pick<SportProfileView, 'personal' | 'academics' | 'jersey'>): SportProfileView {
  const spec = EXTRA_SPORTS[id];
  return {
    id,
    label: spec.label,
    available: false,
    positionLine: '',
    jersey: shared.jersey,
    seasonLabel: '',
    wins: null,
    losses: null,
    winRateLabel: '—',
    axes: spec.axes.map((axis) => ({ label: axis.label, value: 0, display: '—' })),
    tableHeaders: spec.table.map((column) => column.label) as [string, string, string, string],
    matches: [],
    personal: shared.personal,
    physical: '',
    team: '',
    academics: shared.academics,
    seasonLine: `No ${spec.label.toLowerCase()} record for this player`,
    careerLine: '',
    skills: [],
  };
}

function extraView(
  id: Exclude<SportId, 'football'>,
  raw: Record<string, unknown>,
  shared: Pick<SportProfileView, 'personal' | 'academics' | 'jersey'>,
): SportProfileView {
  const spec = EXTRA_SPORTS[id];
  const stats = raw.stats && typeof raw.stats === 'object' ? (raw.stats as Record<string, unknown>) : {};
  const wins = finiteNumber(raw.wins);
  const losses = finiteNumber(raw.losses);
  const draws = finiteNumber(raw.draws);
  const jersey = raw.jersey != null && String(raw.jersey).trim() ? String(raw.jersey).trim() : shared.jersey;
  const position = String(raw.position || '').trim();
  const secondary = String(raw.secondary || '').trim();
  const skills = Array.isArray(raw.skills) ? raw.skills.map((item) => String(item).trim()).filter(Boolean) : [];
  const matches = Array.isArray(raw.matches)
    ? raw.matches.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        const opponent = String(row.opponent || '').trim();
        if (!opponent) return [];
        const result = String(row.result || '').trim().toUpperCase();
        return [
          {
            dateLabel: shortMatchDate(String(row.date || '')),
            opponent,
            home: row.home !== false,
            homeScore: finiteNumber(row.homeScore) ?? 0,
            awayScore: finiteNumber(row.awayScore) ?? 0,
            result: result === 'WIN' || result === 'LOSS' || result === 'DRAW' ? result : '',
            kickoff: String(row.kickoff || '').trim(),
            cells: spec.table.map((column) => cellValue(row[column.key], column.digits)) as [string, string, string, string],
          },
        ];
      })
    : [];
  const seasonBits = spec.axes
    .slice(0, 4)
    .map((axis) => `${axis.label} ${axis.percent ? formatRate(finiteNumber(stats[axis.key])) : formatCount(finiteNumber(stats[axis.key]))}`);
  const careerLine = String(raw.careerLine || '').trim();

  return {
    id,
    label: spec.label,
    available: true,
    positionLine: [position, secondary].filter(Boolean).join(' · '),
    jersey,
    seasonLabel: String(raw.seasonLabel || '').trim(),
    wins,
    losses,
    winRateLabel: winRateLabel(wins, losses, draws),
    axes: spec.axes.map((axis) => {
      const value = finiteNumber(stats[axis.key]);
      return {
        label: axis.label,
        value: axis.percent ? value ?? 0 : scaleStat(value, axis.ceiling ?? 1),
        display: axis.percent ? formatRate(value) : formatCount(value),
      };
    }),
    tableHeaders: spec.table.map((column) => column.label) as [string, string, string, string],
    matches,
    personal: shared.personal,
    physical: String(raw.physical || '').trim(),
    team: [String(raw.league || '').trim(), position].filter(Boolean).join(' · '),
    academics: shared.academics,
    seasonLine: [`Season ${String(raw.seasonLabel || '—')}`, ...seasonBits].join(' · '),
    careerLine,
    skills,
  };
}

function readSelectedSports(parsed: Record<string, unknown>): SportId[] | null {
  if (!Object.prototype.hasOwnProperty.call(parsed, 'categories') || !Array.isArray(parsed.categories)) {
    return null;
  }
  const picked = new Set(parsed.categories.map((value) => String(value)));
  return SPORT_ORDER.filter((id) => picked.has(id));
}

function selectedPlaceholder(
  id: Exclude<SportId, 'football'>,
  shared: Pick<SportProfileView, 'personal' | 'academics' | 'jersey'>,
): SportProfileView {
  const view = emptyExtra(id, shared);
  return {
    ...view,
    available: true,
    seasonLine: `${view.label} is one of this player's sports`,
  };
}

export function buildSportProfiles(raw: string | undefined, football: FootballSportInput): SportProfileView[] {
  const footballProfile = footballView(football);
  const shared = {
    personal: footballProfile.personal,
    academics: footballProfile.academics,
    jersey: football.jersey,
  };
  let parsed: Record<string, unknown> = {};
  if (raw?.trim()) {
    try {
      const value = JSON.parse(raw) as unknown;
      if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }
  const selected = readSelectedSports(parsed);
  const order = selected ?? LEGACY_SPORT_ORDER;
  return order.map((id) => {
    if (id === 'football') return footballProfile;
    const entry = parsed[id];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return extraView(id, entry as Record<string, unknown>, shared);
    }
    if (selected) return selectedPlaceholder(id, shared);
    return emptyExtra(id, shared);
  });
}
