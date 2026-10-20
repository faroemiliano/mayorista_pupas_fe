type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

function visiblePages(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 1, totalPages - 3))
  const end = Math.min(totalPages, start + 3)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = "pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className={className} aria-label="Paginación">
      <button
        type="button"
        disabled={disabled || page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
        title="Página anterior"
      >
        ←
      </button>
      {visiblePages(page, totalPages).map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          disabled={disabled}
          aria-current={pageNumber === page ? "page" : undefined}
          className={pageNumber === page ? "!border-black !bg-black !text-white" : ""}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente"
        title="Página siguiente"
      >
        →
      </button>
    </nav>
  )
}
