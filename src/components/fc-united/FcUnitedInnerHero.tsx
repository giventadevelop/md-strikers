import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { PitchShell } from './pitchUi';

const INNER_HERO_IMAGE = '/images/md_strikers_media/gallery/mdstrikers_com/2021-msl.jpg';

const crumbLink =
  'rounded-sm text-pitch-stone transition-colors duration-300 hover:text-pitch-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-charcoal';

export function FcUnitedInnerHero({
  title,
  subtitle,
  parentHref,
  parentLabel,
  tone = 'classic',
}: {
  title: string;
  subtitle?: string;
  parentHref?: string;
  parentLabel?: string;
  /** Club matches the homepage navy theme. Classic keeps the original wash. */
  tone?: 'classic' | 'club';
}) {
  const club = tone === 'club';
  return (
    <section
      className={cn(
        fcBrand.className,
        'md-sport-bg relative isolate overflow-hidden bg-pitch-charcoal',
        club && 'md-inner-hero--club',
      )}
      aria-label={title}
    >
      <Image src={INNER_HERO_IMAGE} alt="" fill priority className="-z-20 object-cover object-[center_40%]" sizes="100vw" />
      <div
        className={cn(
          'absolute inset-0 -z-10',
          club
            ? 'bg-[linear-gradient(100deg,rgba(7,27,56,0.94)_0%,rgba(11,45,89,0.82)_58%,rgba(7,27,56,0.62)_100%)]'
            : 'md-inner-hero-wash bg-[linear-gradient(90deg,rgba(192,40,28,0.94)_0%,rgba(185,68,26,0.82)_55%,rgba(244,123,32,0.45)_100%)]',
        )}
        aria-hidden
      />
      <PitchShell className="py-20 md:py-28">
        <nav className="mb-6 text-xs font-semibold uppercase tracking-[0.24em]" aria-label="Breadcrumb">
          <Link href="/" className={crumbLink}>
            Home
          </Link>
          {parentHref && parentLabel ? (
            <>
              <span className="mx-3 text-pitch-chalk/25" aria-hidden>
                /
              </span>
              <Link href={parentHref} className={crumbLink}>
                {parentLabel}
              </Link>
            </>
          ) : null}
          <span className="mx-3 text-pitch-chalk/25" aria-hidden>
            /
          </span>
          <span className={cn(club ? 'md-inner-crumb-current' : 'text-pitch-lime')}>{title}</span>
        </nav>
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-pitch-chalk md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className={cn('mt-6 max-w-2xl text-base leading-relaxed md:text-lg', club ? 'md-inner-hero-sub' : 'text-pitch-chalk/75')}>
            {subtitle}
          </p>
        ) : null}
      </PitchShell>
    </section>
  );
}
