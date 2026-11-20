import Image from 'next/image';
import Link from 'next/link';
import type { ClubNewsArticle } from '@/lib/news/clubNews';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';

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
  const published = formatNewsDate(article.publishedAt);

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="news" />
      <main className="md-nw">
        <div className="md-nw-hero">
          <div className="md-nw-wrap">
            <nav className="md-nw-crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/news">News</Link>
            </nav>
            <div className="md-nw-kicker">
              <span />
              {article.categoryName || 'Club news'}
            </div>
            <h1>{article.title}</h1>
            {published ? <p className="md-nw-article-date">{published}</p> : null}
          </div>
        </div>

        <article className="md-nw-article">
          <div className="md-nw-wrap md-nw-article__card">
            <Link href="/news" className="md-nw-back">
              All news
            </Link>
            {article.coverUrl ? (
              <div className="md-nw-article__cover">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt}
                  width={1600}
                  height={1200}
                  sizes="(min-width: 1024px) 1180px, 100vw"
                  unoptimized
                />
              </div>
            ) : null}
            {article.excerpt ? <p className="md-nw-article__excerpt">{article.excerpt}</p> : null}
            <div className="md-nw-article__body">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
