'use client'
import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Eye, Pencil, ToggleRight, ToggleLeft, X } from 'lucide-react'
import StatusDropdown from '../../../../components/common/StatusDropdown'
import { useInsurances } from '../hooks/useInsurances'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from '../../../../utils/filterPersistence'
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal'
import Toast from '../../../../components/common/Toast'
import { deleteInsuranceById } from '../services/insuranceService'
import { canEdit, canDelete } from '../../../../utils/rbac'

interface InsuranceRow {
  guid: string
  insurance: string
  insuranceType: string
  carrierCode: string
  status: 'Active' | 'Inactive'
}

const STATUS_OPTIONS = ['Active', 'Inactive']
const ITEMS_PER_PAGE = 10

export interface InsuranceTableRef {
  exportSelected: () => Promise<void>;
}

interface InsuranceTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const InsuranceTable = forwardRef<InsuranceTableRef, InsuranceTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rowsState, setRowsState] = useState<InsuranceRow[]>([])
  const [inFlight, setInFlight] = useState<Set<string>>(new Set())
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [selectedGuids, setSelectedGuids] = useState<string[]>([])

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = useState<Record<string, any>>(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['insurance', 'insuranceType', 'carrierCode', 'status'])
    return {
      insurance: urlFilters.insurance || '',
      insuranceType: urlFilters.insuranceType || '',
      carrierCode: urlFilters.carrierCode || '',
      status: urlFilters.status || '',
    }
  })
  const rawFilters = useMemo(() => {
    const f: Record<string, string> = {}
    if (search.insurance) f.name = search.insurance.trim()
    if (search.insuranceType) f.insurance_type = search.insuranceType.trim()
    if (search.carrierCode) f.insurance_code = search.carrierCode.trim()
    if (search.status) f.is_deleted = search.status === 'Active' ? 'false' : 'true'
    return f
  }, [search])

  const DEBOUNCE_MS = 300
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, any> | undefined>(undefined)
  const filtersHash = useMemo(() => Object.entries(rawFilters).sort().map(([k, v]) => k + ':' + String(v)).join('|'), [rawFilters])

  // Update URL when search filters change
  useEffect(() => {
    const id = setTimeout(() => {
      updateUrlWithFilters(router, pathname, search, page, pageSize)
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search, router, pathname, page, pageSize])

  useEffect(() => {
    const active = Object.keys(rawFilters).length ? rawFilters : undefined
    const id = setTimeout(() => {
      setDebouncedFilters(active)
      // Don't reset page - let the URL handle pagination state
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [filtersHash])

  const { data, loading, error, totalPages, totalRecords } = useInsurances(page, pageSize, debouncedFilters)
  const [deletedGuids, setDeletedGuids] = useState<Set<string>>(new Set())

  useEffect(() => {
    const incoming: InsuranceRow[] = Array.isArray(data) ? data
      .filter((d: any) => !deletedGuids.has(d?.guid))
      .map((d: any) => ({
        guid: d?.guid || '',
        insurance: d?.name || '',
        insuranceType: d?.insurance_type || '',
        carrierCode: d?.insurance_code || '',
        status: d?.is_deleted ? 'Inactive' : 'Active',
      })) : []
    setRowsState(prev => {
      const prevMap = new Map(prev.map(r => [r.guid, r]))
      return incoming.map(r => {
        const existing = prevMap.get(r.guid)
        if (existing && existing.status !== r.status) {
          if (inFlight.has(r.guid)) return existing
        }
        return existing ? { ...r, status: existing.status } : r
      })
    })
  }, [data, deletedGuids, inFlight])

  // Selection handlers
  const updateSelection = (next: string[]) => {
    setSelectedGuids(next);
    if (onSelectionChange) onSelectionChange(next);
  };

  const isRowSelected = (guid?: string) => {
    if (!guid) return false;
    return selectedGuids.includes(guid);
  };

  useEffect(() => {
    if (typeof clearSelectionKey !== 'undefined') {
      updateSelection([]);
    }
  }, [clearSelectionKey]);

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        const selectedItems = (data || []).filter((item: any) => externalSelectedGuids?.includes(item.guid));
        
        // Map to only include visible table columns
        const exportData = selectedItems.map((item: any) => ({
          "Insurance": item.name ?? "--",
          "Insurance Type": item.insurance_type ?? "--",
          "Carrier Code": item.carrier_code ?? "--",
          "Status": item.is_deleted ? "Inactive" : "Active"
        }));
        
        exportToCSV(exportData, 'insurance');
        if (onExportComplete) {
          onExportComplete(selectedItems.length);
        }
      } catch (err) {
        console.error('Failed to export insurance:', err);
      }
    }
  }), [data, externalSelectedGuids, onExportComplete]);

  async function updateInsuranceStatus(guid: string) {
    const current = rowsState.find(r => r.guid === guid)?.status
    if (!current) return
    const next: 'Active' | 'Inactive' = current === 'Active' ? 'Inactive' : 'Active'
    setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: next } : r))
    setInFlight(prev => new Set(prev).add(guid))
    try {
      const res = await deleteInsuranceById(guid)
      const ok = !!(res && (res.success === true || res.status === 200))
      if (!ok) {
        setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
        setToastType('error')
        setToastMessage(res?.message || 'Status update failed')
        setToastOpen(true)
      } else {
        setToastType('success')
        setToastMessage(`Insurance status set to ${next}`)
        setToastOpen(true)
      }
    } catch (e: any) {
      setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
      setToastType('error')
      setToastMessage(e?.message || 'Status update failed')
      setToastOpen(true)
    } finally {
      setInFlight(prev => { const n = new Set(prev); n.delete(guid); return n })
    }
  }

  const startIndex = (page - 1) * pageSize
  const pageData = rowsState
  const effectiveTotalPages = totalPages || 1
  const effectiveTotalRecords = totalRecords !== undefined ? totalRecords : rowsState.length
  const areAllVisibleSelected = pageData.length > 0 && pageData.every((row: any) => row.guid && selectedGuids.includes(row.guid));
  const makePages = () => {
    const pages: (number | string)[] = []
    const first = 1
    const last = totalPages
    const start = Math.max(first, page - 1)
    const end = Math.min(last, page + 1)
    pages.push(first)
    if (start > first + 1) pages.push('…')
    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) pages.push(p)
    }
    if (end < last - 1) pages.push('…')
    if (last > first) pages.push(last)
    return pages
  }

  const statusColors: Record<string, string> = {
    Active: 'bg-[#E2F6EA] text-[#008E43]',
    Inactive: 'bg-[#E5E8EB] text-[#5E6470]',
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null)
  // (toast state defined above)

  const requestDelete = (guid: string) => {
    setSelectedGuid(guid)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedGuid) return
    try {
      await deleteInsuranceById(selectedGuid)
      setDeletedGuids((prev) => new Set(prev).add(selectedGuid))
      setToastType('success')
      setToastMessage('Insurance deleted successfully')
      setToastOpen(true)
    } catch (e) {
      setToastType('error')
      setToastMessage('Failed to delete Insurance')
      setToastOpen(true)
    } finally {
      setSelectedGuid(null)
    }
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto h-[calc(100vh-235px)] scrollbar-custom">
        <table className="min-w-full text-sm text-[#344256]">
          <thead className='sticky top-0 z-20'>
            {/* Header */}
            <tr className="bg-[#EDF3EF] text-[#344256]">
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tl-2xl">
                <input
                  type="checkbox"
                  checked={areAllVisibleSelected}
                  style={{ accentColor: '#009728' }}
                  onChange={(e) => {
                    if (pageData.length === 0) return;
                    if (areAllVisibleSelected) {
                      const visibleGuids = pageData.map((row: any) => row.guid).filter(Boolean);
                      const remaining = selectedGuids.filter((g) => !visibleGuids.includes(g));
                      updateSelection(remaining);
                    } else {
                      const visibleGuids = pageData.map((row: any) => row.guid).filter(Boolean);
                      const next = Array.from(new Set([...selectedGuids, ...visibleGuids]));
                      updateSelection(next);
                    }
                  }}
                  className="accent-green-600"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Insurance
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Insurance Type
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Carrier Code
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[160px]">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tr-2xl">
                Actions
              </th>
            </tr>

            {/* Filter Row */}
            <tr className="bg-[#EDF3EF]">
              <th className="px-4 py-2"></th>
              {['insurance', 'insuranceType', 'carrierCode', 'status'].map((key) => (
                <th key={key} className="px-4 py-2 border-b border-gray-200">
                  {key === 'status' ? (
                    <StatusDropdown
                      value={search.status}
                      options={STATUS_OPTIONS}
                      onChange={(value) => setSearch({ ...search, status: value })}
                      placeholder="Select"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={search[key] || ''}
                        onChange={(e) => setSearch({ ...search, [key]: e.target.value })}
                        className="w-full ps-8 pr-8 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-green-200"
                      />
                      <svg
                        className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                        />
                      </svg>
                      {search[key] ? (
                        <button
                          onClick={() => setSearch({ ...search, [key]: '' })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && pageData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No Insurances found
                </td>
              </tr>
            )}
            {pageData.map((row, i) => (
              <tr key={i} className="bg-white border-b border-gray-100 hover:bg-green-50 transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isRowSelected(row.guid)}
                    style={{ accentColor: '#009728' }}
                    onChange={(e) => {
                      const guid = row.guid;
                      if (!guid) return;
                      if (e.target.checked) {
                        if (!selectedGuids.includes(guid)) {
                          updateSelection([...selectedGuids, guid]);
                        }
                      } else {
                        updateSelection(selectedGuids.filter((g) => g !== guid));
                      }
                    }}
                    className="accent-green-600"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.insurance}</td>
                <td className="px-4 py-3">{row.insuranceType}</td>
                <td className="px-4 py-3">{row.carrierCode}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>
                    {row.status}
                    {inFlight.has(row.guid) && (
                      <svg className="animate-spin h-3 w-3 text-current" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-green-600">
                    {canEdit() && (
                      <Pencil onClick={() => router.push(`/records/insurance/new?guid=${row.guid}`)} className="w-4 h-4 cursor-pointer hover:scale-110 transition" />
                    )}
                    <Eye onClick={() => router.push(`/records/insurance/view?guid=${row.guid}`)} className="w-4 h-4 cursor-pointer hover:scale-110 transition" />
                    {canDelete() && (
                      <button
                        type="button"
                        onClick={() => !inFlight.has(row.guid) && updateInsuranceStatus(row.guid)}
                        disabled={inFlight.has(row.guid)}
                        className={`p-1 rounded transition hover:bg-gray-100
                          ${inFlight.has(row.guid) ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {row.status === "Active" ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals/Toasts */}
      <DeleteConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Insurance"
      />
      <Toast open={toastOpen} type={toastType} message={toastMessage} onClose={() => setToastOpen(false)} />

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Items per page:</span>
            <select
              className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-600">
            {pageData.length === 0
              ? '0-0'
              : `${startIndex + 1}-${startIndex + pageData.length}`} of {effectiveTotalRecords}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
          {(() => {
            const tp = effectiveTotalPages
            const pages: (number | string)[] = []
            const first = 1
            const last = tp
            const start = Math.max(first, page - 1)
            const end = Math.min(last, page + 1)
            pages.push(first)
            if (start > first + 1) pages.push('…')
            for (let p = start; p <= end; p++) {
              if (p !== first && p !== last) pages.push(p)
            }
            if (end < last - 1) pages.push('…')
            if (last > first) pages.push(last)
            return pages
          })().map((p, idx) => (
            typeof p === 'number' ? (
              <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
            ) : (
              <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>
            )
          ))}
          <button disabled={page === effectiveTotalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
          <button disabled={page === effectiveTotalPages} onClick={() => setPage(effectiveTotalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
        </div>
      </div>
    </div>
  )
});

InsuranceTable.displayName = 'InsuranceTable';

export default InsuranceTable
