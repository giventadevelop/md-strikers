'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdsenseRegionId } from '@/lib/adsense/parseAdsensePlacements';
import { ADSENSE_CONSENT_EVENT, readAdsenseConsent } from '@/lib/adsense/adsenseConsent';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface GoogleAdSenseSlotProps {
  publisherId: string;
  slotId: string;
  region: AdsenseRegionId;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  minHeight?: number;
}

/** Ad unit only. The ownership script stays in the layout head. */
export default function GoogleAdSenseSlot({
  publisherId,
  slotId,
  region,
  format = 'auto',
  className = '',
  minHeight = 90,
}: GoogleAdSenseSlotProps) {
  const pushedRef = useRef(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const sync = () => setConsentAccepted(readAdsenseConsent() === 'accepted');
    sync();
    window.addEventListener(ADSENSE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(ADSENSE_CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!consentAccepted || pushedRef.current || !publisherId || !slotId) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.warn('[GoogleAdSenseSlot] Failed to initialize ad region:', region, error);
    }
  }, [consentAccepted, publisherId, slotId, region]);

  if (!consentAccepted || !publisherId?.trim() || !slotId?.trim()) {
    return null;
  }

  return (
    <div
      className={`google-adsense-region google-adsense-region--${region} ${className}`.trim()}
      data-ad-region={region}
      style={{ minHeight }}
      aria-hidden="true"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
