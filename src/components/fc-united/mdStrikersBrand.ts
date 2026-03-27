/**
 * Maryland Strikers — shared brand tokens (header, footer, CTAs).
 * Navy + stadium red + gold from the crest; use these instead of one-off hex values.
 */
export const mdStrikersBrand = {
  /** Primary header / hero band */
  navy: '#0a1628',
  navyDeep: '#060d14',
  /** Active nav, hover, primary CTA (stadium red — ties to crest) */
  accent: '#e31837',
  accentHover: '#ff2d4a',
  /** Crest gold — taglines, subtle highlights */
  gold: '#f5b514',
  goldMuted: '#d4a20a',
  /** Body on dark */
  text: '#f8fafc',
  textMuted: '#94a3b8',
} as const;
