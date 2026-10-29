import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * MD Strikers "pitch" design system primitives.
 * Colors live in tailwind.config (`pitch-*`); spacing follows an 8px rhythm
 * (section padding 80/112px, card padding 24/32px, grid gaps 24/32px).
 */

export function PitchShell({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** On wide monitors, grow past 1240px but stay capped so the hero image is not letterboxed. */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        wide
          ? 'max-w-[1240px] min-[1440px]:max-w-[1500px] min-[1440px]:px-10 min-[1920px]:max-w-[1620px] min-[1920px]:px-12'
          : 'max-w-[1240px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical padding shared by every homepage section. */
export const pitchSection = 'py-20 md:py-28';

export const pitchFocus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-lime';

const buttonBase = cn(
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-300 ease-out hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  pitchFocus,
);

export const pitchButton = {
  /** Primary on dark surfaces. */
  primary: cn(buttonBase, 'bg-pitch-chalk text-pitch-charcoal hover:bg-pitch-lime'),
  /** Primary on chalk surfaces. */
  primaryOnLight: cn(buttonBase, 'bg-pitch-forest text-pitch-chalk hover:bg-pitch-olive'),
  ghost: cn(buttonBase, 'border border-pitch-chalk/20 text-pitch-chalk hover:border-pitch-chalk/50 hover:bg-pitch-chalk/5'),
  ghostOnLight: cn(
    buttonBase,
    'border border-pitch-charcoal/15 text-pitch-charcoal hover:border-pitch-charcoal/40 hover:bg-pitch-charcoal/[0.03]',
  ),
};

export function PitchArrow({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

type Tone = 'dark' | 'light';

/** Eyebrow + editorial headline + optional lead, with an optional action on the right. */
export function PitchHeading({
  eyebrow,
  title,
  lead,
  id,
  tone = 'dark',
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  tone?: Tone;
  action?: ReactNode;
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={cn('mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        <p
          className={cn(
            'mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em]',
            dark ? 'text-pitch-lime' : 'text-pitch-olive',
          )}
        >
          <span className={cn('h-px w-8', dark ? 'bg-pitch-lime/60' : 'bg-pitch-olive/60')} aria-hidden />
          {eyebrow}
        </p>
        <h2
          id={id}
          className={cn(
            'text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[2.75rem]',
            dark ? 'text-pitch-chalk' : 'text-pitch-charcoal',
          )}
        >
          {title}
        </h2>
        {lead && (
          <p className={cn('mt-4 text-base leading-relaxed', dark ? 'text-pitch-stone' : 'text-pitch-charcoal/70')}>
            {lead}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
