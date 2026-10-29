import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcUnitedAboutParagraphs, fcUnitedAboutTitle } from './fcUnitedAboutContent';
import { FC_IMG, fcSponsors } from './fcUnitedConstants';
import { fetchClubNewsArticles, newsHref, type ClubNewsArticle } from '@/lib/news/clubNews';
import { fetchTenantSettingsServer } from '@/app/ApiServerActions';
import { getFeaturedEventImageUrl, isPastHomepageEvent } from '@/lib/homepage/featuredEvents';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';
import { fetchLiveEventsForHomepageServer } from '@/lib/homepage/fetchLiveEventsServer';
import {
  fetchExecutiveTeamServer,
  fetchHomepageEventListServer,
  fetchHomepageSponsorsServer,
  fetchLastMatchesServer,
  fetchHomepageLeagueTablesServer,
  fetchTeamMembersImageTitleServer,
} from './ApiServerActions';
import { HOMEPAGE_SPONSOR_LIMIT } from './homepageLimits';
import { fcBebas, fcManrope, fcPoppins, fcRoboto } from './fcUnitedFonts';
import { FcSquadCarousel, type FcSquadPlayer } from './FcSquadCarousel';
import { TeamMembersDbSection } from './TeamMembersDbSection';
import { ExecutiveTeamSection } from './ExecutiveTeamSection';
import { HOMEPAGE_MATCHES_LIMIT, LastMatchSection } from './LastMatchSection';
import { LiveEventsSection, liveItemsDemo } from './LiveEventsSection';
import { FeaturedEventsSection, featuredBandEvents, featuredEventsShown } from './FeaturedEventsSection';
import { OnSaleBand, pickOnSaleEvent, type BandEvent } from './OnSaleBand';
import { eventToBandEvent, eventToSpotlightItem } from './homeEventDisplay';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { ViewAllSponsorsButton } from './ViewAllSponsorsButton';
import { HeroSlider, type HeroSlide } from './HeroSlider';
import { NextMatchPanel } from './NextMatchPanel';
import { buildStandings } from './homeStandings';
import { HomeLeagueSection } from './HomeLeagueSection';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchFocus, pitchSection } from './pitchUi';

const STORY_IMAGE = '/images/md_strikers_media/gallery/mdstrikers_com/gal03.jpg';

const formatNewsDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

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
    latestNews,
    homepageLeagues,
  ] = await Promise.all([
    fetchTeamMembersImageTitleServer(),
    fetchLastMatchesServer(),
    fetchHomepageEventListServer(),
    fetchFeaturedEventsForHomepageServer(),
    fetchLiveEventsForHomepageServer(),
    fetchHomepageSponsorsServer(HOMEPAGE_SPONSOR_LIMIT),
    fetchExecutiveTeamServer(),
    fetchTenantSettingsServer(),
    fetchClubNewsArticles(3),
    fetchHomepageLeagueTablesServer(),
  ]);
  const fcSquadFirstTeamPlayers: FcSquadPlayer[] = [];

  const showEventsSection = tenantSettings?.showEventsSectionInHomePage !== false;
  const showSportsTeamSection = tenantSettings?.showTeamMembersSectionInHomePage !== false;
  const showExecutiveTeamSection = tenantSettings?.showExecutiveCommitteeSectionInHomePage !== false;
  const showSponsorsSection = tenantSettings?.showSponsorsSectionInHomePage !== false;
  const showLeagueStandings = tenantSettings?.showLeagueStandingsSectionInHomePage === true;

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
      ? sponsorsFromDb.slice(0, HOMEPAGE_SPONSOR_LIMIT).map((sp) => ({
          key: `sponsor-${sp.id ?? sp.name}`,
          src: sp.imageUrl,
          name: sp.name,
          label: sp.type || 'Sponsor',
          tagline: sp.tagline,
          detailsHref: sp.id != null ? `/sponsors/${sp.id}` : undefined,
          websiteHref: sp.websiteHref,
        }))
      : mdStrikersHomeSponsors.slice(0, HOMEPAGE_SPONSOR_LIMIT).map((sp) => ({ ...sp, key: sp.src }));

  // Hero slider: images of upcoming events (featured first, one slide per distinct image), then upcoming matches.
  const heroEventSlides: HeroSlide[] = useSampleEvents
    ? upcomingEventsDemo.map((e) => ({ kind: 'image' as const, key: `event-${e.key}`, src: e.src, alt: e.title }))
    : [
        ...featuredFromDb
          .filter((item) => !isPastHomepageEvent(item.event))
          .map((item) => ({ event: item.event, imageUrl: getFeaturedEventImageUrl(item) })),
        ...(eventList.isUpcoming ? eventList.items : []),
      ]
        .flatMap(({ event, imageUrl }) =>
          imageUrl
            ? [{ kind: 'image' as const, key: `event-${event.id ?? event.title}`, src: imageUrl, alt: event.title }]
            : [],
        )
        .filter((slide, i, all) => all.findIndex((s) => s.src === slide.src) === i);
  const heroSlides: HeroSlide[] = [
    ...heroEventSlides,
    ...lastMatches
      .filter((m) => m.matchKind === 'UPCOMING')
      .map((m) => ({
        kind: 'match' as const,
        key: `match-${m.id}`,
        home: m.home,
        away: m.away,
        homeName: m.homeName,
        awayName: m.awayName,
        date: m.date,
        league: m.league,
      })),
  ];

  const standings = buildStandings(lastMatches).slice(0, 8);
  const hasMatchPanel = lastMatches.length > 0;

  return (
    <div className={cn(fcManrope.className, 'flex min-h-screen flex-col bg-pitch-charcoal text-pitch-stone antialiased')}>
      <FcUnitedHeader active="home" />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Hero — club panel (logo, name, CTA) beside an auto-playing slider of upcoming event images */}
        <section
          className={cn('bg-pitch-charcoal pt-8 md:pt-12', hasMatchPanel ? 'pb-28 md:pb-36' : 'pb-12 md:pb-16')}
          aria-labelledby="home-hero-heading"
        >
          <PitchShell>
            <div className="grid gap-6 md:min-h-[520px] md:grid-cols-[300px_minmax(0,1fr)] lg:min-h-[560px] lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
              {/* Left: logo panel + primary CTA */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-pitch-chalk/10 bg-pitch-forest px-6 py-10 text-center">
                  <div className="relative aspect-square w-[min(200px,60%)] md:w-[min(220px,80%)]">
                    <Image
                      src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
                      alt="Maryland Strikers Sports Club"
                      fill
                      priority
                      className="object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
                      sizes="220px"
                    />
                  </div>
                  <h1
                    id="home-hero-heading"
                    className="mt-6 text-3xl font-extrabold tracking-[-0.02em] text-pitch-chalk md:text-4xl"
                  >
                    MD Strikers
                  </h1>
                  <div className="mt-4 flex w-full max-w-[240px] items-center gap-3">
                    <span className="h-px flex-1 bg-pitch-chalk/15" aria-hidden />
                    <span className="text-xs font-medium tracking-[0.12em] text-pitch-stone">mdstrikers.com</span>
                    <span className="h-px flex-1 bg-pitch-chalk/15" aria-hidden />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">
                    Maryland Strikers Sports Club
                  </p>
                </div>

                <Link href="/events" className={cn(pitchButton.primary, 'group w-full py-4')}>
                  Browse all upcoming events
                  <PitchArrow />
                </Link>
              </div>

              {/* Right: upcoming event slider + caption band */}
              <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-pitch-chalk/10 bg-pitch-forest">
                <div className="relative flex aspect-[4/3] flex-col sm:aspect-[16/10] md:aspect-auto md:flex-1">
                  <HeroSlider slides={heroSlides} />
                </div>
                <div className="border-t border-pitch-chalk/10 px-6 py-4 md:px-8">
                  <p className="text-sm font-medium text-pitch-stone">www.mdstrikers.com</p>
                  <p className="mt-1 text-base font-extrabold uppercase tracking-[0.08em] text-pitch-chalk md:text-lg">
                    Maryland Strikers Sports Club
                  </p>
                </div>
              </div>
            </div>
          </PitchShell>
        </section>

        <NextMatchPanel matches={lastMatches} />

        <LiveEventsSection items={liveItems} />
        <FeaturedEventsSection items={featuredItems} />

        {/* Events from event_details: always show title; upcoming → past fallback → empty message */}
        {(showEventsSection || hasOnSaleBand) && (
          <section className={cn(pitchSection, 'bg-pitch-charcoal')}>
            <PitchShell>
              {showEventsSection && (
                <PitchHeading
                  eyebrow="Calendar"
                  title={listEvents.length === 0 || listIsUpcoming ? 'Upcoming Events' : 'Past Events'}
                  lead="Match days, tournaments, and club nights on the Maryland Strikers calendar."
                  action={
                    <Link href="/events" className={cn(pitchButton.ghost, 'group')}>
                      Full calendar
                      <PitchArrow />
                    </Link>
                  }
                />
              )}

              <OnSaleBand events={bandEvents} />

              {showEventsSection &&
                (listEvents.length === 0 ? (
                  <p className="rounded-2xl border border-pitch-chalk/10 px-6 py-10 text-center text-sm">
                    No events listed.
                  </p>
                ) : (
                  <ul className="border-t border-pitch-chalk/10">
                    {listEvents.map((event) => (
                      <li key={event.key} className="border-b border-pitch-chalk/10">
                        <Link
                          href={event.href}
                          className={cn(
                            'group grid grid-cols-[96px_1fr] items-center gap-6 py-6 sm:grid-cols-[160px_1fr_auto] md:gap-8 md:py-8',
                            pitchFocus,
                          )}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-pitch-forest">
                            <Image
                              src={event.src}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                              sizes="160px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-lime/80">
                              {listIsUpcoming ? 'Upcoming' : 'Past event'}
                            </p>
                            <h3 className="mt-2 text-lg font-bold leading-snug text-pitch-chalk transition-colors duration-300 group-hover:text-pitch-lime md:text-2xl">
                              {event.title}
                            </h3>
                            <p className="mt-2 text-sm text-pitch-stone">
                              {[event.dateTime, event.venue].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <span
                            className="hidden h-12 w-12 items-center justify-center rounded-full border border-pitch-chalk/15 text-pitch-chalk transition-colors duration-300 group-hover:border-pitch-lime group-hover:text-pitch-lime sm:flex"
                            aria-hidden
                          >
                            <PitchArrow />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
            </PitchShell>
          </section>
        )}

        {latestNews.length > 0 && (
          <section className={cn(pitchSection, 'bg-pitch-chalk')} aria-labelledby="home-news-heading">
            <PitchShell>
              <PitchHeading
                tone="light"
                id="home-news-heading"
                eyebrow="News"
                title="The Latest from the Club"
                action={
                  <Link href="/news" className={cn(pitchButton.ghostOnLight, 'group')}>
                    All news
                    <PitchArrow />
                  </Link>
                }
              />
              <div className={cn('grid gap-8 md:grid-cols-2', latestNews.length > 2 && 'lg:grid-cols-3')}>
                {latestNews.map((article: ClubNewsArticle) => (
                  <article key={article.documentId || article.slug}>
                    <Link href={newsHref(article)} className={cn('group block rounded-2xl', pitchFocus)}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pitch-forest">
                        {article.coverUrl && (
                          <Image
                            src={article.coverUrl}
                            alt={article.coverAlt}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="pt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-olive">
                          {[article.categoryName, article.publishedAt && formatNewsDate(article.publishedAt)]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.01em] text-pitch-charcoal transition-colors duration-300 group-hover:text-pitch-olive md:text-2xl">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-pitch-charcoal/70">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </PitchShell>
          </section>
        )}

        {showLeagueStandings && homepageLeagues.length > 0 ? (
          <HomeLeagueSection leagues={homepageLeagues} />
        ) : standings.length > 1 && (
          <section className={cn(pitchSection, 'bg-pitch-forest')} aria-labelledby="home-standings-heading">
            <PitchShell>
              <PitchHeading
                id="home-standings-heading"
                eyebrow="Table"
                title="Standings"
                lead="Calculated from recorded results — three points for a win, one for a draw."
              />
              <div className="overflow-x-auto rounded-2xl border border-pitch-chalk/10">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-stone">
                      <th scope="col" className="w-10 px-3 py-4 md:w-12 md:px-6">
                        #
                      </th>
                      <th scope="col" className="px-2 py-4 sm:px-4">
                        Club
                      </th>
                      {['P', 'W', 'D', 'L'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className={cn('px-2 py-4 text-center sm:px-3', h !== 'P' && 'hidden sm:table-cell')}
                        >
                          {h}
                        </th>
                      ))}
                      <th scope="col" className="hidden px-2 py-4 text-center sm:table-cell sm:px-3">
                        GD
                      </th>
                      <th scope="col" className="px-4 py-4 text-center md:px-6">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, i) => (
                      <tr
                        key={row.team}
                        className="border-t border-pitch-chalk/10 tabular-nums text-pitch-chalk transition-colors duration-200 hover:bg-pitch-chalk/[0.03]"
                      >
                        <td className={cn('px-4 py-4 font-semibold md:px-6', i === 0 ? 'text-pitch-lime' : 'text-pitch-stone')}>
                          {i + 1}
                        </td>
                        <td className="px-2 py-4 sm:px-4">
                          <span className="flex items-center gap-3 font-semibold">
                            <Image src={row.crest} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
                            <span className="max-w-[10rem] truncate sm:max-w-none">{row.team}</span>
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center text-pitch-stone sm:px-3">{row.p}</td>
                        <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.w}</td>
                        <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.d}</td>
                        <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.l}</td>
                        <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">
                          {row.gf - row.ga > 0 ? `+${row.gf - row.ga}` : row.gf - row.ga}
                        </td>
                        <td className="px-4 py-4 text-center font-extrabold md:px-6">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PitchShell>
          </section>
        )}

        <LastMatchSection matches={lastMatches} limitPerView={HOMEPAGE_MATCHES_LIMIT} showSeeAll />

        {/* Our Story — club photo under a forest overlay */}
        <section id="about" className="relative isolate overflow-hidden py-24 md:py-32" aria-labelledby="home-story-heading">
          <Image src={STORY_IMAGE} alt="" fill className="-z-20 object-cover object-center" sizes="100vw" />
          <div className="absolute inset-0 -z-10 bg-pitch-forest/85" aria-hidden />
          <PitchShell>
            <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
              <div className="max-w-2xl">
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">
                  <span className="h-px w-8 bg-pitch-lime/60" aria-hidden />
                  Our story
                </p>
                <h2
                  id="home-story-heading"
                  className="text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-pitch-chalk md:text-[2.75rem]"
                >
                  {fcUnitedAboutTitle}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-pitch-chalk/75">{fcUnitedAboutParagraphs[0]}</p>
                <Link href="/about" className={cn(pitchButton.primary, 'group mt-10')}>
                  Read our story
                  <PitchArrow />
                </Link>
              </div>
              <div className="relative mx-auto h-40 w-40 md:h-56 md:w-56">
                <Image
                  src="/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png"
                  alt="Maryland Strikers Sports Club"
                  fill
                  className="object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
                  sizes="(max-width:768px) 160px, 224px"
                />
              </div>
            </div>
          </PitchShell>
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

        {showExecutiveTeamSection && <ExecutiveTeamSection members={executiveTeam} showSeeAll />}

        {/* Sponsors — one card per row, six on the homepage */}
        {showSponsorsSection && (
          <section className={cn(pitchSection, 'bg-pitch-charcoal')} aria-labelledby="home-sponsors-heading">
            <PitchShell>
              <PitchHeading
                id="home-sponsors-heading"
                eyebrow="Partners"
                title="Our Sponsors"
                lead="Local businesses that fuel Capital Cup, training, and community programs — keeping our players competing at a high level and opening the door for families who want serious soccer."
              />

              <div className="grid grid-cols-1 gap-8">
                {sponsorCards.map((sponsor) => (
                  <article
                    key={sponsor.key}
                    className="group overflow-hidden rounded-2xl border border-pitch-chalk/10 bg-pitch-forest/40 transition-colors duration-300 hover:border-pitch-chalk/20"
                  >
                    <div className="w-full overflow-hidden">
                      <Image
                        src={sponsor.src}
                        alt={sponsor.name}
                        width={1600}
                        height={700}
                        className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                        sizes="(max-width: 1240px) 100vw, 1240px"
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      {sponsor.label && (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pitch-lime/80">{sponsor.label}</p>
                      )}
                      <h3 className="mt-2 text-xl font-bold text-pitch-chalk md:text-2xl">{sponsor.name}</h3>
                      {sponsor.tagline && <p className="mt-3 text-sm leading-relaxed">{sponsor.tagline}</p>}
                      {(sponsor.detailsHref || sponsor.websiteHref) && (
                        <div className="mt-6 flex flex-wrap gap-4">
                          {sponsor.detailsHref && (
                            <Link href={sponsor.detailsHref} className={pitchButton.primary}>
                              Sponsor details
                            </Link>
                          )}
                          {sponsor.websiteHref && (
                            <a href={sponsor.websiteHref} target="_blank" rel="noopener noreferrer" className={pitchButton.ghost}>
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
              <ViewAllSponsorsButton />
            </PitchShell>
          </section>
        )}

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
        <section className="border-t border-pitch-chalk/10 bg-pitch-charcoal py-12">
          <PitchShell>
            <div className="grid grid-cols-3 place-items-center gap-8 md:grid-cols-6">
              {fcSponsors.map((src) => (
                <div key={src} className="relative h-12 w-28 md:h-14 md:w-32">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-90"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>
          </PitchShell>
        </section>
      </main>

      <FcUnitedFooter />
    </div>
  );
}
