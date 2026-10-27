import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/project_workspace/strapi-editorial-template/.tmp/data.db');
const rows = db.prepare(`
  SELECT id FROM articles
  WHERE document_id IN ('w6mplyq75q3hq23eabmd8nl4', 'c0vanfft4ck6daxs1r78wjhf')
    AND published_at IS NOT NULL
`).all();
const insert = db.prepare('INSERT INTO articles_tenant_lnk (article_id, tenant_id) VALUES (?, 4)');
for (const row of rows) {
  const existing = db.prepare('SELECT id FROM articles_tenant_lnk WHERE article_id = ?').get(row.id);
  if (existing) {
    console.log('already linked', row.id);
    continue;
  }
  insert.run(row.id);
  console.log('linked published article', row.id);
}
