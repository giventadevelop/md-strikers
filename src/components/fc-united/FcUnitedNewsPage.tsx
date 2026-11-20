'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { newsHref, type ClubAdSlot, type ClubNewsArticle, type ClubNewsPageData } from '@/lib/news/clubNews';
import { CATALOG_SUGGESTION_LIMIT, FcCatalogTypeahead } from './FcCatalogTypeahead';
import { MdPagination } from './MdPagination';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';

const PAGE_SIZE = 20;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type SectionKey = 'main' | 'featured' | 'press';
type TabKey = 'all' | SectionKey;

type NewsItem = ClubNewsArticle & { sections: SectionKey[]; key: string };

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'main', label: 'Main News' },
  { key: 'featured', label: 'Featured News' },
  { key: 'press', label: 'Press Release' },
];

const TAGS: Record<SectionKey, { label: string; bg: string; ink: string }> = {
  main: { label: 'Main News', bg: '#E3EEFB', ink: '#104A91' },
  featured: { label: 'Featured News', bg: '#FFC857', ink: '#071B38' },
  press: { label: 'Press Release', bg: '#071B38', ink: '#FFFFFF' },
};

const HEADINGS: Record<TabKey, string> = {
  all: 'All news',
  main: 'Main News',
  featured: 'Featured News',
  press: 'Press Release',
};

function articleKey(article: ClubNewsArticle): string {
  return article.documentId || article.slug || String(article.id);
}

function formatNewsDate(value: string | null): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return '';
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return '';
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

function mergeArticles(data: ClubNewsPageData): NewsItem[] {
  const map = new Map<string, NewsItem>();
  const add = (articles: ClubNewsArticle[], section: SectionKey) => {
    articles.forEach((article) => {
      const key = articleKey(article);
      const existing = map.get(key);
      if (existing) {
        if (!existing.sections.includes(section)) existing.sections.push(section);
        return;
      }
      map.set(key, { ...article, sections: [section], key });
    });
  };
  add(data.mainNews, 'main');
  add(data.featured, 'featured');
  add(data.pressRelease, 'press');
  return [...map.values()].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
}

function tagFor(item: NewsItem, tab: TabKey) {
  const section = tab !== 'all' && item.sections.includes(tab) ? tab : item.sections[0];
  return TAGS[section];
}

function articleHay(article: NewsItem) {
  return [article.title, article.excerpt, article.categoryName, article.slug, article.id].filter(Boolean).join(' ');
}

function wordsMatch(haystack: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack.toLowerCase();
  return words.every((word) => hay.includes(word));
}

function AdCreative({ slot }: { slot: ClubAdSlot }) {
  if (slot.embedHtml) {
    return <div className="md-nw-ad__html" dangerouslySetInnerHTML={{ __html: slot.embedHtml }} />;
  }
  if (!slot.mediaUrl) return null;
  const image = <img src={slot.mediaUrl} alt="Advertisement" />;
  if (!slot.linkUrl) return image;
  return (
    <a href={slot.linkUrl} target="_blank" rel="noopener noreferrer">
      {image}
    </a>
  );
}

function InlineAd({ slots, place }: { slots: ClubAdSlot[]; place: 'top' | 'between' }) {
  const creatives = slots.filter((slot) => slot.embedHtml || slot.mediaUrl);
  return (
    <div
      className={`md-nw-ad md-nw-ad--${place}${creatives.length > 0 ? ' md-nw-ad--live' : ''}`}
      role="complementary"
      aria-label="Advertisement"
    >
      {creatives.length === 0 ? (
        <>
          <span>Advertisement</span>
          <p>No advertisements at the moment.</p>
        </>
      ) : (
        creatives.map((slot) => <AdCreative key={`${slot.position}-${slot.id}`} slot={slot} />)
      )}
    </div>
  );
}

function Cover({ article, kind }: { article: NewsItem; kind: 'lead' | 'row' }) {
  return (
    <span className={`md-nw-media md-nw-media--${kind}`}>
      <span aria-hidden="true" />
      {article.coverUrl ? <img src={article.coverUrl} alt="" /> : <span className="md-nw-ph" />}
    </span>
  );
}

/** How many cards sit above the in-feed ad. Keeps that ad clear of the top slot and leaves a few cards below it. */
function cardsBeforeBetweenAd(count: number): number | null {
  if (count < 2) return null;
  if (count <= 4) return Math.ceil(count / 2);
  return count >= 6 ? count - 4 : count - 3;
}

