import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FC_IMG, fcSponsors } from './fcUnitedConstants';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

const filters = ['All', 'articles', 'League', 'Soccer'];

const galleryItems = [
  {
    src: '/images/md_strikers_media/md_media/WhatsApp Image 2026-03-24 at 10.56.39 AM.jpeg',
    title: 'Capital Cup 2026',
    tag: 'articles',
  },
  { src: `${FC_IMG}/post-2-nfl-copyright.jpg`, title: 'American Football Tactics', tag: 'League' },
  { src: `${FC_IMG}/post-1-nfl-copyright.jpg`, title: 'Effective Training Programs', tag: 'League' },
  { src: `${FC_IMG}/post-7-nfl-copyright.jpg`, title: 'Beginners Guide', tag: 'Soccer' },
  { src: `${FC_IMG}/post-6-nfl-copyright.jpg`, title: 'Most Beautiful Stadiums', tag: 'articles' },
  { src: `${FC_IMG}/post-5-nfl-copyright.jpg`, title: 'Players Who Changed Their Game', tag: 'League' },
  { src: `${FC_IMG}/post-4-nfl-copyright.jpg`, title: 'Best Moments 2018', tag: 'Soccer' },
  { src: `${FC_IMG}/post-6-copyright.jpg`, title: '2018 League Report and Highlights', tag: 'articles' },
  { src: `${FC_IMG}/post-5-copyright.jpg`, title: 'World Cup Expectations', tag: 'Soccer' },
  { src: `${FC_IMG}/post-3-copyright.jpg`, title: 'The Game that Knows No Limit', tag: 'League' },
  { src: `${FC_IMG}/post-11-copyright.jpg`, title: 'Female Players in Football', tag: 'articles' },
  { src: `${FC_IMG}/post-7-copyright.jpg`, title: 'Stunning Goals by Top Players', tag: 'Soccer' },
];

export default function FcUnitedGalleryPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader active="gallery" />
      <FcUnitedInnerHero title="Gallery" />

      <section className="bg-[#f4f4f4] py-12 md:py-16">
        <Shell>
          <div className="mb-8 flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                disabled
                className={cn(
                  'rounded-[32px] border px-4 py-2 text-sm font-medium',
                  index === 0
                    ? 'border-[#ff0000] bg-[#ff0000] text-white'
                    : 'border-[#e3e3e3] bg-white text-[#262f3e] opacity-70',
                )}
                title="Static demo"
              >
                {index === 0 ? 'Filter - All' : filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#081224]">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-contain object-center p-2 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width:1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081224]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-[#797e87]">{item.tag}</p>
                  <h3 className={cn(fcBebas.className, 'mt-1 text-xl leading-tight text-[#262f3e]')}>{item.title}</h3>
                </div>
              </article>
            ))}
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