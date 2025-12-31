'use client'
import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { Eye, Pencil,ToggleLeft, ToggleRight, X } from 'lucide-react'
import StatusDropdown from '../../../../components/common/StatusDropdown'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from '../../../../utils/filterPersistence'
import Toast from '../../../../components/common/Toast'
import { useFilteredPhysicians } from '../hooks/usePhysicians'
import { deletePhysician } from '../services/physiciansService'
import { canEdit, canDelete } from '../../../../utils/rbac'

interface PhysicianRow {
  guid: string
  name: string
  speciality: string
  npi: string
  phone: string
  email: string
  status: string
}

const STATUS_OPTIONS = ['Active', 'Inactive']
const ITEMS_PER_PAGE = 10

export interface PhysicianTableRef {
  exportSelected: () => Promise<void>;
}

interface PhysicianTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const PhysicianTable = forwardRef<PhysicianTableRef, PhysicianTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = useState<Record<string, string>>(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['name', 'speciality', 'npi', 'phone', 'email', 'status'])
    return {
      name: urlFilters.name || '',
      speciality: urlFilters.speciality || '',
      npi: urlFilters.npi || '',
      phone: urlFilters.phone || '',
      email: urlFilters.email || '',
      status: urlFilters.status || '',
    }
  })

  // Update URL when search filters change
  const DEBOUNCE_MS = 300
  useEffect(() => {
    const id = setTimeout(() => {
      updateUrlWithFilters(router, pathname, search, page, pageSize)
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search, router, pathname, page, pageSize])

  const filterMap: Record<string, string> = {
    name: 'full_name',
    speciality: 'specialization',
    npi: 'npi',
    phone: 'phone_number',
    email: 'email',
    status: 'is_deleted'
  }

  const apiFilters: any = {}
  Object.entries(search).forEach(([k, v]) => {
    if (!v) return
    const apiKey = filterMap[k]
    if (!apiKey) return
    if (k === 'status') {
      apiFilters[apiKey] = v === 'Active' ? false : true
      return
    }
    if (k === 'name') {
      apiFilters['full_name'] = v.trim()
      return
    }
    apiFilters[apiKey] = v
  })

  const { data, loading, error, totalPages, totalRecords, refetch } = useFilteredPhysicians({
    page,
    pageSize,
    filters: apiFilters,
  })

  const [rowsState, setRowsState] = useState<PhysicianRow[]>([])
  const [inFlight, setInFlight] = useState<Set<string>>(new Set())

  useEffect(() => {
    const incoming: PhysicianRow[] = (Array.isArray(data) ? data : []).map((p: any) => ({
      guid: p?.guid || '',
      name: [p?.first_name, p?.middle_name, p?.last_name].filter(Boolean).join(' '),
      speciality: p?.specialization || '',
      npi: p?.npi || '',
      phone: p?.phone_number || '',
      email: p?.email || '',
      status: p?.is_deleted ? 'Inactive' : 'Active',
    }))
    setRowsState(prev => {
      const prevMap = new Map(prev.map(r => [r.guid, r]))
      return incoming.map(r => {
        const existing = prevMap.get(r.guid)
        if (existing) {
          if (inFlight.has(r.guid)) return existing // keep optimistic value during flight
          return { ...r, status: existing.status }
        }
        return r
      })
    })
  }, [data, inFlight])

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        // For physicians, we might need to fetch all if we want to export more than current page,
        // but for now let's export from current data or implement a fetchAll if needed.
        // Given the pattern in other tables, we filter from available data. 
        // If 'data' is paginated, this only exports selected items on current page.
        // To fix this properly like UserTable, we would need a getAllPhysicians service.
        // For now, I will use the rowsState which contains current page data.
        // Ideally we should fetch all for export if selection spans multiple pages.

        const selectedItems = rowsState.filter((item: any) => externalSelectedGuids?.includes(item.guid));
        
        // Map to only include visible table columns
        const exportData = selectedItems.map((item: any) => ({
          "Name": item.name ?? "--",
          "Speciality": item.speciality ?? "--",
          "NPI": item.npi ?? "--",
          "Phone": item.phone ?? "--",
          "Email": item.email ?? "--",
          "Status": item.status ?? "--"
        }));
        
        exportToCSV(exportData, 'physicians');
        if (onExportComplete) {
          onExportComplete(selectedItems.length);
        }
      } catch (err) {
        console.error('Failed to export physicians:', err);
      }
    }
  }), [rowsState, externalSelectedGuids, onExportComplete]);

  const pageData = rowsState
  const startIndex = (page - 1) * pageSize

  // Helper to check if a row is selected
  const isRowSelected = (guid: string) => externalSelectedGuids?.includes(guid);

  // Helper to update selection
  const updateSelection = (newSelection: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Clear selection when key changes
  useEffect(() => {
    if (clearSelectionKey && clearSelectionKey > 0) {
      // Selection cleared by parent
    }
  }, [clearSelectionKey]);

  const areAllVisibleSelected = pageData.length > 0 && pageData.every((row: any) => row.guid && isRowSelected(row.guid));

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

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')

  async function updatePhysicianStatus(guid: string) {
    const current = rowsState.find(r => r.guid === guid)?.status as ('Active' | 'Inactive' | undefined)
    if (!current) return
    const next: 'Active' | 'Inactive' = current === 'Active' ? 'Inactive' : 'Active'
    setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: next } : r))
    setInFlight(prev => new Set(prev).add(guid))
    try {
      const res = await deletePhysician(guid)
      const ok = !!res
      if (!ok) {
        setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
        setToastType('error')
        setToastMessage(res?.message || 'Status update failed')
        setToastOpen(true)
      } else {
        setToastType('success')
        setToastMessage(`Physician status set to ${next}`)
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

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto h-[calc(100vh-235px)] scrollbar-custom">
        <table className="min-w-full text-sm text-gray-700">
          <thead className='sticky top-0 z-20'>
            {/* Header Row */}
            <tr className="bg-[#EDF3EF] text-gray-800">
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tl-2xl">
                <input
                  type="checkbox"
                  checked={areAllVisibleSelected}
                  style={{ accentColor: '#009728' }}
                  onChange={(e) => {
                    if (pageData.length === 0) return;
                    if (areAllVisibleSelected) {
                      const visibleGuids = pageData.map((row: any) => row.guid).filter(Boolean);
                      const remaining = (externalSelectedGuids || []).filter((g) => !visibleGuids.includes(g));
                      updateSelection(remaining);
                    } else {
                      const visibleGuids = pageData.map((row: any) => row.guid).filter(Boolean);
                      const next = Array.from(new Set([...(externalSelectedGuids || []), ...visibleGuids]));
                      updateSelection(next);
                    }
                  }}
                  className="accent-green-600"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">Name</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">Speciality</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">NPI</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">Phone</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">Email</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200  w-[160px] min-w-[160px] max-w-[160px]">Status</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tr-2xl">
                Actions
              </th>
            </tr>

            {/* Filter Row */}
            <tr className="bg-[#EDF3EF]">
              <th className="px-4 py-2"></th>
              {['name', 'speciality', 'npi', 'phone', 'email', 'status'].map((key) => (
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

          {/* Body */}
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
            {error && !loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && pageData.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No Physicians found
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
                        if (!externalSelectedGuids?.includes(guid)) {
                          updateSelection([...(externalSelectedGuids || []), guid]);
                        }
                      } else {
                        updateSelection((externalSelectedGuids || []).filter((g) => g !== guid));
                      }
                    }}
                    className="accent-green-600"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.name}</td>
                <td className="px-4 py-3">
                  <span title={row.speciality} className="inline-block max-w-[240px] truncate align-bottom">
                    {row.speciality}
                  </span>
                </td>
                <td className="px-4 py-3">{row.npi}</td>
                <td className="px-4 py-3">{row.phone}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>
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
                      <Pencil
                        onClick={() => router.push(`/records/physicians/new?guid=${encodeURIComponent(row.guid)}`)}
                        className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                      />
                    )}
                    <Eye
                      onClick={() => router.push(`/records/physicians/view?guid=${encodeURIComponent(row.guid)}`)}
                      className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                    />
                    {canDelete() && (
                      row.status === 'Active' ? (
                        <ToggleRight
                          onClick={() => !inFlight.has(row.guid) && updatePhysicianStatus(row.guid)}
                          className={`w-5 h-5 cursor-pointer text-green-600 hover:scale-110 transition 
                          ${inFlight.has(row.guid) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                      ) : (
                        <ToggleLeft
                          onClick={() => !inFlight.has(row.guid) && updatePhysicianStatus(row.guid)}
                          className={`w-5 h-5 cursor-pointer text-gray-500 hover:scale-110 transition 
                          ${inFlight.has(row.guid) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Items per page:</span>
            <select
              className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
              value={pageSize}
              onChange={(e) => { 
                const newPageSize = Number(e.target.value);
                setPageSize(newPageSize); 
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-600">
            {pageData.length === 0
              ? '0-0'
              : `${startIndex + 1}-${Math.min(startIndex + pageSize, totalRecords || pageData.length)}`} of {totalRecords || pageData.length}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
          {makePages().map((p, idx) => (
            typeof p === 'number' ? (
              <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
            ) : (
              <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>
            )
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
        </div>
      </div>
      {/* Confirmation modal removed; using optimistic status toggle */}
      <Toast open={toastOpen} type={toastType} message={toastMessage} onClose={() => setToastOpen(false)} />
    </div>
  )
});

PhysicianTable.displayName = 'PhysicianTable';

export default PhysicianTable
