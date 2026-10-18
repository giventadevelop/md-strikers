import type { Metadata } from 'next';
import FcUnitedTournamentsPage from '@/components/fc-united/FcUnitedTournamentsPage';

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Published tournaments for this sports club.',
};

/** Catalog of published tenant tournaments, linking into /tournaments/[slug]. */
export default function TournamentsPage() {
  return <FcUnitedTournamentsPage />;
}
