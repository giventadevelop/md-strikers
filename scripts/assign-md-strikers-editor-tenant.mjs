import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db');
const tenant = db.prepare("SELECT id FROM tenants WHERE tenant_id = 'md_strikers_10'").get();
if (!tenant) throw new Error('tenant md_strikers_10 missing');

const emails = ['mosc.regular.user@keleno.com', 'giventauser@gmail.com'];
const now = Date.now();
const insertEditor = db.prepare(`
  INSERT INTO editor_tenants (
    document_id, admin_user_email, created_at, updated_at, published_at,
    created_by_id, updated_by_id, assignment_key
  ) VALUES (?, ?, ?, ?, ?, 1, 1, ?)
`);
const insertLink = db.prepare('INSERT INTO editor_tenants_tenant_lnk (editor_tenant_id, tenant_id) VALUES (?, ?)');

for (const email of emails) {
  const key = `${email}__md_strikers_10`;
  const existing = db.prepare('SELECT id FROM editor_tenants WHERE assignment_key = ?').get(key);
  if (existing) {
    console.log('already assigned', email);
    continue;
  }
  const documentId = randomBytes(12).toString('hex').slice(0, 24);
  const info = insertEditor.run(documentId, email, now, now, now, key);
  insertLink.run(Number(info.lastInsertRowid), tenant.id);
  console.log('assigned', email, 'row', info.lastInsertRowid);
}
