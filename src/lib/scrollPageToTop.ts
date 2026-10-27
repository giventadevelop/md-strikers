/**
 * Jump to the top of the page after a pagination control is used.
 * Blur first so the browser does not keep the focused button in view.
 * Repeat after paint: the next page can re-anchor the scroll position at the control.
 */
export function scrollPageToTop(from?: Element | null) {
  if (from instanceof HTMLElement) {
    from.blur();
  }
  const active = document.activeElement;
  if (active instanceof HTMLElement && active !== document.body) {
    active.blur();
  }

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';

  const run = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    root.scrollTop = 0;
    document.body.scrollTop = 0;

    let node = from?.parentElement ?? null;
    while (node && node !== document.body) {
      const overflowY = window.getComputedStyle(node).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 2) {
        node.scrollTop = 0;
        break;
      }
      node = node.parentElement;
    }
  };

  run();
  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
  window.setTimeout(run, 0);
  window.setTimeout(run, 80);
  window.setTimeout(() => {
    run();
    root.style.scrollBehavior = previousBehavior;
  }, 200);
}
