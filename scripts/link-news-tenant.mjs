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
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

async function call(path, options = {}) {
  const response = await fetch(`${base}/api${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const body = await response.json();
  return { status: response.status, body };
}

const tenants = await call('/tenants?filters[tenantId][$eq]=md_strikers_10');
const tenant = tenants.body?.data?.[0];
console.log('tenant keys', tenant && Object.keys(tenant), 'id', tenant?.id, 'documentId', tenant?.documentId);

const sample = await call('/articles?filters[tenant][tenantId][$eq]=tenant_demo_002&populate[tenant]=true&pagination[pageSize]=1&status=published');
const sampleRow = sample.body?.data?.[0];
console.log('sample tenant', JSON.stringify(sampleRow?.tenant || null)?.slice(0, 300), 'status', sample.status);

const mine = await call('/articles?filters[slug][$eq]=capital-cup-2026-kickoff-im-vijayan&populate[tenant]=true&status=published');
const article = mine.body?.data?.[0];
console.log('before', article?.documentId, JSON.stringify(article?.tenant));

const attempts = [
  { tenant: { connect: [tenant.documentId] } },
  { tenant: { set: [tenant.documentId] } },
  { tenant: tenant.documentId },
];
if (tenant.id) attempts.push({ tenant: tenant.id });

for (const data of attempts) {
  const updated = await call(`/articles/${article.documentId}?status=published`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  const again = await call(`/articles/${article.documentId}?populate[tenant]=true&status=published`);
  console.log('attempt', JSON.stringify(data), 'put', updated.status, JSON.stringify(updated.body?.error || updated.body?.data?.tenant || null)?.slice(0, 250));
  console.log('  readback', JSON.stringify(again.body?.data?.tenant || null)?.slice(0, 250));
  if (again.body?.data?.tenant) break;
}
