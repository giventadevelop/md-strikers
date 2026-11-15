/**
 * One-shot backfill: stamp search_text from stored name/description fields
 * for the current tenant. Reads .env.local. Does not print credentials.
 */
import fs from 'fs';

function loadEnv(path) {
  const env = {};
  const text = fs.readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const hash = value.indexOf(' #');
    if (hash >= 0) value = value.slice(0, hash).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function joinSearchParts(parts) {
  return parts
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const env = loadEnv(new URL('../.env.local', import.meta.url));
const apiBase = env.NEXT_PUBLIC_API_BASE_URL;
const tenantId = env.NEXT_PUBLIC_TENANT_ID;
const username = env.AMPLIFY_API_JWT_USER || env.API_JWT_USER || env.NEXT_PUBLIC_API_JWT_USER;
const password = env.AMPLIFY_API_JWT_PASS || env.API_JWT_PASS || env.NEXT_PUBLIC_API_JWT_PASS;

if (!apiBase || !tenantId || !username || !password) {
  console.error('Missing API base, tenant, or JWT credentials in .env.local');
  process.exit(1);
}

const authRes = await fetch(`${apiBase}/api/authenticate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, rememberMe: true }),
});
if (!authRes.ok) {
  console.error('Authenticate failed', authRes.status);
  process.exit(1);
}
const { id_token: token } = await authRes.json();
if (!token) {
  console.error('No id_token');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'X-Tenant-ID': tenantId,
};

async function listPage(resource, page) {
  const params = new URLSearchParams({
    'tenantId.equals': tenantId,
    page: String(page),
    size: '100',
    sort: 'id,asc',
  });
  const res = await fetch(`${apiBase}/api/${resource}?${params}`, { headers });
  if (!res.ok) throw new Error(`${resource} list ${res.status}`);
  const total = parseInt(res.headers.get('x-total-count') || '0', 10);
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : [];
  return { rows, total };
}

async function patchSearchText(resource, row, searchText) {
  const body = resource === 'event-sponsors'
    ? { id: row.id, searchText }
    : { ...row, id: row.id, searchText };
  const res = await fetch(`${apiBase}/api/${resource}/${row.id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${resource} ${id} patch ${res.status} ${text.slice(0, 800)}`);
  }
}

const resources = [
  {
    path: 'event-sponsors',
    build: (row) => joinSearchParts([row.name, row.companyName, row.tagline, row.description, row.type, row.ocrText]),
  },
  {
    path: 'event-details',
    build: (row) => joinSearchParts([row.title, row.caption, row.description, row.location, row.ocrText]),
  },
  {
    path: 'gallery-albums',
    build: (row) => joinSearchParts([row.title, row.description, row.eventLocation, row.ocrText]),
  },
  {
    path: 'focus-groups',
    build: (row) => joinSearchParts([row.name, row.slug, row.description, row.ocrText]),
  },
];

for (const resource of resources) {
  let page = 0;
  let updated = 0;
  let skipped = 0;
  let seen = 0;
  let total = 0;
  do {
    const batch = await listPage(resource.path, page);
    total = batch.total;
    if (batch.rows.length === 0) break;
    for (const row of batch.rows) {
      seen += 1;
      const searchText = resource.build(row);
      if ((row.searchText || '') === searchText) {
        skipped += 1;
        continue;
      }
      await patchSearchText(resource.path, row, searchText);
      updated += 1;
    }
    page += 1;
  } while (seen < total);
  console.log(`${resource.path}: updated ${updated}, already current ${skipped}, listed ${seen}`);
}
