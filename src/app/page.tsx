import FcUnitedHomePage from '@/components/fc-united/FcUnitedHomePage';

/**
 * Home route: static FC United mirror (wget index) styled per
 * `design_systems/mdStrikers_site_general_design_final.json`.
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
