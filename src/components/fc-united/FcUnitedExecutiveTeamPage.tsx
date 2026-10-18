import { cn } from '@/lib/utils';
import { fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { ExecutiveTeamSection } from './ExecutiveTeamSection';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';

/** Organization committee — separate from the sports roster at /team. */
export default function FcUnitedExecutiveTeamPage({
  members,
}: {
  members: ExecutiveCommitteeTeamMemberDTO[];
}) {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="executive" />
      <FcUnitedInnerHero
        title="Executive Team"
        subtitle="The organization committee that runs the club."
      />
      {members.length > 0 ? (
        <ExecutiveTeamSection members={members} />
      ) : (
        <section className="bg-white py-16">
          <p className="mx-auto max-w-[1308px] px-4 text-center text-sm text-[#797e87] md:px-7 lg:px-12">
            The executive team will be listed here once members are published.
          </p>
        </section>
      )}
      <FcUnitedFooter />
    </div>
  );
}
