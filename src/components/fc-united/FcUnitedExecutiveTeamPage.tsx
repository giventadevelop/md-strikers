import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import { FcUnitedRosterBoard, type RosterPerson, type RosterTone } from './FcUnitedRosterBoard';
import { encodePublicPath } from './fcUnitedGalleryData';

const TONES: RosterTone[] = ['defender', 'midfielder', 'forward', 'goalkeeper'];

function memberName(member: ExecutiveCommitteeTeamMemberDTO) {
  const joined = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
  return joined || member.title?.trim() || 'Committee member';
}

export default function FcUnitedExecutiveTeamPage({ members }: { members: ExecutiveCommitteeTeamMemberDTO[] }) {
  const groups = new Map<string, RosterTone>();
  const people = [...members]
    .sort((a, b) => (a.priorityOrder ?? 10000) - (b.priorityOrder ?? 10000))
    .map((member): RosterPerson => {
      const groupLabel = member.department?.trim() || member.designation?.trim() || 'Committee';
      const groupKey = groupLabel.toLowerCase();
      if (!groups.has(groupKey)) groups.set(groupKey, TONES[groups.size % TONES.length]);
      const chip = member.designation?.trim() || member.title?.trim() || groupLabel;
      const detail = member.title?.trim() && member.title.trim() !== chip ? member.title.trim() : member.department?.trim() || '';
      const name = memberName(member);
      return {
        id: String(member.id ?? name),
        name,
        chip,
        tone: groups.get(groupKey) || 'other',
        groupKey,
        groupLabel,
        detail,
        number: '',
        imageUrl: member.profileImageUrl?.trim() ? encodePublicPath(member.profileImageUrl.trim()) : '',
        searchText: [name, member.designation, member.title, member.department, member.bio].filter(Boolean).join(' '),
        sortNumber: member.priorityOrder ?? 10000,
      };
    });

  return (
    <FcUnitedRosterBoard
      active="executive"
      kicker="Committee"
      title="Executive Team"
      subtitle="The organization committee that runs the club."
      people={people}
      noun="member"
      emptyQuiet="No committee members yet"
      emptyDetail="The executive team will be listed here once members are published."
      searchLabel="Search committee members by name"
      searchPlaceholder="Search by name or role…"
      sorts={[
        { key: 'order', label: 'Order' },
        { key: 'name', label: 'Name' },
      ]}
    />
  );
}
