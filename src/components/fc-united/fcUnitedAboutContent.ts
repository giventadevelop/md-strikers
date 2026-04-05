/**
 * About copy for Maryland Strikers — aligned with the home page and NAMSL community context.
 * NAMSL: https://namsl.com/ (North American Malayalee Soccer League).
 */
export const fcUnitedAboutTitle = 'One of the top soccer clubs in the USA and North America';

export const fcUnitedAboutP1 =
  'Maryland Strikers Sports Club is a U.S.-based soccer organization rooted in Germantown, Maryland. We compete at a high level, develop players across age groups, and bring together families who want serious soccer with a strong sense of community.';

/** Text before the NAMSL link (About page renders the link; home teaser uses full paragraph list only). */
export const fcUnitedAboutP2BeforeNamslLink =
  'We are part of the broader North American Malayalee soccer ecosystem alongside leagues such as the North American Malayalee Soccer League (NAMSL), which promotes premier-level soccer and connection for communities across the USA and Canada. Learn more about that league at';

export const fcUnitedAboutNamslUrl = 'https://namsl.com/';

export const fcUnitedAboutP3 =
  'As you will see on our home page, we spotlight major events such as Capital Cup 2026—with chief guest I.M. Vijayan—and fixtures at venues including Othello Regional Park in Frederick, Maryland. Our first team, match results, and news sections reflect the same energy we bring to training and competition every week.';

/** Full text for paragraph 2 (e.g. contexts that cannot render JSX). */
const fcUnitedAboutP2Plain = `${fcUnitedAboutP2BeforeNamslLink} ${fcUnitedAboutNamslUrl}`;

export const fcUnitedAboutParagraphs = [fcUnitedAboutP1, fcUnitedAboutP2Plain, fcUnitedAboutP3] as const;

// --- Integrated from https://www.mdstrikers.com/index.html (headings + subsections; does not replace copy above) ---

export const mdStrikersIndexTagline =
  'Develop your skills, compete with heart, enjoy the game.';

export const mdStrikersLearnMoreHeading = 'Learn more about us';

export const mdStrikersWhatWeDoHeading = 'What we do';
export const mdStrikersWhatWeDoBody =
  'At MD Strikers, we are committed to providing a supportive and competitive soccer environment for players of all ages and skill levels. As a nonprofit club, our goal is to make soccer accessible to everyone by offering quality training, development programs, and opportunities to compete at various levels. We focus on fostering teamwork, sportsmanship, and personal growth, both on and off the field. Through community involvement and partnerships, we strive to inspire a lifelong love for the game while shaping future leaders.';

export const mdStrikersHistoryHeading = 'History';
export const mdStrikersHistoryBody =
  'Founded in 2009, MD Strikers is a recreational soccer club based in the DMV (D.C., Maryland, Virginia) area, created to bring together soccer enthusiasts of all skill levels. The club was established by a group of local players who wanted to create a fun, inclusive environment where the community could enjoy the game without the pressures of competitive leagues. Starting with small pick-up games and weekend matches, MD Strikers quickly grew in popularity, attracting players of all ages. Over the years, the club expanded to organize seasonal leagues, friendly tournaments, and social events, fostering a strong sense of camaraderie among its members. Today, MD Strikers remains a vibrant part of the DMV soccer scene, offering a welcoming space for recreational players to stay active, build friendships, and share their love for the sport.';

export const mdStrikersNewsHeading = 'News';
export const mdStrikersNewsParagraphs = [
  'The MD Strikers Soccer Sports Club is set to host the Capital Cup 2026, a 40+ soccer tournament scheduled for Saturday, May 23, 2026, at Othello Regional Park in Brunswick, Maryland.',
  'The tournament aims to bring together veteran soccer enthusiasts from the region, promoting camaraderie and competitive spirit among players aged 40 and above. Matches will kick off at 8:00 am EDT, with teams competing throughout the day.',
  'Othello Regional Park, located at 1901A Jefferson Pike, offers a scenic backdrop for the event, featuring well-maintained fields and amenities suitable for players and spectators alike.',
  'The MD Strikers Soccer Sports Club, known for organizing engaging soccer events in the area, encourages teams and players interested in participating to register early.',
  'Soccer fans and community members are invited to attend and support local talent, enjoying a day filled with exciting matches and sportsmanship.',
] as const;

export const mdStrikersSupportersHeading = 'Supporters';
export const mdStrikersSupportersParagraphs = [
  'MD Strikers is proud to be supported by a dedicated community of sponsors and partners who share our passion for recreational soccer. Their generosity helps us provide quality facilities, organize exciting tournaments, and create a fun, inclusive environment for players of all skill levels.',
  'Our sponsors play a vital role in making our club a success, contributing to equipment, field rentals, and community events. In return, we proudly showcase their support through our events, social media, and club activities.',
  'We extend our heartfelt gratitude to our sponsors for their commitment to growing the beautiful game in our community. If you or your organization are interested in supporting MD Strikers, we welcome partnerships that help us continue to expand and enhance our programs.',
] as const;

export const mdStrikersThankYouSponsorsLine = 'Thank you to our sponsors!';
export const mdStrikersBecomeASponsorHeading = 'Become a sponsor';
export const mdStrikersBecomeASponsorBody =
  'Want to be part of our growing soccer community? Contact us to learn how you can support MD Strikers and gain exposure for your brand while making a difference in local sports!';

export const mdStrikersMemorableMomentsHeading = 'Memorable moments';

/** Local copies of https://www.mdstrikers.com/images/strikers/* (scraped from index.html MEMORABLE MOMENTS). */
export type MdStrikersMemorableMomentTile = {
  src: string;
  /** Shown on the grid card (title line). */
  caption: string;
  /** Optional longer copy for the lightbox; if omitted, the slideshow uses `caption` as the description. */
  description?: string;
};

export const mdStrikersMemorableMomentTiles: readonly MdStrikersMemorableMomentTile[] = [
  {
    src: '/images/md_strikers_site/memorable_moments/2024-kanj.jpg',
    caption: 'KANJ Soccer Tournament 2024, New Jersey',
  },
  {
    src: '/images/md_strikers_site/memorable_moments/2021-msl.jpg',
    caption: 'MSL 2021, Virginia',
  },
  {
    src: '/images/md_strikers_site/memorable_moments/2022-nj-team.jpg',
    caption: 'Syro Soccer league 2022, Sometset, New Jersey',
  },
  {
    src: '/images/md_strikers_site/memorable_moments/2024-namsl.jpg',
    caption: 'V P Sathyan Memorial North American National Soccer Tournament 2024, New York',
  },
  {
    src: '/images/md_strikers_site/memorable_moments/Soccer-KCS.jpg',
    caption: 'KCS Soccer Tournament 2023, Loudoun County, Virginia',
  },
  {
    src: '/images/md_strikers_site/memorable_moments/gal05.jpg',
    caption: 'MD Strikers Internal Tournament 2022, Potomac, Maryland',
  },
];
