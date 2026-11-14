'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import {
  ADSENSE_CONSENT_EVENT,
  ADSENSE_CONSENT_OPEN_EVENT,
  readAdsenseConsent,
  requestAdsenseConsentPrompt,
  writeAdsenseConsent,
  type AdsenseConsentChoice,
} from '@/lib/adsense/adsenseConsent';

interface AdSenseConsentBannerProps {
  variant?: 'banner' | 'settings-link';
  linkClassName?: string;
}

export default function AdSenseConsentBanner({ variant = 'banner', linkClassName }: AdSenseConsentBannerProps) {
  const pathname = usePathname();
  const { showGoogleAdsense } = useTenantSettings();
  const [choice, setChoice] = useState<AdsenseConsentChoice | null | undefined>(undefined);
  const [forcedOpen, setForcedOpen] = useState(false);

  useEffect(() => {
    const sync = () => setChoice(readAdsenseConsent());
    const open = () => setForcedOpen(true);
    sync();
    window.addEventListener(ADSENSE_CONSENT_EVENT, sync);
    window.addEventListener(ADSENSE_CONSENT_OPEN_EVENT, open);
    return () => {
      window.removeEventListener(ADSENSE_CONSENT_EVENT, sync);
      window.removeEventListener(ADSENSE_CONSENT_OPEN_EVENT, open);
    };
  }, []);

  const adsEnabled = showGoogleAdsense && !pathname?.startsWith('/admin');
  if (!adsEnabled) {
    return null;
  }

  if (variant === 'settings-link') {
    return (
      <button
        type="button"
        onClick={() => requestAdsenseConsentPrompt()}
        className={linkClassName || 'text-sm underline-offset-2 hover:underline'}
      >
        Cookie settings
      </button>
    );
  }

  const open = choice === null || forcedOpen;
  if (choice === undefined || !open) {
    return null;
  }

  const choose = (next: AdsenseConsentChoice) => {
    writeAdsenseConsent(next);
    setForcedOpen(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-pitch-chalk/15 bg-pitch-charcoal text-pitch-stone shadow-2xl"
      role="dialog"
      aria-labelledby="adsense-consent-title"
      aria-describedby="adsense-consent-body"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <p id="adsense-consent-title" className="text-sm font-semibold text-pitch-chalk">
            Cookies and advertising
          </p>
          <p id="adsense-consent-body" className="mt-1 text-sm leading-relaxed">
            Maryland Strikers Sports Club uses Google AdSense. The site verification script is in the page.
            Ad units and their cookies load only if you accept. Read the{' '}
            <Link href="/privacy" className="text-pitch-lime underline-offset-2 hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-pitch-lime underline-offset-2 hover:underline">
              Terms and Conditions
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="rounded-lg border border-pitch-chalk/30 px-4 py-2 text-sm font-semibold text-pitch-chalk hover:bg-white/10"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="rounded-lg bg-pitch-lime px-4 py-2 text-sm font-semibold text-pitch-charcoal hover:brightness-110"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
