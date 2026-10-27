import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const opponents = {
  volleyball: ['Rockville Aces', 'Bethesda Spike', 'Silver Spring Setters', 'Columbia Blocks'],
  basketball: ['Annapolis Hoops', 'PG County Prep', 'Bethesda Court', 'Frederick Falcons'],
  cricket: ['Montgomery CC', 'Howard XI', 'Baltimore Strikers CC', 'Anne Arundel CC'],
  badminton: ['Rockville Smash', 'Bethesda Shuttle', 'College Park BC', 'Germantown BC'],
  'tennis-squash': ['Bethesda Tennis', 'Rockville Racquets', 'Potomac Squash', 'Silver Spring Lawn'],
  'table-tennis': ['Germantown TT', 'College Park Paddle', 'Bethesda Spin', 'Frederick TT'],
  golf: ['Laytonsville GC', 'Hampshire Greens', 'Little Bennett', 'Northwest Park'],
};

const positions = {
  volleyball: ['Outside hitter', 'Setter', 'Libero', 'Middle blocker', 'Opposite'],
  basketball: ['Point guard', 'Shooting guard', 'Small forward', 'Power forward', 'Center'],
  cricket: ['Opening batter', 'Middle-order batter', 'Fast bowler', 'Spinner', 'Wicket-keeper'],
  badminton: ['Singles', 'Doubles', 'Mixed doubles'],
  'tennis-squash': ['Tennis singles', 'Tennis doubles', 'Squash singles', 'Squash doubles'],
  'table-tennis': ['Singles', 'Doubles', 'Mixed doubles'],
  golf: ['Low handicap', 'Mid handicap', 'Junior'],
};

const secondary = {
  volleyball: ['Opposite', 'Defensive specialist', 'Serve receive'],
  basketball: ['Wing', 'Sixth man', 'Combo guard'],
  cricket: ['Slip fielder', 'All-rounder', 'Death bowler'],
  badminton: ['Net play', 'Rear court', 'Left-handed'],
  'tennis-squash': ['One-handed backhand', 'Two-handed backhand', 'Left-handed'],
  'table-tennis': ['Shakehand', 'Penhold', 'Left-handed'],
  golf: ['Irons', 'Putting', 'Driving'],
};

const CATEGORY_ORDER = [
  'cricket',
  'football',
  'basketball',
  'volleyball',
  'tennis-squash',
  'badminton',
  'table-tennis',
  'golf',
];

function hasSport(id, sport) {
  if (sport === 'volleyball') return id % 2 === 0;
  if (sport === 'basketball') return id % 3 !== 0;
  if (sport === 'cricket') return id % 4 !== 1;
  if (sport === 'badminton') return id % 5 !== 0;
  if (sport === 'tennis-squash') return id % 3 === 2;
  if (sport === 'table-tennis') return id % 4 === 2;
  if (sport === 'golf') return id % 5 === 2 || id % 5 === 0;
  return false;
}

function resultFor(seed) {
  const pick = seed % 5;
  if (pick === 0) return 'DRAW';
  if (pick === 1) return 'LOSS';
  return 'WIN';
}

function score(result, home, low, high) {
  if (result === 'DRAW') return home ? [low, low] : [low, low];
  if (result === 'WIN') return home ? [high, low] : [low, high];
  return home ? [low, high] : [high, low];
}

const matchRanges = {
  kills: [8, 18],
  aces: [0, 4],
  blocks: [0, 5],
  digs: [4, 14],
  points: [8, 24],
  rebounds: [2, 11],
  assists: [1, 8],
  steals: [0, 4],
  runs: [12, 64],
  wickets: [0, 4],
  catches: [0, 3],
  winners: [6, 16],
  smashes: [3, 12],
  errors: [2, 9],
  score: [72, 84],
  birdies: [1, 5],
  pars: [8, 14],
  eagles: [0, 1],
};

function ranged(id, index, key) {
  const [low, high] = matchRanges[key] || [1, 10];
  return low + ((id + index * 5 + key.length) % (high - low + 1));
}

function matches(id, sport, statKeys, scorePair) {
  return opponents[sport].map((opponent, index) => {
    const home = index % 2 === 0;
    const result = resultFor(id + index + sport.length);
    const [homeScore, awayScore] = score(result, home, scorePair[0], scorePair[1]);
    const row = {
      date: ['2026-10-16', '2026-10-09', '2026-10-02', '2026-09-25'][index],
      kickoff: ['06:30 PM', '05:15 PM', '07:00 PM', '04:45 PM'][index],
      opponent,
      home,
      homeScore,
      awayScore,
      result,
    };
    statKeys.forEach((key) => {
      row[key] = ranged(id, index, key);
    });
    if (sport === 'cricket') row.economy = Number((4.2 + ((id + index) % 30) / 10).toFixed(1));
    return row;
  });
}

