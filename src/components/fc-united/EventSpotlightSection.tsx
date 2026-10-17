import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBebas, fcRoboto } from './fcUnitedFonts';

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
    section: '',
    eyebrow: 'text-[#848992]',
    heading: 'text-white',
    muted: 'text-[#848992]',
    card: 'border-white/10 bg-white/[0.03] hover:border-white/20',
    media: 'bg-[#081224]',
    title: 'text-white',
    value: 'text-white',
    rule: 'border-white/10',
    secondary: 'border-white/20 text-white hover:border-white/35 hover:bg-white/[0.06]',
  },
  light: {
    section: 'bg-[#f4f4f4]',
    eyebrow: 'text-[#797e87]',
    heading: 'text-[#262f3e]',
    muted: 'text-[#797e87]',
    card: 'border-[#e3e3e3] bg-white hover:border-[#c8c8c8]',
    media: 'bg-white',
    title: 'text-[#262f3e]',
    value: 'text-[#262f3e]',
    rule: 'border-[#e3e3e3]',
    secondary: 'border-[#e3e3e3] text-[#262f3e] hover:border-[#c8c8c8] hover:bg-[#f9fafb]',
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
    <section
      id={id}
      className={cn('py-14 md:py-20', t.section)}
      style={
        tone === 'dark'
          ? { background: 'linear-gradient(135deg, #081224 0%, #0f1f38 55%, #262f3e 100%)' }
          : undefined
      }
      aria-labelledby={headingId}
    >
      <div className="mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12">
        <div className="mb-10 text-center md:mb-12 md:text-left">
          <span className={cn('mb-2 block text-xs font-semibold uppercase tracking-[0.2em]', t.eyebrow)}>
            {eyebrow}
          </span>
          <h2 id={headingId} className={cn(fcBebas.className, 'text-4xl tracking-[0.03em] md:text-5xl', t.heading)}>
            {heading}
          </h2>
          <p className={cn('mt-4 max-w-2xl text-sm leading-relaxed md:text-[15px]', t.muted)}>{lead}</p>
        </div>

        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <article
              key={item.key}
              className={cn(
                'grid overflow-hidden rounded-[3px] border transition-colors duration-300 ease-in-out lg:grid-cols-[1.15fr_1fr]',
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
                    'absolute left-3 top-3 inline-flex items-center gap-2 rounded-[32px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white',
                    badge.className,
                  )}
                >
                  {badge.pulse && (
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                  )}
                  {badge.label}
                </span>
              </div>

              <div className="flex flex-col px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
                <p className={cn('flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]', t.muted)}>
                  <span className="h-2 w-2 rounded-[1px] bg-[#ff0000]" aria-hidden />
                  {item.label}
                </p>
                <h3
                  className={cn(
                    fcBebas.className,
                    'mt-2 text-4xl leading-[1.05] tracking-[0.02em] md:text-5xl',
                    t.title,
                  )}
                >
                  {item.title}
                </h3>

                {item.score && (
                  <div className={cn('mt-4 flex items-center justify-between gap-4 rounded-[3px] border px-4 py-3', t.rule)}>
                    <span className={cn('text-sm font-medium', t.value)}>{item.score.home}</span>
                    <span
                      className={cn(fcRoboto.className, 'text-2xl font-medium tabular-nums', t.value)}
                      aria-label={`Score ${item.score.homeGoals} to ${item.score.awayGoals}, minute ${item.score.minute}`}
                    >
                      {item.score.homeGoals}
                      <span className={cn('mx-2', t.muted)}>–</span>
                      {item.score.awayGoals}
                      <span className="ml-3 text-sm text-[#ff0000]">{item.score.minute}</span>
                    </span>
                    <span className={cn('text-right text-sm font-medium', t.value)}>{item.score.away}</span>
                  </div>
                )}

                <p className={cn('mt-4 text-sm leading-relaxed md:text-[15px]', t.muted)}>{item.description}</p>

                <dl className={cn('mt-6 border-t', t.rule)}>
                  {item.details.map((row) => (
                    <div key={row.label} className={cn('flex items-start justify-between gap-6 border-b py-3', t.rule)}>
                      <dt className={cn('shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em]', t.muted)}>
                        {row.label}
                      </dt>
                      <dd className={cn('text-right text-sm font-medium', t.value)}>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={item.primary.href}
                    className="inline-flex items-center justify-center rounded-[32px] bg-[#ff0000] px-7 py-3 text-sm font-semibold text-white transition-[filter] duration-300 ease-in-out hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none"
                    {...(item.primary.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {item.primary.label}
                    {item.primary.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </Link>
                  <Link
                    href={item.secondary.href}
                    className={cn(
                      'inline-flex items-center justify-center rounded-[32px] border px-7 py-3 text-sm font-semibold transition-[border-color,background] duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000] motion-reduce:transition-none',
                      t.secondary,
                    )}
                  >
                    {item.secondary.label}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
