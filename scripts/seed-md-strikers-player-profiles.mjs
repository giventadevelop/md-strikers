import fs from 'node:fs';
import path from 'node:path';

const players = [
  [1, 'Arjun', 'Nair', 'Arjun', 9, 'Striker', 'Right winger', 'RIGHT', 'Walt Whitman High School', 'USA', 'English, Malayalam'],
  [2, 'Mateo', 'Alvarez', 'Mateo', 1, 'Goalkeeper', 'Sweeper keeper', 'RIGHT', 'Winston Churchill High School', 'USA', 'English, Spanish'],
  [3, 'Liam', "O'Connor", 'Liam', 4, 'Center back', 'Right back', 'RIGHT', 'Thomas S. Wootton High School', 'USA', 'English'],
  [4, 'Noah', 'Joseph', 'Noah', 5, 'Center back', 'Defensive midfielder', 'LEFT', 'Walter Johnson High School', 'India', 'English, Malayalam'],
  [5, 'Ethan', 'George', 'Ethan', 2, 'Right back', 'Right winger', 'RIGHT', 'Montgomery Blair High School', 'USA', 'English'],
  [6, 'Caleb', 'Thomas', 'Caleb', 3, 'Left back', 'Left winger', 'LEFT', 'Albert Einstein High School', 'USA', 'English, French'],
  [7, 'Rohan', 'Iyer', 'Rohan', 6, 'Defensive midfielder', 'Center back', 'RIGHT', 'Quince Orchard High School', 'India', 'English, Hindi'],
  [8, 'Daniel', 'Okoye', 'Dan', 8, 'Central midfielder', 'Attacking midfielder', 'RIGHT', 'Richard Montgomery High School', 'Nigeria', 'English'],
  [9, 'Samuel', 'Abraham', 'Sam', 10, 'Attacking midfielder', 'Striker', 'BOTH', 'Bethesda-Chevy Chase High School', 'USA', 'English, Malayalam'],
  [10, 'Kenji', 'Sato', 'Kenji', 7, 'Right winger', 'Striker', 'LEFT', 'Paint Branch High School', 'Japan', 'English, Japanese'],
  [11, 'Diego', 'Morales', 'Diego', 11, 'Left winger', 'Attacking midfielder', 'RIGHT', 'Walt Whitman High School', 'Mexico', 'English, Spanish'],
  [12, 'Aaron', 'Philip', 'Aaron', 14, 'Striker', 'Left winger', 'RIGHT', 'Winston Churchill High School', 'USA', 'English'],
  [13, 'Isaac', 'Rahman', 'Isaac', 16, 'Central midfielder', 'Right winger', 'RIGHT', 'Thomas S. Wootton High School', 'USA', 'English, Arabic'],
  [14, 'Owen', 'Blake', 'Owen', 12, 'Left back', 'Left winger', 'LEFT', 'Walter Johnson High School', 'USA', 'English'],
  [15, 'Nathan', 'George', 'Nate', 15, 'Right back', 'Center back', 'RIGHT', 'Montgomery Blair High School', 'Ghana', 'English'],
  [16, 'Farhan', 'Qureshi', 'Farhan', 18, 'Center back', 'Defensive midfielder', 'RIGHT', 'Albert Einstein High School', 'USA', 'English, Urdu'],
  [17, 'Leo', 'Martins', 'Leo', 17, 'Attacking midfielder', 'Left winger', 'LEFT', 'Quince Orchard High School', 'Brazil', 'English, Portuguese'],
  [18, 'Victor', 'Chen', 'Victor', 20, 'Right winger', 'Striker', 'RIGHT', 'Richard Montgomery High School', 'USA', 'English, Mandarin'],
  [19, 'Adam', 'Hussein', 'Adam', 19, 'Left winger', 'Striker', 'RIGHT', 'Bethesda-Chevy Chase High School', 'USA', 'English, Arabic'],
  [20, 'Miles', 'Carter', 'Miles', 21, 'Defensive midfielder', 'Central midfielder', 'BOTH', 'Paint Branch High School', 'USA', 'English'],
  [21, 'Jonah', 'Park', 'Jonah', 22, 'Goalkeeper', 'Sweeper keeper', 'LEFT', 'Walt Whitman High School', 'South Korea', 'English, Korean'],
  [22, 'Elias', 'Haddad', 'Elias', 23, 'Center back', 'Right back', 'RIGHT', 'Winston Churchill High School', 'USA', 'English, Arabic'],
  [23, 'Ryan', "D'Souza", 'Ryan', 24, 'Central midfielder', 'Attacking midfielder', 'RIGHT', 'Thomas S. Wootton High School', 'India', 'English, Konkani'],
  [24, 'Omar', 'Farouk', 'Omar', 25, 'Striker', 'Attacking midfielder', 'LEFT', 'Walter Johnson High School', 'USA', 'English, Arabic'],
  [25, 'Benjamin', 'Cole', 'Ben', 13, 'Left back', 'Center back', 'LEFT', 'Montgomery Blair High School', 'USA', 'English'],
  [26, 'Hari', 'Krishnan', 'Hari', 26, 'Right winger', 'Right back', 'RIGHT', 'Albert Einstein High School', 'India', 'English, Malayalam'],
  [27, 'Lucas', 'Bennett', 'Lucas', 27, 'Attacking midfielder', 'Central midfielder', 'RIGHT', 'Quince Orchard High School', 'USA', 'English'],
  [28, 'Malik', 'Johnson', 'Malik', 28, 'Center back', 'Defensive midfielder', 'RIGHT', 'Richard Montgomery High School', 'USA', 'English'],
  [29, 'Theo', 'Nguyen', 'Theo', 29, 'Left winger', 'Left back', 'LEFT', 'Bethesda-Chevy Chase High School', 'USA', 'English, Vietnamese'],
  [30, 'Jacob', 'Singh', 'Jacob', 30, 'Central midfielder', 'Striker', 'RIGHT', 'Paint Branch High School', 'USA', 'English, Punjabi'],
];

