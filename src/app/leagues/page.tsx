import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchPublishedLeaguesServer } from '@/components/fc-united/ApiServerActions';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { FcUnitedInnerHero } from '@/components/fc-united/FcUnitedInnerHero';
import { fcManrope } from '@/components/fc-united/fcUnitedFonts';
import { PitchShell } from '@/components/fc-united/pitchUi';

export const metadata: Metadata = {
  title: 'Leagues',
  description: 'Published league tables for Maryland Strikers.',
};

export const dynamic = 'force-dynamic';

export default async function LeaguesPage() {
  const leagues = await fetchPublishedLeaguesServer();
  return (
    <div className={cn(fcManrope.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader active="leagues" />
      <FcUnitedInnerHero title="Leagues" subtitle="Tables, clubs, and results for each published league." />
      <section className="bg-pitch-chalk pb-20 pt-10">
        <PitchShell>
          {leagues.length === 0 ? (
            <p className="rounded-xl border border-pitch-charcoal/10 bg-white p-10 text-center text-pitch-charcoal/70">
              No published leagues yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {leagues.map((league) => (
                <li key={league.id}>
                  <Link
                    href={`/leagues/${league.slug}`}
                    className="flex h-full flex-col rounded-xl border border-pitch-charcoal/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
                      {league.seasonLabel || league.status || 'League'}
                    </p>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-pitch-charcoal">{league.name}</h2>
                    {league.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-pitch-charcoal/70">{league.description}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PitchShell>
      </section>
      <FcUnitedFooter />
    </div>
  );
}
