import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcUnitedAboutParagraphs, fcUnitedAboutTitle } from './fcUnitedAboutContent';
import { fcSponsors } from './fcUnitedConstants';
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
import { fcBrand, fcOrganic } from './fcUnitedFonts';
import { TeamMembersDbSection } from './TeamMembersDbSection';
import { ExecutiveTeamSection } from './ExecutiveTeamSection';
import { HOMEPAGE_MATCHES_LIMIT, LastMatchSection } from './LastMatchSection';
import { LiveEventsSection } from './LiveEventsSection';
import { FeaturedEventsSection } from './FeaturedEventsSection';
import { EventNewsCarousel } from './EventNewsCarousel';
import { OnSaleBand, pickOnSaleEvent, type BandEvent } from './OnSaleBand';
import { eventToBandEvent, eventToSpotlightItem } from './homeEventDisplay';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { ViewAllSponsorsButton } from './ViewAllSponsorsButton';
import { HeroSlider, type HeroSlide } from './HeroSlider';
import { HomeMotion } from './HomeMotion';
import { NextMatchPanel } from './NextMatchPanel';
import { buildStandings } from './homeStandings';
import { HomeLeagueSection } from './HomeLeagueSection';
import { PitchArrow, PitchHeading, PitchShell, pitchButton, pitchFocus, pitchSection } from './pitchUi';
const STORY_IMAGE = '/images/md_strikers_media/gallery/mdstrikers_com/gal03.jpg';

const formatNewsDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