const opponents = [
  'Annapolis FC',
  'Capital United',
  'Baltimore United',
  'Frederick City',
  'Howard County',
  'Rockville Athletic',
];
const builds = ['Athletic', 'Lean', 'Power'];
const attack = new Set(['Striker', 'Right winger', 'Left winger', 'Attacking midfielder']);

function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function profile(row) {
  const [id, first, last, preferred, jersey, position, secondary, foot, school, nationality, languages] = row;
  const keeper = position === 'Goalkeeper';
  const forward = attack.has(position);
  const goals = keeper ? 0 : forward ? 12 + (id % 9) : 1 + (id % 5);
  const assists = keeper ? 1 + (id % 2) : 4 + (id % 8);
  const apps = 14 + (id % 6);
  const wins = 12 + (id % 4);
  const draws = 1 + (id % 3);
  const losses = 2 + (id % 3);
  const height = 168 + ((id * 7) % 26);
  const weight = 64 + ((id * 5) % 24);
  const pass = keeper ? 78 + (id % 8) : 74 + (id % 16);
  const shots = keeper ? 6 + (id % 4) : forward ? 42 + (id % 18) : 22 + (id % 16);
  const speed = Number((28.4 + (id % 12) * 0.45).toFixed(1));
  const gpa = Number((3.15 + (id % 8) * 0.1).toFixed(2));
  const sat = 1180 + (id % 9) * 30;
  const year = 2008 + (id % 3);
  const month = String((id % 12) + 1).padStart(2, '0');
  const day = String((id % 27) + 1).padStart(2, '0');
  const matches = opponents.slice(0, 4).map((opponent, index) => {
    const slot = (id + index) % 5;
    const result = slot === 0 ? 'DRAW' : slot === 4 ? 'LOSS' : 'WIN';
    const home = index % 2 === 0;
    const low = 1 + ((id + index) % 2);
    const high = low + 1 + (index % 2);
    const [homeScore, awayScore] =
      result === 'DRAW' ? [low, low] : result === 'WIN' ? (home ? [high, low] : [low, high]) : home ? [low, high] : [high, low];
    const scored = keeper ? 0 : result === 'LOSS' ? index % 2 : forward ? 1 + (index % 2) : index % 2;
    return {
      date: ['2026-10-18', '2026-10-11', '2026-10-04', '2026-09-27'][index],
      kickoff: ['03:35 PM', '04:10 PM', '01:15 PM', '06:00 PM'][index],
      opponent,
      competition: 'DMV Premier',
      home,
      homeScore,
      awayScore,
      result,
      goals: scored,
      assists: keeper ? 0 : index % 2,
      minutes: keeper || index === 0 ? 90 : 70 + (index % 3) * 8,
      passAccuracy: pass - index,
    };
  });
  return {
    id,
    first,
    last,
    preferred,
    jersey,
    position,
    secondary,
    foot,
    school,
    nationality,
    languages,
    goals,
    assists,
    apps,
    wins,
    draws,
    losses,
    height,
    weight,
    pass,
    shots,
    speed,
    gpa,
    sat,
    dob: `${year}-${month}-${day}`,
    minutes: apps * 78,
    careerApps: apps + 28 + (id % 10),
    careerGoals: goals + (keeper ? 0 : 14 + (id % 12)),
    careerAssists: assists + 6 + (id % 7),
    build: builds[id % builds.length],
    matches,
    bio: `${first} ${last} is a ${position.toLowerCase()} for the Maryland Strikers first team and a student at ${school}.`,
    skills: keeper ? 'Distribution, Command, Reflexes' : forward ? 'Finishing, Pace, Pressing' : 'Positioning, Passing, Duels',
  };
}

