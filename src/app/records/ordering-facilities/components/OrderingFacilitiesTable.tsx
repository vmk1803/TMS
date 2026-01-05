'use client'
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Eye, Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react'
import StatusDropdown from "../../../../components/common/StatusDropdown";
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from '../../../../utils/filterPersistence'
import { useAllPartners } from '../hooks/usePartners'
import { deletePartner } from '../services/partnersService'
import Toast from '../../../../components/common/Toast'
import { canEdit, canDelete } from '../../../../utils/rbac'
import { useDebounce } from '../hooks/useDebounce'

interface FacilityRow {
  facilityName: string
  address: string
  cityState: string
  phone: string
  contactPerson: string
  status: string
  guid: string
}

const STATUS_OPTIONS = ['Active', 'Inactive']

export interface OrderingFacilitiesTableRef {
  exportSelected: () => Promise<void>;
}

interface OrderingFacilitiesTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const OrderingFacilitiesTable = forwardRef<OrderingFacilitiesTableRef, OrderingFacilitiesTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = useState<Record<string, string>>(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['facilityName', 'address', 'cityState', 'phone', 'contactPerson', 'status'])
    return {
      facilityName: urlFilters.facilityName || '',
      address: urlFilters.address || '',
      cityState: urlFilters.cityState || '',
      phone: urlFilters.phone || '',
      contactPerson: urlFilters.contactPerson || '',
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
  const filters: Record<string, string> = {};

  if (search.facilityName) filters.name = search.facilityName;
  if (search.phone) filters.phone = search.phone;
  if (search.address) filters.address = search.address;
  if (search.contactPerson) filters.contact_person = search.contactPerson;

  if (search.cityState) {
    const raw = search.cityState.trim();
    if (raw.includes(',')) {
      const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
      if (parts[0]) filters.city = parts[0];
      if (parts[1]) filters.state = parts[1];
    } else if (/^[A-Za-z]{2}$/.test(raw)) {
      filters.state = raw.toUpperCase();
    } else if (/^[A-Za-z].*\s+[A-Za-z]{2}$/.test(raw)) {
      const tokens = raw.split(/\s+/);
      const stateToken = tokens.pop();
      if (stateToken && /^[A-Za-z]{2}$/.test(stateToken)) {
        filters.state = stateToken.toUpperCase();
        const cityPart = tokens.join(' ');
        if (cityPart) filters.city = cityPart;
      } else {
        filters.city = raw;
      }
    } else {
      // Single word or multi-word city only
      filters.city = raw;
    }
  }
  if (search.status) {
    filters.is_deleted = search.status === "Active" ? "false" : "true";
  }

  const debouncedFilters = useDebounce(
    Object.keys(filters).length > 0 ? filters : undefined,
    300
  );
  const { data, loading, error } = useAllPartners(100, debouncedFilters)
  const [inFlight, setInFlight] = useState<Set<string>>(new Set())
  const [rowsState, setRowsState] = useState<FacilityRow[]>([])
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  // Map API rows to display rows for filtering and rendering
  const mappedRows: FacilityRow[] = (Array.isArray(data) ? data : []).map((p) => {
    const addr1 = p.address_line1 || ''
    const addr2 = p.address_line2 || ''
    const address = `${addr1}${addr1 && addr2 ? ' ' : ''}${addr2}`.trim()
    const city = p.city || ''
    const state = p.state || ''
    const cityState = city && state ? `${city}, ${state}` : (city || state)
    const status = p.is_deleted ? 'Inactive' : 'Active'
    const guid = p.guid || ''
    return {
      facilityName: p.name || '',
      address,
      cityState,
      phone: p.phone || '',
      contactPerson: p.contact_person || '',
      status,
      guid
    }
  })

  useEffect(() => {
    setRowsState(mappedRows)
  }, [data])

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        const selectedItems = (data || []).filter((item: any) => externalSelectedGuids?.includes(item.guid));

        // Map to only include visible table columns
        const exportData = selectedItems.map((item: any) => ({
          "Facility Name": item.name ?? "--",
          "Address": item.address ?? "--",
          "City/State": `${item.city ?? ""}, ${item.state ?? ""}`.trim() || "--",
          "Phone": item.phone ?? "--",
          "Contact Person": item.contact_person ?? "--",
          "Status": item.is_deleted ? "Inactive" : "Active"
        }));

        exportToCSV(exportData, 'ordering-facilities');
        if (onExportComplete) {
          onExportComplete(selectedItems.length);
        }
      } catch (err) {
        console.error('Failed to export ordering facilities:', err);
      }
    }
  }), [data, externalSelectedGuids, onExportComplete]);

  // Use server-filtered data directly (no client-side filtering needed)
  const filteredData = rowsState
  const startIndex = (page - 1) * pageSize
  const pageData = filteredData.slice(startIndex, startIndex + pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

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

  const statusColors: Record<string, string> = {
    Active: 'bg-[#E2F6EA] text-[#008E43]',
    Inactive: 'bg-[#E5E8EB] text-[#5E6470]',
  }

  async function updatePartnerStatus(guid: string) {
    const current = rowsState.find(r => r.guid === guid)?.status as ('Active' | 'Inactive' | undefined)
    if (!current) return
    const next: 'Active' | 'Inactive' = current === 'Active' ? 'Inactive' : 'Active'
    setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: next } : r))
    setInFlight(prev => new Set(prev).add(guid))
    try {
      const res = await deletePartner(guid)
      const ok = !!(res && (res.success === true || res.status === 200))
      if (!ok) {
        setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
        setToastType('error')
        setToastMessage(res?.message || 'Status update failed')
        setToastOpen(true)
      } else {
        setToastType('success')
        setToastMessage(`Partner status set to ${next}`)
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
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[350px] min-w-[350px] max-w-[350px]">Facility Name</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200  w-[200px] min-w-[200px] max-w-[200px]">Address</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[180px] min-w-[180px] max-w-[180px]">City/State</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[160px]  min-w-[160px] max-w-[160px]">Phone</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200  min-w-[160px] max-w-[160px]">Contact Person</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[160px] min-w-[160px] max-w-[160px] z-[10] right-[115px] sticky bg-[#EDF3EF]">Status</th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tr-2xl z-[10] right-0 sticky bg-[#EDF3EF]">
                Actions
              </th>
            </tr>

            {/* Filter Row */}
            <tr className="bg-[#EDF3EF]">
              <th className="px-4 py-2"></th>
              {['facilityName', 'address', 'cityState', 'phone', 'contactPerson', 'status'].map((key) => (
                <th key={key}   className={`px-4 py-2 border-b border-gray-200
                ${key === 'status' ? 'bg-[#EDF3EF] right-[115px] sticky ' : ''} 
              `}>
                  {key === 'status' ? (
                    <StatusDropdown
                      value={search[key] || ''}
                      options={STATUS_OPTIONS}
                      onChange={(value) => setSearch({ ...search, [key]: value })}
                      placeholder="Select"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={search[key] || ''}
                        onChange={(e) => setSearch({ ...search, [key]: e.target.value })}
                        className="w-full ps-8 pr-10 py-1.5 rounded-full border border-gray-200 text-sm
                                  focus:outline-none focus:ring-1 focus:ring-green-200"
                      />
                      <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                      {/* Clear (X) Icon */}
                      {search[key] && (
                        <button
                          onClick={() => setSearch({ ...search, [key]: '' })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              <th className='bg-[#EDF3EF] sticky right-0 z-[10]'></th>
            </tr>
          </thead >

          {/* Body */}
          <tbody>
            {
              loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                    </div>
                  </td>
                </tr>
              )
            }
            {
              !loading && !error && pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No Facilities found</td>
                </tr>
              )
            }
            {
              error && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-red-600">{error}</td>
                </tr>
              )
            }
            {
              !loading && !error && pageData.map((row, i) => (
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
                  <td className="px-4 py-3 w-[350px] max-w-[350px]">
                  <div className="truncate w-full" title={row.facilityName}>
                    {row.facilityName}
                  </div>
                </td>
                    <td className="px-4 py-3 w-[150px] max-w-[150px]">
                  <div className="truncate" title={row.address}>
                    {row.address}
                  </div>
                </td>
                  <td className="px-4 py-3">{row.cityState}</td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3">{row.contactPerson}</td>
                  <td className="px-4 py-3 bg-white sticky right-[115px] z-[10]">
                    <button
                      disabled={inFlight.has(row.guid)}
                      onClick={() => updatePartnerStatus(row.guid)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition ${statusColors[row.status] || 'bg-gray-100 text-gray-700'
                        } ${inFlight.has(row.guid) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {inFlight.has(row.guid) ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : null}
                      {row.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 bg-white sticky right-0 z-[10]">
                    <div className="flex items-center gap-3 text-green-600">
                      {canEdit() && (
                        <Pencil
                          onClick={() => router.push(`/records/ordering-facilities/edit?guid=${row.guid}`)}
                          className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                        />
                      )}
                      <Eye
                        onClick={() => router.push(`/records/ordering-facilities/view?guid=${row.guid}`)}
                        className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                      />
                      {canDelete() && (
                        <button
                          type="button"
                          onClick={() => !inFlight?.has(row.guid) && updatePartnerStatus(row.guid)}
                          disabled={inFlight?.has(row.guid)}
                          className={`p-1 rounded hover:bg-gray-100 transition 
                          ${inFlight?.has(row.guid) ? 'opacity-40 cursor-not-allowed' : ''}`}
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
              ))
            }
          </tbody >
        </table >
      </div >
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

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
            {filteredData.length === 0 ? '0-0' : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredData.length)}`} of {filteredData.length}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
          {(() => {
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
            return pages.map((p, idx) => (
              typeof p === 'number' ? (
                <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
              ) : (
                <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>
              )
            ))
          })()}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
        </div>
      </div>
    </div >
  )
});

OrderingFacilitiesTable.displayName = 'OrderingFacilitiesTable';

export default OrderingFacilitiesTable
