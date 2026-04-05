import type { Metadata } from 'next';
import FcUnitedTeamPage from '@/components/fc-united/FcUnitedTeamPage';
import { loadFcSquadFirstTeamPlayers } from '@/components/fc-united/fcSquadMembersFromDisk';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Maryland Strikers First Team — squad photos with full-screen slideshow.',
};

/** Re-read `squad/members` on every request so new files appear without a rebuild. */
export const dynamic = 'force-dynamic';

/** First Team roster photos — same source as the home carousel (`squad/members`), gallery-style grid + lightbox. */
export default function TeamPage() {
  const players = loadFcSquadFirstTeamPlayers();
  const items = players.map((p) => ({
    src: p.img,
    title: p.name,
    tag: p.role,
    kind: 'image' as const,
  }));

  return <FcUnitedTeamPage items={items} />;
}
