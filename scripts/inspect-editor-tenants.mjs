import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db', { readOnly: true });
console.log('editor cols', db.prepare('PRAGMA table_info(editor_tenants)').all().map((c) => c.name).join(','));
console.log('lnk cols', db.prepare('PRAGMA table_info(editor_tenants_tenant_lnk)').all().map((c) => c.name).join(','));
const rows = db.prepare(`
  SELECT e.id, e.admin_user_email, e.assignment_key, t.tenant_id, t.name
  FROM editor_tenants e
  LEFT JOIN editor_tenants_tenant_lnk l ON l.editor_tenant_id = e.id
  LEFT JOIN tenants t ON t.id = l.tenant_id
`).all();
console.log(JSON.stringify(rows, null, 2));
const sample = db.prepare('SELECT * FROM editor_tenants WHERE id = 4').get();
console.log(JSON.stringify(sample));
const link = db.prepare('SELECT * FROM editor_tenants_tenant_lnk WHERE editor_tenant_id = 4').get();
console.log('link', JSON.stringify(link));