const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function FcUnitedNewsPage({ data }: { data: ClubNewsPageData }) {
  const articles = useMemo(() => mergeArticles(data), [data]);
  const newestKey = articles[0]?.key ?? '';
  const [tab, setTab] = useState<TabKey>('all');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const needle = query.trim();
  const searched = needle ? articles.filter((article) => wordsMatch(articleHay(article), needle)) : articles;
  const suggestionRows = draft.trim() ? articles.filter((article) => wordsMatch(articleHay(article), draft)) : [];
  const commitSearch = (value: string) => {
    const next = value.trim();
    setDraft(next);
    setQuery(next);
    setPage(0);
  };
  const list = tab === 'all' ? searched : searched.filter((article) => article.sections.includes(tab));
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);
  const lead = pageItems[0]?.coverUrl ? pageItems[0] : null;
  const rows = lead ? pageItems.slice(1) : pageItems;
  const cardsBeforeAd = cardsBeforeBetweenAd(pageItems.length);
  const betweenAfter = (visualIndex: number) => cardsBeforeAd !== null && visualIndex + 1 === cardsBeforeAd;
  const counts: Record<TabKey, number> = {
    all: searched.length,
    main: searched.filter((article) => article.sections.includes('main')).length,
    featured: searched.filter((article) => article.sections.includes('featured')).length,
    press: searched.filter((article) => article.sections.includes('press')).length,
  };

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="news" />
      <main className="md-nw">
        <div className="md-nw-hero">
          <div className="md-nw-wrap">
            <p className="md-nw-kicker">
              <span />
              Club news
            </p>
            <h1>News</h1>
            <p>Latest news from Maryland Strikers.</p>
          </div>
        </div>

        <div className="md-nw-filters">
          <div className="md-nw-wrap md-nw-filtercard">
            <div role="tablist" aria-label="News sections">
              {TABS.map((item) => {
                const on = tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      setTab(item.key);
                      setPage(0);
                    }}
                  >
                    {item.label}
                    <span>{counts[item.key]}</span>
                  </button>
                );
              })}
            </div>
            <FcCatalogTypeahead
              draft={draft}
              onDraftChange={setDraft}
              onCommit={commitSearch}
              suggestions={suggestionRows.slice(0, CATALOG_SUGGESTION_LIMIT).map((article) => ({
                key: article.key,
                label: article.title,
                hint: article.categoryName || formatNewsDate(article.publishedAt) || undefined,
                commitValue: article.title,
              }))}
              totalCount={suggestionRows.length}
              placeholder="Search by title or topic…"
              ariaLabel="Search articles by title, topic, or id"
              leading={(
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              )}
            />
          </div>
        </div>

        <div className="md-nw-board">
          <div className="md-nw-wrap md-nw-layout">
            <div className="md-nw-feed">
              <div className="md-nw-feedhead">
                <h2>{HEADINGS[tab]}</h2>
                <span>{list.length}</span>
              </div>

              <InlineAd slots={data.topAds} place="top" />

              {lead && (
                <Link href={newsHref(lead)} className="md-nw-lead">
                  <Cover article={lead} kind="lead" />
                  <span className="md-nw-lead__copy">
                    <span className="md-nw-lead__meta">
                      {lead.key === newestKey && <span className="md-nw-latest">Latest</span>}
                      <span>{tagFor(lead, tab).label}</span>
                    </span>
                    <span className="md-nw-title">{lead.title}</span>
                    {lead.publishedAt && <span className="md-nw-date">{formatNewsDate(lead.publishedAt)}</span>}
                    {lead.excerpt && <span className="md-nw-excerpt">{lead.excerpt}</span>}
                    <span className="md-nw-read">
                      Read article
                      {arrow}
                    </span>
                  </span>
                </Link>
              )}
              {lead && betweenAfter(0) && <InlineAd slots={data.betweenAds} place="between" />}

              {rows.length > 0 && (
                <div className="md-nw-rows">
                  {rows.map((article, index) => {
                    const section = tab !== 'all' && article.sections.includes(tab) ? tab : article.sections[0];
                    const visualIndex = lead ? index + 1 : index;
                    return (
                      <div key={article.key} className="md-nw-rows__item">
                        <Link href={newsHref(article)} className="md-nw-row">
                          <Cover article={article} kind="row" />
                          <span className="md-nw-row__copy">
                            <span className="md-nw-row__meta">
                              <span className="md-nw-tag" data-section={section}>
                                {TAGS[section].label}
                              </span>
                              {article.publishedAt && <span>{formatNewsDate(article.publishedAt)}</span>}
                            </span>
                            <span className="md-nw-title">{article.title}</span>
                            {article.excerpt && <span className="md-nw-excerpt">{article.excerpt}</span>}
                          </span>
                          <span className="md-nw-go" aria-hidden="true">
                            {arrow}
                          </span>
                        </Link>
                        {betweenAfter(visualIndex) && <InlineAd slots={data.betweenAds} place="between" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {list.length === 0 && (
                <div className="md-nw-empty">
                  <h3>No articles found</h3>
                  <p>{needle ? 'Nothing matches the current search.' : 'No articles at the moment. Check back later.'}</p>
                  {needle && (
                    <button type="button" onClick={() => commitSearch('')}>
                      Clear search
                    </button>
                  )}
                </div>
              )}

              <MdPagination
                page={safePage}
                pageSize={PAGE_SIZE}
                totalCount={list.length}
                onPageChange={setPage}
                itemLabel="articles"
                itemLabelSingular="article"
              />
            </div>

            <aside className="md-nw-side">
              {data.mostRead.length > 0 && (
                <div className="md-nw-most">
                  <h2>
                    <span aria-hidden="true" />
                    Most Read
                  </h2>
                  <div>
                    {data.mostRead.map((article, index) => (
                      <Link key={articleKey(article)} href={newsHref(article)}>
                        <span data-lead={index === 0 ? 'true' : 'false'}>{String(index + 1).padStart(2, '0')}</span>
                        <span>
                          <strong>{article.title}</strong>
                          {article.publishedAt && <em>{formatNewsDate(article.publishedAt)}</em>}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="md-nw-sidead">
                <h2>Advertisement</h2>
                {data.sidebarAds.some((slot) => slot.embedHtml || slot.mediaUrl) ? (
                  data.sidebarAds.map((slot) => <AdCreative key={`${slot.position}-${slot.id}`} slot={slot} />)
                ) : (
                  <p>No advertisements at the moment.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
