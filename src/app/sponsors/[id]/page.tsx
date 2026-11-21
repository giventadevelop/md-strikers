"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { EventSponsorsDTO, EventMediaDTO } from "@/types";
import { Camera, Video, Eye } from 'lucide-react';
import styles from '../../events/[id]/GalleryThumbnails.module.css';
import { EventMediaSlideshow } from '@/app/gallery/components/EventMediaSlideshow';
import { FcUnitedFooter } from '@/components/fc-united/FcUnitedFooter';
import { FcUnitedHeader } from '@/components/fc-united/FcUnitedHeader';
import { fcPublicShell } from '@/components/fc-united/fcUnitedFonts';

function SponsorDetailChrome({ children }: { children: ReactNode }) {
  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="sponsors" />
      {children}
      <FcUnitedFooter />
    </div>
  );
}

// Array of modern background colors for sponsor cards
const cardBackgrounds = [
  'bg-gradient-to-br from-blue-50 to-blue-100',
  'bg-gradient-to-br from-green-50 to-green-100',
  'bg-gradient-to-br from-purple-50 to-purple-100',
  'bg-gradient-to-br from-pink-50 to-pink-100',
  'bg-gradient-to-br from-yellow-50 to-yellow-100',
  'bg-gradient-to-br from-indigo-50 to-indigo-100',
  'bg-gradient-to-br from-teal-50 to-teal-100',
  'bg-gradient-to-br from-orange-50 to-orange-100',
  'bg-gradient-to-br from-cyan-50 to-cyan-100',
  'bg-gradient-to-br from-rose-50 to-rose-100'
];

// Function to get random background color for each sponsor
const getSponsorBackground = (sponsorId: number) => {
  return cardBackgrounds[sponsorId % cardBackgrounds.length];
};

function externalHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function SponsorLinkButtons({ sponsor }: { sponsor: EventSponsorsDTO }) {
  const links: { label: string; href: string; className: string; icon: ReactNode }[] = [];
  if (sponsor.contactEmail?.trim()) {
    links.push({
      label: 'Email',
      href: `mailto:${sponsor.contactEmail.trim()}`,
      className: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    });
  }
  if (sponsor.contactPhone?.trim()) {
    links.push({
      label: 'Call',
      href: `tel:${sponsor.contactPhone.trim()}`,
      className: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    });
  }
  if (sponsor.websiteUrl?.trim()) {
    links.push({
      label: 'Website',
      href: externalHref(sponsor.websiteUrl),
      className: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9" />
        </svg>
      ),
    });
  }
  const socials: { label: string; url?: string | null; className: string; path: string }[] = [
    { label: 'Facebook', url: sponsor.facebookUrl, className: 'bg-blue-100 text-blue-600 hover:bg-blue-200', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { label: 'Instagram', url: sponsor.instagramUrl, className: 'bg-pink-100 text-pink-600 hover:bg-pink-200', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { label: 'X', url: sponsor.twitterUrl, className: 'bg-slate-100 text-slate-700 hover:bg-slate-200', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { label: 'LinkedIn', url: sponsor.linkedinUrl, className: 'bg-sky-100 text-sky-700 hover:bg-sky-200', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { label: 'YouTube', url: sponsor.youtubeUrl, className: 'bg-red-100 text-red-600 hover:bg-red-200', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { label: 'TikTok', url: sponsor.tiktokUrl, className: 'bg-gray-100 text-gray-700 hover:bg-gray-200', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  ];
  for (const social of socials) {
    const url = social.url?.trim();
    if (!url) continue;
    links.push({
      label: social.label,
      href: externalHref(url),
      className: social.className,
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d={social.path} /></svg>,
    });
  }
  if (links.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2" aria-label="Sponsor links">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith('http') ? '_blank' : undefined}
          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          title={link.label}
          aria-label={link.label}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${link.className}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

// Helper functions for media type display
const getMediaTypeIcon = (mediaType: string) => {
  if (mediaType.startsWith('video/')) {
    return <Video className="w-4 h-4" />;
  }
  return <Camera className="w-4 h-4" />;
};

const getMediaTypeColor = (mediaType: string) => {
  if (mediaType.startsWith('video/')) {
    return 'text-red-600 bg-red-100';
  }
  return 'text-blue-600 bg-blue-100';
};

export default function SponsorDetailsPage() {
  const params = useParams();
  const sponsorId = params?.id;
  const [sponsor, setSponsor] = useState<EventSponsorsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowInitialIndex, setSlideshowInitialIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [heroImageError, setHeroImageError] = useState(false);

  useEffect(() => {
    async function fetchSponsorDetails() {
      if (!sponsorId) return;
      setLoading(true);
      try {
        // Fetch sponsor details
        const sponsorRes = await fetch(`/api/proxy/event-sponsors/${sponsorId}`);
        if (!sponsorRes.ok) {
          throw new Error('Failed to fetch sponsor');
        }
        const sponsorData: EventSponsorsDTO = await sponsorRes.json();
        setSponsor(sponsorData);

        // Fetch sponsor media
        const mediaRes = await fetch(`/api/proxy/event-medias?sponsorId.equals=${sponsorId}&sort=priorityRanking,asc`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          // Handle paginated response (Spring Data REST format)
          if (mediaData && typeof mediaData === 'object' && '_embedded' in mediaData && 'eventMedias' in mediaData._embedded) {
            setMedia(Array.isArray(mediaData._embedded.eventMedias) ? mediaData._embedded.eventMedias : []);
          } else {
            // Handle direct array response
            setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);
          }
        } else {
          setMedia([]);
        }
      } catch (err) {
        console.error('Error fetching sponsor details:', err);
        setSponsor(null);
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSponsorDetails();
  }, [sponsorId]);

  if (loading) {
    return (
      <SponsorDetailChrome>
        <div className="p-8 text-center">Loading sponsor details...</div>
      </SponsorDetailChrome>
    );
  }
  if (!sponsor) {
    return (
      <SponsorDetailChrome>
        <div className="p-8 text-center text-red-500">Sponsor not found.</div>
      </SponsorDetailChrome>
    );
  }

  // Banner (hero): use SPONSOR_BANNER media with lowest priority (media already sorted by priorityRanking,asc)
  const primaryBannerMedia = media.find((m) => m.fileUrl && (m.eventMediaType === 'SPONSOR_BANNER'));
  const bannerDisplayUrl = primaryBannerMedia?.fileUrl || sponsor.bannerImageUrl || undefined;

  // Gallery: all media with fileUrl, excluding the primary banner so it does not duplicate in the grid
  const gallery = media.filter((m) => m.fileUrl && (primaryBannerMedia ? m.id !== primaryBannerMedia.id : true));

  // Get preview images (first 12 media items for grid display)
  const previewMedia = gallery.slice(0, 12);
  const remainingCount = Math.max(0, gallery.length - 12);

  return (
    <SponsorDetailChrome>
    <div>
      {/* Hero Section - Full width banner image */}
      <section className="relative w-full bg-transparent">
        <div className="w-full relative min-h-[200px]">
          {/* Main hero image container */}
          {bannerDisplayUrl && !heroImageError ? (
            <div className="relative w-full flex items-center justify-center min-h-[200px]" style={{ maxWidth: '100%' }}>
              {/* Blurred background image */}
              <div className="absolute inset-0 w-full h-full min-h-[200px]" style={{ zIndex: 0 }}>
                <Image
                  src={bannerDisplayUrl}
                  alt="Sponsor banner background"
                  fill
                  className="object-cover w-full h-full blur-lg scale-105"
                  style={{
                    filter: 'blur(24px) brightness(1.1)',
                    objectPosition: 'center',
                  }}
                  aria-hidden="true"
                  priority
                  onError={() => setHeroImageError(true)}
                />
              </div>

              {/* Main hero image */}
              <div className="relative w-full flex items-center justify-center min-h-[200px]" style={{ zIndex: 1, maxWidth: '100%' }}>
                <Image
                  src={bannerDisplayUrl}
                  alt={`${sponsor.name} Banner`}
                  width={1920}
                  height={1900}
                  className="w-full h-auto min-h-[200px]"
                  style={{
                    maxHeight: '1900px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                  priority
                  onError={() => setHeroImageError(true)}
                />
              </div>

              {/* Fade overlays */}
              <div className="pointer-events-none absolute left-0 top-0 w-full h-16" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
              <div className="pointer-events-none absolute left-0 bottom-0 w-full h-16" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)', zIndex: 20 }} />
            </div>
          ) : (
            <div className="w-full min-h-[200px] h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">{sponsor.name}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sponsor Details - Styled like event details page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 sponsor-details-container">
        <div
          className={`sponsor-card ${getSponsorBackground(sponsor.id || 0)} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Content Section */}
            <div className="p-6 border-t border-white/20 relative">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                {sponsor.name}
              </h1>

              {/* Sponsor Type Badge */}
              {sponsor.type && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {sponsor.type}
                  </span>
                </div>
              )}

              {/* Sponsor Details - Centered flexbox layout */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 lg:max-w-4xl lg:mx-auto contact-info">
                {/* Company Name */}
                {sponsor.companyName && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px] contact">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.companyName}
                    </span>
                  </div>
                )}

                {/* Contact Email */}
                {sponsor.contactEmail && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a
                      href={`mailto:${sponsor.contactEmail}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.contactEmail}
                    </a>
                  </div>
                )}

                {/* Contact Phone */}
                {sponsor.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a
                      href={`tel:${sponsor.contactPhone}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.contactPhone}
                    </a>
                  </div>
                )}

                {/* Website */}
                {sponsor.websiteUrl && (
                  <div className="flex items-center gap-3 text-gray-700 w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                      </svg>
                    </div>
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              <SponsorLinkButtons sponsor={sponsor} />

              {/* Tagline */}
              {sponsor.tagline && (
                <div className="mb-8 lg:max-w-3xl lg:mx-auto px-3">
                  <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_18px_38px_-20px_rgba(146,118,65,0.45)] px-6 sm:px-10 py-8 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(130deg, rgba(255,255,255,0.75) 0%, rgba(255,248,235,0.35) 50%, rgba(214,173,96,0.2) 100%)'
                    }}/>
                    <p className="relative z-10 font-heading text-xl sm:text-2xl text-amber-800 italic leading-relaxed tracking-wide">
                      {sponsor.tagline}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {sponsor.description && sponsor.description.trim().length > 0 && (
                <div className="mb-10 lg:max-w-4xl lg:mx-auto px-3">
                  <div className="relative rounded-3xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-[0_22px_45px_-25px_rgba(15,23,42,0.35)] px-8 sm:px-12 py-10 text-center">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 40%, rgba(135,206,250,0.15) 100%)'
                    }}/>
                    <div className="relative z-10 text-left">
                      {sponsor.description.split(/\n{2,}|\r\n\r\n/).map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="font-heading text-[1.1rem] sm:text-[1.2rem] text-slate-700 leading-relaxed tracking-[0.01em] mb-4 last:mb-0"
                        >
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button - Visit Website */}
              {sponsor.websiteUrl && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Visit Website"
                    aria-label={`Visit ${sponsor.name} website`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <span className="font-semibold text-indigo-700">Visit Website</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Section - Styled like event details page */}
        {gallery.length > 0 && (
          <div className="mb-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sponsor Gallery</h2>
                <p className="text-lg text-gray-600">
                  {gallery.length} {gallery.length === 1 ? 'photo or video' : 'photos and videos'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSlideshowInitialIndex(0);
                  setShowSlideshow(true);
                }}
                className="flex items-center justify-center px-6 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl border-2 border-blue-400 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Gallery
              </button>
            </div>

            {/* Preview thumbnails grid */}
            {previewMedia.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className={styles.galleryThumbnailsGrid}>
                  {previewMedia.map((mediaItem) => (
                    <button
                      key={mediaItem.id}
                      onClick={() => {
                        const galleryIndex = gallery.findIndex(m => m.id === mediaItem.id);
                        if (galleryIndex !== -1) {
                          setSlideshowInitialIndex(galleryIndex);
                          setShowSlideshow(true);
                        }
                      }}
                      className={`${styles.galleryThumbnail} relative bg-gray-100 rounded overflow-hidden hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center`}
                    >
                      {mediaItem.fileUrl ? (
                        <Image
                          src={mediaItem.fileUrl}
                          alt={mediaItem.altText || mediaItem.title || 'Media'}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 220px, 220px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {getMediaTypeIcon(mediaItem.eventMediaType || '')}
                        </div>
                      )}

                      {/* Media type indicator */}
                      <div className={`absolute bottom-0 right-0 ${getMediaTypeColor(mediaItem.eventMediaType || '')} p-1 rounded-tl`}>
                        {getMediaTypeIcon(mediaItem.eventMediaType || '')}
                      </div>
                    </button>
                  ))}

                  {/* Show remaining count */}
                  {remainingCount > 0 && (
                    <button
                      onClick={() => {
                        setSlideshowInitialIndex(previewMedia.length);
                        setShowSlideshow(true);
                      }}
                      className={`${styles.galleryThumbnail} flex items-center justify-center bg-gray-100 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors`}
                    >
                      +{remainingCount} more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Slideshow Modal */}
        {showSlideshow && sponsor && (
          <EventMediaSlideshow
            event={{
              id: sponsor.id,
              title: sponsor.name || 'Sponsor',
              startDate: '',
              endDate: '',
              promotionStartDate: '',
              startTime: '',
              endTime: '',
              timezone: 'America/New_York',
              isFeaturedEvent: false,
              featuredEventPriorityRanking: 0,
              liveEventPriorityRanking: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            media={gallery}
            onClose={() => setShowSlideshow(false)}
            initialIndex={slideshowInitialIndex}
          />
        )}

        <div className="mt-8 text-center">
          <Link
            href="/sponsors"
            className="inline-flex flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="View All Sponsors"
            aria-label="View All Sponsors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">View All Sponsors</span>
          </Link>
        </div>
      </div>
    </div>
    </SponsorDetailChrome>
  );
}

