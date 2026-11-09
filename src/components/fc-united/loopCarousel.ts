const SLIDE_MS = 1400;
const motions = new WeakMap<HTMLElement, number>();

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

/** Advance a duplicated horizontal track by one card. The wrap to the other copy is instant; the step itself eases. */
export function stepLoop(el: HTMLElement, direction: -1 | 1, itemCount: number) {
  const card = el.querySelector<HTMLElement>('[data-carousel-card]');
  if (!card || itemCount < 1) return;
  const styles = getComputedStyle(el);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;
  const step = card.getBoundingClientRect().width + gap;
  if (step <= 1) return;
  const setWidth = step * itemCount;

  const running = motions.get(el);
  if (running) cancelAnimationFrame(running);

  let left = el.scrollLeft;
  if (direction < 0 && left <= 1) {
    left += setWidth;
    el.scrollLeft = left;
  } else if (direction > 0 && left >= setWidth - 1) {
    left -= setWidth;
    el.scrollLeft = left;
  }

  const from = left;
  const target = direction > 0 ? left + step : Math.max(0, left - step);
  const start = performance.now();

  const run = (now: number) => {
    const t = Math.min(1, (now - start) / SLIDE_MS);
    el.scrollLeft = from + (target - from) * easeInOut(t);
    if (t < 1) {
      motions.set(el, requestAnimationFrame(run));
    } else {
      motions.delete(el);
    }
  };
  motions.set(el, requestAnimationFrame(run));
}
