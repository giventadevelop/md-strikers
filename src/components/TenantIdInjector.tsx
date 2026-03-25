'use client';

import { useEffect } from 'react';
import { getClientTenantId } from '@/lib/env';

/**
 * Exposes current tenant id on `<html data-tenant-id="...">` for debugging and selectors.
 */
export default function TenantIdInjector() {
  useEffect(() => {
    const tid = getClientTenantId();
    if (!tid) return;
    document.documentElement.setAttribute('data-tenant-id', tid);
  }, []);
  return null;
}
