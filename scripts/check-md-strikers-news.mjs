import { readFileSync } from 'node:fs';

function loadEnv(file) {
  const text = readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv(new URL('../.env.local', import.meta.url));
const base = process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '');
const token = process.env.STRAPI_API_TOKEN;
const path = '/articles?filters[tenant][tenantId][$eq]=md_strikers_10&filters[publishedAt][$notNull]=true&populate[0]=cover&populate[1]=category&populate[2]=tenant&sort=publishedAt:desc&pagination[pageSize]=5';
const response = await fetch(`${base}/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
const body = await response.json();
console.log('status', response.status, 'count', body?.data?.length, 'meta', JSON.stringify(body?.meta || body?.error || null));
for (const row of body?.data || []) {
  console.log(JSON.stringify({
    title: row.title,
    slug: row.slug,
    publishedAt: row.publishedAt,
    tenant: row.tenant?.tenantId || row.tenant,
    cover: row.cover?.url || null,
  }));
}
