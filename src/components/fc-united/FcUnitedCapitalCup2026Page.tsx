import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

const GALLERY = '/images/md_strikers_media/gallery';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

/** Content aligned with https://www.mdstrikers.com/capitalcup2026.html */
export default function FcUnitedCapitalCup2026Page() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="capitalCup2026" />
      <FcUnitedInnerHero title="Capital Cup 2026" />

      <section className="bg-white">
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-[#081224]">
          <div className="relative mx-auto aspect-[3/4] max-h-[min(92vh,1200px)] w-full max-w-4xl sm:aspect-[3/4] md:aspect-[4/5] lg:max-h-[min(85vh,1100px)]">
            <Image
              src={`${GALLERY}/capital_cup_2026_flyer.jpg`}
              alt="Capital Cup 2026 tournament poster"
              fill
              className="object-contain object-top"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        </div>

        <Shell className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-sm leading-relaxed md:text-base">
            <p>
              Welcome to the Capital Cup 2026! Maryland Strikers Sports Club is proud to host the 40+ Soccer
              Tournament, bringing together soccer enthusiasts from across the region for an exciting display of
              sportsmanship and talent.
            </p>

            <div>
              <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                About the Tournament
              </h2>
              <p className="mt-4">
                The Capital Cup 2026 is designed for players aged 40 and above, celebrating the passion and skill of
                veteran soccer players. This tournament promises competitive matches, great camaraderie, and unforgettable
                moments on the field.
              </p>
            </div>

            <div>
              <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                Chief Guest
              </h2>
              <div className="relative mt-6 overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4]">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-xl md:aspect-[16/10]">
                  <Image
                    src={`${GALLERY}/IM-Vijayan-Image_news.jpg`}
                    alt="Chief guest — I. M. Vijayan"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 768px) 100vw, 576px"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                Tournament Details
              </h2>
              <p className="mt-4">
                Join us for an action-packed tournament featuring teams from various clubs and regions. Stay tuned for
                more details about fixtures, venues, and schedules.
              </p>
            </div>

            <div>
              <h2 className={cn(fcBebas.className, 'text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
                Registration
              </h2>
              <p className="mt-4">
                Teams interested in participating can reach out to us at{' '}
                <a
                  href="mailto:mdstrikersinc@gmail.com"
                  className="cursor-pointer font-medium text-[#ff0000] underline-offset-2 transition-colors duration-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                >
                  mdstrikersinc@gmail.com
                </a>{' '}
                for registration details and tournament guidelines.
              </p>
            </div>

            <div className="border-t border-[#e3e3e3] pt-10">
              <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                Previous Tournaments
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  <a
                    href="/capital-cup-2025"
                    className="cursor-pointer text-[#ff0000] underline-offset-2 transition-colors duration-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                  >
                    Capital Cup 2025
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Shell>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
