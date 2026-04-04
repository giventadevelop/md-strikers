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
const CONTACT_MAP_QUERY = '13881 Hopkins Rd, Germantown, MD 20874';

const CONTACT_MAP_EMBED_SRC = `https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=16&q=${encodeURIComponent(CONTACT_MAP_QUERY)}`;

const DETAIL_CONTACT_EMAIL = 'mdstrikersinc@gmail.com';

const detailContacts = [
  { name: 'Noble Joseph', tel: '+13013468631', displayPhone: '301 346 8631' },
  { name: 'Reji Thomas', tel: '+12405938510', displayPhone: '240 593 8510' },
] as const;

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
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-[#e3e3e3] bg-gradient-to-br from-[#f8f8f8] via-white to-[#f4f4f4] p-6 shadow-sm md:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage: 'radial-gradient(circle at top left, rgba(227, 24, 55, 0.08), transparent 55%)',
                }}
              />
              <div className="relative">
                <p
                  className={cn(
                    fcBebas.className,
                    'text-center text-2xl uppercase tracking-[0.14em] text-[#262f3e] md:text-3xl',
                  )}
                >
                  For details contact
                </p>
                <div className="mt-8 grid gap-6 sm:gap-8">
                  {detailContacts.map((c) => (
                    <div
                      key={c.name}
                      className="flex flex-col gap-4 rounded-xl border border-[#e3e3e3]/80 bg-white/90 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <svg
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>
                        <span className={cn(fcBebas.className, 'text-lg tracking-wide text-[#262f3e] md:text-xl')}>
                          {c.name}
                        </span>
                      </div>
                      <a
                        href={`tel:${c.tel}`}
                        className="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg bg-green-50 px-4 py-2.5 text-[#262f3e] transition-colors duration-200 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none sm:self-center"
                        title={`Call ${c.name}`}
                      >
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </span>
                        <span className="text-base font-semibold tabular-nums tracking-wide">{c.displayPhone}</span>
                      </a>
                    </div>
                  ))}
                </div>
                <a
                  href={`mailto:${DETAIL_CONTACT_EMAIL}`}
                  className="relative mt-8 flex cursor-pointer flex-wrap items-center justify-center gap-3 rounded-xl border border-[#e3e3e3] bg-white px-4 py-4 text-center transition-colors duration-200 hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e31837] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f8] motion-reduce:transition-none sm:gap-4"
                  title="Email Maryland Strikers"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg
                      className="h-6 w-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <span className="text-left text-sm md:text-base">
                    <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#797e87]">Email</span>
                    <span className="mt-0.5 block font-medium text-[#ff0000] hover:underline">{DETAIL_CONTACT_EMAIL}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 md:mt-16">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className={cn(fcBebas.className, 'text-xl text-[#262f3e]')}>Address</h3>
              <p className="mt-3 text-sm leading-relaxed">
                13881 Hopkins Rd
                <br />
                Germantown, MD 20874
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