const statements = players.map((row) => {
  const player = profile(row);
  const tag = `rm${player.id}`;
  return `UPDATE team_members SET
  first_name = ${sqlText(player.first)},
  last_name = ${sqlText(player.last)},
  jersey_number = ${player.jersey},
  position = ${sqlText(player.position)},
  nationality = ${sqlText(player.nationality)},
  date_of_birth = DATE ${sqlText(player.dob)},
  preferred_foot = ${sqlText(player.foot)},
  height_cm = ${player.height},
  preferred_name = ${sqlText(player.preferred)},
  spoken_languages = ${sqlText(player.languages)},
  weight_kg = ${player.weight},
  body_build = ${sqlText(player.build)},
  club_name = ${sqlText(`Maryland Strikers - ${player.school}`)},
  league_division = 'DMV Premier',
  secondary_positions = ${sqlText(player.secondary)},
  season_label = '2026',
  season_appearances = ${player.apps},
  season_goals = ${player.goals},
  season_assists = ${player.assists},
  season_minutes = ${player.minutes},
  season_wins = ${player.wins},
  season_draws = ${player.draws},
  season_losses = ${player.losses},
  pass_accuracy_pct = ${player.pass},
  shot_accuracy_pct = ${player.shots},
  top_speed_kmh = ${player.speed},
  career_appearances = ${player.careerApps},
  career_goals = ${player.careerGoals},
  career_assists = ${player.careerAssists},
  gpa = ${player.gpa.toFixed(2)},
  academic_score = ${sqlText(`SAT ${player.sat}`)},
  coach_name = 'Daniel Okonkwo',
  coach_email = 'coach@strikers.demo',
  coach_phone = '(301) 555-0148',
  recent_matches = $${tag}$${JSON.stringify(player.matches)}$${tag}$,
  bio = ${sqlText(player.bio)},
  expertise = ${sqlText(player.skills)},
  updated_at = NOW()
WHERE id = ${player.id} AND tenant_id = 'md_strikers_10';`;
});

const sql = `BEGIN;\n${statements.join('\n')}\nCOMMIT;\n`;
const out = path.join(process.cwd(), 'scripts', 'seed-md-strikers-player-profiles.sql');
fs.writeFileSync(out, sql);
console.log(`wrote ${statements.length} updates`);
