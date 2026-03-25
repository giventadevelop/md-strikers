'use client';

import { useEffect } from 'react';

/**
 * Removes `__clerk_synced` from the URL after Clerk satellite sync and flags a one-time
 * client re-check (see Header admin status + sessionStorage `clerk_satellite_synced`).
 */
export default function ClerkSyncUrlCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('__clerk_synced')) return;
    try {
      sessionStorage.setItem('clerk_satellite_synced', '1');
    } catch {
      /* ignore */
    }
    url.searchParams.delete('__clerk_synced');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next);
  }, []);
  return null;
}
