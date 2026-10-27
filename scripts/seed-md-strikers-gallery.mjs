/**
 * Idempotent seed: public gallery albums + Capital Cup 2026 (event 45) photos
 * from public/images/md_strikers_media. Safe to re-run.
 */
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3005';
const TENANT = 'md_strikers_10';
const EVENT_ID = 45;
const ROOT = path.resolve('public/images/md_strikers_media');
const TODAY = '2026-10-19';

const ALBUMS = [
  { title: 'Capital Cup 2026', description: 'Capital Cup 2026 flyers and match photos.', displayOrder: 1 },
  { title: 'Capital Cup 2024', description: 'Capital Cup 2024 team photos.', displayOrder: 2 },
  { title: 'KANJ Soccer Tournament 2024', description: 'KANJ Soccer Tournament 2024.', displayOrder: 3 },
  { title: 'MSL 2021 Virginia', description: 'MSL 2021 Virginia.', displayOrder: 4 },
  { title: 'Syro Soccer League 2022', description: 'Syro Soccer League 2022.', displayOrder: 5 },
  { title: 'V P Sathyan Memorial 2024', description: 'V P Sathyan Memorial Tournament 2024.', displayOrder: 6 },
  { title: 'KCS Soccer Tournament 2023', description: 'KCS Soccer Tournament 2023.', displayOrder: 7 },
  { title: 'Internal Tournament 2022', description: 'Internal tournament photos from 2022.', displayOrder: 8 },
  { title: 'Maveli Cup 2023', description: 'Maveli Cup 2023.', displayOrder: 9 },
  { title: 'IM Vijayan', description: 'IM Vijayan with Maryland Strikers.', displayOrder: 10 },
  { title: 'Match Photos', description: 'Match and event photos from the club gallery.', displayOrder: 11 },
  { title: 'Club Gallery', description: 'Club photos and group shots.', displayOrder: 12 },
];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function publicUrl(full) {
  const rel = path.relative(path.resolve('public'), full).split(path.sep).join('/');
  return '/' + rel.split('/').map(encodeURIComponent).join('/');
}

function classify(full) {
  const rel = path.relative(ROOT, full).split(path.sep).join('/').toLowerCase();
  const base = path.basename(full).toLowerCase();
  if (!/\.(jpe?g|png|webp)$/i.test(base)) return null;
  if (rel.includes('logo') || rel.includes('advertisement') || rel.includes('copyright')) return null;
  if (rel.includes('gallery_thumbnail')) return null;
  if (rel.includes('im_vijayan') || rel.includes('im-vijayan')) return 'IM Vijayan';
  if (base === 'capital-2024.jpg' || rel.includes('capital-cup-2024') || rel.includes('capital_cup_2024')) return 'Capital Cup 2024';
  if (rel.includes('capital_cup') || rel.includes('capital-cup') || rel.includes('reji thomas')) return 'Capital Cup 2026';
  if (rel.includes('2024-kanj')) return 'KANJ Soccer Tournament 2024';
  if (rel.includes('2021-msl')) return 'MSL 2021 Virginia';
  if (rel.includes('2022-nj-team')) return 'Syro Soccer League 2022';
  if (rel.includes('2024-namsl')) return 'V P Sathyan Memorial 2024';
  if (rel.includes('soccer-kcs')) return 'KCS Soccer Tournament 2023';
  if (/^gal0[2-5]\./.test(base)) return 'Internal Tournament 2022';
  if (base === 'gal01.jpg') return 'Maveli Cup 2023';
  if (
    rel.includes('mdstrikers_gallery_html_root') ||
    rel.includes('soccer-group') ||
    rel.includes('md-strikers-image') ||
    rel.includes('whatsapp')
  ) {
    return 'Club Gallery';
  }
  if (rel.startsWith('gallery_extra/')) return 'Match Photos';
  if (rel.startsWith('gallery/') && /_n\.(jpe?g|webp|png)$/.test(base)) return 'Match Photos';
  if (rel.startsWith('gallery/')) return 'Club Gallery';
  return null;
}

function titleFromFile(full) {
  const base = path.basename(full, path.extname(full));
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
}

