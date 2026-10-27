'use client';

type MdPaginationProps = {
  /** Zero-based page index. */
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  /** Plural noun used in the count line, for example "events". */
  itemLabel: string;
  itemLabelSingular?: string;
  loading?: boolean;
};

export function MdPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  itemLabel,
  itemLabelSingular,
  loading = false,
}: MdPaginationProps) {
  if (totalCount <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const startItem = safePage * pageSize + 1;
  const endItem = Math.min(totalCount, safePage * pageSize + pageSize);
  const noun = totalCount === 1 ? itemLabelSingular || itemLabel.replace(/s$/, '') : itemLabel;
  const prevDisabled = safePage === 0 || loading;
  const nextDisabled = safePage >= totalPages - 1 || loading;

  return (
    <nav className="md-pagination" aria-label="Pagination">
      <div className="md-pagination__bar">
        <button
          type="button"
          className="md-pagination__prev"
          disabled={prevDisabled}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <p className="md-pagination__status">
          Page <span className="md-pagination__page">{safePage + 1}</span> of{' '}
          <span className="md-pagination__page">{totalPages}</span>
        </p>
        <button
          type="button"
          className="md-pagination__next"
          disabled={nextDisabled}
          onClick={() => onPageChange(safePage + 1)}
          title="Next Page"
          aria-label="Next Page"
        >
          Next
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="md-pagination__count">
        {`Showing ${startItem} to ${endItem} of ${totalCount} ${noun}`}
      </p>
    </nav>
  );
}
