import { getClientTenantId } from '@/lib/env';

/** BroadcastChannel name for admin “refresh homepage cache” actions */
export const HOMEPAGE_CACHE_INVALIDATE_CHANNEL = 'mcefee_homepage_cache_invalidate';

function tenantSegment(): string {
  return getClientTenantId() || 'no_tenant';
}

/**
 * SessionStorage key for homepage-related caches, scoped by tenant (and optional version).
 */
export function getHomepageCacheKey(suffix: string, version?: number): string {
  const tid = tenantSegment();
  const base = `hp_${tid}_${suffix}`;
  return version != null ? `${base}__v${version}` : base;
}

/** Clears all homepage cache entries for the current tenant from sessionStorage. */
export function clearHomepageCaches(): void {
  if (typeof sessionStorage === 'undefined') return;
  const prefix = `hp_${tenantSegment()}_`;
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}
