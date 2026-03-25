'use client';

import Image from 'next/image';
import type { EventSponsorsDTO } from '@/types';

export type SponsorCardProps = {
  sponsor: EventSponsorsDTO;
  backgroundClass: string;
  onCardClick?: () => void;
};

export function SponsorCard({ sponsor, backgroundClass, onCardClick }: SponsorCardProps) {
  const title = sponsor.companyName?.trim() || sponsor.name;
  const banner = sponsor.bannerImageUrl?.trim();
  const logo = sponsor.logoUrl?.trim();

  return (
    <div
      className={`${backgroundClass} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (!onCardClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick();
        }
      }}
    >
      <div className="flex flex-col h-full">
        {banner ? (
          <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-white/50">
            <Image
              src={banner}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        ) : null}

        <div className="p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {logo ? (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white shadow-md border border-gray-100">
              <Image src={logo} alt={`${title} logo`} fill className="object-contain p-2" sizes="96px" />
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            {sponsor.tagline ? (
              <p className="text-sm font-medium text-indigo-700 mb-2">{sponsor.tagline}</p>
            ) : null}
            {sponsor.description ? (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{sponsor.description}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
