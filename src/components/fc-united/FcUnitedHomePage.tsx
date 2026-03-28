import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcUnitedAboutParagraphs, fcUnitedAboutTitle } from './fcUnitedAboutContent';
import { FC_IMG, fcLeagueRows, fcMatchBlocks, fcNewsItems, fcSponsors } from './fcUnitedConstants';
import { loadFcSquadFirstTeamPlayers } from './fcSquadMembersFromDisk';
import { fcBebas, fcPoppins, fcRoboto } from './fcUnitedFonts';
import { FcSquadCarousel } from './FcSquadCarousel';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcEventCountdown } from './FcEventCountdown';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedHeroVideo } from './FcUnitedHeroVideo';

const products = [
  { img: `${FC_IMG}/product-13-copyright-393x426.jpg`, tag: 'Gloves', title: 'Alpha Goalkeeper Glove', price: '$80.00' },
  { img: `${FC_IMG}/product-8-copyright-393x426.jpg`, tag: 'Shoes', title: 'Athletic Training Boots', price: '$79.00' },
  { img: `${FC_IMG}/product-12-copyright-393x426.jpg`, tag: 'Gloves', title: 'Weather Grip gloves', price: '$110.00' },
  { img: `${FC_IMG}/product-13-copyright-393x426.jpg`, tag: 'Shoes', title: 'Men Soccer Boots Predator', price: '$100.00' },
];

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default async function FcUnitedHomePage() {
  const fcSquadFirstTeamPlayers = loadFcSquadFirstTeamPlayers();

  return (
    <div
      className={cn(fcPoppins.className, 'flex min-h-screen flex-col bg-[#f4f4f4] text-[#797e87] antialiased')}
    >
      <FcUnitedHeader active="home" />

      <main className="flex min-w-0 flex-1 flex-col">
      {/* Hero — full width + gradient */}
      <section className="relative min-h-[min(75vh,690px)] bg-[#081224]">
        <div className="absolute inset-0">
          <FcUnitedHeroVideo className="absolute inset-0 h-full w-full object-cover object-center" />
          {/* Darken slightly so headline + countdown stay readable over ambient video (HP-style) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#081224]/88 via-[#0f1f38]/72 to-[#262f3e]/85"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex min-h-[min(75vh,690px)] flex-col justify-end pb-12 pt-20 md:pb-14 md:pt-24 lg:pt-28">
          <Shell className="overflow-visible">
            {/* Right stack ~36% width; stretch rows so left headline stays bottom-aligned while image+overlay+card stack from the top */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,36%)] lg:items-stretch lg:gap-8">
              <div className="flex min-h-0 max-w-xl flex-col justify-end lg:max-w-none lg:self-end">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">Welcome</span>
                <h1
                  className={cn(
                    fcBebas.className,
                    'mb-3 text-5xl leading-[1.05] tracking-wide text-white md:text-6xl lg:text-7xl',
                  )}
                >
                  Mary Land
                  <br />
                  Strikers
                </h1>
                <Link
                  href="/about"
                  className="mt-6 inline-flex rounded-[32px] bg-[#ff0000] px-7 py-3 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
                >
                  Read More
                </Link>
              </div>

              {/* Promo image → venue overlay → upcoming card; bleed right; slightly shorter band (16/10) frees vertical room for overlay */}
              <div className="flex w-full max-w-md flex-col gap-3 lg:max-w-none lg:min-w-0 lg:w-full lg:-mr-12 lg:justify-start">
                <div className="overflow-hidden rounded-[3px] border border-white/15 bg-black/20 backdrop-blur-sm lg:-mt-1">
                  <div className="relative aspect-[16/10] w-full min-h-0 sm:aspect-[16/9]">
                    <Image
                      src="/images/md_strikers_media/md_media/Gallery/IM-Vijayan-Image_news.jpg"
                      alt=""
                      fill
                      className="object-cover object-center opacity-[0.96] drop-shadow-[0_8px_36px_rgba(0,0,0,0.5)]"
                      sizes="(max-width: 1024px) 100vw, 36vw"
                      priority
                      aria-hidden
                    />
                  </div>
                </div>
                <p
                  className={cn(
                    fcPoppins.className,
                    'rounded-[3px] border border-white/25 bg-black/50 px-3 py-3 text-center text-[11px] leading-relaxed text-white shadow-[0_6px_28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:text-xs md:text-[13px]',
                  )}
                >
                  May 23, 2026, at Othello Regional Park, Frederick, Maryland
                </p>
                <div className="shrink-0 rounded-[3px] border border-white/15 bg-black/25 p-6 text-white backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#848992]">Upcoming Event</p>
                  <h3 className={cn(fcBebas.className, 'mt-4 text-center text-3xl tracking-wide text-white')}>Capital Cup 2026</h3>
                  <p className="mt-2 text-center text-sm text-white/90">
                    <span className="font-semibold text-white/90">Chief Guest :</span>{' '}
                    <span className={cn(fcBebas.className, 'text-2xl tracking-wide text-white')}>I M Vijayan</span>
                  </p>
                  <FcEventCountdown targetIso="2026-05-23T00:00:00" />
                </div>
              </div>
            </div>
          </Shell>
        </div>
      </section>

      {/* Mobile news */}
      <section className="border-b border-[#e3e3e3] bg-white py-6 lg:hidden">
        <Shell className="space-y-3">
          {fcNewsItems.map((n) => (
            <div key={n.title}>
              <p className={cn(fcBebas.className, 'text-lg text-[#262f3e]')}>{n.title}</p>
              <p className="text-xs text-[#797e87]">{n.date}</p>
            </div>
          ))}
        </Shell>
      </section>

      <div className="h-px bg-[#e3e3e3]" />

      {/* Last match — section title */}
      <section className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <div className="mb-6 text-center md:mb-10 md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">results</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>The Last Match</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* League table — hidden (see layout / section index) */}
      <section className="hidden bg-white py-12 md:py-16" aria-hidden>
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
        </Shell>
      </section>

      {/* Squad — dark band */}
      <section className="bg-[#081224] py-14 md:py-20">
        <Shell>
          <div className="mb-10 text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">squad</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-white md:text-5xl')}>The First Team</h2>
          </div>
          <FcSquadCarousel players={fcSquadFirstTeamPlayers} />
          <div className="mt-12 text-center">
            <span className="inline-flex cursor-not-allowed rounded-[32px] border border-white/20 px-8 py-3 text-sm font-semibold text-[#848992]">
              View All Players (static)
            </span>
          </div>
        </Shell>
      </section>

      {/* News + about */}
      <section id="about" className="bg-[#f4f4f4] py-14 md:py-20">
        <Shell>
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">news</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>The Latest News</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white">
              <div className="relative aspect-[16/9] w-full min-h-0">
                <Image
                  src="/images/md_strikers_media/md_media/Gallery/IM-Vijayan-Image_news.jpg"
                  alt="I.M. Vijayan — MD Strikers news"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-[#797e87]">May 23 2026</p>
                <p className={cn(fcBebas.className, 'mt-2 text-2xl text-[#262f3e]')}>
                  Capital Cup 2026 | MD Strikers | May 23 : Kick Off By I.M Vijayan
                </p>
                <p className="mt-2 text-sm leading-relaxed">Highlights and analysis from the match — static demo content.</p>
              </div>
            </div>
            <div
              className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-[#262f3e] p-8 text-white lg:min-h-[400px]"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(8,18,36,0.92) 0%, rgba(38,47,62,0.75) 100%), url(${FC_IMG}/bg-about-copyright.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center left',
              }}
            >
              <span className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">our story</span>
              <h3 className={cn(fcBebas.className, 'text-2xl leading-tight text-white md:text-3xl lg:text-4xl')}>
                {fcUnitedAboutTitle}
              </h3>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/85">
                {fcUnitedAboutParagraphs[0]}
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex w-fit rounded-[32px] bg-[#ff0000] px-6 py-2 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
              >
                Read More
              </Link>
            </div>
          </div>
        </Shell>
      </section>

      {/* Shop — hidden (see layout / section index) */}
      <section className="hidden bg-white py-14 md:py-20" aria-hidden>
        <Shell>
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">shop</span>
              <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>Top Products</h2>
            </div>
            <span className="cursor-not-allowed text-sm font-semibold text-[#797e87]">Cart / checkout disabled (static)</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <div
                key={`${p.title}-${i}`}
                className="rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4] transition-colors hover:border-[#c8c8c8]"
              >
                <div className="relative aspect-[393/426] w-full bg-white">
                  <Image src={p.img} alt={p.title} fill className="object-contain p-4" sizes="(max-width:1024px) 50vw, 25vw" />
                </div>
                <div className="border-t border-[#e3e3e3] bg-white p-4">
                  <span className="inline-block rounded-[3px] bg-[#f4f4f4] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#262f3e]">
                    {p.tag}
                  </span>
                  <p className={cn('mt-2 font-medium text-[#262f3e]', fcPoppins.className)}>{p.title}</p>
                  <p className={cn('mt-2 text-lg font-medium text-[#262f3e]', fcRoboto.className)}>{p.price}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full rounded-[32px] bg-[#e3e3e3] px-4 py-2 text-sm font-semibold text-[#797e87]"
                  >
                    Buy now (disabled)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {/* Partners */}
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

      </main>

      <FcUnitedFooter />
    </div>
  );
}
