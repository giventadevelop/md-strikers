import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-sm',
} as const;

/** Club crest from league_club.logoUrl, with a letter badge when the club has no logo. */
export function ClubMark({
  name,
  logoUrl,
  size = 'md',
}: {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof SIZES;
}) {
  const box = SIZES[size];
  if (logoUrl) {
    return (
      <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5', box)}>
        <img src={logoUrl} alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-white font-bold text-pitch-charcoal', box)}>
      {name.trim().slice(0, 1).toUpperCase() || '?'}
    </span>
  );
}
