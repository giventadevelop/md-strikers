import { fetchStrapi, getStrapiTenantId, getStrapiUrl } from '@/lib/strapi';

export type ClubNewsArticle = {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  coverAlt: string;
  publishedAt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

export type ClubAdSlot = {
  id: number;
  position: string;
  embedHtml: string | null;
  mediaUrl: string | null;
  linkUrl: string | null;
  /** False when the admin news-ad switch hides this creative. Missing means shown. */
  isVisible: boolean;
};

export type ClubNewsPageData = {
  mainNews: ClubNewsArticle[];
  featured: ClubNewsArticle[];
  pressRelease: ClubNewsArticle[];
  mostRead: ClubNewsArticle[];
  topAds: ClubAdSlot[];
  betweenAds: ClubAdSlot[];
  sidebarAds: ClubAdSlot[];
};

const POPULATE = 'populate[0]=cover&populate[1]=category';

function mediaUrl(media: unknown): string | null {
  if (!media) return null;
  const base = getStrapiUrl().replace(/\/$/, '');
  let record = media as Record<string, unknown>;
  if (Array.isArray(media) && media[0]) record = media[0] as Record<string, unknown>;
  let url = record.url as string | undefined;
  const data = record.data as Record<string, unknown> | undefined;
  if (!url) url = data?.url as string | undefined;
  if (!url) {
    const attrs = data?.attributes as Record<string, unknown> | undefined;
    url = attrs?.url as string | undefined;
  }
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function mediaAlt(media: unknown): string {
  if (!media) return '';
  let record = media as Record<string, unknown>;
  if (Array.isArray(media) && media[0]) record = media[0] as Record<string, unknown>;
  return (record.alternativeText as string) || '';
}

function plainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapArticle(raw: Record<string, unknown>): ClubNewsArticle | null {
  const attrs = (raw.attributes as Record<string, unknown> | undefined) ?? raw;
  const title = `${attrs.title || ''}`.trim();
  if (!title) return null;
  const description = typeof attrs.description === 'string' ? attrs.description : '';
  const documentId = `${raw.documentId || attrs.documentId || ''}`.trim();
  const slug = `${attrs.slug || ''}`.trim();
  const id = Number(raw.id ?? attrs.id ?? 0);
  const category = (attrs.category as Record<string, unknown> | null) || null;
  const categoryData = (category?.data as Record<string, unknown> | undefined) ?? undefined;
  const categoryAttrs =
    (category?.attributes as Record<string, unknown> | undefined) ??
    (categoryData?.attributes as Record<string, unknown> | undefined) ??
    categoryData ??
    category;
  const categorySlug = categoryAttrs ? `${categoryAttrs.slug || ''}`.trim() || null : null;
  return {
    id,
    documentId,
    slug: slug || documentId || String(id),
    title,
    excerpt: plainText(description).slice(0, 220),
    body: description,
    coverUrl: mediaUrl(attrs.cover),
    coverAlt: mediaAlt(attrs.cover) || title,
    publishedAt: (attrs.publishedAt as string) || null,
    categoryName: categoryAttrs ? `${categoryAttrs.name || ''}`.trim() || null : null,
    categorySlug,
  };
}

function mapAd(raw: Record<string, unknown>): ClubAdSlot | null {
  const attrs = (raw.attributes as Record<string, unknown> | undefined) ?? raw;
  const position = `${attrs.position || ''}`.trim().toLowerCase().replace(/-/g, '_');
  if (!position) return null;
  return {
    id: Number(raw.id ?? attrs.id ?? 0),
    position,
    embedHtml: typeof attrs.embedHtml === 'string' && attrs.embedHtml.trim() ? attrs.embedHtml : null,
    mediaUrl: mediaUrl(attrs.media),
    linkUrl: typeof attrs.linkUrl === 'string' && attrs.linkUrl.trim() ? attrs.linkUrl : null,
    isVisible: attrs.isVisible !== false,
  };
}

function tenantFilter(): string {
  return `filters[tenant][tenantId][$eq]=${encodeURIComponent(getStrapiTenantId())}`;
}

export function newsHref(article: Pick<ClubNewsArticle, 'slug' | 'documentId' | 'id'>): string {
  return `/news/${encodeURIComponent(article.slug || article.documentId || String(article.id))}`;
}

function mapRows(rows: unknown[]): ClubNewsArticle[] {
  return rows
    .map((row) => mapArticle(row as Record<string, unknown>))
    .filter((row): row is ClubNewsArticle => row !== null);
}

export async function fetchClubNewsArticles(limit = 20): Promise<ClubNewsArticle[]> {
  const path = `/articles?${tenantFilter()}&filters[publishedAt][$notNull]=true&${POPULATE}&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=${limit}`;
  const result = await fetchStrapi<unknown[]>(path);
  const rows = Array.isArray(result?.data) ? result.data : [];
  return mapRows(rows);
}

const NEWS_SECTIONS = {
  mainNews: 'main-news',
  featured: 'featured-news',
  pressRelease: 'press-release',
  mostRead: 'most-read',
} as const;

async function fetchCategoryArticles(slug: string, pageSize: number): Promise<ClubNewsArticle[]> {
  const articles: ClubNewsArticle[] = [];
  const chunk = 100;
  let page = 1;
  while (articles.length < pageSize && page <= 10) {
    const path = `/articles?${tenantFilter()}&filters[publishedAt][$notNull]=true&filters[category][slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${chunk}`;
    const result = await fetchStrapi<unknown[]>(path);
    const rows = Array.isArray(result?.data) ? result.data : [];
    articles.push(...mapRows(rows));
    if (rows.length < chunk) break;
    page += 1;
  }
  return articles.slice(0, pageSize);
}

/** Sectioned news page: Main, Featured, Press Release, Most Read, plus advertisement slots. */
export async function fetchClubNewsPageData(): Promise<ClubNewsPageData> {
  const empty: ClubNewsPageData = {
    mainNews: [],
    featured: [],
    pressRelease: [],
    mostRead: [],
    topAds: [],
    betweenAds: [],
    sidebarAds: [],
  };
  const [mainNews, featured, pressRelease, mostRead, adsEnabled] = await Promise.all([
    fetchCategoryArticles(NEWS_SECTIONS.mainNews, 200),
    fetchCategoryArticles(NEWS_SECTIONS.featured, 6),
    fetchCategoryArticles(NEWS_SECTIONS.pressRelease, 10),
    fetchCategoryArticles(NEWS_SECTIONS.mostRead, 5),
    import('@/lib/news/newsAdsEnabled')
      .then((mod) => mod.newsAdvertisementsEnabled())
      .catch(() => true),
  ]);
  const articles = { mainNews, featured, pressRelease, mostRead };
  if (!adsEnabled) {
    return { ...empty, ...articles };
  }
  const adsPath = `/advertisement-slots?filters[$or][0][position][$eq]=sidebar&filters[$or][1][position][$eq]=top&filters[$or][2][position][$eq]=between_sections&${tenantFilter()}&populate=media&sort=priority:asc&pagination[pageSize]=20`;
  const adsRes = await fetchStrapi<unknown[]>(adsPath);
  const ads = (Array.isArray(adsRes?.data) ? adsRes.data : [])
    .map((row) => mapAd(row as Record<string, unknown>))
    .filter((row): row is ClubAdSlot => row !== null && row.isVisible);
  return {
    ...empty,
    ...articles,
    topAds: ads.filter((ad) => ad.position === 'top'),
    betweenAds: ads.filter((ad) => ad.position === 'between_sections'),
    sidebarAds: ads.filter((ad) => ad.position === 'sidebar'),
  };
}

/** Full published list for /news. The page then shows 20 articles at a time. */
export async function fetchClubNewsCatalog(maxArticles = 200): Promise<ClubNewsArticle[]> {
  const pageSize = 100;
  const articles: ClubNewsArticle[] = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount && articles.length < maxArticles) {
    const path = `/articles?${tenantFilter()}&filters[publishedAt][$notNull]=true&${POPULATE}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const result = await fetchStrapi<unknown[]>(path);
    const rows = Array.isArray(result?.data) ? result.data : [];
    articles.push(...mapRows(rows));
    pageCount = result?.meta?.pagination?.pageCount ?? page;
    if (rows.length === 0 || rows.length < pageSize) break;
    page += 1;
  }

  return articles.slice(0, maxArticles);
}

export async function fetchClubNewsArticle(param: string): Promise<ClubNewsArticle | null> {
  const value = decodeURIComponent(param);
  const filters = [/^\d+$/.test(value) ? `filters[id][$eq]=${value}` : null, `filters[slug][$eq]=${encodeURIComponent(value)}`, `filters[documentId][$eq]=${encodeURIComponent(value)}`].filter(
    (item): item is string => Boolean(item)
  );
  for (const filter of filters) {
    const path = `/articles?${tenantFilter()}&filters[publishedAt][$notNull]=true&${filter}&${POPULATE}&pagination[pageSize]=1`;
    const result = await fetchStrapi<unknown[]>(path);
    const row = Array.isArray(result?.data) ? result.data[0] : null;
    if (row) {
      const article = mapArticle(row as Record<string, unknown>);
      if (article) return article;
    }
  }
  return null;
}
