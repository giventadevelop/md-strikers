'use client';

import { useEffect } from 'react';
import { scrollPageToTop } from '@/lib/scrollPageToTop';

const PAGE_BUTTON = /^(previous|next) page$/i;

/**
 * Any Previous/Next pagination button scrolls the page to the top.
 * Covers the shared MdPagination control and the admin lists that repeat the same buttons.
 */
export function PaginationScrollToTop() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest('button');
      if (!button || button.disabled) return;
      const label = button.getAttribute('aria-label') || '';
      if (!PAGE_BUTTON.test(label)) return;
      scrollPageToTop(button);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
