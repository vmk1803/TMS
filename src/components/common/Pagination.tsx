import { useEffect, useMemo } from 'react'

export interface PaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  maxPageButtons?: number
  resetPageOnPageSizeChange?: boolean
  clampPageToRange?: boolean
}

type PaginationItem =
  | { type: 'page'; value: number }
  | { type: 'ellipsis'; key: string }

function buildPaginationItems(
  page: number,
  totalPages: number,
  maxPageButtons: number
): PaginationItem[] {
  if (totalPages <= 0) return []
  if (totalPages === 1) return [{ type: 'page', value: 1 }]

  const safeMax = Math.max(1, Math.floor(maxPageButtons))
  const half = Math.floor(safeMax / 2)

  let windowStart = Math.max(2, page - half)
  let windowEnd = Math.min(totalPages - 1, windowStart + safeMax - 1)
  windowStart = Math.max(2, windowEnd - safeMax + 1)

  const items: PaginationItem[] = [{ type: 'page', value: 1 }]

  if (windowStart > 2) items.push({ type: 'ellipsis', key: 'start' })

  for (let p = windowStart; p <= windowEnd; p += 1) {
    items.push({ type: 'page', value: p })
  }

  if (windowEnd < totalPages - 1) items.push({ type: 'ellipsis', key: 'end' })

  items.push({ type: 'page', value: totalPages })

  return items
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  maxPageButtons = 3,
  resetPageOnPageSizeChange = true,
  clampPageToRange = true,
}: PaginationProps) {
  const safePageSize = pageSize > 0 ? pageSize : 1
  const totalPages = Math.max(0, Math.ceil(totalItems / safePageSize))
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    if (!clampPageToRange) return
    if (page !== safePage) {
      onPageChange?.(safePage)
    }
  }, [clampPageToRange, onPageChange, page, safePage, totalPages])

  const rangeText = useMemo(() => {
    if (totalItems <= 0) return '0–0 of 0'
    const start = (safePage - 1) * safePageSize + 1
    const end = Math.min(safePage * safePageSize, totalItems)
    return `${start}–${end} of ${totalItems}`
  }, [safePage, safePageSize, totalItems])

  const items = useMemo(
    () => buildPaginationItems(safePage, totalPages, maxPageButtons),
    [maxPageButtons, safePage, totalPages]
  )

  const isFirstPage = totalPages <= 1 || safePage === 1
  const isLastPage = totalPages <= 1 || safePage === totalPages

  const handlePageSizeChange = (nextSize: number) => {
    onPageSizeChange?.(nextSize)
    if (resetPageOnPageSizeChange) onPageChange?.(1)
  }

  return (
    <div className="px-4 py-3 border-t">
      {/* Desktop: Single row layout */}
      <div className="hidden md:flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            Items per page:
            <select
              className="border rounded px-2 py-1 bg-[#efeff5]"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>{rangeText}</div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isFirstPage}
              onClick={() => onPageChange?.(1)}
            >
              « First
            </button>
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isFirstPage}
              onClick={() => onPageChange?.(safePage - 1)}
            >
              &lt; Back
            </button>

            {items.map((it) => {
              if (it.type === 'ellipsis') {
                return (
                  <span key={it.key} className="px-2 text-sm">
                    …
                  </span>
                )
              }

              const isActive = it.value === safePage
              return (
                <button
                  key={it.value}
                  className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 ${
                    isActive ? 'bg-secondary text-white' : ''
                  }`}
                  onClick={() => onPageChange?.(it.value)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {it.value}
                </button>
              )
            })}

            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLastPage}
              onClick={() => onPageChange?.(safePage + 1)}
            >
              Next &gt;
            </button>
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLastPage}
              onClick={() => onPageChange?.(totalPages)}
            >
              Last »
            </button>
          </div>
        )}
      </div>

      {/* Mobile/Tablet: Two-row layout */}
      <div className="md:hidden space-y-3">
        {/* Row 1: Items per page + Range text */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-xs">Items per page:</span>
            <select
              className="border rounded px-2 py-1 bg-[#efeff5] text-xs"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs">{rangeText}</div>
        </div>

        {/* Row 2: Navigation buttons centered */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            <button
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isFirstPage}
              onClick={() => onPageChange?.(1)}
            >
              « First
            </button>
            <button
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isFirstPage}
              onClick={() => onPageChange?.(safePage - 1)}
            >
              &lt; Back
            </button>

            {items.map((it) => {
              if (it.type === 'ellipsis') {
                return (
                  <span key={it.key} className="px-1 text-xs">
                    …
                  </span>
                )
              }

              const isActive = it.value === safePage
              return (
                <button
                  key={it.value}
                  className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 min-w-[28px] ${
                    isActive ? 'bg-secondary text-white' : ''
                  }`}
                  onClick={() => onPageChange?.(it.value)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {it.value}
                </button>
              )
            })}

            <button
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLastPage}
              onClick={() => onPageChange?.(safePage + 1)}
            >
              Next &gt;
            </button>
            <button
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLastPage}
              onClick={() => onPageChange?.(totalPages)}
            >
              Last »
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
