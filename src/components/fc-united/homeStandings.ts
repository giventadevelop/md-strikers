import type { LastMatchCard } from './ApiServerActions';

export type StandingRow = {
  team: string;
  crest: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
};

function goals(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * League table built from recorded results in last_matches (3 points a win, 1 a draw).
 * Sorted by points, goal difference, goals scored, then name.
 */
export function buildStandings(matches: LastMatchCard[]): StandingRow[] {
  const table = new Map<string, StandingRow>();
  const rowFor = (team: string, crest: string) => {
    let row = table.get(team);
    if (!row) {
      row = { team, crest, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
      table.set(team, row);
    }
    return row;
  };

  for (const m of matches) {
    if (m.matchKind !== 'PAST' || !m.homeName || !m.awayName) continue;
    const hg = goals(m.score[0]);
    const ag = goals(m.score[1]);
    if (hg === null || ag === null) continue;

    const home = rowFor(m.homeName, m.home);
    const away = rowFor(m.awayName, m.away);
    home.p += 1;
    away.p += 1;
    home.gf += hg;
    home.ga += ag;
    away.gf += ag;
    away.ga += hg;
    if (hg > ag) {
      home.w += 1;
      home.pts += 3;
      away.l += 1;
    } else if (hg < ag) {
      away.w += 1;
      away.pts += 3;
      home.l += 1;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  return [...table.values()].sort(
    (a, b) =>
      b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || a.team.localeCompare(b.team),
  );
}
