import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl, getTenantId } from '@/lib/env';

/** True until tenant settings explicitly turn news advertisements off. */
export async function newsAdvertisementsEnabled(): Promise<boolean> {
  const base = getApiBaseUrl();
  const tenantId = getTenantId();
  if (!base || !tenantId) return true;
  const response = await fetchWithJwtRetry(
    `${base}/api/tenant-settings?tenantId.equals=${encodeURIComponent(tenantId)}&size=1`,
    { cache: 'no-store' }
  );
  if (!response.ok) return true;
  const data = await response.json();
  const row = Array.isArray(data) ? data[0] : data?.content?.[0] ?? data;
  return row?.showNewsAdvertisements !== false;
}
