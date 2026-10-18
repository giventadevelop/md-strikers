import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';
import type { HomepageSponsor } from './ApiServerActions';

export default function FcUnitedSponsorsPage({ sponsors }: { sponsors: HomepageSponsor[] }) {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="sponsors" />
      <FcUnitedInnerHero title="Sponsors" subtitle="Businesses that support the club and its programs." />

      <section className="bg-[#f4f4f4] py-14 md:py-20">
        <div className="mx-auto flex w-full max-w-[1308px] flex-col gap-5 px-4 md:px-7 lg:px-12">
          {sponsors.length === 0 ? (
            <p className="text-center text-sm text-[#797e87]">No sponsors are published yet.</p>
          ) : (
            sponsors.map((sponsor) => (
              <article
                key={sponsor.id ?? sponsor.name}
                className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white"
              >
                <div className="relative w-full border-b border-[#e3e3e3]">
                  <Image
                    src={sponsor.imageUrl}
                    alt={sponsor.name}
                    width={1600}
                    height={600}
                    className="h-auto w-full object-contain"
                    sizes="100vw"
                  />
                </div>
                <div className="px-5 py-5 md:px-6 md:py-6">
                  {sponsor.type ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">{sponsor.type}</p>
                  ) : null}
                  <h2 className={cn(fcBebas.className, 'mt-1 text-3xl tracking-[0.02em] text-[#262f3e] md:text-4xl')}>
                    {sponsor.name}
                  </h2>
                  {sponsor.tagline ? (
                    <p className="mt-2 text-sm leading-relaxed text-[#797e87] md:text-[15px]">{sponsor.tagline}</p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {sponsor.id != null ? (
                      <Link
                        href={`/sponsors/${sponsor.id}`}
                        className="inline-flex items-center justify-center rounded-[32px] bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white"
                      >
                        Sponsor details
                      </Link>
                    ) : null}
                    {sponsor.websiteHref ? (
                      <a
                        href={sponsor.websiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-[32px] border border-[#e3e3e3] px-6 py-2.5 text-sm font-semibold text-[#262f3e]"
                      >
                        Visit website
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      <FcUnitedFooter />
    </div>
  );
}
