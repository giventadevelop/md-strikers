import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

/** Same live schedule / fixtures / results as https://www.mdstrikers.com/capitalcup2025.html */
const TOURNIFY_SCHEDULE_URL = 'https://www.tournifyapp.com/live/capitalcup/schedule';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>
  );
}

export default function FcUnitedCapitalCup2025Page() {
  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader />
      <FcUnitedInnerHero title="Capital Cup 2025" />

      <section className="bg-white">
        <Shell className="py-8 md:py-10">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-pitch-charcoal/70 md:text-base">
            Live schedule, fixtures, standings, and match results for Capital Cup 2025 are powered by Tournify — the same
            experience as the{' '}
            <a
              href="https://www.mdstrikers.com/capitalcup2025.html"
              className="cursor-pointer font-medium text-pitch-olive underline-offset-2 transition-colors duration-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-olive focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
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
                'font-extrabold tracking-[-0.02em] inline-flex cursor-pointer items-center justify-center rounded-lg md-btn-primary px-6 py-3 text-lg text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-olive focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
              )}
            >
              Open schedule in new tab
            </a>
            <Link
              href="/capital-cup-2026"
              className={cn(
                'font-extrabold tracking-[-0.02em] inline-flex cursor-pointer items-center justify-center rounded-xl border border-pitch-charcoal/10 bg-white px-6 py-3 text-lg text-pitch-charcoal transition-colors duration-200 hover:bg-pitch-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-olive focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none',
              )}
            >
              Capital Cup 2026
            </Link>
          </div>
        </Shell>

        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-pitch-charcoal/10 bg-pitch-chalk/60 pb-8 pt-6 md:pb-12 md:pt-8">
          <Shell>
            <h2 className={cn('font-extrabold tracking-[-0.02em] mb-4 text-center text-xl text-pitch-charcoal md:text-2xl')}>
              Schedule &amp; results
            </h2>
          </Shell>
          <div className="mx-auto w-full max-w-[1400px] px-2 sm:px-4 md:px-6">
            <div className="overflow-hidden rounded-xl border border-pitch-charcoal/10 bg-white shadow-sm">
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
