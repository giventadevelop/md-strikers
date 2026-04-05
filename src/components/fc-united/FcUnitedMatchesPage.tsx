import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { fcLeagueRows, fcMatchBlocks, FC_IMG, fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins, fcRoboto } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedMatchesPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="matches" />
      <FcUnitedInnerHero title="Matches" />

      <section className="bg-white py-12 md:py-16">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-square max-w-md overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4]">
              <Image src={`${FC_IMG}/go-4-copyright-400x400.png`} alt="" fill className="object-contain p-8" sizes="400px" />
            </div>
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">premier league</span>
              <h2 className={cn(fcBebas.className, 'text-3xl tracking-wide text-[#262f3e] md:text-4xl')}>Season overview</h2>
              <p className="mt-4 text-sm leading-relaxed text-[#797e87]">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet
                dolore magna aliquam erat volutpat. Static copy from the wget Premier League mirror — no live data.
              </p>
            </div>
          </div>
        </Shell>
      </section>

      <section className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <div className="mb-6 text-center md:mb-10 md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">results</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>Recent matches</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fcMatchBlocks.map((m) => (
              <div
                key={m.title}
                className="rounded-[3px] border border-[#e3e3e3] bg-white p-4 transition-colors hover:border-[#c8c8c8]"
              >
                <div className="flex items-center justify-center gap-3">
                  <Image src={m.home} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                  <Image src={m.away} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                </div>
                <p className="mt-3 text-center text-xs text-[#797e87]">{m.date}</p>
                <p className={cn(fcBebas.className, 'text-center text-3xl text-[#262f3e]')}>
                  <span className="text-[#2d7a3e]">{m.score[0]}</span> - {m.score[1]}
                </p>
                <p className="text-center text-xs text-[#797e87]">{m.league}</p>
                <p className={cn(fcBebas.className, 'mt-2 text-center text-lg text-[#262f3e]')}>{m.title}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Shell>
          <div className="mb-8 text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">table</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>Premier League</h2>
          </div>
          <div className="overflow-x-auto rounded-[3px] border border-[#e3e3e3]">
            <table className={cn(fcRoboto.className, 'w-full min-w-[640px] border-collapse text-sm')}>
              <thead>
                <tr className="bg-[#fafafa] text-left text-xs uppercase tracking-wide text-[#262f3e]">
                  {['Pos', 'Club', 'P', 'W', 'D', 'L', 'F', 'A', 'GD', 'Pts'].map((h) => (
                    <th key={h} className="border-b border-[#e3e3e3] px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fcLeagueRows.map((row, i) => (
                  <tr key={`${row.club}-${i}`} className="transition-colors hover:bg-[#f9fafb]">
                    <td className="border-b border-[#e3e3e3] px-4 py-3 font-medium tabular-nums text-[#262f3e]">{row.pos}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 font-medium text-[#262f3e]">{row.club}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.p}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.w}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.d}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.l}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.f}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.a}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums text-[#262f3e]">{row.gd}</td>
                    <td className="border-b border-[#e3e3e3] px-4 py-3 tabular-nums font-medium text-[#262f3e]">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs text-[#797e87]">League data is static (wget mirror) — not connected to a backend.</p>
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
