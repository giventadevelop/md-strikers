import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  fcUnitedAboutNamslUrl,
  fcUnitedAboutP1,
  fcUnitedAboutP2BeforeNamslLink,
  fcUnitedAboutP3,
  fcUnitedAboutTitle,
  mdStrikersBecomeASponsorBody,
  mdStrikersBecomeASponsorHeading,
  mdStrikersHistoryBody,
  mdStrikersHistoryHeading,
  mdStrikersIndexTagline,
  mdStrikersLearnMoreHeading,
  mdStrikersNewsHeading,
  mdStrikersNewsParagraphs,
  mdStrikersSupportersHeading,
  mdStrikersSupportersParagraphs,
  mdStrikersThankYouSponsorsLine,
  mdStrikersWhatWeDoBody,
  mdStrikersWhatWeDoHeading,
} from './fcUnitedAboutContent';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcMemorableMomentsSection } from './FcMemorableMomentsSection';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

/** Same logo asset as `FcUnitedHeader` — shown large above the index tagline on About. */
const MD_STRIKERS_LOGO_ABOUT =
  '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

/** Same order as index.html tabs; anchor targets live in the “Learn more” section below the intro. */
const ABOUT_SUBNAV_ITEMS = [
  { id: 'what-we-do' as const, label: 'What we do' },
  { id: 'history' as const, label: 'History' },
  { id: 'news' as const, label: 'News' },
  { id: 'supporters' as const, label: 'Supporters' },
  { id: 'sponsors' as const, label: 'Sponsors' },
] as const;

function AboutPageSubnav() {
  return (
    <nav
      className="border-b border-[#e3e3e3] bg-white"
      aria-label="Jump to section on this page"
    >
      <Shell className="py-3 md:py-4">
        <ul className="flex flex-wrap items-center justify-center gap-2 md:justify-start md:gap-3">
          {ABOUT_SUBNAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  fcPoppins.className,
                  'inline-block rounded-[3px] px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#f5b514] transition-colors hover:bg-[#0a1628] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b514] md:text-sm',
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Shell>
    </nav>
  );
}

export default function FcUnitedAboutPage() {
  return (
    <div
      className={cn(
        fcPoppins.className,
        'flex min-h-screen flex-col bg-[#f4f4f4] text-[#797e87] antialiased',
      )}
    >
      <FcUnitedHeader active="about" />
      <main className="flex min-w-0 flex-1 flex-col">
        <FcUnitedInnerHero title="About" />

        <AboutPageSubnav />

        <section id="about-intro" className="scroll-mt-24 bg-white py-12 md:py-16">
          <Shell>
            <div className="mx-auto max-w-4xl rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4] p-6 md:p-10">
              <h2 className={cn(fcBebas.className, 'text-3xl tracking-wide text-[#262f3e] md:text-4xl')}>
                {fcUnitedAboutTitle}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#797e87] md:text-base">
                <p>{fcUnitedAboutP1}</p>
                <p>
                  {fcUnitedAboutP2BeforeNamslLink}{' '}
                  <a
                    href={fcUnitedAboutNamslUrl}
                    className="font-medium text-[#ff0000] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    namsl.com
                  </a>
                  .
                </p>
                <p>{fcUnitedAboutP3}</p>
              </div>
            </div>
          </Shell>
        </section>

        {/* Content from https://www.mdstrikers.com/index.html — integrated below existing about copy */}
        <section className="border-t border-[#e3e3e3] bg-[#f4f4f4] py-12 md:py-16">
          <Shell>
            <div className="mx-auto max-w-4xl space-y-10">
              <div className="flex justify-center px-2">
                <Image
                  src={MD_STRIKERS_LOGO_ABOUT}
                  alt="Maryland Strikers Sports Club logo"
                  width={960}
                  height={960}
                  className="h-auto w-full max-w-[min(100%,720px)] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
                  sizes="(max-width: 768px) min(100vw - 2rem, 720px), 720px"
                  priority
                />
              </div>
              <p
                className={cn(
                  fcBebas.className,
                  'text-center text-2xl leading-snug tracking-wide text-[#262f3e] md:text-3xl',
                )}
              >
                {mdStrikersIndexTagline}
              </p>

              <div>
                <h2
                  className={cn(
                    fcBebas.className,
                    'mb-8 text-center text-3xl uppercase tracking-[0.12em] text-[#262f3e] md:text-4xl',
                  )}
                >
                  {mdStrikersLearnMoreHeading}
                </h2>

                <div className="space-y-10 rounded-[3px] border border-[#e3e3e3] bg-white p-6 md:p-10">
                  <div id="what-we-do" className="scroll-mt-28">
                    <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                      {mdStrikersWhatWeDoHeading}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#797e87] md:text-base">{mdStrikersWhatWeDoBody}</p>
                  </div>

                  <div id="history" className="scroll-mt-28">
                    <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                      {mdStrikersHistoryHeading}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#797e87] md:text-base">{mdStrikersHistoryBody}</p>
                  </div>

                  <div id="news" className="scroll-mt-28">
                    <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                      {mdStrikersNewsHeading}
                    </h3>
                    <div className="mt-3 space-y-4 text-sm leading-relaxed text-[#797e87] md:text-base">
                      {mdStrikersNewsParagraphs.map((p, i) => (
                        <p key={`news-${i}`}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div id="supporters" className="scroll-mt-28">
                    <h3 className={cn(fcBebas.className, 'text-xl tracking-wide text-[#262f3e] md:text-2xl')}>
                      {mdStrikersSupportersHeading}
                    </h3>
                    <div className="mt-3 space-y-4 text-sm leading-relaxed text-[#797e87] md:text-base">
                      {mdStrikersSupportersParagraphs.map((p, i) => (
                        <p key={`supporters-${i}`}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div id="sponsors" className="scroll-mt-28 border-t border-[#e3e3e3] pt-10">
                    <p className="text-sm font-semibold text-[#262f3e] md:text-base">{mdStrikersThankYouSponsorsLine}</p>
                    <h4 className={cn(fcBebas.className, 'mt-6 text-lg tracking-wide text-[#262f3e] md:text-xl')}>
                      {mdStrikersBecomeASponsorHeading}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#797e87] md:text-base">{mdStrikersBecomeASponsorBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </Shell>
        </section>

        <FcMemorableMomentsSection />
      </main>

      <FcUnitedFooter />
    </div>
  );
}
