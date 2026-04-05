import type { Metadata } from 'next';
import FcUnitedCapitalCup2026Page from '@/components/fc-united/FcUnitedCapitalCup2026Page';

export const metadata: Metadata = {
  title: 'Capital Cup 2026',
  description:
    'Capital Cup 2026 — 40+ soccer tournament hosted by Maryland Strikers Sports Club. Registration and tournament details.',
};

export default function CapitalCup2026Page() {
  return <FcUnitedCapitalCup2026Page />;
}