async function api(method, urlPath, body) {
  const res = await fetch(BASE + urlPath, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const files = walk(ROOT);
  const grouped = new Map(ALBUMS.map((a) => [a.title, []]));
  const skipped = [];
  for (const file of files) {
    const album = classify(file);
    if (!album) {
      skipped.push(path.relative(ROOT, file));
      continue;
    }
    grouped.get(album).push(file);
  }

  for (const album of ALBUMS) {
    console.log(`${album.title}: ${grouped.get(album.title).length}`);
  }
  console.log(`skipped: ${skipped.length}`);

  const existingRes = await api('GET', '/api/proxy/gallery-albums?size=100&page=0&isPublic.equals=true');
  if (!existingRes.ok) {
    console.error('album list failed', existingRes.status, existingRes.data);
    process.exit(1);
  }
  const existing = Array.isArray(existingRes.data) ? existingRes.data : [];
  const byTitle = new Map(existing.map((a) => [a.title, a]));

  const now = new Date().toISOString();
  const albumIds = new Map();

  for (const album of ALBUMS) {
    const found = byTitle.get(album.title);
    if (found?.id) {
      albumIds.set(album.title, found.id);
      console.log(`reuse album ${found.id} ${album.title}`);
      continue;
    }
    const cover = grouped.get(album.title)[0];
    const created = await api('POST', '/api/proxy/gallery-albums', {
      title: album.title,
      description: album.description,
      isPublic: true,
      displayOrder: album.displayOrder,
      coverImageUrl: cover ? publicUrl(cover) : '',
      createdAt: now,
      updatedAt: now,
    });
    if (!created.ok || !created.data?.id) {
      console.error('create album failed', album.title, created.status, created.data);
      process.exit(1);
    }
    albumIds.set(album.title, created.data.id);
    console.log(`created album ${created.data.id} ${album.title}`);
  }

  let createdMedia = 0;
  let skippedMedia = 0;

  for (const album of ALBUMS) {
    const albumId = albumIds.get(album.title);
    const mediaRes = await api('GET', `/api/proxy/event-medias?albumId.equals=${albumId}&size=500&page=0`);
    if (!mediaRes.ok) {
      console.error('media list failed', album.title, mediaRes.status, mediaRes.data);
      process.exit(1);
    }
    const have = new Set((Array.isArray(mediaRes.data) ? mediaRes.data : []).map((m) => m.fileUrl));
    let order = have.size;
    for (const file of grouped.get(album.title)) {
      const fileUrl = publicUrl(file);
      if (have.has(fileUrl)) {
        skippedMedia += 1;
        continue;
      }
      order += 1;
      const payload = mediaPayload(titleFromFile(file), fileUrl, order, { albumId });
      const posted = await api('POST', '/api/proxy/event-medias', payload);
      if (!posted.ok) {
        console.error('media failed', fileUrl, posted.status, posted.data);
        process.exit(1);
      }
      createdMedia += 1;
    }
  }

  const eventMediaRes = await api('GET', `/api/proxy/event-medias?eventId.equals=${EVENT_ID}&size=500&page=0`);
  if (!eventMediaRes.ok) {
    console.error('event media list failed', eventMediaRes.status, eventMediaRes.data);
    process.exit(1);
  }
  const eventHave = new Set((Array.isArray(eventMediaRes.data) ? eventMediaRes.data : []).map((m) => m.fileUrl));
  let eventOrder = eventHave.size;
  for (const file of grouped.get('Capital Cup 2026')) {
    const fileUrl = publicUrl(file);
    if (eventHave.has(fileUrl)) {
      skippedMedia += 1;
      continue;
    }
    eventOrder += 1;
    const posted = await api('POST', '/api/proxy/event-medias', mediaPayload(titleFromFile(file), fileUrl, eventOrder, { eventId: EVENT_ID }));
    if (!posted.ok) {
      console.error('event media failed', fileUrl, posted.status, posted.data);
      process.exit(1);
    }
    createdMedia += 1;
  }

  console.log(`done createdMedia=${createdMedia} skippedMedia=${skippedMedia}`);
}

function mediaPayload(title, fileUrl, displayOrder, link) {
  const now = new Date().toISOString();
  return {
    title,
    description: '',
    eventMediaType: 'gallery',
    contentType: 'image/jpeg',
    fileSize: 0,
    storageType: 'EXTERNAL',
    fileUrl,
    isPublic: true,
    eventFlyer: false,
    isAgendaFlyer: false,
    isEventManagementOfficialDocument: false,
    altText: title,
    displayOrder,
    isFeaturedVideo: false,
    featuredVideoUrl: '',
    isHeroImage: false,
    isActiveHeroImage: false,
    isHomePageHeroImage: false,
    isFeaturedEventImage: false,
    isLiveEventImage: false,
    startDisplayingFromDate: TODAY,
    tenantId: TENANT,
    createdAt: now,
    updatedAt: now,
    ...link,
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
