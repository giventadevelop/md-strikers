'use client';

import { useEffect } from 'react';
import { scrollPageToTop } from '@/lib/scrollPageToTop';

function paginationControl(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const control = target.closest('button, a');
  if (!(control instanceof HTMLElement)) return null;
  if (control.matches(':disabled') || control.getAttribute('aria-disabled') === 'true') return null;
  const label = `${control.getAttribute('aria-label') || ''} ${control.getAttribute('title') || ''}`.toLowerCase();
  const labeled = label.includes('previous page') || label.includes('next page');
  const classed =
    control.classList.contains('md-pagination__prev') || control.classList.contains('md-pagination__next');
  return labeled || classed ? control : null;
}

/**
 * Previous/Next keep the clicked control in view, so the next page opens at the bottom.
 * Blur the control and scroll to the top after the new page has painted.
 */
export default function PaginationScrollToTop() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const control = paginationControl(event.target);
      if (!control) return;
      scrollPageToTop(control);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
