import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FcUnitedTournamentPage from '@/components/fc-united/FcUnitedTournamentPage';
import { fetchPublishedTournaments, fetchTournamentBySlug } from '@/lib/tournaments/publicTournaments';

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>).then === 'function' ? await params : params;
  const tournament = await fetchTournamentBySlug(resolved.slug);
  if (!tournament) return { title: 'Tournament' };
  return {
    title: tournament.title,
    description: tournament.welcomeText || `${tournament.title} hosted tournament.`,
  };
}

export default async function TournamentSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolved = typeof (params as Promise<{ slug: string }>).then === 'function' ? await params : params;
  const tournament = await fetchTournamentBySlug(resolved.slug);
  if (!tournament) notFound();
  const published = await fetchPublishedTournaments();
  const previous = published.filter((row) => row.slug !== tournament.slug);
  return <FcUnitedTournamentPage tournament={tournament} previous={previous} />;
}