function profile(id, sport) {
  const position = positions[sport][id % positions[sport].length];
  const wins = 8 + (id % 7);
  const losses = 2 + (id % 4);
  const base = {
    position,
    secondary: secondary[sport][id % secondary[sport].length],
    jersey: String((id % 18) + 1),
    seasonLabel: '2026',
    wins,
    losses,
    draws: sport === 'cricket' || sport === 'football' ? id % 3 : 0,
    league:
      sport === 'volleyball'
        ? 'DMV Volleyball'
        : sport === 'basketball'
          ? 'DMV Basketball'
          : sport === 'cricket'
            ? 'DMV Cricket League'
            : sport === 'tennis-squash'
              ? 'DMV Tennis and Squash'
              : sport === 'table-tennis'
                ? 'DMV Table Tennis'
                : sport === 'golf'
                  ? 'DMV Golf'
                  : 'DMV Badminton',
    physical:
      sport === 'volleyball'
        ? `Approach jump ${68 + (id % 12)} cm`
        : sport === 'basketball'
          ? `Wingspan ${190 + (id % 20)} cm`
          : sport === 'cricket'
            ? id % 2 === 0
              ? 'Right-arm bowler'
              : 'Left-hand batter'
            : sport === 'tennis-squash'
              ? id % 2 === 0
                ? 'Right-handed serve'
                : 'Left-handed serve'
              : sport === 'table-tennis'
                ? `Forehand loop ${70 + (id % 20)} km/h`
                : sport === 'golf'
                  ? `Handicap ${4 + (id % 14)}`
                  : `Smash speed ${250 + (id % 40)} km/h`,
  };

  if (sport === 'volleyball') {
    return {
      ...base,
      stats: { kills: 90 + id * 3, aces: 10 + (id % 12), blocks: 8 + (id % 15), digs: 70 + id * 2, attackPct: 32 + (id % 15), servePct: 88 + (id % 8) },
      careerLine: `Career - ${140 + id * 6} kills - ${24 + id} aces - ${18 + id} blocks`,
      skills: ['Jump serve', 'Line shot'],
      matches: matches(id, sport, ['kills', 'aces', 'blocks', 'digs'], [1, 3]),
    };
  }
  if (sport === 'basketball') {
    return {
      ...base,
      stats: { points: 8 + (id % 16), rebounds: 3 + (id % 8), assists: 2 + (id % 6), steals: 1 + (id % 3), fieldGoalPct: 41 + (id % 14), threePointPct: 28 + (id % 12) },
      careerLine: `Career - ${220 + id * 8} points - ${70 + id * 2} rebounds - ${40 + id} assists`,
      skills: ['Catch and shoot', 'Help defense'],
      matches: matches(id, sport, ['points', 'rebounds', 'assists', 'steals'], [48, 62]),
    };
  }
  if (sport === 'cricket') {
    return {
      ...base,
      stats: { runs: 180 + id * 7, wickets: 4 + (id % 12), catches: 3 + (id % 6), average: 22 + (id % 18), strikeRate: 92 + (id % 40), economy: Number((4.4 + (id % 20) / 10).toFixed(1)) },
      careerLine: `Career - ${640 + id * 15} runs - ${18 + (id % 20)} wickets - ${12 + (id % 8)} catches`,
      skills: ['Cover drive', 'Death bowling'],
      matches: matches(id, sport, ['runs', 'wickets', 'catches'], [120, 168]),
    };
  }
  if (sport === 'tennis-squash') {
    const winPct = Number(((wins / (wins + losses)) * 100).toFixed(1));
    const rows = matches(id, sport, ['aces', 'winners', 'wins', 'losses'], [1, 2]);
    rows.forEach((row) => {
      row.aces = 3 + ((id + row.opponent.length) % 8);
      row.wins = row.result === 'WIN' ? 1 : 0;
      row.losses = row.result === 'LOSS' ? 1 : 0;
    });
    return {
      ...base,
      draws: 0,
      stats: { wins, losses, aces: 12 + (id % 16), winners: 18 + (id % 12), firstServePct: 58 + (id % 18), winPct },
      careerLine: `Career - ${wins + 14} wins - ${18 + id} aces - ${40 + id} winners`,
      skills: ['First serve', 'Volley'],
      matches: rows,
    };
  }
  if (sport === 'table-tennis') {
    const winPct = Number(((wins / (wins + losses)) * 100).toFixed(1));
    const rows = matches(id, sport, ['points', 'winners', 'wins', 'losses'], [9, 11]);
    rows.forEach((row) => {
      row.wins = row.result === 'WIN' ? 1 : 0;
      row.losses = row.result === 'LOSS' ? 1 : 0;
    });
    return {
      ...base,
      draws: 0,
      stats: { wins, losses, points: 21 + (id % 12), winners: 10 + (id % 10), rallyWinPct: 51 + (id % 16), winPct },
      careerLine: `Career - ${wins + 20} wins - ${160 + id * 3} points - ${70 + id} winners`,
      skills: ['Forehand loop', 'Push'],
      matches: rows,
    };
  }
  if (sport === 'golf') {
    const rows = opponents.golf.map((opponent, index) => {
      const home = index % 2 === 0;
      const ourScore = 72 + ((id + index * 3) % 12);
      const theirScore = 72 + ((id + index * 5 + 3) % 14);
      const result = ourScore === theirScore ? 'DRAW' : ourScore < theirScore ? 'WIN' : 'LOSS';
      return {
        date: ['2026-10-16', '2026-10-09', '2026-10-02', '2026-09-25'][index],
        kickoff: ['08:00 AM', '08:40 AM', '01:10 PM', '09:20 AM'][index],
        opponent,
        home,
        homeScore: home ? ourScore : theirScore,
        awayScore: home ? theirScore : ourScore,
        result,
        score: ourScore,
        birdies: 1 + ((id + index) % 5),
        pars: 8 + ((id + index) % 6),
        eagles: (id + index) % 4 === 0 ? 1 : 0,
      };
    });
    const roundWins = rows.filter((row) => row.result === 'WIN').length;
    const roundLosses = rows.filter((row) => row.result === 'LOSS').length;
    return {
      ...base,
      wins: roundWins,
      losses: roundLosses,
      draws: rows.length - roundWins - roundLosses,
      stats: {
        rounds: 8 + (id % 6),
        birdies: 6 + (id % 10),
        pars: 28 + (id % 12),
        eagles: id % 4,
        fairwayPct: 48 + (id % 28),
        girPct: 42 + (id % 24),
      },
      careerLine: `Career - ${10 + (id % 8)} rounds - ${14 + id} birdies - handicap ${4 + (id % 14)}`,
      skills: ['Approach', 'Putting'],
      matches: rows,
    };
  }
  return {
    ...base,
    stats: { points: 28 + (id % 12), winners: 12 + (id % 10), smashes: 8 + (id % 8), netPoints: 4 + (id % 6), rallyWinPct: 52 + (id % 18), errors: 6 + (id % 7) },
    careerLine: `Career - ${36 + (id % 20)} wins - ${210 + id * 4} winners - ${90 + id} smashes`,
    skills: ['Jump smash', 'Net kill'],
    matches: matches(id, sport, ['points', 'winners', 'smashes', 'errors'], [15, 21]),
  };
}

