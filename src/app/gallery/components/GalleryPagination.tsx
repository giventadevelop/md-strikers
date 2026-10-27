'use client';

import { MdPagination } from '@/components/fc-united/MdPagination';

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemType?: 'albums' | 'events';
}

export function GalleryPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
  itemType = 'events',
}: GalleryPaginationProps) {
  if (totalCount <= 0) {
    return <p className="md-pagination__count">No {itemType} found</p>;
  }

  return (
    <MdPagination
      page={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      itemLabel={itemType === 'albums' ? 'albums' : 'events'}
      loading={loading}
    />
  );
}
