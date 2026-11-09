'use client';

import { useRouter } from 'next/navigation';
import { pitchButton } from './pitchUi';

/** Homepage control. A button, so it is not a navigation link. */
export function ViewAllSponsorsButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/sponsors')}
      className={className ?? pitchButton.ghost}
      title="View All Sponsors"
      aria-label="View All Sponsors"
    >
      View All Sponsors
    </button>
  );
}
