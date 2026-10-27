import type { Metadata } from 'next';
import FcUnitedSponsorsPage from '@/components/fc-united/FcUnitedSponsorsPage';

export const metadata: Metadata = {
  title: 'Sponsors',
  description: 'Maryland Strikers sponsors and club partners.',
};

export const dynamic = 'force-dynamic';

export default function SponsorsPage() {
  return <FcUnitedSponsorsPage />;
}