type SponsorCard = {
  key: string;
  src: string;
  name: string;
  label: string;
  tagline?: string;
  detailsHref?: string;
  websiteHref?: string | null;
};

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

  const showEventsSection = tenantSettings?.showEventsSectionInHomePage !== false;
  const showSportsTeamSection = tenantSettings?.showTeamMembersSectionInHomePage !== false;
  const showExecutiveTeamSection = tenantSettings?.showExecutiveCommitteeSectionInHomePage !== false;
  const showSponsorsSection = tenantSettings?.showSponsorsSectionInHomePage !== false;
  const showLeagueStandings = tenantSettings?.showLeagueStandingsSectionInHomePage === true;

  const listIsUpcoming = eventList.isUpcoming;

  const liveItems = liveFromDb.map((item) => eventToSpotlightItem(item, 'Live Event'));

  const featuredItems = featuredFromDb
    .slice(0, 1)
    .map((item) =>
      eventToSpotlightItem(
        { event: item.event, imageUrl: getFeaturedEventImageUrl(item) },
        isPastHomepageEvent(item.event) ? 'Past Featured Event' : 'Featured Event',
      ),
    );

  const listEvents: BandEvent[] = eventList.items.map((item) => eventToBandEvent(item, false));

  const bandEvents: BandEvent[] = [
    ...featuredFromDb.map((item) =>
      eventToBandEvent({ event: item.event, imageUrl: getFeaturedEventImageUrl(item) }, true),
    ),
    ...listEvents,
  ];
  const onSaleEvent = pickOnSaleEvent(bandEvents);
  const hasOnSaleBand = onSaleEvent !== null;
  const eventsAfterFirst = hasOnSaleBand
    ? listEvents.filter((event) => event.key !== onSaleEvent.key)
    : listEvents.slice(1);

  const sponsorCards: SponsorCard[] = sponsorsFromDb.slice(0, HOMEPAGE_SPONSOR_LIMIT).map((sp) => ({
    key: `sponsor-${sp.id ?? sp.name}`,
    src: sp.imageUrl,
    name: sp.name,
    label: sp.type || 'Sponsor',
    tagline: sp.tagline,
    detailsHref: sp.id != null ? `/sponsors/${sp.id}` : undefined,
    websiteHref: sp.websiteHref,
  }));

  // Hero slider: images of current events (featured first, one slide per distinct image), then current matches.
  const heroEventSlides: HeroSlide[] = [
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
    <div className={cn(fcBrand.className, fcOrganic.className, 'md-organic flex min-h-screen flex-col bg-pitch-charcoal text-pitch-stone antialiased')}>
      <HomeMotion>
      <FcUnitedHeader active="home" />

      <main className="md-home flex min-w-0 flex-1 flex-col">
        {/* Hero — club panel (logo, name, CTA) beside an auto-playing slider of upcoming event images */}
        <section
          className={cn('md-sport-bg md-hero-stage pt-8 md:pt-12', hasMatchPanel ? 'pb-28 md:pb-36' : 'pb-12 md:pb-16')}
          aria-labelledby="home-hero-heading"
        >
          <div className="md-hero-lights" aria-hidden="true">
            <div className="md-hero-bowl" />
            <div className="md-hero-atmosphere" />
            <span className="md-hero-mote" />
            <span className="md-hero-mote" />
            <span className="md-hero-mote" />
            <span className="md-hero-mote" />
            <span className="md-hero-mote" />
          </div>
          <PitchShell wide>
            <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
              {/* Left: logo panel + primary CTA */}
              <div className="flex flex-col gap-4">
                <div className="md-live-card md-live-card--soft md-hero-logo flex flex-1 flex-col items-center justify-center rounded-3xl px-6 py-10 text-center">
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

                <Link href="/events" className={cn(pitchButton.primary, 'md-hero-cta group w-full py-4')}>
                  Browse all upcoming events
                  <PitchArrow />
                </Link>
              </div>

              {/* Right: upcoming event slider + caption band */}
              <div className="md-hero-slider flex min-h-0 flex-col overflow-hidden rounded-3xl">
                <div className="relative flex aspect-[4/3] flex-col sm:aspect-[16/10]">
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

        {(showEventsSection || hasOnSaleBand) && (listEvents.length > 0 || hasOnSaleBand) && (
          <section className={cn(pitchSection, 'bg-pitch-charcoal')}>
            <PitchShell>
              {showEventsSection && listEvents.length > 0 && (
                <PitchHeading
                  className="md-home-heading md-home-heading--on-light"
                  tone="light"
                  eyebrow="Calendar"
                  title={listIsUpcoming ? 'Upcoming Events' : 'Past Events'}
                  lead="Match days, tournaments, and club nights on the Maryland Strikers calendar."
                />
              )}

              <OnSaleBand events={bandEvents} />

              {showEventsSection && listEvents.length > 0 && (
                <EventNewsCarousel
                  events={eventsAfterFirst.map((event) => ({
                    key: event.key,
                    title: event.title,
                    src: event.src,
                    dateTime: event.dateTime,
                    venue: event.venue,
                    href: event.href,
                    isTicketed: event.isTicketed,
                  }))}
                />
              )}
              {showEventsSection && listEvents.length > 0 && (
                <div className="mt-12 flex justify-center">
                  <Link href="/events" className={cn(pitchButton.primaryOnLight, 'group')}>
                    See All Events
                    <PitchArrow />
                  </Link>
                </div>
              )}
            </PitchShell>
          </section>
        )}

        {latestNews.length > 0 && (
          <section className={cn(pitchSection, 'md-news-band')} aria-labelledby="home-news-heading">
            <PitchShell>
              <PitchHeading
                className="md-home-heading"
                tone="light"
                id="home-news-heading"
                eyebrow="News"
                title="The Latest from the Club"
              />
              <div className={cn('grid gap-8 md:grid-cols-2', latestNews.length > 2 && 'lg:grid-cols-3')}>
                {latestNews.map((article: ClubNewsArticle) => (
                  <article key={article.documentId || article.slug}>
                    <Link href={newsHref(article)} className={cn('md-live-card group block h-full rounded-2xl bg-pitch-card/60 p-3', pitchFocus)}>
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
              <div className="mt-12 flex justify-center">
                <Link href="/news" className={cn(pitchButton.primaryOnLight, 'group')}>
                  See All News
                  <PitchArrow />
                </Link>
              </div>
            </PitchShell>
          </section>
        )}

        {showLeagueStandings && homepageLeagues.length > 0 ? (
          <HomeLeagueSection leagues={homepageLeagues} />
        ) : standings.length > 1 && (
          <section className={cn(pitchSection, 'md-band-olive md-sport-bg bg-pitch-forest')} aria-labelledby="home-standings-heading">
            <PitchShell>
              <PitchHeading
                className="md-home-heading md-home-heading--on-light"
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
                        className="md-live-row border-t border-pitch-chalk/10 tabular-nums text-pitch-chalk"
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
              <div className="md-home-heading max-w-2xl">
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-pitch-lime">
                  <span className="md-brand-rule h-0.5 w-10 rounded-full" aria-hidden />
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

        {showSportsTeamSection && <TeamMembersDbSection members={teamMembersFromDb} />}

        {showExecutiveTeamSection && <ExecutiveTeamSection members={executiveTeam} showSeeAll />}

        {showSponsorsSection && sponsorCards.length > 0 && (
          <section className="md-sponsor-strip" aria-labelledby="home-sponsors-heading">
            <PitchShell>
              <div className="md-sponsor-strip__head">
                <div className="md-home-heading">
                  <p>
                    <span className="md-brand-rule h-0.5 w-10 rounded-full" aria-hidden />
                    Partners
                  </p>
                  <h2 id="home-sponsors-heading">Our Sponsors</h2>
                </div>
              </div>
              <ul className="md-sponsor-strip__grid">
                {sponsorCards.map((sponsor) => {
                  const mark = (
                    <>
                      <span className="md-sponsor-tile__logo">
                        <Image
                          src={sponsor.src}
                          alt=""
                          width={1376}
                          height={768}
                          className="md-sponsor-tile__img"
                          sizes="100vw"
                        />
                      </span>
                      <span className="md-sponsor-tile__name">{sponsor.name}</span>
                    </>
                  );
                  return (
                    <li key={sponsor.key}>
                      <article className="md-sponsor-tile">
                        {sponsor.detailsHref ? (
                          <Link className="md-sponsor-tile__open" href={sponsor.detailsHref} aria-label={sponsor.name}>
                            {mark}
                          </Link>
                        ) : (
                          <div className="md-sponsor-tile__open" aria-label={sponsor.name}>
                            {mark}
                          </div>
                        )}
                        {(sponsor.detailsHref || sponsor.websiteHref) && (
                          <div className="md-sponsor-tile__actions">
                            {sponsor.detailsHref ? (
                              <Link className="md-sp-card__details" href={sponsor.detailsHref}>
                                Sponsor details
                                <svg viewBox="0 0 24 24" aria-hidden>
                                  <path fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                              </Link>
                            ) : null}
                            {sponsor.websiteHref ? (
                              <a
                                className="md-sp-card__site"
                                href={sponsor.websiteHref}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Visit website
                                <svg viewBox="0 0 24 24" aria-hidden>
                                  <path fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M8 7h9v9" />
                                </svg>
                              </a>
                            ) : null}
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-10 flex justify-center">
                <ViewAllSponsorsButton />
              </div>
            </PitchShell>
          </section>
        )}

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
      </HomeMotion>
    </div>
  );
}
