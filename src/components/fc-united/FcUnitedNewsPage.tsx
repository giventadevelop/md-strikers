'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { newsHref, type ClubAdSlot, type ClubNewsArticle, type ClubNewsPageData } from '@/lib/news/clubNews';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { MdPagination } from './MdPagination';

const MAIN_NEWS_PAGE_SIZE = 20;

const secondaryCta =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-brand-orange/55 bg-white px-6 py-2.5 text-sm font-semibold text-pitch-charcoal transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange hover:bg-brand-orange/[0.06] hover:text-pitch-olive motion-reduce:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive';

const sectionLinks = [
  { id: 'main-news', label: 'Main News' },
  { id: 'featured-news', label: 'Featured News' },
  { id: 'press-release', label: 'Press Release' },
  { id: 'most-read', label: 'Most Read' },
] as const;

function formatNewsDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function NewsCard({ article }: { article: ClubNewsArticle }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white transition-colors duration-300 hover:border-pitch-charcoal/25">
      <Link href={newsHref(article)} className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-olive">
        {article.coverUrl ? (
          <div className="relative w-full bg-pitch-charcoal/[0.06]">
            <Image
              src={article.coverUrl}
              alt={article.coverAlt}
              width={1200}
              height={900}
              className="block h-auto w-full"
              sizes="(max-width: 768px) 100vw, 40vw"
              unoptimized
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full bg-pitch-charcoal/[0.06]" aria-hidden />
        )}
        <div className="flex flex-1 flex-col p-5">
          {article.publishedAt && <p className="text-xs text-pitch-charcoal/70">{formatNewsDate(article.publishedAt)}</p>}
          <h3 className={cn('font-extrabold tracking-[-0.02em] mt-2 line-clamp-2 text-xl text-pitch-charcoal')}>{article.title}</h3>
          {article.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-pitch-charcoal/70">{article.excerpt}</p>}
        </div>
      </Link>
    </article>
  );
}

function AdCreative({ slot }: { slot: ClubAdSlot }) {
  if (slot.embedHtml) {
    return <div className="prose prose-sm max-w-none [&_iframe]:max-w-full" dangerouslySetInnerHTML={{ __html: slot.embedHtml }} />;
  }
  if (!slot.mediaUrl) return null;
  const image = (
    <div className="relative w-full">
      <Image
        src={slot.mediaUrl}
        alt="Advertisement"
        width={1200}
        height={600}
        className="block h-auto w-full"
        sizes="(max-width: 1024px) 100vw, 380px"
        unoptimized
      />
    </div>
  );
  if (!slot.linkUrl) return image;
  return (
    <a href={slot.linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90">
      {image}
    </a>
  );
}

function AdSlots({ slots, emptyLabel }: { slots: ClubAdSlot[]; emptyLabel?: string }) {
  if (slots.length === 0) {
    if (!emptyLabel) return null;
    return (
      <div className="rounded-xl border border-pitch-charcoal/10 bg-white p-6">
        <h3 className={cn('font-extrabold tracking-[-0.02em] text-xl text-pitch-charcoal')}>Advertisement</h3>
        <p className="mt-2 text-sm text-pitch-charcoal/70">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={`${slot.position}-${slot.id}`} className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white p-4">
          <AdCreative slot={slot} />
        </div>
      ))}
    </div>
  );
}

function ArticleSection({
  id,
  title,
  articles,
}: {
  id: string;
  title: string;
  articles: ClubNewsArticle[];
}) {
  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white">
      <h2 className={cn('font-extrabold tracking-[-0.02em] border-b border-l-[7px] border-pitch-charcoal/10 border-l-pitch-olive px-5 py-4 text-2xl text-pitch-charcoal')}>
        {title}
      </h2>
      {articles.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {articles.map((article) => (
            <NewsCard key={article.documentId || article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-sm text-pitch-charcoal/70">No articles at the moment. Check back later.</p>
      )}
    </section>
  );
}

export default function FcUnitedNewsPage({ data }: { data: ClubNewsPageData }) {
  const [page, setPage] = useState(0);
  const totalCount = data.mainNews.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / MAIN_NEWS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleMain = data.mainNews.slice(safePage * MAIN_NEWS_PAGE_SIZE, (safePage + 1) * MAIN_NEWS_PAGE_SIZE);
  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="news" />
      <FcUnitedInnerHero title="News" subtitle="Latest news from Maryland Strikers." />
      <main className="bg-pitch-chalk py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="News sections">
            {sectionLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} className={secondaryCta}>
                {link.label}
              </a>
            ))}
          </nav>

          {data.topAds.length > 0 && (
            <div className="mb-8">
              <AdSlots slots={data.topAds} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <ArticleSection id="main-news" title="Main News" articles={visibleMain} />
              <MdPagination
                page={safePage}
                pageSize={MAIN_NEWS_PAGE_SIZE}
                totalCount={totalCount}
                onPageChange={setPage}
                itemLabel="articles"
              />
              <ArticleSection id="featured-news" title="Featured News" articles={data.featured} />
              {data.betweenAds.length > 0 && <AdSlots slots={data.betweenAds} />}
              <ArticleSection id="press-release" title="Press Release" articles={data.pressRelease} />
              <ArticleSection id="most-read" title="Most Read" articles={data.mostRead} />
            </div>
            <aside>
              <AdSlots slots={data.sidebarAds} emptyLabel="No advertisements at the moment." />
            </aside>
          </div>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
