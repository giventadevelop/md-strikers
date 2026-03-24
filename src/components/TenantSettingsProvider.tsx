'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { TenantSettingsDTO } from '@/types';
import { getAppUrl } from '@/lib/env';
import { usePageReady } from '@/hooks/usePageReady';
import {
  getHomepageCacheKey,
  clearHomepageCaches,
  HOMEPAGE_CACHE_INVALIDATE_CHANNEL,
} from '@/lib/homepageCacheKeys';

interface TenantSettingsContextType {
  settings: TenantSettingsDTO | null;
  loading: boolean;
  showEventsSection: boolean;
  showTeamSection: boolean;
  showSponsorsSection: boolean;
}

const TenantSettingsContext = React.createContext<TenantSettingsContextType>({
  settings: null,
  loading: true,
  showEventsSection: true, // Default to true for backward compatibility
  showTeamSection: true,
  showSponsorsSection: true,
});

export const useTenantSettings = () => React.useContext(TenantSettingsContext);

interface TenantSettingsProviderProps {
  children: React.ReactNode;
}

export const TenantSettingsProvider: React.FC<TenantSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TenantSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [invalidateTrigger, setInvalidateTrigger] = useState(0);
  const pageReady = usePageReady();

  // Cache key for sessionStorage (env-prefixed; optional version for cache-busting after admin refresh)
  const CACHE_KEY_BASE = getHomepageCacheKey('homepage_tenant_settings_cache');
  const CACHE_VERSION_KEY = getHomepageCacheKey('homepage_tenant_settings_version');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000; // 2 seconds

  // Listen for admin "Refresh cache" to clear caches and refetch
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(HOMEPAGE_CACHE_INVALIDATE_CHANNEL);
    channel.onmessage = () => {
      clearHomepageCaches();
      setSettings(null);
      setLoading(true);
      setInvalidateTrigger((t) => t + 1);
    };
    return () => channel.close();
  }, []);

  // Run cache read before paint so cached data shows immediately (no loading image on refresh)
  useLayoutEffect(() => {
    let CACHE_KEY = CACHE_KEY_BASE;
    try {
      const versionStr = sessionStorage.getItem(CACHE_VERSION_KEY);
      if (versionStr) {
        const v = parseInt(versionStr, 10);
        if (!isNaN(v)) CACHE_KEY = getHomepageCacheKey('homepage_tenant_settings_cache', v);
      }
    } catch (_) { /* ignore */ }

    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setSettings(data);
          setLoading(false);
        }
      }
    } catch (_) { /* ignore */ }
  }, [CACHE_KEY_BASE, CACHE_VERSION_KEY, CACHE_DURATION]);

  useEffect(() => {
    async function fetchTenantSettings() {
      // Resolve cache key: prefer versioned key if we have a stored version
      let CACHE_KEY = CACHE_KEY_BASE;
      try {
        const versionStr = sessionStorage.getItem(CACHE_VERSION_KEY);
        if (versionStr) {
          const v = parseInt(versionStr, 10);
          if (!isNaN(v)) CACHE_KEY = getHomepageCacheKey('homepage_tenant_settings_cache', v);
        }
      } catch (_) { /* ignore */ }

      // Check cache first (instant, no deferral needed for cached data)
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached tenant settings data');
            setSettings(data);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read tenant settings cache:', error);
      }

      // Defer network request until after initial paint to avoid blocking static content rendering
      if (!pageReady && retryCount === 0) return;

      try {
        const baseUrl = getAppUrl();
        const response = await fetch(
          `${baseUrl}/api/proxy/tenant-settings`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (response.ok) {
          const data = await response.json();
          const tenantSettings = Array.isArray(data) ? data[0] : data;

          if (tenantSettings) {
            console.log('✅ Tenant settings fetched successfully:', {
              tenantId: tenantSettings.tenantId,
              showEvents: tenantSettings.showEventsSectionInHomePage,
              showTeam: tenantSettings.showTeamMembersSectionInHomePage,
              showSponsors: tenantSettings.showSponsorsSectionInHomePage
            });

            setSettings(tenantSettings);

            const version = typeof tenantSettings.homepageCacheVersion === 'number' ? tenantSettings.homepageCacheVersion : undefined;
            const cacheKey = version != null ? getHomepageCacheKey('homepage_tenant_settings_cache', version) : CACHE_KEY_BASE;
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify({
                data: tenantSettings,
                timestamp: Date.now()
              }));
              if (version != null) {
                sessionStorage.setItem(CACHE_VERSION_KEY, String(version));
              }
            } catch (error) {
              console.warn('Failed to cache tenant settings:', error);
            }
          } else {
            console.warn('⚠️ No tenant settings found, using defaults');
            setSettings(null);
          }
        } else {
          // Handle different error status codes gracefully
          if (response.status === 500) {
            console.warn('⚠️ Tenant settings service temporarily unavailable');
          } else if (response.status === 404) {
            console.warn('⚠️ Tenant settings endpoint not found');
          } else {
            console.warn(`⚠️ Failed to fetch tenant settings (${response.status})`);
          }

          // Retry logic for server errors
          if ((response.status >= 500 || response.status === 0) && retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying tenant settings fetch (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
            return; // Don't set loading to false yet
          }

          setSettings(null);
        }
      } catch (error) {
        // Handle network errors and other exceptions gracefully
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('⚠️ Network error fetching tenant settings');
        } else {
          console.warn('⚠️ Error fetching tenant settings:', error);
        }

        // Retry logic for network errors
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying tenant settings fetch after network error (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
          return; // Don't set loading to false yet
        }

        setSettings(null);
        setLoading(false); // Always stop loading after max retries
      }

      // Always set loading to false after successful fetch or after all retries exhausted
      setLoading(false);
    }

    fetchTenantSettings();
  }, [CACHE_KEY_BASE, CACHE_VERSION_KEY, CACHE_DURATION, retryCount, pageReady, invalidateTrigger]);

  // Determine section visibility with fallback to true (show by default)
  // This ensures the app continues to work even if tenant settings fail
  const showEventsSection = settings?.showEventsSectionInHomePage ?? true;
  const showTeamSection = settings?.showTeamMembersSectionInHomePage ?? true;
  const showSponsorsSection = settings?.showSponsorsSectionInHomePage ?? true;

  const contextValue: TenantSettingsContextType = {
    settings,
    loading,
    showEventsSection,
    showTeamSection,
    showSponsorsSection,
  };

  return (
    <TenantSettingsContext.Provider value={contextValue}>
      {children}
    </TenantSettingsContext.Provider>
  );
};

