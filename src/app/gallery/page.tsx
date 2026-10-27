import type { Metadata } from 'next';
import FcUnitedGalleryPage from '@/components/fc-united/FcUnitedGalleryPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Maryland Strikers photo albums and event galleries.',
};

export default function GalleryPage() {
  return <FcUnitedGalleryPage />;
}