import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcManrope } from './fcUnitedFonts';
import { PitchShell } from './pitchUi';

const INNER_HERO_IMAGE = '/images/md_strikers_media/gallery/mdstrikers_com/2021-msl.jpg';

export function FcUnitedInnerHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className={cn(fcManrope.className, 'relative isolate overflow-hidden bg-pitch-charcoal')} aria-label={title}>
      <Image src={INNER_HERO_IMAGE} alt="" fill priority className="-z-20 object-cover object-[center_40%]" sizes="100vw" />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(23,27,25,0.95)_0%,rgba(20,40,32,0.88)_55%,rgba(20,40,32,0.6)_100%)]"
        aria-hidden
      />
      <PitchShell className="py-20 md:py-28">
        <nav className="mb-6 text-xs font-semibold uppercase tracking-[0.24em]" aria-label="Breadcrumb">
          <Link
            href="/"
            className="rounded-sm text-pitch-stone transition-colors duration-300 hover:text-pitch-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-lime focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-charcoal"
          >
            Home
          </Link>
          <span className="mx-3 text-pitch-chalk/25" aria-hidden>
            /
          </span>
          <span className="text-pitch-lime">{title}</span>
        </nav>
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-pitch-chalk md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-pitch-chalk/75 md:text-lg">{subtitle}</p>
        ) : null}
      </PitchShell>
    </section>
  );
}
