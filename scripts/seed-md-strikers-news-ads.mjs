import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
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
    throw new Error(`${options.method || 'GET'} ${path} ${response.status} ${typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body).slice(0, 700)}`);
  }
  return body;
}

async function uploadImage(relativePath) {
  const filePath = join(process.cwd(), relativePath);
  const bytes = readFileSync(filePath);
  const form = new FormData();
  form.append('files', new Blob([bytes]), basename(filePath));
  const response = await fetch(`${base}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`upload ${response.status} ${JSON.stringify(body).slice(0, 300)}`);
  const file = Array.isArray(body) ? body[0] : body;
  return file.id;
}

const CATEGORIES = {
  'main-news': 'n5cpsrc9dbumm2a5udtz0l5t',
  'featured-news': 'gxxm9nal5n71n8fw41yc84e1',
  'press-release': 'xwsqwmfyfcoqui9h733henj7',
  'most-read': 'kx5alvohxmw0umnyfc4uzwj7',
};

const ARTICLES = [
  {
    slug: 'capital-cup-2026-kickoff-im-vijayan',
    title: 'Capital Cup 2026 kickoff with I.M. Vijayan',
    category: 'featured-news',
    description: 'I.M. Vijayan kicked off Capital Cup 2026 for Maryland Strikers. The club welcomed players, families, and supporters as the tournament opened in the Washington region.',
    image: 'public/images/md_strikers_media/gallery/IM_Vijayan-Image-2.jpg',
  },
  {
    slug: 'maryland-strikers-season-underway',
    title: 'Maryland Strikers season is underway',
    category: 'main-news',
    description: 'Maryland Strikers are back on the pitch for the new season. Match photos, fixtures, and club updates will be posted here as the campaign continues.',
    image: 'public/images/md_strikers_media/capital_2026_match_fixtures_wide_finals.jpg',
  },
  {
    slug: 'fall-cup-group-draw',
    title: 'Fall Cup group draw is set',
    category: 'main-news',
    description: 'Maryland Strikers released the Fall Cup group draw. Clubs from across Maryland and the District will open the weekend at Othello Regional Park.',
    image: 'public/images/md_strikers_media/gallery/soccer-group.jpg',
  },
  {
    slug: 'winter-training-camp-opens',
    title: 'Winter training camp opens in Germantown',
    category: 'main-news',
    description: 'First-team training moves indoors this winter. Sessions stay open to registered players, with match-day details posted on the club calendar.',
    image: 'public/images/md_strikers_media/gallery/mdstrikers_com/gal04.jpg',
  },
  {
    slug: 'capital-cup-2026-match-week',
    title: 'Capital Cup 2026 match week guide',
    category: 'featured-news',
    description: 'Kickoff times, parking, and the weekend schedule for Capital Cup 2026. Maryland Strikers host the tournament at Othello Regional Park in Brunswick.',
    image: 'public/images/md_strikers_media/gallery/Capital_Cup_Hero_Image.jpg',
  },
  {
    slug: 'club-statement-2026-calendar',
    title: 'Club statement on the 2026 match calendar',
    category: 'press-release',
    description: 'Maryland Strikers Sports Club confirmed the published 2026 match calendar. Fixture changes will be announced on the news page and the matches list.',
    image: 'public/images/md_strikers_media/gallery/capital_cup_2026_full-width.jpg',
  },
  {
    slug: 'opal-ridge-club-partnership',
    title: 'Opal Ridge continues as a club partner',
    category: 'press-release',
    description: 'Opal Ridge remains a partner of Maryland Strikers for the current season, supporting Capital Cup and first-team match days.',
    image: 'public/images/md_strikers_media/sponsors/opal-ridge.jpg',
  },
  {
    slug: 'match-day-guide-othello-park',
    title: 'Match day guide for Othello Regional Park',
    category: 'most-read',
    description: 'Gates, parking, and what to bring for a Maryland Strikers match day at Othello Regional Park, 1901A Jefferson Pike, Brunswick.',
    image: 'public/images/md_strikers_media/gallery/mdstrikers_com/gal01.jpg',
  },
  {
    slug: 'youth-pathway-maryland-strikers',
    title: 'The youth pathway at Maryland Strikers',
    category: 'most-read',
    description: 'How younger players move into club training and tournament weekends with Maryland Strikers Sports Club.',
    image: 'public/images/md_strikers_media/gallery/mdstrikers_com/Soccer-KCS.jpg',
  },
];

const ADS = [
  { position: 'top', priority: 1, image: 'public/images/md_strikers_media/gallery/capital_cup_2026_full-width.jpg' },
  { position: 'between_sections', priority: 2, image: 'public/images/md_strikers_media/sponsors/opal-ridge.jpg' },
  { position: 'sidebar', priority: 3, image: 'public/images/md_strikers_media/gallery/IM-Vijayan-Image_news.jpg' },
];

const tenantRow = await api('/tenants?filters[tenantId][$eq]=md_strikers_10');
const tenant = tenantRow?.data?.[0];
if (!tenant?.documentId) throw new Error('Strapi tenant md_strikers_10 was not found');
console.log('tenant', tenant.documentId);

for (const article of ARTICLES) {
  const existing = await api(`/articles?filters[slug][$eq]=${article.slug}&status=published&populate=category`);
  const current = existing?.data?.[0];
  const categoryId = CATEGORIES[article.category];
  if (current) {
    const currentSlug = current.category?.slug || '';
    if (currentSlug === article.category && current.tenant?.tenantId === 'md_strikers_10') {
      console.log('article ok', article.slug);
      continue;
    }
    await api(`/articles/${current.documentId}?status=published`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          category: { connect: [categoryId] },
          tenant: { connect: [tenant.documentId] },
        },
      }),
    });
    console.log('article updated', article.slug, article.category);
    continue;
  }
  const coverId = await uploadImage(article.image);
  await api('/articles?status=published', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        title: article.title,
        description: article.description,
        slug: article.slug,
        category: { connect: [categoryId] },
        tenant: { connect: [tenant.documentId] },
        cover: coverId,
      },
    }),
  });
  console.log('article created', article.slug, article.category);
}

const existingAds = await api(`/advertisement-slots?filters[tenant][tenantId][$eq]=md_strikers_10&pagination[pageSize]=20`);
const have = new Set((existingAds?.data || []).map((row) => row.position));
for (const ad of ADS) {
  if (have.has(ad.position)) {
    console.log('ad exists', ad.position);
    continue;
  }
  const mediaId = await uploadImage(ad.image);
  await api('/advertisement-slots', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        position: ad.position,
        priority: ad.priority,
        media: mediaId,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2028-12-31T00:00:00.000Z',
        tenant: { connect: [tenant.documentId] },
      },
    }),
  });
  console.log('ad created', ad.position);
}

// Strapi stores tenant on a link table. The REST connect often lands on the draft row only.
const { DatabaseSync } = await import('node:sqlite');
const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db');
const tenantDb = db.prepare("SELECT id FROM tenants WHERE tenant_id = 'md_strikers_10'").get();
if (tenantDb?.id) {
  const slugs = ARTICLES.map((article) => article.slug);
  const articleRows = db.prepare(`SELECT id FROM articles WHERE slug IN (${slugs.map(() => '?').join(',')})`).all(...slugs);
  const hasArticle = db.prepare('SELECT id FROM articles_tenant_lnk WHERE article_id = ?');
  const insertArticle = db.prepare('INSERT INTO articles_tenant_lnk (article_id, tenant_id) VALUES (?, ?)');
  for (const row of articleRows) {
    if (hasArticle.get(row.id)) continue;
    insertArticle.run(row.id, tenantDb.id);
    console.log('linked article row', row.id);
  }
  const adRows = db.prepare(`
    SELECT s.id
    FROM advertisement_slots s
    JOIN files_related_mph fr ON fr.related_id = s.id
      AND fr.related_type = 'api::advertisement-slot.advertisement-slot'
      AND fr.field = 'media'
    JOIN files file ON file.id = fr.file_id
    LEFT JOIN advertisement_slots_tenant_lnk l ON l.advertisement_slot_id = s.id
    WHERE l.id IS NULL
      AND (
        file.name LIKE 'capital_cup_2026_full-width%'
        OR file.name LIKE 'opal-ridge%'
        OR file.name LIKE 'IM-Vijayan-Image_news%'
      )
  `).all();
  const insertAd = db.prepare('INSERT INTO advertisement_slots_tenant_lnk (advertisement_slot_id, tenant_id) VALUES (?, ?)');
  for (const row of adRows) {
    insertAd.run(row.id, tenantDb.id);
    console.log('linked ad row', row.id);
  }
}

