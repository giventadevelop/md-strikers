/**
 * One-off: scrape First Team squad from disk, copy images, insert into
 * event_site_manager_db.team_groups + team_members.
 * Does not modify homepage UI.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MEMBERS_DIR = path.join(ROOT, 'public/images/md_strikers_media/squad/members');
const COPY_DIR = path.join(
  ROOT,
  'public/images/md_strikers_media/squad/first-team-imported',
);
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const TENANT_ID = 'tenant_demo_002';
const DOCKER_CONTAINER = 'event_site_manager_db-postgresql-1';
const DB = 'event_site_manager_db';
const DB_USER = 'postgres';

function formatMemberLabel(base, fallbackNum) {
  if (/^member-\d+-\d+$/i.test(base)) {
    const parts = base.split('-');
    return `Player ${parts[1]}-${parts[2]}`;
  }
  if (/^member-\d+$/i.test(base)) {
    return `Player ${base.replace(/^member-/i, '')}`;
  }
  return base.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function memberBaseKey(p) {
  const file = p.img.split('/').pop() ?? '';
  return file.replace(/\.[^.]+$/i, '').toLowerCase();
}

function applySquadDisplayOrder(players) {
  const n = players.length;
  if (n === 0) return [];
  const take = (pool, base) => {
    const i = pool.findIndex((p) => memberBaseKey(p) === base);
    if (i === -1) return undefined;
    return pool.splice(i, 1)[0];
  };
  const pool = [...players];
  const p401 = take(pool, 'member-4-01');
  const p308 = take(pool, 'member-3-08');
  const p01 = n > 9 ? take(pool, 'member-01') : undefined;
  const out = [];
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

function loadPlayers() {
  if (!fs.existsSync(MEMBERS_DIR)) {
    throw new Error(`Members dir missing: ${MEMBERS_DIR}`);
  }
  const files = fs.readdirSync(MEMBERS_DIR).filter((f) => IMAGE_EXT.test(f));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const players = files.map((filename, index) => {
    const num = String(index + 1).padStart(2, '0');
    const base = filename.replace(/\.[^.]+$/i, '');
    return {
      filename,
      img: `/images/md_strikers_media/squad/members/${filename}`,
      num,
      name: formatMemberLabel(base, num),
      role: 'First Team',
      sourcePath: path.join(MEMBERS_DIR, filename),
    };
  });
  const ordered = applySquadDisplayOrder(players);
  return ordered.map((p, i) => ({
    ...p,
    num: String(i + 1).padStart(2, '0'),
    jerseyNumber: i + 1,
    priorityOrder: i + 1,
  }));
}

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function runPsql(sql) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', DOCKER_CONTAINER, 'psql', '-U', DB_USER, '-d', DB, '-v', 'ON_ERROR_STOP=1'],
    { input: sql, encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`psql failed with status ${r.status}`);
  }
  return r.stdout;
}

function main() {
  const players = loadPlayers();
  console.log(`[import] Scraped ${players.length} First Team players`);

  fs.mkdirSync(COPY_DIR, { recursive: true });
  for (const p of players) {
    const dest = path.join(COPY_DIR, p.filename);
    fs.copyFileSync(p.sourcePath, dest);
    p.copiedPublicPath = `/images/md_strikers_media/squad/first-team-imported/${p.filename}`;
  }
  console.log(`[import] Copied ${players.length} images → ${COPY_DIR}`);

  // Idempotent: remove prior First Team group for this tenant (cascade members)
  const setupSql = `
BEGIN;
DELETE FROM team_groups
 WHERE tenant_id = '${sqlEscape(TENANT_ID)}'
   AND slug = 'first-team';

INSERT INTO team_groups (
  tenant_id, team_type, name, slug, section_label, headline,
  description, cta_label, cta_href, display_order, is_active, created_at, updated_at
) VALUES (
  '${sqlEscape(TENANT_ID)}',
  'SPORTS',
  'The First Team',
  'first-team',
  'squad',
  'The First Team',
  'Maryland Strikers first-team squad (imported from homepage static carousel).',
  'View All Players',
  '/team',
  1,
  true,
  NOW(),
  NOW()
)
RETURNING id;
COMMIT;
`;

  const out = runPsql(setupSql);
  console.log(out);
  const idMatch = out.match(/\n\s*(\d+)\s*\n/);
  if (!idMatch) {
    // Try again with a clearer RETURNING query
    const idOut = runPsql(
      `SELECT id FROM team_groups WHERE tenant_id='${sqlEscape(TENANT_ID)}' AND slug='first-team';`,
    );
    console.log(idOut);
  }

  const idOut = runPsql(
    `SELECT id FROM team_groups WHERE tenant_id='${sqlEscape(TENANT_ID)}' AND slug='first-team';`,
  );
  const groupId = (idOut.match(/\n\s*(\d+)\s*\n/) || [])[1];
  if (!groupId) {
    throw new Error(`Could not resolve team_groups.id. psql output:\n${idOut}`);
  }
  console.log(`[import] team_groups.id = ${groupId}`);

  const valueRows = players.map((p) => {
    // Display names are labels like "Player 4-01" — no real first/last; keep full label in first_name
    const firstName = p.name;
    const lastName = 'Squad';
    return `(
  '${sqlEscape(TENANT_ID)}',
  ${groupId},
  '${sqlEscape(firstName)}',
  '${sqlEscape(lastName)}',
  '${sqlEscape(p.name)}',
  '${sqlEscape(p.role)}',
  ${p.priorityOrder},
  '${sqlEscape(p.copiedPublicPath)}',
  true,
  ${p.jerseyNumber},
  NULL,
  '${sqlEscape(p.role)}',
  NOW(),
  NOW()
)`;
  });

  const insertSql = `
BEGIN;
INSERT INTO team_members (
  tenant_id, team_group_id, first_name, last_name, title, designation,
  priority_order, profile_image_url, is_active, jersey_number, position,
  lineup_subtitle, created_at, updated_at
) VALUES
${valueRows.join(',\n')};
COMMIT;
SELECT COUNT(*) AS member_count FROM team_members WHERE team_group_id = ${groupId};
SELECT jersey_number, title, profile_image_url FROM team_members WHERE team_group_id = ${groupId} ORDER BY priority_order LIMIT 5;
`;

  console.log(runPsql(insertSql));
  console.log('[import] Done.');
  console.log('[import] Tables: team_groups (parent) + team_members (players)');
  console.log(`[import] team_group_id=${groupId} tenant_id=${TENANT_ID} slug=first-team`);
}

main();
