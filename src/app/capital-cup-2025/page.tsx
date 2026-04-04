import type { Metadata } from 'next';
import FcUnitedCapitalCup2025Page from '@/components/fc-united/FcUnitedCapitalCup2025Page';

export const metadata: Metadata = {
  title: 'Capital Cup 2025',
  description:
    'Capital Cup 2025 — live schedule, fixtures, and match results (Tournify). Maryland Strikers Sports Club.',
};

export default function CapitalCup2025Page() {
  return <FcUnitedCapitalCup2025Page />;
}
