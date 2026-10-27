import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LastMatchCard } from './ApiServerActions';
import { PitchArrow, PitchShell, pitchFocus } from './pitchUi';

function Crest({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-4 text-center">
      <div className="relative h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28">
        <Image src={logo} alt={name ? `${name} crest` : ''} fill className="object-contain" sizes="112px" />
      </div>
      {name && (
        <p className="text-sm font-bold leading-snug text-pitch-chalk sm:text-base md:text-lg">{name}</p>
      )}
    </div>
  );
}

/**
 * Spacious fixture panel that overlaps the hero: next upcoming match,
 * or the most recent result when nothing is scheduled.
 */
export function NextMatchPanel({ matches }: { matches: LastMatchCard[] }) {
  const upcoming = matches.find((m) => m.matchKind === 'UPCOMING');
  const match = upcoming ?? matches.find((m) => m.matchKind === 'PAST');
  if (!match) return null;
  const isUpcoming = match.matchKind === 'UPCOMING';

  return (
    <section aria-labelledby="next-match-heading" className="relative z-10 -mt-20 md:-mt-28">
      <PitchShell>
        <div className="rounded-3xl border border-pitch-chalk/10 bg-pitch-forest/95 px-6 py-8 shadow-pitch backdrop-blur sm:px-10 md:px-16 md:py-12">
          <div className="flex flex-col gap-4 border-b border-pitch-chalk/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">
              <span className="relative flex h-2 w-2" aria-hidden>
                {isUpcoming && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-lime opacity-60 [animation-duration:2s] motion-reduce:animate-none" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-lime" />
              </span>
              <span id="next-match-heading">{isUpcoming ? 'Next fixture' : 'Latest result · Full time'}</span>
            </p>
            {match.league && <p className="text-sm font-medium text-pitch-stone">{match.league}</p>}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-8 sm:gap-8 md:py-10">
            <Crest logo={match.home} name={match.homeName} />
            {isUpcoming ? (
              <div className="text-center">
                <p className="text-2xl font-extrabold tracking-[-0.02em] text-pitch-chalk/40 sm:text-4xl">VS</p>
              </div>
            ) : (
              <p
                className="text-center text-4xl font-extrabold tabular-nums tracking-[-0.02em] text-pitch-chalk sm:text-6xl"
                aria-label={`Final score ${match.score[0]} to ${match.score[1]}`}
              >
                {match.score[0]}
                <span className="mx-2 text-pitch-chalk/30 sm:mx-4">–</span>
                {match.score[1]}
              </p>
            )}
            <Crest logo={match.away} name={match.awayName} />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-pitch-chalk/10 pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-pitch-stone">
              <span className="font-semibold text-pitch-chalk">{isUpcoming ? 'Kick-off' : 'Played'}</span>
              <span className="mx-2 text-pitch-chalk/20" aria-hidden>
                /
              </span>
              {match.date}
            </p>
            <Link
              href="/matches"
              className={cn(
                'group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-pitch-chalk transition-colors duration-300 hover:text-pitch-lime',
                pitchFocus,
              )}
            >
              All fixtures &amp; results
              <PitchArrow />
            </Link>
          </div>
        </div>
      </PitchShell>
    </section>
  );
}
