import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fcEventsListItems, fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins, fcRoboto } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import Image from 'next/image';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedEventsPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="events" />
      <FcUnitedInnerHero title="Events List" />

      <section className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
                upcoming events
              </span>
              <h2 className={cn(fcBebas.className, 'text-3xl tracking-wide text-[#262f3e] md:text-4xl lg:text-5xl')}>
                Whether it&apos;s professional or amateur, we have it all!
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {fcEventsListItems.map((ev) => (
              <article
                key={ev.title}
                className="flex flex-col gap-6 rounded-[3px] border border-[#e3e3e3] bg-white p-6 md:flex-row md:items-stretch lg:gap-10"
              >
                <div className="flex shrink-0 flex-col items-center justify-center rounded-[3px] bg-[#081224] px-6 py-8 text-white md:w-36">
                  <span className={cn(fcBebas.className, 'text-4xl leading-none md:text-5xl')}>{ev.day}</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#848992]">{ev.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={cn(fcBebas.className, 'text-2xl text-[#262f3e] md:text-3xl')}>{ev.title}</h3>
                  <p className={cn(fcRoboto.className, 'mt-2 text-sm text-[#797e87]')}>
                    <span className="font-medium text-[#262f3e]">Time:</span> {ev.time}
                  </p>
                  <p className={cn(fcRoboto.className, 'mt-1 text-sm text-[#797e87]')}>
                    <span className="font-medium text-[#262f3e]">Cost:</span> {ev.cost}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#797e87]">{ev.blurb}</p>
                  <span className="mt-4 inline-flex cursor-not-allowed rounded-[32px] border border-[#e3e3e3] px-5 py-2 text-sm font-semibold text-[#797e87]/70">
                    More info (static)
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Shell>
      </section>

      <section className="border-t border-[#e3e3e3] bg-[#f4f4f4] py-10">
        <Shell>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:justify-between">
            {fcSponsors.map((src) => (
              <div key={src} className="relative h-12 w-28 md:h-14 md:w-32">
                <Image src={src} alt="" fill className="object-contain opacity-90" sizes="128px" />
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
