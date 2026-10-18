import type { Metadata } from 'next';
import FcUnitedExecutiveTeamPage from '@/components/fc-united/FcUnitedExecutiveTeamPage';
import { fetchExecutiveTeamServer } from '@/components/fc-united/ApiServerActions';

export const metadata: Metadata = {
  title: 'Executive Team',
  description: 'Maryland Strikers organization committee — the executive team that runs the club.',
};

export const dynamic = 'force-dynamic';

export default async function ExecutiveTeamPage() {
  const members = await fetchExecutiveTeamServer(50);
  return <FcUnitedExecutiveTeamPage members={members} />;
}
