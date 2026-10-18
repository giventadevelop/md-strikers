import type { Metadata } from 'next';
import FcUnitedTeamPage from '@/components/fc-united/FcUnitedTeamPage';
import { fetchFirstTeamSquadPlayersServer } from '@/components/fc-united/ApiServerActions';

export const metadata: Metadata = {
  title: 'Sports Team',
  description: 'Maryland Strikers sports team — squad photos with full-screen slideshow.',
};

export const dynamic = 'force-dynamic';

/** First Team roster from team_groups (slug first-team) + team_members, gallery-style grid + lightbox. */
export default async function TeamPage() {
  const players = await fetchFirstTeamSquadPlayersServer();
  const items = players.map((p) => ({
    src: p.img,
    title: p.name,
    tag: p.role,
    kind: 'image' as const,
  }));

  return <FcUnitedTeamPage items={items} />;
}
