import type { Metadata } from 'next';
import FcUnitedTeamPage from '@/components/fc-united/FcUnitedTeamPage';
import {
  fetchPublicRosterServer,
  fetchPublicSquadMembershipsServer,
  fetchPublicSquadsServer,
} from '@/components/fc-united/ApiServerActions';

export const metadata: Metadata = {
  title: 'Sports Team',
  description: 'Maryland Strikers squad roster.',
};

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const [players, squads, memberships] = await Promise.all([
    fetchPublicRosterServer(),
    fetchPublicSquadsServer(),
    fetchPublicSquadMembershipsServer(),
  ]);
  return <FcUnitedTeamPage players={players} squads={squads} memberships={memberships} />;
}
