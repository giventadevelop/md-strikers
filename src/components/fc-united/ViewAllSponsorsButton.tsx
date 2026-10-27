'use client';

import { useRouter } from 'next/navigation';
import { pitchButton } from './pitchUi';

/** Homepage control. A button, so it is not a navigation link. */
export function ViewAllSponsorsButton() {
  const router = useRouter();

  return (
    <div className="mt-12 flex justify-center">
      <button
        type="button"
        onClick={() => router.push('/sponsors')}
        className={pitchButton.ghost}
        title="View All Sponsors"
        aria-label="View All Sponsors"
      >
        View All Sponsors
      </button>
    </div>
  );
}
