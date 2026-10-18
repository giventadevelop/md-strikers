import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcUnitedAboutParagraphs, fcUnitedAboutTitle } from './fcUnitedAboutContent';
import { FC_IMG, fcLeagueRows, fcNewsItems, fcSponsors } from './fcUnitedConstants';
import { fetchTenantSettingsServer } from '@/app/ApiServerActions';
import { getFeaturedEventImageUrl, isPastHomepageEvent } from '@/lib/homepage/featuredEvents';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';
import { fetchLiveEventsForHomepageServer } from '@/lib/homepage/fetchLiveEventsServer';
import {
  fetchExecutiveTeamServer,
  fetchHomepageEventListServer,
  fetchHomepageSponsorsServer,
  fetchLastMatchesServer,
  fetchTeamMembersImageTitleServer,
} from './ApiServerActions';
import { fcBebas, fcPoppins, fcRoboto } from './fcUnitedFonts';
import { FcSquadCarousel, type FcSquadPlayer } from './FcSquadCarousel';
import { TeamMembersDbSection } from './TeamMembersDbSection';
import { ExecutiveTeamSection } from './ExecutiveTeamSection';
import { HOMEPAGE_MATCHES_LIMIT, LastMatchSection } from './LastMatchSection';
import { HeroSlider, type HeroSlide } from './HeroSlider';
import { LiveEventsSection, liveItemsDemo } from './LiveEventsSection';
import { FeaturedEventsSection, featuredBandEvents, featuredEventsShown } from './FeaturedEventsSection';
import { OnSaleBand, pickOnSaleEvent, type BandEvent } from './OnSaleBand';
import { eventToBandEvent, eventToSpotlightItem } from './homeEventDisplay';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';

const products = [
  { img: `${FC_IMG}/product-13-copyright-393x426.jpg`, tag: 'Gloves', title: 'Alpha Goalkeeper Glove', price: '$80.00' },
  { img: `${FC_IMG}/product-8-copyright-393x426.jpg`, tag: 'Shoes', title: 'Athletic Training Boots', price: '$79.00' },
  { img: `${FC_IMG}/product-12-copyright-393x426.jpg`, tag: 'Gloves', title: 'Weather Grip gloves', price: '$110.00' },
  { img: `${FC_IMG}/product-13-copyright-393x426.jpg`, tag: 'Shoes', title: 'Men Soccer Boots Predator', price: '$100.00' },
];

type SponsorCard = {
  key: string;
  src: string;
  name: string;
  label: string;
  tagline?: string;
  detailsHref?: string;
  websiteHref?: string | null;
};

/** Shown when the sponsors table returns nothing. */
const mdStrikersHomeSponsors = [
  {
    src: '/images/md_strikers_media/sponsors/certainty-home-lending.jpg',
    name: 'Certainty Home Lending',
    label: 'Diamond Sponsor',
  },
  {
    src: '/images/md_strikers_media/sponsors/samson-properties.jpg',
    name: 'Samson Properties',
    label: 'Diamond Sponsor',
  },
  {
    src: '/images/md_strikers_media/sponsors/marriott.jpg',
    name: 'Marriott',
    label: 'Hospitality Sponsor',
  },
  {
    src: '/images/md_strikers_media/sponsors/opal-ridge.jpg',
    name: 'Opal Ridge',
    label: 'Gold Sponsor',
  },
] as const;

