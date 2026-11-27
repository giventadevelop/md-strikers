'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FcNavItem } from './fcUnitedNavLinks';

const FcHeaderLinksContext = createContext<FcNavItem[] | null>(null);

export function FcHeaderLinksProvider({
  links,
  children,
}: {
  links: FcNavItem[];
  children: ReactNode;
}) {
  return <FcHeaderLinksContext.Provider value={links}>{children}</FcHeaderLinksContext.Provider>;
}

export function useFcHeaderLinks(): FcNavItem[] | null {
  return useContext(FcHeaderLinksContext);
}
