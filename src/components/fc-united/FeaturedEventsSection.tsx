import { EventSpotlightSection, type SpotlightItem } from './EventSpotlightSection';
import type { BandEvent } from './OnSaleBand';

type FeaturedEvent = SpotlightItem & {
  /** YYYY-MM-DD */
  startDate: string;
  isTicketed: boolean;
  registrationUrl?: string;
};

const featuredItemsDemo: FeaturedEvent[] = [
  {
    key: 'featured-capital-cup-2027-launch',
    startDate: '2026-11-21',
    isTicketed: false,
    registrationUrl: 'https://www.mdstrikers.com/',
    label: 'Featured Event',
    title: 'Capital Cup 2027 Launch Night',
    description:
      'Maryland Strikers Sports Club unveils the Capital Cup 2027 tournament — fixtures, team registrations, and sponsor announcements, with an evening of food and music for players and families.',
    image: '/images/md_strikers_media/gallery/capital_cup_2026_full-width.jpg',
    details: [
      { label: 'Date', value: 'Sat, Nov 21, 2026' },
      { label: 'Time', value: '06:00 PM — 10:00 PM' },
      { label: 'Venue', value: 'Marriott Washingtonian Center, 9751 Washingtonian Blvd, Gaithersburg, MD 20878' },
      { label: 'Admission', value: 'Free · registration required' },
    ],
    primary: { label: 'View event', href: '/events' },
    secondary: { label: 'All events', href: '/events' },
  },
  {
    key: 'featured-im-vijayan-clinic',
    startDate: '2026-12-13',
    isTicketed: true,
    label: 'Featured Event',
    title: 'Meet I.M. Vijayan — Legends Clinic',
    description:
      'Indian football legend I.M. Vijayan returns to Maryland for a coaching clinic and meet-and-greet with Strikers youth and senior players. Limited spots per age group.',
    image: '/images/md_strikers_media/gallery/IM-Vijayan-Image.jpg',
    details: [
      { label: 'Date', value: 'Sun, Dec 13, 2026' },
      { label: 'Time', value: '10:00 AM — 01:00 PM' },
      { label: 'Venue', value: 'Maryland SoccerPlex, 18031 Central Park Cir, Boyds, MD 20841' },
      { label: 'Admission', value: '$25.00 players · spectators free' },
    ],
    primary: { label: 'View event', href: '/events' },
    secondary: { label: 'All events', href: '/events' },
  },
];

/** Sample card, used only when the events backend is unreachable. */
export const featuredEventsShown = featuredItemsDemo.slice(0, 1);

const detail = (item: FeaturedEvent, label: string) =>
  item.details.find((row) => row.label === label)?.value ?? '';

export const featuredBandEvents: BandEvent[] = featuredEventsShown.map((item) => ({
  key: item.key,
  title: item.title,
  src: item.image,
  startDate: item.startDate,
  dateTime: [detail(item, 'Date'), detail(item, 'Time')].filter(Boolean).join(' · '),
  venue: detail(item, 'Venue'),
  isFeatured: true,
  isTicketed: item.isTicketed,
  registrationUrl: item.registrationUrl,
  href: item.primary.href,
}));

export function FeaturedEventsSection({ items }: { items: SpotlightItem[] }) {
  if (items.length === 0) return null;
  return (
    <EventSpotlightSection
      tone="light"
      id="featured-events"
      eyebrow="Spotlight"
      heading="Featured Event"
      lead="Highlights from the Maryland Strikers calendar."
      badge={{ label: 'Featured', className: 'bg-[#262f3e]' }}
      items={items}
    />
  );
}
