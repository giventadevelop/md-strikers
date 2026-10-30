import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { PitchHeading, PitchShell, pitchButton, pitchSection } from './pitchUi';

export type SpotlightItem = {
  key: string;
  label: string;
  title: string;
  description: string;
  image: string;
  details: { label: string; value: string }[];
  score?: { home: string; away: string; homeGoals: number; awayGoals: number; minute: string };
  primary: { label: string; href: string; external?: boolean };
  secondary: { label: string; href: string };
};

type Tone = 'dark' | 'light';

const toneStyles = {
  dark: {
    section: 'bg-pitch-forest',
    muted: 'text-pitch-stone',
    card: 'border-pitch-chalk/10 bg-pitch-charcoal/40 hover:border-pitch-chalk/20',
    media: 'bg-pitch-charcoal',
    title: 'text-pitch-chalk',
    value: 'text-pitch-chalk',
    rule: 'border-pitch-chalk/10',
    marker: 'bg-pitch-lime',
    primary: pitchButton.primary,
    secondary: pitchButton.ghost,
  },
  light: {
    section: 'bg-pitch-chalk',
    muted: 'text-pitch-charcoal/70',
    card: 'border-pitch-charcoal/10 bg-white/60 hover:border-pitch-charcoal/20',
    media: 'bg-pitch-charcoal/[0.04]',
    title: 'text-pitch-charcoal',
    value: 'text-pitch-charcoal',
    rule: 'border-pitch-charcoal/10',
    marker: 'bg-pitch-olive',
    primary: pitchButton.primaryOnLight,
    secondary: pitchButton.ghostOnLight,
  },
} as const;

type Props = {
  tone: Tone;
  id: string;
  eyebrow: string;
  heading: string;
  lead: string;
  badge: { label: string; className: string; pulse?: boolean };
  items: SpotlightItem[];
};

export function EventSpotlightSection({ tone, id, eyebrow, heading, lead, badge, items }: Props) {
  const t = toneStyles[tone];
  const headingId = `${id}-heading`;

  return (
    <section id={id} className={cn(fcBrand.className, pitchSection, t.section)} aria-labelledby={headingId}>
      <PitchShell>
        <PitchHeading tone={tone} id={headingId} eyebrow={eyebrow} title={heading} lead={lead} />

        <div className="flex flex-col gap-8">
          {items.map((item) => (
            <article
              key={item.key}
              className={cn(
                'grid overflow-hidden rounded-3xl border transition-colors duration-300 ease-in-out lg:grid-cols-[1.15fr_1fr]',
                t.card,
              )}
            >
              <div className={cn('relative aspect-[16/10] w-full lg:aspect-auto lg:min-h-[420px]', t.media)}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <span
                  className={cn(
                    'absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-pitch-chalk backdrop-blur',
                    badge.className,
                  )}
                >
                  {badge.pulse && (
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-lime opacity-60 [animation-duration:2s] motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-lime" />
                    </span>
                  )}
                  {badge.label}
                </span>
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-12">
                <p className={cn('flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]', t.muted)}>
                  <span className={cn('h-2 w-2 rounded-full', t.marker)} aria-hidden />
                  {item.label}
                </p>
                <h3
                  className={cn(
                    'mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-4xl',
                    t.title,
                  )}
                >
                  {item.title}
                </h3>

                {item.score && (
                  <div className={cn('mt-6 flex items-center justify-between gap-4 rounded-2xl border px-6 py-4', t.rule)}>
                    <span className={cn('text-sm font-medium', t.value)}>{item.score.home}</span>
                    <span
                      className={cn('text-2xl font-extrabold tabular-nums', t.value)}
                      aria-label={`Score ${item.score.homeGoals} to ${item.score.awayGoals}, minute ${item.score.minute}`}
                    >
                      {item.score.homeGoals}
                      <span className={cn('mx-2', t.muted)}>–</span>
                      {item.score.awayGoals}
                      <span className="ml-3 text-sm font-semibold text-pitch-lime">{item.score.minute}</span>
                    </span>
                    <span className={cn('text-right text-sm font-medium', t.value)}>{item.score.away}</span>
                  </div>
                )}

                <p className={cn('mt-6 text-base leading-relaxed', t.muted)}>{item.description}</p>

                <dl className={cn('mt-8 border-t', t.rule)}>
                  {item.details.map((row) => (
                    <div key={row.label} className={cn('flex items-start justify-between gap-6 border-b py-4', t.rule)}>
                      <dt className={cn('shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em]', t.muted)}>
                        {row.label}
                      </dt>
                      <dd className={cn('text-right text-sm font-medium', t.value)}>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={item.primary.href}
                    className={t.primary}
                    {...(item.primary.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {item.primary.label}
                    {item.primary.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </Link>
                  <Link
                    href={item.secondary.href}
                    className={t.secondary}
                  >
                    {item.secondary.label}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PitchShell>
    </section>
  );
}
