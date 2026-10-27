import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FcUnitedNewsArticlePage from '@/components/fc-united/FcUnitedNewsArticlePage';
import { fetchClubNewsArticle } from '@/lib/news/clubNews';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchClubNewsArticle(slug);
  if (!article) return { title: 'News' };
  return { title: article.title, description: article.excerpt || undefined };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchClubNewsArticle(slug);
  if (!article) notFound();
  return <FcUnitedNewsArticlePage article={article} />;
}
