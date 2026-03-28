import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import { FcUnitedContactForm } from './FcUnitedContactForm';
import Image from 'next/image';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

/** Map pin + primary venue (embed uses same query for one marker). */
const CONTACT_MAP_QUERY =
  'Germantown Rd, Germantown, MD 20874, United States';

const CONTACT_MAP_EMBED_SRC = `https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=15&q=${encodeURIComponent(CONTACT_MAP_QUERY)}`;

export default function FcUnitedContactsPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="contacts" />
      <FcUnitedInnerHero title="Contacts" />

      <section className="bg-white">
        <div className="relative h-[min(60vh,604px)] w-full overflow-hidden bg-[#e3e3e3]">
          <iframe
            title="Maryland Strikers — location map"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={CONTACT_MAP_EMBED_SRC}
          />
        </div>

        <Shell className="py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="text-center">
              <h3 className={cn(fcBebas.className, 'text-xl text-[#262f3e]')}>Address</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Germantown Rd, Germantown, MD 20874, United States, Washington D.C., DC, United States, Washington,
                District of Columbia
              </p>
            </div>
            <div className="text-center">
              <h3 className={cn(fcBebas.className, 'text-xl text-[#262f3e]')}>Mail</h3>
              <p className="mt-3 text-sm">
                <a href="mailto:mdstrikersinc@gmail.com" className="text-[#ff0000] hover:underline">
                  mdstrikersinc@gmail.com
                </a>
              </p>
            </div>
            <div className="text-center">
              <h3 className={cn(fcBebas.className, 'text-xl text-[#262f3e]')}>Phone</h3>
              <p className="mt-3 text-sm">
                <a href="tel:+12404187790" className="text-[#ff0000] hover:underline">
                  (240) 418-7790
                </a>
              </p>
            </div>
          </div>

          <div className="mt-16 border-t border-[#e3e3e3] pt-12 text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">have a question?</span>
            <h2 className={cn(fcBebas.className, 'text-3xl text-[#262f3e] md:text-4xl')}>drop a line</h2>

            <FcUnitedContactForm />
          </div>
        </Shell>
      </section>

      <section className="border-t border-[#e3e3e3] bg-[#f4f4f4] py-10">
        <Shell>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:justify-between">
            {fcSponsors.map((src) => (
              <div key={src} className="relative h-12 w-28 md:h-14 md:w-32">
                <Image src={src} alt="" fill className="object-contain opacity-90" sizes="128px" />
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
