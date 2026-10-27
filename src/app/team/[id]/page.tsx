import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FcUnitedPlayerPage from '@/components/fc-united/FcUnitedPlayerPage';
import { fetchPublicPlayerServer } from '@/components/fc-united/ApiServerActions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = await fetchPublicPlayerServer(Number(id));
  return {
    title: player?.name || 'Player',
    description: player?.bio || player?.position || 'Maryland Strikers player',
  };
}

export default async function TeamPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();
  const player = await fetchPublicPlayerServer(numericId);
  if (!player) notFound();
  return <FcUnitedPlayerPage player={player} />;
}
