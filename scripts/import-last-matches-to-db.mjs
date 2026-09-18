/**
 * Upload Last Match logos to S3 and seed last_matches (PAST + UPCOMING demo rows).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TENANT_ID = 'tenant_demo_002';
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'eventapp-media-bucket';
const REGION = process.env.AWS_REGION || 'us-east-2';
const PROFILE_PREFIX = 'dev';
const DOCKER_CONTAINER = 'event_site_manager_db-postgresql-1';
const DB = 'event_site_manager_db';
const DB_USER = 'postgres';

const HOME_LOGO = path.join(
  ROOT,
  'public/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png',
);

const MATCHES = [
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-3-copyright-400x400.png'),
    date: 'July 11, 2018',
    homeScore: 3,
    awayScore: 1,
    league: 'Premier League',
    title: 'First Match',
    priorityOrder: 1,
    matchKind: 'PAST',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-2-copyright-400x400.png'),
    date: 'July 18, 2018',
    homeScore: 1,
    awayScore: 1,
    league: 'Premier League',
    title: 'Second Match',
    priorityOrder: 2,
    matchKind: 'PAST',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-1-copyright-400x400.png'),
    date: 'July 25, 2018',
    homeScore: 2,
    awayScore: 3,
    league: 'Premier League',
    title: 'Third Match',
    priorityOrder: 3,
    matchKind: 'PAST',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-4-copyright-400x400.png'),
    date: 'August 1, 2018',
    homeScore: 4,
    awayScore: 2,
    league: 'Premier League',
    title: 'Fourth Match',
    priorityOrder: 4,
    matchKind: 'PAST',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/teams-3-copyright-400x400.png'),
    date: 'August 8, 2018',
    homeScore: 0,
    awayScore: 1,
    league: 'Premier League',
    title: 'Fifth Match',
    priorityOrder: 5,
    matchKind: 'PAST',
  },
  // Upcoming demo fixtures (must be after "today" — keep in the future)
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-1-copyright-400x400.png'),
    date: 'October 4, 2026',
    homeScore: 0,
    awayScore: 0,
    league: 'Capital Cup',
    title: 'Opening Fixture',
    priorityOrder: 10,
    matchKind: 'UPCOMING',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-2-copyright-400x400.png'),
    date: 'November 15, 2026',
    homeScore: 0,
    awayScore: 0,
    league: 'Premier League',
    title: 'Home Derby',
    priorityOrder: 11,
    matchKind: 'UPCOMING',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/go-4-copyright-400x400.png'),
    date: 'December 6, 2026',
    homeScore: 0,
    awayScore: 0,
    league: 'Friendly',
    title: 'Winter Friendly',
    priorityOrder: 12,
    matchKind: 'UPCOMING',
  },
  {
    homeLocal: HOME_LOGO,
    awayLocal: path.join(ROOT, 'public/images/fc-united/teams-5-copyright.png'),
    date: 'January 17, 2027',
    homeScore: 0,
    awayScore: 0,
    league: 'Capital Cup',
    title: 'Alumni Night',
    priorityOrder: 13,
    matchKind: 'UPCOMING',
  },
];

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function runPsql(sql) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', DOCKER_CONTAINER, 'psql', '-U', DB_USER, '-d', DB, '-v', 'ON_ERROR_STOP=1', '-t', '-A'],
    { input: sql, encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`psql failed: ${r.status}`);
  }
  return (r.stdout || '').trim();
}

function contentType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function awsCp(localPath, s3Key) {
  const ct = contentType(localPath);
  const r = spawnSync(
    'aws',
    ['s3', 'cp', localPath, `s3://${BUCKET}/${s3Key}`, '--region', REGION, '--content-type', ct, '--acl', 'public-read'],
    { encoding: 'utf8', env: process.env },
  );
  if (r.status !== 0) {
    const r2 = spawnSync(
      'aws',
      ['s3', 'cp', localPath, `s3://${BUCKET}/${s3Key}`, '--region', REGION, '--content-type', ct],
      { encoding: 'utf8', env: process.env },
    );
    if (r2.status !== 0) {
      console.error(r.stderr || r.stdout);
      console.error(r2.stderr || r2.stdout);
      throw new Error(`aws s3 cp failed for ${localPath}`);
    }
  }
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
}

function uploadOnce(localPath, cache, label) {
  if (cache.has(localPath)) return cache.get(localPath);
  if (!fs.existsSync(localPath)) throw new Error(`Missing file: ${localPath}`);
  const ext = path.extname(localPath) || '.png';
  const base = path.basename(localPath, ext).replace(/[^a-zA-Z0-9_-]+/g, '_');
  const s3Key = `${PROFILE_PREFIX}/media/tenantId/${TENANT_ID}/last-matches/${base}_${Date.now()}_${randomUUID().slice(0, 8)}${ext}`;
  const url = awsCp(localPath, s3Key);
  console.log(`[s3] ${label} → ${url}`);
  cache.set(localPath, url);
  return url;
}

function ensureTable() {
  const exists = runPsql(
    `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='last_matches';`,
  );
  if (exists !== '1') {
    console.log('[db] Creating last_matches (+ sequence)...');
    runPsql(`
CREATE SEQUENCE IF NOT EXISTS public.last_matches_id_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE public.last_matches (
  id bigint PRIMARY KEY,
  tenant_id varchar(255) NOT NULL,
  home_logo_url varchar(500) NOT NULL,
  away_logo_url varchar(500) NOT NULL,
  match_date_label varchar(64) NOT NULL,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  league_name varchar(255) NOT NULL,
  title varchar(255) NOT NULL,
  match_kind varchar(32) NOT NULL DEFAULT 'PAST',
  priority_order integer,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.last_matches
  ADD CONSTRAINT fk_last_matches__tenant_id
  FOREIGN KEY (tenant_id) REFERENCES tenant_organization(tenant_id) ON DELETE CASCADE;
CREATE INDEX idx_last_matches_tenant_id ON public.last_matches (tenant_id);
CREATE INDEX idx_last_matches_is_active ON public.last_matches (is_active);
CREATE INDEX idx_last_matches_priority_order ON public.last_matches (priority_order);
CREATE INDEX idx_last_matches_match_kind ON public.last_matches (match_kind);
`);
  } else {
    console.log('[db] last_matches already exists');
  }

  const hasKind = runPsql(
    `SELECT COUNT(*) FROM information_schema.columns WHERE table_name='last_matches' AND column_name='match_kind';`,
  );
  if (hasKind !== '1') {
    console.log('[db] Adding match_kind column...');
    runPsql(`
ALTER TABLE public.last_matches
  ADD COLUMN match_kind varchar(32) NOT NULL DEFAULT 'PAST';
CREATE INDEX IF NOT EXISTS idx_last_matches_match_kind ON public.last_matches (match_kind);
UPDATE public.last_matches SET match_kind = 'PAST' WHERE match_kind IS NULL OR match_kind = '';
`);
  }
}

function main() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY required in env');
  }

  ensureTable();

  const urlCache = new Map();
  runPsql(`DELETE FROM last_matches WHERE tenant_id = '${sqlEscape(TENANT_ID)}';`);

  for (const m of MATCHES) {
    const homeUrl = uploadOnce(m.homeLocal, urlCache, 'home');
    const awayUrl = uploadOnce(m.awayLocal, urlCache, m.title);
    const id = runPsql(`SELECT nextval('public.last_matches_id_seq');`);
    runPsql(`
INSERT INTO last_matches (
  id, tenant_id, home_logo_url, away_logo_url, match_date_label,
  home_score, away_score, league_name, title, match_kind, priority_order, is_active, created_at, updated_at
) VALUES (
  ${id},
  '${sqlEscape(TENANT_ID)}',
  '${sqlEscape(homeUrl)}',
  '${sqlEscape(awayUrl)}',
  '${sqlEscape(m.date)}',
  ${m.homeScore},
  ${m.awayScore},
  '${sqlEscape(m.league)}',
  '${sqlEscape(m.title)}',
  '${sqlEscape(m.matchKind)}',
  ${m.priorityOrder},
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
`);
    console.log(`[db] Inserted #${id} ${m.matchKind} ${m.title}`);
  }

  const count = runPsql(`SELECT COUNT(*) FROM last_matches WHERE tenant_id='${sqlEscape(TENANT_ID)}';`);
  const upcoming = runPsql(
    `SELECT COUNT(*) FROM last_matches WHERE tenant_id='${sqlEscape(TENANT_ID)}' AND match_kind='UPCOMING';`,
  );
  console.log(`[done] last_matches rows for ${TENANT_ID}: ${count} (upcoming: ${upcoming})`);
}

main();
