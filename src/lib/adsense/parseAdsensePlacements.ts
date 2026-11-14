export type AdsenseRegionId =
  | 'sidebar'
  | 'between_sections'
  | 'footer_strip'
  | 'article_inline';

export type AdsensePlacementsMap = Partial<Record<AdsenseRegionId, string>>;

/** Parse tenant_settings.googleAdsensePlacementsJson into region → slot id map. */
export function parseAdsensePlacements(json: string | null | undefined): AdsensePlacementsMap {
  if (!json?.trim()) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: AdsensePlacementsMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
        result[key as AdsenseRegionId] = value.trim();
      }
    }
    return result;
  } catch {
    return {};
  }
}
