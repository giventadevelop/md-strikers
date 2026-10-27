import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db', { readOnly: true });
const cols = db.prepare('PRAGMA table_info(articles_tenant_lnk)').all();
console.log('lnk', cols.map((c) => c.name).join(','));
const articles = db.prepare("SELECT id, document_id, slug, published_at FROM articles WHERE slug IN ('capital-cup-2026-kickoff-im-vijayan','maryland-strikers-season-underway')").all();
console.log(JSON.stringify(articles, null, 2));
const links = db.prepare('SELECT * FROM articles_tenant_lnk WHERE article_id IN (SELECT id FROM articles WHERE slug IN (\'capital-cup-2026-kickoff-im-vijayan\',\'maryland-strikers-season-underway\'))').all();
console.log('links', JSON.stringify(links));
const tenant = db.prepare("SELECT id, document_id, tenant_id FROM tenants WHERE tenant_id = 'md_strikers_10'").all();
console.log('tenant', JSON.stringify(tenant));
