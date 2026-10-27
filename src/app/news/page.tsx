import type { Metadata } from 'next';
import FcUnitedNewsPage from '@/components/fc-united/FcUnitedNewsPage';
import { fetchClubNewsPageData } from '@/lib/news/clubNews';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news from Maryland Strikers Sports Club.',
};

export default async function NewsPage() {
  const data = await fetchClubNewsPageData();
  return <FcUnitedNewsPage data={data} />;
}