/** Sample upcoming events, used only when the events backend is unreachable. */
const upcomingEventsDemo: BandEvent[] = [
  {
    key: 'capital-cup-2026',
    src: '/images/md_strikers_media/events/capital_2026_match_fixtures_wide_finals.jpg',
    title: 'Capital Cup 2026',
    startDate: '2026-05-23',
    dateTime: 'Saturday, May 23, 2026 · 9:00 AM',
    venue: 'Othello Regional Park, Frederick, Maryland',
    isFeatured: false,
    isTicketed: true,
    href: '/events',
  },
  {
    key: 'u17-league-friendly',
    src: '/images/md_strikers_media/gallery/soccer-group.jpg',
    title: 'U17 League Friendly',
    startDate: '2026-06-14',
    dateTime: 'Sunday, June 14, 2026 · 2:00 PM',
    venue: 'Black Rock Soccer Complex, Germantown, Maryland',
    isFeatured: false,
    isTicketed: false,
    href: '/events',
  },
  {
    key: 'md-strikers-open-scrimmage',
    src: '/images/md_strikers_media/gallery/Md-Strikers-image.jpg',
    title: 'MD Strikers Open Scrimmage',
    startDate: '2026-07-11',
    dateTime: 'Saturday, July 11, 2026 · 10:30 AM',
    venue: 'South Germantown Recreational Park, Boyds, Maryland',
    isFeatured: false,
    isTicketed: false,
    registrationUrl: '/events',
    href: '/events',
  },
  {
    key: 'capital-cup-alumni-night',
    src: '/images/md_strikers_media/gallery/Capital-Cup-image.jpg',
    title: 'Capital Cup Alumni Night',
    startDate: '2026-08-07',
    dateTime: 'Friday, August 7, 2026 · 6:30 PM',
    venue: 'Maryland SoccerPlex, Boyds, Maryland',
    isFeatured: false,
    isTicketed: true,
    href: '/events',
  },
];

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default async function FcUnitedHomePage() {
  const [
    teamMembersFromDb,
    lastMatches,
    eventList,
    featuredFromDb,
    liveFromDb,
    sponsorsFromDb,
    executiveTeam,
    tenantSettings,
  ] = await Promise.all([
    fetchTeamMembersImageTitleServer(),
    fetchLastMatchesServer(),
    fetchHomepageEventListServer(),
    fetchFeaturedEventsForHomepageServer(),
    fetchLiveEventsForHomepageServer(),
    fetchHomepageSponsorsServer(),
    fetchExecutiveTeamServer(),
    fetchTenantSettingsServer(),
  ]);
  const fcSquadFirstTeamPlayers: FcSquadPlayer[] = [];

  const showEventsSection = tenantSettings?.showEventsSectionInHomePage !== false;
  const showSportsTeamSection = tenantSettings?.showTeamMembersSectionInHomePage !== false;
  const showExecutiveTeamSection = tenantSettings?.showExecutiveCommitteeSectionInHomePage !== false;
  const showSponsorsSection = tenantSettings?.showSponsorsSectionInHomePage !== false;

  const useSampleEvents = !eventList.reachable;
  const listIsUpcoming = useSampleEvents || eventList.isUpcoming;

  const liveItems = useSampleEvents
    ? liveItemsDemo
    : liveFromDb.map((item) => eventToSpotlightItem(item, 'Live Event'));

  const featuredItems = useSampleEvents
    ? featuredEventsShown
    : featuredFromDb
        .slice(0, 1)
        .map((item) =>
          eventToSpotlightItem(
            { event: item.event, imageUrl: getFeaturedEventImageUrl(item) },
            isPastHomepageEvent(item.event) ? 'Past Featured Event' : 'Featured Event',
          ),
        );

  const listEvents: BandEvent[] = useSampleEvents
    ? upcomingEventsDemo
    : eventList.items.map((item) => eventToBandEvent(item, false));

  const bandEvents: BandEvent[] = useSampleEvents
    ? [...featuredBandEvents, ...upcomingEventsDemo]
    : [
        ...featuredFromDb.map((item) =>
          eventToBandEvent({ event: item.event, imageUrl: getFeaturedEventImageUrl(item) }, true),
        ),
        ...listEvents,
      ];
  const hasOnSaleBand = pickOnSaleEvent(bandEvents) !== null;

  const sponsorCards: SponsorCard[] =
    sponsorsFromDb.length > 0
      ? sponsorsFromDb.map((sp) => ({
          key: `sponsor-${sp.id ?? sp.name}`,
          src: sp.imageUrl,
          name: sp.name,
          label: sp.type || 'Sponsor',
          tagline: sp.tagline,
          detailsHref: sp.id != null ? `/sponsors/${sp.id}` : undefined,
          websiteHref: sp.websiteHref,
        }))
      : mdStrikersHomeSponsors.map((sp) => ({ ...sp, key: sp.src }));

  const heroEventImages = useSampleEvents
    ? upcomingEventsDemo.map((e) => ({ key: e.key, src: e.src, alt: e.title }))
    : eventList.isUpcoming
      ? eventList.items.flatMap((i) =>
          i.imageUrl ? [{ key: String(i.event.id ?? i.event.title), src: i.imageUrl, alt: i.event.title }] : [],
        )
      : [];

  const heroSlides: HeroSlide[] = [
    ...heroEventImages.map((img) => ({ ...img, kind: 'image' as const, key: `event-${img.key}` })),
    ...lastMatches
      .filter((m) => m.matchKind === 'UPCOMING')
      .map((m) => ({
        kind: 'match' as const,
        key: `match-${m.id}`,
        home: m.home,
        away: m.away,
        date: m.date,
        league: m.league,
        title: m.title,
      })),
  ];

  return (
    <div
      className={cn(fcPoppins.className, 'flex min-h-screen flex-col bg-[#f4f4f4] text-[#797e87] antialiased')}
    >
      {/* First viewport: header + hero fill 100dvh with no cutoff / empty space */}
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
        <FcUnitedHeader active="home" />

        {/* Hero — design system tokens (mdStrikers_site_general_design_final); content unchanged */}
        <section className="flex min-h-0 flex-1 flex-col bg-[#f4f4f4]">
          <Shell className="flex min-h-0 flex-1 flex-col py-4 md:py-5 lg:py-6">
            <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-row md:items-stretch">
              {/* Left: logo panel + primary CTA */}
              <div className="flex max-h-[46%] min-h-0 w-full shrink-0 flex-col gap-3 md:max-h-none md:w-[300px] lg:w-[320px]">
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-[3px] border border-[#e3e3e3] bg-white px-5 py-5 sm:px-6 sm:py-6">
                  <div className="relative mx-auto aspect-square w-[min(240px,72%)] max-w-[260px] shrink-0 sm:w-[min(260px,78%)]">
                    <Image
                      src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
                      alt="Maryland Strikers Sports Club"
                      fill
                      className="object-contain"
                      sizes="260px"
                      priority
                    />
                  </div>
                  <p
                    className={cn(
                      fcBebas.className,
                      'mt-3 text-center text-2xl tracking-[0.02em] text-[#262f3e] sm:mt-4 sm:text-3xl md:text-4xl',
                    )}
                  >
                    MD Strikers
                  </p>
                  <div className="mt-2 flex w-full max-w-[220px] items-center gap-2">
                    <span className="h-px flex-1 bg-[#e3e3e3]" aria-hidden />
                    <span className="text-[11px] font-medium tracking-[0.12em] text-[#797e87]">mdstrikers.com</span>
                    <span className="h-px flex-1 bg-[#e3e3e3]" aria-hidden />
                  </div>
                  <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#797e87]">
                    Maryland Strikers Sports Club
                  </p>
                </div>

                <Link
                  href="/events"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[32px] bg-[#ff0000] px-7 py-3 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none motion-reduce:hover:brightness-100"
                >
                  Browse all upcoming events
                  <span aria-hidden>›</span>
                </Link>
              </div>

              {/* Right: hero image panel — object-contain; footer band uses --footer-band */}
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white">
                <HeroSlider slides={heroSlides} />
                <div className="shrink-0 border-t border-white/10 bg-[#262f3e] px-4 py-2.5 sm:px-6 sm:py-3">
                  <p className="text-sm font-medium text-white sm:text-base">www.mdstrikers.com</p>
                  <p className={cn(fcBebas.className, 'text-lg tracking-[0.02em] text-white sm:text-xl')}>
                    Maryland Strikers Sports Club
                  </p>
                </div>
              </div>
            </div>
          </Shell>
        </section>
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
      <LiveEventsSection items={liveItems} />
      <FeaturedEventsSection items={featuredItems} />

      {/* Events from event_details: always show title; upcoming → past fallback → empty message */}
      {(showEventsSection || hasOnSaleBand) && (
      <section className="bg-white py-14 md:py-20">
        <Shell>
          {showEventsSection && (
          <div className="mb-10 text-center md:mb-12 md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
              calendar
            </span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-[0.03em] text-[#262f3e] md:text-5xl')}>
              {listEvents.length === 0
                ? 'Upcoming Events'
                : listIsUpcoming
                  ? 'Upcoming Events'
                  : 'Past Events'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#797e87] md:text-[15px]">
              Match days, tournaments, and club nights on the Maryland Strikers calendar.
            </p>
          </div>
          )}

          <OnSaleBand events={bandEvents} />

          {showEventsSection && (
            listEvents.length === 0 ? (
              <p className="rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4] px-5 py-8 text-center text-sm text-[#797e87] md:text-left">
                No events listed.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {listEvents.map((event) => (
                  <article
                    key={event.key}
                    className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white transition-colors duration-300 ease-in-out hover:border-[#c8c8c8]"
                  >
                    {/* Uniform frame (~half prior 16:9 height); object-contain = no crop */}
                    <div className="relative aspect-[32/9] w-full border-b border-[#e3e3e3] bg-[#f4f4f4]">
                      <Image
                        src={event.src}
                        alt={event.title}
                        fill
                        className="object-contain object-center"
                        sizes="100vw"
                      />
                    </div>
                    <div className="px-5 py-5 md:px-6 md:py-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">
                        {listIsUpcoming ? 'Upcoming Event' : 'Past Event'}
                      </p>
                      <h3
                        className={cn(
                          fcBebas.className,
                          'mt-1.5 text-3xl tracking-[0.02em] text-[#262f3e] md:text-4xl',
                        )}
                      >
                        <Link
                          href={event.href}
                          className="transition-colors duration-300 hover:text-[#ff0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[#262f3e] md:text-[15px]">{event.dateTime}</p>
                      {event.venue && (
                        <p className="mt-1 text-sm leading-relaxed text-[#797e87] md:text-[15px]">{event.venue}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </Shell>
      </section>
      )}

      {/* Our Story — text left, club logo right */}
      <section id="about" className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <div
            className="relative grid min-h-[320px] grid-cols-1 overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-[#262f3e] text-white md:min-h-[380px] md:grid-cols-[minmax(0,1fr)_minmax(160px,280px)] md:items-center md:gap-8 md:p-8 lg:min-h-[400px] lg:gap-10 lg:p-10"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(8,18,36,0.92) 0%, rgba(38,47,62,0.75) 100%), url(${FC_IMG}/bg-about-copyright.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center left',
            }}
          >
            <div className="relative z-10 flex flex-col justify-end p-8 pb-6 md:p-0 md:pb-0">
              <span className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">our story</span>
              <h3 className={cn(fcBebas.className, 'text-2xl leading-tight text-white md:text-3xl lg:text-4xl')}>
                {fcUnitedAboutTitle}
              </h3>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/85">
                {fcUnitedAboutParagraphs[0]}
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex w-fit cursor-pointer rounded-[32px] bg-[#ff0000] px-6 py-2 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none motion-reduce:hover:brightness-100"
              >
                Read More
              </Link>
            </div>
            <div className="relative z-10 flex items-center justify-center px-8 pb-8 pt-0 md:justify-end md:px-0 md:pb-0 md:pt-0">
              <div className="relative h-36 w-36 shrink-0 sm:h-44 sm:w-44 md:h-48 md:w-48 lg:h-56 lg:w-56">
                <Image
                  src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
                  alt="Maryland Strikers Sports Club"
                  fill
                  className="object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                  sizes="(max-width:768px) 144px, 224px"
                />
              </div>
            </div>
          </div>
        </Shell>
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

      <LastMatchSection
        matches={lastMatches}
        limitPerView={HOMEPAGE_MATCHES_LIMIT}
        showSeeAll
      />

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

      {/* Squad — dark band (hidden: superseded by TeamMembersDbSection below) */}
      <section className="hidden bg-[#081224] py-14 md:py-20" aria-hidden>
        <Shell>
          <div className="mb-10 text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#848992]">squad</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-white md:text-5xl')}>The First Team</h2>
          </div>
          <FcSquadCarousel players={fcSquadFirstTeamPlayers} />
          <div className="mt-12 text-center">
            <Link
              href="/team"
              className={cn(
                fcBebas.className,
                'inline-flex cursor-pointer items-center justify-center rounded-[32px] bg-[#ff0000] px-8 py-3 text-lg tracking-wide text-white transition-[filter] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none motion-reduce:hover:brightness-100',
              )}
            >
              View All Players
            </Link>
          </div>
        </Shell>
      </section>

      {showSportsTeamSection && <TeamMembersDbSection members={teamMembersFromDb} />}

      {showExecutiveTeamSection && <ExecutiveTeamSection members={executiveTeam} />}

      {/* Sponsors — one per row; design system panels */}
      {showSponsorsSection && (
      <section className="bg-[#f4f4f4] py-14 md:py-20">
        <Shell>
          <div className="mb-10 text-center md:mb-12 md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
              partners
            </span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-[0.03em] text-[#262f3e] md:text-5xl')}>
              Sponsor
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#797e87] md:text-[15px]">
              Maryland Strikers Sports Club partners with local businesses that fuel Capital Cup, training,
              and community programs across Maryland and the D.C. area.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#797e87] md:text-[15px]">
              Their support keeps our players competing at a high level and opens the door for families who
              want serious soccer with a strong club culture.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {sponsorCards.map((sponsor) => (
              <article
                key={sponsor.key}
                className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white transition-colors duration-300 ease-in-out hover:border-[#c8c8c8]"
              >
                {/* Full-width image: object-contain = no crop; w-full h-auto = no side gaps */}
                <div className="relative w-full border-b border-[#e3e3e3]">
                  <Image
                    src={sponsor.src}
                    alt={sponsor.name}
                    width={1600}
                    height={600}
                    className="h-auto w-full object-contain"
                    sizes="100vw"
                  />
                  {sponsor.label && (
                    <span className="absolute left-3 top-3 rounded-[3px] bg-[#ff0000] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] md:left-4 md:top-4">
                      {sponsor.label}
                    </span>
                  )}
                </div>
                <div className="px-5 py-5 md:px-6 md:py-6">
                  <h3
                    className={cn(
                      fcBebas.className,
                      'text-3xl tracking-[0.02em] text-[#262f3e] md:text-4xl',
                    )}
                  >
                    {sponsor.name}
                  </h3>
                  {sponsor.tagline && (
                    <p className="mt-2 text-sm leading-relaxed text-[#797e87] md:text-[15px]">{sponsor.tagline}</p>
                  )}
                  {(sponsor.detailsHref || sponsor.websiteHref) && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {sponsor.detailsHref && (
                        <Link
                          href={sponsor.detailsHref}
                          className="inline-flex items-center justify-center rounded-[32px] bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none"
                        >
                          Sponsor details
                        </Link>
                      )}
                      {sponsor.websiteHref && (
                        <a
                          href={sponsor.websiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-[32px] border border-[#e3e3e3] px-6 py-2.5 text-sm font-semibold text-[#262f3e] transition-[border-color,background] duration-300 ease-in-out hover:border-[#c8c8c8] hover:bg-[#f9fafb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none"
                        >
                          Visit website
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Shell>
      </section>
      )}

      {/* Latest news */}
      <section className="bg-[#f4f4f4] py-14 md:py-20">
        <Shell>
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">news</span>
            <h2 className={cn(fcBebas.className, 'text-4xl tracking-wide text-[#262f3e] md:text-5xl')}>The Latest News</h2>
          </div>
          <div className="mx-auto w-full max-w-[766px]">
            <div className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white">
              {/* 4:3 frame (766×574.5 at max width); contain = no crop on tall/wide photos */}
              <div className="relative aspect-[4/3] w-full min-h-0 bg-[#ececec]">
                <Image
                  src="/images/md_strikers_media/gallery/IM_Vijayan-Image-2.jpg"
                  alt="I.M. Vijayan — MD Strikers news"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 766px"
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
