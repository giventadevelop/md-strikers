'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { isAdminRole } from '@/lib/utils';
import { cn } from '@/lib/utils';

const authLink =
  'cursor-pointer text-base font-bold text-white transition-colors duration-200 hover:text-[#e31837] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]';

function displayName(user: ReturnType<typeof useUser>['user']): string {
  return user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User';
}

export function useFcUnitedAuth() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingSignOut, setPendingSignOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clerk_signout') !== 'true') return;
    setPendingSignOut(true);
    urlParams.delete('clerk_signout');
    const next = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
    window.history.replaceState({}, '', next);
  }, []);

  useEffect(() => {
    if (!pendingSignOut || !isLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('[FcUnitedHeader] signOut() error on satellite:', error);
      }
      if (cancelled) return;
      setPendingSignOut(false);
      window.location.replace(window.location.pathname);
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingSignOut, isLoaded, signOut]);

  useEffect(() => {
    if (!isLoaded || !userId) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        if (!tenantId) return;
        const resp = await fetch(
          `/api/proxy/user-profiles?userId.equals=${encodeURIComponent(userId)}&tenantId.equals=${encodeURIComponent(tenantId)}&size=1`,
          { cache: 'no-store' }
        );
        if (!resp.ok || cancelled) return;
        const data = await resp.json();
        const profile = Array.isArray(data) ? data[0] : data?.content?.[0] || data;
        if (!cancelled) setIsAdmin(isAdminRole(profile?.userRole));
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    localStorage.setItem('clerk_signout_broadcast', Date.now().toString());

    const hostname = window.location.hostname;
    const primaryDomain = process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'www.adwiiseagent.ai';
    const primaryHost = primaryDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const bareHost = primaryHost.replace(/^www\./, '');
    const isPrimary =
      hostname === primaryHost ||
      hostname === primaryDomain ||
      hostname === bareHost ||
      hostname.endsWith(`.${bareHost}`);

    if (isPrimary) {
      try {
        await signOut();
        window.location.href = '/';
      } catch (error) {
        console.error('[FcUnitedHeader] Error signing out:', error);
        setIsSigningOut(false);
      }
      return;
    }

    if (hostname.includes('mosc-temp.com')) {
      const returnUrl = encodeURIComponent(window.location.origin);
      window.location.href = `https://${primaryHost}/auth/signout-redirect?redirect_url=${returnUrl}`;
      return;
    }

    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('[FcUnitedHeader] Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return { userId, isLoaded, user, isAdmin, isSigningOut, handleSignOut };
}

function AvatarButton({
  user,
  onSignOut,
  isSigningOut,
}: {
  user: ReturnType<typeof useUser>['user'];
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const name = displayName(user);
  const email = user?.emailAddresses?.[0]?.emailAddress || '';
  const imageUrl = user?.imageUrl || null;

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-[#e31837] text-white hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
        ) : (
          <span className="text-sm font-bold">{name.charAt(0).toUpperCase()}</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#e3e3e3] bg-white py-2 text-[#262f3e] shadow-xl">
          <div className="border-b border-[#e3e3e3] px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            {email ? <p className="mt-0.5 truncate text-xs text-[#797e87]">{email}</p> : null}
          </div>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className={cn(
              'block px-4 py-2.5 text-sm font-semibold hover:bg-[#f4f4f4]',
              pathname === '/profile' && 'text-[#e31837]'
            )}
          >
            Profile
          </Link>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm font-semibold text-[#e31837] hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:text-[#797e87]"
          >
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}

export function FcUnitedAuthDesktop() {
  const { userId, isLoaded, user, isAdmin, isSigningOut, handleSignOut } = useFcUnitedAuth();
  const pathname = usePathname();
  if (!isLoaded) return <div className="hidden h-10 w-24 md:block" aria-hidden />;

  if (!userId) {
    return (
      <div className="hidden shrink-0 items-center gap-4 md:flex">
        <Link href="/sign-in" className={authLink}>
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex cursor-pointer items-center rounded-[32px] bg-[#e31837] px-4 py-2 text-sm font-bold text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 items-center gap-4 md:flex">
      {isAdmin && (
        <Link href="/admin" className={cn(authLink, pathname?.startsWith('/admin') && 'text-[#e31837]')}>
          Admin
        </Link>
      )}
      <AvatarButton user={user} onSignOut={handleSignOut} isSigningOut={isSigningOut} />
    </div>
  );
}

export function FcUnitedAuthMobile({ onNavigate }: { onNavigate: () => void }) {
  const { userId, isLoaded, user, isAdmin, isSigningOut, handleSignOut } = useFcUnitedAuth();
  if (!isLoaded) return null;

  if (!userId) {
    return (
      <div className="mt-2 flex flex-col gap-2 border-t border-white/10 px-3 py-3">
        <Link href="/sign-in" onClick={onNavigate} className={cn(authLink, 'rounded-[3px] px-3 py-3')}>
          Sign In
        </Link>
        <Link
          href="/sign-up"
          onClick={onNavigate}
          className="rounded-[32px] bg-[#e31837] px-3 py-3 text-center text-sm font-bold text-white"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const name = displayName(user);
  const email = user?.emailAddresses?.[0]?.emailAddress || '';

  return (
    <div className="mt-2 border-t border-white/10 px-3 py-3">
      <p className="px-3 text-sm font-semibold text-white">{name}</p>
      {email ? <p className="px-3 text-xs text-[#94a3b8]">{email}</p> : null}
      <div className="mt-2 flex flex-col">
        {isAdmin && (
          <Link href="/admin" onClick={onNavigate} className={cn(authLink, 'rounded-[3px] px-3 py-3')}>
            Admin
          </Link>
        )}
        <Link href="/profile" onClick={onNavigate} className={cn(authLink, 'rounded-[3px] px-3 py-3')}>
          Profile
        </Link>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => {
            onNavigate();
            handleSignOut();
          }}
          className="cursor-pointer rounded-[3px] px-3 py-3 text-left text-base font-bold text-[#e31837] disabled:cursor-not-allowed"
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
