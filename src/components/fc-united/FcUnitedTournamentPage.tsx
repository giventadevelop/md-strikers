import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import type { PublicTournament } from '@/lib/tournaments/publicTournaments';
import { menuLabel } from '@/lib/tournaments/publicTournaments';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>;
}

function filled(value?: string | null) {
  return Boolean(value && value.trim());
}

export default function FcUnitedTournamentPage({
  tournament,
  previous,
}: {
  tournament: PublicTournament;
  previous: PublicTournament[];
}) {
  const label = tournament.title;
  const names = [tournament.winnerName, tournament.runnerUpName, tournament.thirdPlaceName].filter(filled);
  const completedWithPodium = tournament.status === 'COMPLETED' && names.length > 0;
  const inProgress = tournament.status === 'IN_PROGRESS';
  const resultsUrl = tournament.externalResultsUrl?.trim() || '';
  const resultsLabel = tournament.externalResultsLabel?.trim() || 'Open schedule in new tab';

  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="tournaments" />
      <FcUnitedInnerHero title={label} />

      <section className="bg-white">
        {filled(tournament.heroImageUrl) && (
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-[#081224]">
            <div className="relative aspect-[16/9] w-full sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6]">
              <Image
                src={tournament.heroImageUrl!}
                alt={`${label} tournament poster`}
                fill
                className="object-center"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        )}

        <Shell className="pb-4 pt-12 md:pb-6 md:pt-16">
          <div className="mx-auto max-w-3xl space-y-10 text-sm leading-relaxed md:text-base">
            {filled(tournament.welcomeText) && <p>{tournament.welcomeText}</p>}

            {filled(tournament.aboutText) && (
              <div>
                <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                  About the Tournament
                </h2>
                <p className="mt-4">{tournament.aboutText}</p>
              </div>
            )}

            {(filled(tournament.chiefGuestName) || filled(tournament.chiefGuestImageUrl)) && (
              <div>
                <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                  Chief Guest{tournament.ageGroupLabel ? ` · ${tournament.ageGroupLabel}` : ''}
                </h2>
                {filled(tournament.chiefGuestName) && <p className="mt-4">{tournament.chiefGuestName}</p>}
                {filled(tournament.chiefGuestImageUrl) && (
                  <div className="relative mt-6 overflow-hidden rounded-[3px]">
                    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl md:aspect-[16/10]">
                      <Image
                        src={tournament.chiefGuestImageUrl!}
                        alt={tournament.chiefGuestName ? `Chief guest — ${tournament.chiefGuestName}` : 'Chief guest'}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 576px"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {filled(tournament.detailsText) && (
              <div>
                <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                  Tournament Details
                </h2>
                <p className="mt-4">{tournament.detailsText}</p>
              </div>
            )}

            {filled(tournament.registrationEmail) && (
              <div>
                <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                  Registration
                </h2>
                <p className="mt-4">
                  Teams interested in participating can reach out to us at{' '}
                  <a href={`mailto:${tournament.registrationEmail}`} className="font-medium text-[#ff0000] hover:underline">
                    {tournament.registrationEmail}
                  </a>{' '}
                  for registration details and tournament guidelines.
                </p>
              </div>
            )}

            <div>
              <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>Results</h2>
              {inProgress && <p className="mt-4 font-medium text-[#262f3e]">Tournament in progress</p>}
              {completedWithPodium && (
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[#262f3e]">
                  {filled(tournament.winnerName) && <li>Winner: {tournament.winnerName}</li>}
                  {filled(tournament.runnerUpName) && <li>Runner-up: {tournament.runnerUpName}</li>}
                  {filled(tournament.thirdPlaceName) && <li>Third place: {tournament.thirdPlaceName}</li>}
                </ol>
              )}
              {!completedWithPodium && (
                <p className="mt-4">
                  {inProgress ? 'Final places will be updated when the tournament is complete.' : 'Results will be updated soon.'}
                </p>
              )}
              {resultsUrl && (
                <a
                  href={resultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    fcBebas.className,
                    'mt-6 inline-flex items-center justify-center rounded-[3px] bg-[#e31837] px-6 py-3 text-lg tracking-wide text-white hover:bg-[#c41430]',
                  )}
                >
                  {resultsLabel}
                </a>
              )}
            </div>
          </div>
        </Shell>

        {filled(tournament.fixturesImageUrl) && (
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-[#f4f4f4]">
            <div className="relative aspect-[3/2] w-full md:min-h-[78vh] lg:min-h-[85vh]">
              <Image
                src={tournament.fixturesImageUrl!}
                alt={`${label} match fixtures`}
                fill
                unoptimized
                className="object-contain object-center"
                sizes="100vw"
              />
            </div>
          </div>
        )}

        {resultsUrl && (
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[#e3e3e3] bg-[#f8f8f8] pb-8 pt-6 md:pb-12 md:pt-8">
            <Shell>
              <h2 className={cn(fcBebas.className, 'mb-4 text-center text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                Schedule &amp; results
              </h2>
            </Shell>
            <div className="mx-auto w-full max-w-[1400px] px-2 sm:px-4 md:px-6">
              <div className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white shadow-sm">
                <iframe
                  title={`${label} — live schedule and results`}
                  src={resultsUrl}
                  className="w-full border-0"
                  style={{ height: '1980px' }}
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        )}

        {previous.length > 0 && (
          <Shell className="pb-12 pt-10 md:pb-16 md:pt-12">
            <div className="mx-auto max-w-3xl border-t border-[#e3e3e3] pt-10">
              <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                Previous tournaments
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {previous.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/tournaments/${item.slug}`} className="text-[#ff0000] hover:underline">
                      {menuLabel(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Shell>
        )}
      </section>
      <FcUnitedFooter />
    </div>
  );
}
