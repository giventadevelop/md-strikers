'use client';

import HeroSection from '@/components/HeroSection';
import FeaturedEventsSection from '@/components/FeaturedEventsSection';
import LiveEventsSection from '@/components/LiveEventsSection';
import UpcomingEventsSection from '@/components/UpcomingEventsSection';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';
import OurSponsorsSection from '@/components/OurSponsorsSection';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import type { FeaturedEventWithMedia } from '@/lib/homepage/featuredEvents';

type HomePageClientProps = {
  initialFeaturedEvents: FeaturedEventWithMedia[];
};

export default function HomePageClient({ initialFeaturedEvents }: HomePageClientProps) {
  const { showEventsSection, showTeamSection, showSponsorsSection } = useTenantSettings();

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedEventsSection initialFeaturedEvents={initialFeaturedEvents} />
      <LiveEventsSection />
      {showEventsSection && <UpcomingEventsSection />}
      <AboutSection />
      {showTeamSection && <TeamSection />}
      {showSponsorsSection && <OurSponsorsSection />}
    </main>
  );
}
