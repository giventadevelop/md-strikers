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

    return files.map((filename, index) => {
      const num = String(index + 1).padStart(2, '0');
      const base = filename.replace(/\.[^.]+$/i, '');
      return {
        img: `/images/md_strikers_media/squad/members/${filename}`,
        num,
        name: formatMemberLabel(base, num),
        role: 'First Team',
      };
    });
  } catch {
    return [];
  }
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
