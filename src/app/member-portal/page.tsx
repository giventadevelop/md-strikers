import { Metadata } from 'next';
import MemberPortalClient from './MemberPortalClient';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Member portal – manage your membership and access member-only content.',
};

export default function MemberPortalPage() {
  return (
    <main className="min-h-[60vh] py-8">
      <MemberPortalClient />
    </main>
  );
}
