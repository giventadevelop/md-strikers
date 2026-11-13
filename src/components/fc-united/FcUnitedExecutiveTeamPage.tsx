import { cn } from '@/lib/utils';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { pitchPageInset } from './pitchUi';
import { ExecutiveTeamSection } from './ExecutiveTeamSection';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';

/** Organization committee — separate from the sports roster at /team. */
export default function FcUnitedExecutiveTeamPage({
  members,
}: {
  members: ExecutiveCommitteeTeamMemberDTO[];
}) {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="executive" />
      <FcUnitedInnerHero
        title="Executive Team"
        subtitle="The organization committee that runs the club."
      />
      {members.length > 0 ? (
        <ExecutiveTeamSection members={members} paginate />
      ) : (
        <section className="md-sport-bg bg-pitch-chalk py-16">
          <p className={cn(pitchPageInset, 'text-center text-sm text-pitch-charcoal/70')}>
            The executive team will be listed here once members are published.
          </p>
        </section>
      )}
      <FcUnitedFooter />
    </div>
  );
}
