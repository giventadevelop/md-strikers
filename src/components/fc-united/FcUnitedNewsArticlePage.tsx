import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ClubNewsArticle } from '@/lib/news/clubNews';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function formatNewsDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function FcUnitedNewsArticlePage({ article }: { article: ClubNewsArticle }) {
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="news" />
      <FcUnitedInnerHero title="News" subtitle={article.title} />
      <main className="bg-pitch-chalk py-12 md:py-16">
        <article className="mx-auto w-full max-w-[860px] px-4 md:px-7">
          <Link
            href="/news"
            className="mb-6 inline-flex text-sm font-semibold text-pitch-olive hover:bg-pitch-olive"
          >
            All news
          </Link>
          <div className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white">
            {article.coverUrl && (
              <div className="relative w-full bg-pitch-charcoal/[0.06]">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt}
                  width={1600}
                  height={1200}
                  className="block h-auto w-full"
                  sizes="860px"
                  unoptimized
                />
              </div>
            )}
            <div className="p-6 md:p-8">
              {article.publishedAt && <p className="text-xs text-pitch-charcoal/70">{formatNewsDate(article.publishedAt)}</p>}
              <h1 className={cn('font-extrabold tracking-[-0.02em] mt-2 text-3xl text-pitch-charcoal md:text-4xl')}>{article.title}</h1>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-pitch-charcoal">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
