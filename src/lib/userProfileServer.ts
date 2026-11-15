import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { UserProfileDTO } from '@/types';

/**
 * Service-JWT profile lookups that do not depend on a Clerk session
 * (Stripe webhook, membership/manage). Profile pages use
 * `fetchUserProfileServer` from `@/app/profile/ApiServerActions` (4-step fallback).
 */

/** Direct backend lookup by Clerk user id (used by the Stripe webhook). */
export async function fetchUserProfileServer(userId: string): Promise<UserProfileDTO | null> {
  if (!userId) {
    return null;
  }
  const tenantId = getTenantId();
  const url = `${getApiBaseUrl()}/api/user-profiles/by-user/${userId}?tenantId.equals=${tenantId}`;
  try {
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch user profile for userId ${userId}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching user profile for userId ${userId}:`, error);
    return null;
  }
}

/** Criteria lookup by userId + tenantId (tenant-scoped, consistent response shape). */
export async function fetchAdminProfileServer(userId: string): Promise<UserProfileDTO | null> {
  if (!userId) return null;
  try {
    const params = new URLSearchParams();
    params.append('userId.equals', userId);
    params.append('tenantId.equals', getTenantId());
    params.append('size', '1');
    const url = `${getApiBaseUrl()}/api/user-profiles?${params.toString()}`;

    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0] as UserProfileDTO;
    if (data && typeof data === 'object') return data as UserProfileDTO;
    return null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}
