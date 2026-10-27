/**
 * Add published main-news articles until tenant md_strikers_10 has 120.
 * Reuses the existing Capital Cup cover file. Does not touch tenant settings.
 */
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = 'C:/project_workspace/strapi-editorial-template/.tmp/data.db';
const TENANT_SQLITE_ID = 4;
const CATEGORY_ID = 11;
const COVER_FILE_ID = 34265;
const TARGET = 120;

const db = new DatabaseSync(DB_PATH);
const current = db.prepare(`
  SELECT count(*) AS c
  FROM articles a
  JOIN articles_category_lnk l ON l.article_id = a.id
  JOIN articles_tenant_lnk t ON t.article_id = a.id
  WHERE a.published_at IS NOT NULL
    AND l.category_id = ?
    AND t.tenant_id = ?
`).get(CATEGORY_ID, TENANT_SQLITE_ID).c;

const need = Math.max(0, TARGET - current);
console.log('main-news published', current, 'adding', need);
if (need === 0) process.exit(0);

const insertArticle = db.prepare(`
  INSERT INTO articles (
    document_id, title, description, slug, views, is_featured,
    published_at, created_at, updated_at, locale
  ) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, NULL)
`);
const insertCategory = db.prepare(`
  INSERT INTO articles_category_lnk (article_id, category_id, article_ord)
  VALUES (?, ?, ?)
`);
const insertTenant = db.prepare(`
  INSERT INTO articles_tenant_lnk (article_id, tenant_id) VALUES (?, ?)
`);
const insertCover = db.prepare(`
  INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
  VALUES (?, ?, 'api::article.article', 'cover', 1)
`);

const basePublished = Date.now() - 40 * 24 * 60 * 60 * 1000;

db.exec('BEGIN');
try {
  for (let i = 1; i <= need; i += 1) {
    const n = String(i).padStart(3, '0');
    const slug = `club-bulletin-${n}`;
    const exists = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
    if (exists) continue;
    const stamp = basePublished - i * 60 * 60 * 1000;
    const title = `Club Bulletin ${n}`;
    const description = `Maryland Strikers club bulletin ${n}. Match notes, training times, and fixture updates for the pagination list.`;
    const info = insertArticle.run(
      `pgb${n}${Date.now().toString(36)}`.slice(0, 24),
      title,
      description,
      slug,
      stamp,
      stamp,
      stamp,
    );
    const articleId = Number(info.lastInsertRowid);
    insertCategory.run(articleId, CATEGORY_ID, i);
    insertTenant.run(articleId, TENANT_SQLITE_ID);
    insertCover.run(COVER_FILE_ID, articleId);
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

const after = db.prepare(`
  SELECT count(*) AS c
  FROM articles a
  JOIN articles_category_lnk l ON l.article_id = a.id
  JOIN articles_tenant_lnk t ON t.article_id = a.id
  WHERE a.published_at IS NOT NULL
    AND l.category_id = ?
    AND t.tenant_id = ?
`).get(CATEGORY_ID, TENANT_SQLITE_ID).c;
console.log('main-news published now', after);
