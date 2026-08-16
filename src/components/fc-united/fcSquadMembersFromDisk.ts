import fs from 'fs';
import path from 'path';
import type { FcSquadPlayer } from './FcSquadCarousel';

const MEMBERS_DIR = path.join(process.cwd(), 'public/images/md_strikers_media/squad/members');
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

/**
 * All carousel entries for the First Team section: every image file in
 * `public/images/md_strikers_media/squad/members/`, sorted by filename (numeric-aware).
 */
export function loadFcSquadFirstTeamPlayers(): FcSquadPlayer[] {
  try {
    if (!fs.existsSync(MEMBERS_DIR)) {
      return [];
    }
    const files = fs.readdirSync(MEMBERS_DIR).filter((f) => IMAGE_EXT.test(f));
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const players: FcSquadPlayer[] = files.map((filename, index) => {
      const num = String(index + 1).padStart(2, '0');
      const base = filename.replace(/\.[^.]+$/i, '');
      return {
        img: `/images/md_strikers_media/squad/members/${filename}`,
        num,
        name: formatMemberLabel(base, num),
        role: 'First Team',
      };
    });

    const ordered = applySquadDisplayOrder(players);

    return ordered.map((p, i) => ({
      ...p,
      num: String(i + 1).padStart(2, '0'),
    }));
  } catch {
    return [];
  }
}

/** Filename stem lowercased, e.g. `member-3-08` */
function memberBaseKey(p: FcSquadPlayer): string {
  const file = p.img.split('/').pop() ?? '';
  return file.replace(/\.[^.]+$/i, '').toLowerCase();
}

/**
 * Pin order: Player 4-01 → 1st, Player 3-08 → 3rd, Player 01 → 10th; others fill by filename order.
 */
function applySquadDisplayOrder(players: FcSquadPlayer[]): FcSquadPlayer[] {
  const n = players.length;
  if (n === 0) return [];

  const take = (pool: FcSquadPlayer[], base: string): FcSquadPlayer | undefined => {
    const i = pool.findIndex((p) => memberBaseKey(p) === base);
    if (i === -1) return undefined;
    return pool.splice(i, 1)[0];
  };

  const pool = [...players];
  const p401 = take(pool, 'member-4-01');
  const p308 = take(pool, 'member-3-08');
  /** 10th slot only exists when there are at least 10 players */
  const p01 = n > 9 ? take(pool, 'member-01') : undefined;

  const out: FcSquadPlayer[] = [];
  for (let pos = 0; pos < n; pos++) {
    if (pos === 0 && p401) {
      out.push(p401);
      continue;
    }
    if (pos === 2 && p308) {
      out.push(p308);
      continue;
    }
    if (pos === 9 && p01) {
      out.push(p01);
      continue;
    }
    const next = pool.shift();
    if (next) out.push(next);
  }

  return out;
}

function formatMemberLabel(base: string, fallbackNum: string): string {
  // member-01, member-2-03, person_12, etc.
  if (/^member-\d+-\d+$/i.test(base)) {
    const parts = base.split('-');
    return `Player ${parts[1]}-${parts[2]}`;
  }
  if (/^member-\d+$/i.test(base)) {
    return `Player ${base.replace(/^member-/i, '')}`;
  }
  return base.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