const statements = [];
const extraSports = ['volleyball', 'basketball', 'cricket', 'badminton', 'tennis-squash', 'table-tennis', 'golf'];
for (let id = 1; id <= 30; id += 1) {
  const body = {};
  for (const sport of extraSports) {
    if (hasSport(id, sport)) body[sport] = profile(id, sport);
  }
  body.categories = CATEGORY_ORDER.filter((sport) => sport === 'football' || body[sport]);
  const tag = `sp${id}`;
  statements.push(
    `UPDATE team_members SET sport_profiles = $${tag}$${JSON.stringify(body)}$${tag}$, updated_at = NOW() WHERE id = ${id} AND tenant_id = 'md_strikers_10';`,
  );
}

const sql = ['BEGIN;', ...statements, 'COMMIT;', ''].join('\n');
const out = join(here, 'seed-md-strikers-sport-profiles.sql');
writeFileSync(out, sql);
console.log(`wrote ${out} (${statements.length} updates)`);

if (process.argv.includes('--apply')) {
  const child = spawn(
    'docker',
    ['exec', '-i', 'adwiise_agent_db-postgresql-1', 'psql', '-U', 'postgres', '-d', 'adwiise_agent_db', '-v', 'ON_ERROR_STOP=1'],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  child.stdin.end(readFileSync(out));
  child.on('exit', (code) => process.exit(code ?? 1));
}
