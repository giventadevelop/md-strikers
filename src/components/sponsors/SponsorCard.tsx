import Image from "next/image";
import Link from "next/link";
import type { EventSponsorsDTO } from "@/types";
import { useState } from "react";

// Component to handle image loading errors and hide container when image fails
function ImageWithErrorHandling({
  src,
  alt,
  sponsorType,
}: {
  src: string;
  alt: string;
  sponsorType?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render if image fails to load
  if (imageError || !src) {
    return sponsorType ? (
      <div className="relative w-full pt-3 pr-3">
        <div className="flex justify-end">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {sponsorType}
          </span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        style={{
          backgroundColor: "transparent",
          borderRadius: "1rem 1rem 0 0",
        }}
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
      {sponsorType && imageLoaded && !imageError && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {sponsorType}
          </span>
        </div>
      )}
    </div>
  );
}

interface SponsorCardProps {
  sponsor: EventSponsorsDTO;
  backgroundClass: string;
  onCardClick?: () => void;
  className?: string;
  shadowStyle?: string;
}

const defaultShadow =
  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)";

export function SponsorCard({
  sponsor,
  backgroundClass,
  onCardClick,
  className = "",
  shadowStyle = defaultShadow,
}: SponsorCardProps) {
  const combinedClasses = [
    backgroundClass,
    "rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
    onCardClick ? "cursor-pointer" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={combinedClasses}
        style={{
          boxShadow: shadowStyle,
        }}
        onClick={onCardClick}
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onKeyDown={
          onCardClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCardClick();
                }
              }
            : undefined
        }
      >
        <div className="flex flex-col h-full">
          {sponsor.bannerImageUrl && (
            <ImageWithErrorHandling
              src={sponsor.bannerImageUrl}
              alt={sponsor.name}
              sponsorType={sponsor.type}
            />
          )}
          {!sponsor.bannerImageUrl && sponsor.type && (
            <div className="relative w-full pt-3 pr-3">
              <div className="flex justify-end">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {sponsor.type}
                </span>
              </div>
            </div>
          )}

          <div className={`flex-1 flex flex-col ${sponsor.bannerImageUrl ? 'border-t border-white/20' : ''}`}>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {sponsor.name}
              </h2>

              {sponsor.companyName && (
                <p className="text-gray-600 text-base mb-2">
                  {sponsor.companyName}
                </p>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-white/20 flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 lg:justify-items-center">
                {sponsor.companyName && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.companyName}
                    </span>
                  </div>
                )}

                {sponsor.type && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">{sponsor.type}</span>
                  </div>
                )}

                {sponsor.contactEmail && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactEmail}
                    </span>
                  </div>
                )}

                {sponsor.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactPhone}
                    </span>
                  </div>
                )}

                {sponsor.websiteUrl?.trim() && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-teal-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.websiteUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>

              {/* Social media links - only show icons when URL is non-null and non-empty */}
              {(sponsor.facebookUrl?.trim() || sponsor.instagramUrl?.trim() || sponsor.twitterUrl?.trim() || sponsor.linkedinUrl?.trim() || sponsor.youtubeUrl?.trim() || sponsor.tiktokUrl?.trim()) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/20">
                  {sponsor.facebookUrl?.trim() && (
                    <a href={sponsor.facebookUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-200" title="Facebook" aria-label="Facebook">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {sponsor.instagramUrl?.trim() && (
                    <a href={sponsor.instagramUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-all duration-200" title="Instagram" aria-label="Instagram">
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
                    </a>
                  )}
                  {sponsor.twitterUrl?.trim() && (
                    <a href={sponsor.twitterUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-all duration-200" title="X (Twitter)" aria-label="X (Twitter)">
                      <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {sponsor.linkedinUrl?.trim() && (
                    <a href={sponsor.linkedinUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-200" title="LinkedIn" aria-label="LinkedIn">
                      <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {sponsor.youtubeUrl?.trim() && (
                    <a href={sponsor.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200" title="YouTube" aria-label="YouTube">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {sponsor.tiktokUrl?.trim() && (
                    <a href={sponsor.tiktokUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200" title="TikTok" aria-label="TikTok">
                      <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </a>
                  )}
                </div>
              )}

              {(sponsor.tagline || sponsor.id) && (
                <div className="mt-auto space-y-4 pt-4">
                  {sponsor.tagline && (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_12px_30px_-15px_rgba(146,118,65,0.4)] px-4 py-3 text-center">
                      <p className="relative z-10 text-sm font-medium text-amber-800 italic leading-relaxed line-clamp-2">
                        {sponsor.tagline}
                      </p>
                    </div>
                  )}

                  {typeof sponsor.id !== "undefined" && (
                    <div className="flex justify-end">
                      <Link
                        href={`/sponsors/${sponsor.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title={`View sponsor details for ${sponsor.name}`}
                        aria-label={`View sponsor details for ${sponsor.name}`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-green-700">View Sponsor Details</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}


