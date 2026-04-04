import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

/** Same live schedule / fixtures / results as https://www.mdstrikers.com/capitalcup2025.html */
const TOURNIFY_SCHEDULE_URL = 'https://www.tournifyapp.com/live/capitalcup/schedule';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedCapitalCup2025Page() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader />
      <FcUnitedInnerHero title="Capital Cup 2025" />

      <section className="bg-white">
        <Shell className="py-8 md:py-10">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-[#797e87] md:text-base">
            Live schedule, fixtures, standings, and match results for Capital Cup 2025 are powered by Tournify — the same
            experience as the{' '}
            <a
              href="https://www.mdstrikers.com/capitalcup2025.html"
              className="cursor-pointer font-medium text-[#ff0000] underline-offset-2 transition-colors duration-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              original site
            </a>
            . If the embedded view does not load (e.g. blocked by your browser), use the button below.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={TOURNIFY_SCHEDULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                fcBebas.className,
                'inline-flex cursor-pointer items-center justify-center rounded-[3px] bg-[#e31837] px-6 py-3 text-lg tracking-wide text-white transition-colors duration-200 hover:bg-[#c41430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e31837] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none',
              )}
            >
              Open schedule in new tab
            </a>
            <Link
              href="/capital-cup-2026"
              className={cn(
                fcBebas.className,
                'inline-flex cursor-pointer items-center justify-center rounded-[3px] border border-[#e3e3e3] bg-white px-6 py-3 text-lg tracking-wide text-[#262f3e] transition-colors duration-200 hover:bg-[#f4f4f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e31837] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none',
              )}
            >
              Capital Cup 2026
            </Link>
          </div>
        </Shell>

        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[#e3e3e3] bg-[#f8f8f8] pb-8 pt-6 md:pb-12 md:pt-8">
          <Shell>
            <h2 className={cn(fcBebas.className, 'mb-4 text-center text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
              Schedule &amp; results
            </h2>
          </Shell>
          <div className="mx-auto w-full max-w-[1400px] px-2 sm:px-4 md:px-6">
            <div className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white shadow-sm">
              <iframe
                title="Capital Cup 2025 — Tournify live schedule and results"
                src={TOURNIFY_SCHEDULE_URL}
                className="w-full border-0"
                style={{ height: '1980px' }}
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
