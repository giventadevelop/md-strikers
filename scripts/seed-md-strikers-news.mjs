import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

function loadEnv(file) {
  const text = readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(new URL('../.env.local', import.meta.url));

const base = (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const token = process.env.STRAPI_API_TOKEN;
if (!token) {
  console.error('STRAPI_API_TOKEN missing');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const NEWS_CATEGORY = 'njud43vqfcxw99la1nqyj96g';

async function api(path, options = {}) {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} ${response.status} ${typeof body === 'string' ? body.slice(0, 400) : JSON.stringify(body).slice(0, 800)}`);
  }
  return body;
}

async function ensureTenant() {
  const existing = await api('/tenants?filters[tenantId][$eq]=md_strikers_10');
  const found = existing?.data?.[0];
  if (found) {
    console.log('tenant exists', found.documentId);
    return found.documentId;
  }
  const created = await api('/tenants', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        name: 'MD Strikers',
        tenantId: 'md_strikers_10',
        slug: 'md-strikers-10',
        domain: 'mdstrikers.local',
        description: 'Maryland Strikers Sports Club',
      },
    }),
  });
  console.log('tenant created', created?.data?.documentId);
  return created.data.documentId;
}

async function uploadImage(filePath) {
  const bytes = readFileSync(filePath);
  const form = new FormData();
  form.append('files', new Blob([bytes]), basename(filePath));
  const response = await fetch(`${base}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`upload ${response.status} ${JSON.stringify(body).slice(0, 400)}`);
  const file = Array.isArray(body) ? body[0] : body;
  console.log('uploaded', file.id, file.url);
  return file.id;
}

const ARTICLES = [
  {
    slug: 'capital-cup-2026-kickoff-im-vijayan',
    title: 'Capital Cup 2026 kickoff with I.M. Vijayan',
    description:
      'I.M. Vijayan kicked off Capital Cup 2026 for Maryland Strikers. The club welcomed players, families, and supporters as the tournament opened in the Washington region.',
    image: 'public/images/md_strikers_media/gallery/IM_Vijayan-Image-2.jpg',
  },
  {
    slug: 'maryland-strikers-season-underway',
    title: 'Maryland Strikers season is underway',
    description:
      'Maryland Strikers are back on the pitch for the new season. Match photos, fixtures, and club updates will be posted here as the campaign continues.',
    image: 'public/images/md_strikers_media/events/capital_2026_match_fixtures_wide_finals.jpg',
  },
];

const tenantDocumentId = await ensureTenant();

for (const article of ARTICLES) {
  const existing = await api(`/articles?filters[slug][$eq]=${article.slug}&status=published`);
  if (existing?.data?.length) {
    console.log('article exists', article.slug);
    continue;
  }
  const coverId = await uploadImage(new URL(`../${article.image}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  const created = await api('/articles?status=published', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        title: article.title,
        description: article.description,
        slug: article.slug,
        category: { connect: [NEWS_CATEGORY] },
        tenant: { connect: [tenantDocumentId] },
        cover: coverId,
      },
    }),
  });
  console.log('article created', created?.data?.documentId, created?.data?.publishedAt || created?.data?.slug);
}

const tenantRow = await api('/tenants?filters[tenantId][$eq]=md_strikers_10');
const tenant = tenantRow?.data?.[0];
const tenantRef = tenant?.documentId;
const articles = await api('/articles?filters[slug][$in][0]=capital-cup-2026-kickoff-im-vijayan&filters[slug][$in][1]=maryland-strikers-season-underway&status=published');
for (const article of articles?.data || []) {
  const updated = await api(`/articles/${article.documentId}?status=published`, {
    method: 'PUT',
    body: JSON.stringify({ data: { tenant: tenantRef } }),
  });
  console.log('tenant linked', article.slug, updated?.data?.tenant?.tenantId || updated?.data?.tenant || 'draft');
}

const { DatabaseSync } = await import('node:sqlite');
const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db');
const published = db.prepare(`
  SELECT id FROM articles
  WHERE slug IN ('capital-cup-2026-kickoff-im-vijayan', 'maryland-strikers-season-underway')
    AND published_at IS NOT NULL
`).all();
const insertLink = db.prepare('INSERT INTO articles_tenant_lnk (article_id, tenant_id) VALUES (?, ?)');
for (const row of published) {
  const existing = db.prepare('SELECT id FROM articles_tenant_lnk WHERE article_id = ?').get(row.id);
  if (existing) continue;
  insertLink.run(row.id, tenant.id);
  console.log('published row linked', row.id);
}
