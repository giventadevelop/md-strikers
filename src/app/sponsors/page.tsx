import type { Metadata } from 'next';
import FcUnitedSponsorsPage from '@/components/fc-united/FcUnitedSponsorsPage';
import { fetchHomepageSponsorsServer } from '@/components/fc-united/ApiServerActions';

export const metadata: Metadata = {
  title: 'Sponsors',
  description: 'Maryland Strikers sponsors and club partners.',
};

export const dynamic = 'force-dynamic';

export default async function SponsorsPage() {
  const sponsors = await fetchHomepageSponsorsServer(50);
  return <FcUnitedSponsorsPage sponsors={sponsors} />;
}
