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

/**
 * Buttons use the shared `.md-btn*` classes in globals.css (red→orange gradient primary,
 * gold/orange-edged secondary, lift + glow on hover, reduced-motion aware).
 */
export const pitchButton = {
  /** Primary on dark surfaces. */
  primary: 'md-btn md-btn-primary',
  /** Primary on light surfaces (same brand gradient). */
  primaryOnLight: 'md-btn md-btn-primary',
  /** Secondary on dark surfaces. */
  ghost: 'md-btn md-btn-secondary',
  /** Secondary on light surfaces. */
  ghostOnLight: 'md-btn md-btn-secondary-light',
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
          <span className="md-brand-rule h-0.5 w-10 rounded-full" aria-hidden />
          {eyebrow}
        </p>
        <h2
          id={id}
          className={cn(
            'text-4xl font-extrabold md:text-5xl',
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
