import FcUnitedHomePage from '@/components/fc-united/FcUnitedHomePage';

/**
 * Home route: FC United homepage. Visual system is Blaugrana
 * (`public/website-reference/blaugrana-design-system`), applied in
 * `src/components/fc-united/blaugrana-home.css`. Content and data flow are unchanged.
 *
 * Previous implementation (dynamic featured events + HomePageClient) is kept in:
 * - `src/app/HomePageClient.tsx`
 * - `src/lib/homepage/fetchFeaturedEventsServer.ts`
 * Re-enable by restoring an async page that calls `fetchFeaturedEventsForHomepageServer`
 * and renders `<HomePageClient initialFeaturedEvents={...} />`.
 *
 * Backend event catalog: `/browse-events` (moved from `/events` for FC United static pages).
 */
export default function HomePage() {
  return <FcUnitedHomePage />;
}
