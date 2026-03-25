'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  children?: ReactNode;
};

const DEFAULT_URL = 'https://givebutter.com/embed/mKoUpYQebNsn6RqA';

/**
 * Primary CTA for the homepage hero; uses Givebutter script from root layout when available.
 */
export default function GivebutterDonateButton({ className, children, onClick, ...rest }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const g = typeof window !== 'undefined' ? (window as unknown as { Givebutter?: { open?: () => void } }).Givebutter : undefined;
        if (g?.open) {
          g.open();
          return;
        }
        const url = process.env.NEXT_PUBLIC_GIVEBUTTER_EMBED_URL?.trim() || DEFAULT_URL;
        window.open(url, '_blank', 'noopener,noreferrer');
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
