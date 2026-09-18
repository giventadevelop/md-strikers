/**
 * Upload first-team-imported images to S3 and update team_members.profile_image_url.
 * Uses AWS creds from env (caller should inject from backend container).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMPORT_DIR = path.join(ROOT, 'public/images/md_strikers_media/squad/first-team-imported');
const TENANT_ID = 'tenant_demo_002';
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'eventapp-media-bucket';
const REGION = process.env.AWS_REGION || 'us-east-2';
const PROFILE_PREFIX = 'dev';
const DOCKER_CONTAINER = 'event_site_manager_db-postgresql-1';
const DB = 'event_site_manager_db';
const DB_USER = 'postgres';

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

function awsCp(localPath, s3Key) {
  const r = spawnSync(
    'aws',
    [
      's3',
      'cp',
      localPath,
      `s3://${BUCKET}/${s3Key}`,
      '--region',
      REGION,
      '--content-type',
      localPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
      '--acl',
      'public-read',
    ],
    { encoding: 'utf8', env: process.env },
  );
  if (r.status !== 0) {
    // retry without ACL if bucket blocks ACLs
    const r2 = spawnSync(
      'aws',
      ['s3', 'cp', localPath, `s3://${BUCKET}/${s3Key}`, '--region', REGION, '--content-type', localPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'],
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

function main() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY required in env');
  }
  if (!fs.existsSync(IMPORT_DIR)) {
    throw new Error(`Missing ${IMPORT_DIR}`);
  }

  const rows = runPsql(`
SELECT m.id || '|' || coalesce(m.profile_image_url,'') || '|' || coalesce(m.jersey_number::text,'') || '|' || m.title
FROM team_members m
JOIN team_groups g ON g.id = m.team_group_id
WHERE g.slug = 'first-team' AND m.tenant_id = '${sqlEscape(TENANT_ID)}'
ORDER BY m.priority_order NULLS LAST, m.id;
`).split(/\r?\n/).filter(Boolean);

  console.log(`[s3] Updating ${rows.length} team_members`);

  const updates = [];
  for (const line of rows) {
    const [id, currentUrl, jersey, ...titleParts] = line.split('|');
    const title = titleParts.join('|');
    // Prefer filename from current local path
    let filename = '';
    if (currentUrl.includes('/first-team-imported/')) {
      filename = currentUrl.split('/').pop();
    }
    if (!filename) {
      // fallback: match jersey order file list
      throw new Error(`Cannot resolve local file for member id=${id} url=${currentUrl}`);
    }
    const localPath = path.join(IMPORT_DIR, filename);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Missing file ${localPath}`);
    }

    const base = path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(filename).toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const uuid = randomUUID().slice(0, 8);
    const s3Key = `${PROFILE_PREFIX}/media/tenantId/${TENANT_ID}/team-members/${base}_${timestamp}_${uuid}${ext}`;
    const s3Url = awsCp(localPath, s3Key);
    console.log(`[s3] #${jersey} ${title} → uploaded`);
    updates.push({ id, s3Url });
  }

  const sqlParts = updates.map(
    (u) =>
      `UPDATE team_members SET profile_image_url = '${sqlEscape(u.s3Url)}', updated_at = NOW() WHERE id = ${u.id};`,
  );
  runPsql(`BEGIN;\n${sqlParts.join('\n')}\nCOMMIT;`);

  const sample = runPsql(`
SELECT left(profile_image_url, 120)
FROM team_members m
JOIN team_groups g ON g.id = m.team_group_id
WHERE g.slug='first-team' AND m.tenant_id='${sqlEscape(TENANT_ID)}'
ORDER BY priority_order
LIMIT 3;
`);
  console.log('[s3] Sample URLs:\n' + sample);
  console.log(`[s3] Done. Updated ${updates.length} rows.`);
}

main();
