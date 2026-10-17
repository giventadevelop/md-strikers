import { EventSpotlightSection, type SpotlightItem } from './EventSpotlightSection';

/** Sample cards, used only when the events backend is unreachable. */
export const liveItemsDemo: SpotlightItem[] = [
  {
    key: 'live-match-capital-fc',
    label: 'Live Match',
    title: 'MD Strikers vs Capital FC',
    description:
      'Second half under the lights in Germantown. The Strikers lead the Maryland Premier League clash after a first-half brace — follow every minute live.',
    image: '/images/md_strikers_media/gallery/mdstrikers_com/2021-msl.jpg',
    score: { home: 'MD Strikers', away: 'Capital FC', homeGoals: 2, awayGoals: 1, minute: "67'" },
    details: [
      { label: 'Date', value: 'Wed, Oct 14, 2026' },
      { label: 'Kick-off', value: '07:00 PM — 08:45 PM' },
      { label: 'Venue', value: 'Black Rock Soccer Complex, Germantown, MD 20874' },
      { label: 'League', value: 'Maryland Premier League · Matchday 9' },
    ],
    primary: { label: 'Watch live', href: '/events' },
    secondary: { label: 'All matches', href: '/events' },
  },
  {
    key: 'live-event-skills-clinic',
    label: 'Live Event',
    title: 'Capital Cup Youth Skills Clinic',
    description:
      'Coaches from the Capital Cup 2026 squad are running an open skills clinic for U10–U15 players — dribbling, finishing, and small-sided games. Walk-ins welcome.',
    image: '/images/md_strikers_media/gallery/capital_cup_2026_flyer.jpg',
    details: [
      { label: 'Date', value: 'Wed, Oct 14, 2026' },
      { label: 'Time', value: '05:30 PM — 08:00 PM' },
      { label: 'Venue', value: 'Maryland SoccerPlex, 18031 Central Park Cir, Boyds, MD 20841' },
      { label: 'Admission', value: 'Free · registration required' },
    ],
    primary: { label: 'View event', href: '/events' },
    secondary: { label: 'All events', href: '/events' },
  },
];

export function LiveEventsSection({ items }: { items: SpotlightItem[] }) {
  if (items.length === 0) return null;
  return (
    <EventSpotlightSection
      tone="dark"
      id="live-now"
      eyebrow="Happening now"
      heading="Live Events & Matches"
      lead="Matches in progress and club events open right now."
      badge={{ label: 'Live now', className: 'bg-[#ff0000]', pulse: true }}
      items={items}
    />
  );
}
