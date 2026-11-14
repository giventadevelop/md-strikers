/**
 * Shared Publisher ID registered with giventa.com (Google AdSense owner account).
 * Use on this site when it monetizes with that owner account.
 */
export const GIVENTA_SHARED_ADSENSE_PUBLISHER_ID = 'ca-pub-1016198353275904';

/** Numeric form for ads.txt (no `ca-` prefix). */
export const GIVENTA_SHARED_ADSENSE_PUBLISHER_ID_NUMERIC = 'pub-1016198353275904';

/** ads.txt line for the shared owner account. */
export const GIVENTA_SHARED_ADSENSE_ADS_TXT_LINE = `google.com, ${GIVENTA_SHARED_ADSENSE_PUBLISHER_ID_NUMERIC}, DIRECT, f08c47fec0942fa0`;

/**
 * Publisher ID for the ownership meta tag and head script.
 * Override with NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID when this site uses another account.
 */
export function getSharedAdsensePublisherIdForMeta(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID ||
    process.env.AMPLIFY_NEXT_PUBLIC_GOOGLE_ADSENSE_SHARED_PUBLISHER_ID ||
    GIVENTA_SHARED_ADSENSE_PUBLISHER_ID
  );
}
