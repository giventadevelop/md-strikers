import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import Image from 'next/image';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedContactsPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="contacts" />
      <FcUnitedInnerHero title="Contacts" />

      <section className="bg-white">
        <div className="relative h-[min(60vh,604px)] w-full overflow-hidden bg-[#e3e3e3]">
          <iframe
            title="Map"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=12&q=220+Gardner+Ave+Brooklyn%2C+NY+11211"
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

            <form className="mx-auto mt-10 max-w-2xl space-y-4 text-left">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  placeholder="name *"
                  required
                  className="rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="email *"
                  required
                  className="rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
                />
              </div>
              <textarea
                name="message"
                placeholder="message *"
                rows={6}
                required
                className="w-full rounded-[3px] border border-[#e3e3e3] bg-[#fafafa] px-4 py-3 text-sm text-[#262f3e] placeholder:text-[#797e87]"
              />
              <label className="flex items-start gap-2 text-sm text-[#797e87]">
                <input type="checkbox" required className="mt-1" />
                <span>I agree that my submitted data is being collected and stored (required).</span>
              </label>
              <div className="text-center">
                <button
                  type="submit"
                  className="rounded-[32px] bg-[#ff0000] px-8 py-3 text-sm font-semibold text-white transition-[filter] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0000]"
                >
                  Send Your Message
                </button>
              </div>
            </form>
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
