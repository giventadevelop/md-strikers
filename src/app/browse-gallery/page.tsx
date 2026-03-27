import { Suspense } from 'react';
import { GalleryContent } from '../gallery/GalleryContent';

/** Backend-driven gallery preserved here after /gallery switched to static mirror. */
export default function BrowseGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-lg text-gray-600">
            Explore memories from our albums and events through our photo and video gallery
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-600">Loading gallery...</div>}>
          <GalleryContent />
        </Suspense>
      </div>
    </div>
  );
}