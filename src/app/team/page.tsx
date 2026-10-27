import type { Metadata } from 'next';
import FcUnitedTeamPage from '@/components/fc-united/FcUnitedTeamPage';
import { fetchPublicRosterServer } from '@/components/fc-united/ApiServerActions';

export const metadata: Metadata = {
  title: 'Sports Team',
  description: 'Maryland Strikers first-team roster.',
};

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const players = await fetchPublicRosterServer();
  return <FcUnitedTeamPage players={players} />;
}
