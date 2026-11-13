'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PitchArrow, pitchButton } from './pitchUi';

/** Homepage control. A button, so it is not a navigation link. */
export function ViewAllSponsorsButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/sponsors')}
      className={cn(pitchButton.primaryOnLight, 'group', className)}
      title="See All Sponsors"
      aria-label="See All Sponsors"
    >
      See All Sponsors
      <PitchArrow />
    </button>
  );
}
