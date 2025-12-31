'use client'
import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
// import { useAllTubes } from '../hooks/useTubes'
import { useFilteredTubes } from '../hooks/useFilteredTubes'
import { Eye, Pencil,  ToggleLeft, ToggleRight, X } from 'lucide-react'
import StatusDropdown from "../../../../components/common/StatusDropdown";
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from '../../../../utils/filterPersistence'
import { StorageTemperatureEnum, type TubeDTO } from '../../../../types/testTubes'
import { deleteTubeByGuid } from '../services/testTubesService'
import Toast from '../../../../components/common/Toast'
import { canEdit, canDelete } from '../../../../utils/rbac'

export interface TubeTableRef {
  exportSelected: () => Promise<void>;
}

interface TubeTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const TubeTable = forwardRef<TubeTableRef, TubeTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = React.useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = React.useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = React.useState<Record<string, string>>(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['tube_name', 'quantity', 'storage_temperature', 'special_instructions', 'status'])
    return {
      tube_name: urlFilters.tube_name || '',
      quantity: urlFilters.quantity || '',
      storage_temperature: urlFilters.storage_temperature || '',
      special_instructions: urlFilters.special_instructions || '',
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
    tube_name: 'tube_name',
    quantity: 'quantity',
    storage_temperature: 'storage_temperature',
    special_instructions: 'special_instructions',
    status: 'is_deleted',
  }

  const apiFilters: Record<string, string> = {}
  Object.entries(search).forEach(([k, v]) => {
    if (!v) return
    const apiKey = filterMap[k]
    if (!apiKey) return
    if (k === 'status') {
      apiFilters[apiKey] = v === 'Active' ? 'false' : 'true'
      return
    }
    apiFilters[apiKey] = v
  })

  const { data: allData, loading, error, totalCount, refetch } = useFilteredTubes({
    page,
    pageSize,
    filters: apiFilters,
  })
  const [rowsState, setRowsState] = React.useState<any[]>([])
  const [inFlight, setInFlight] = React.useState<Set<string>>(new Set())
  const [toastOpen, setToastOpen] = React.useState(false)
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success')
  const [toastMsg, setToastMsg] = React.useState('')


  useEffect(() => {
    const mapped = (Array.isArray(allData) ? allData : []).map((d: any) => {
      const guid = d.guid || d.tube_guid || d.tubeGuid || ''
      const status = d.is_deleted ? 'Inactive' : 'Active'
      return { ...d, guid, status }
    })
    setRowsState(prev => {
      const prevMap = new Map(prev.map(r => [r.guid, r]))
      return mapped.map(r => {
        const existing = prevMap.get(r.guid)
        if (existing) {
          if (inFlight.has(r.guid)) return existing
          return { ...r, status: existing.status }
        }
        return r
      })
    })
  }, [allData, inFlight])

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        // For tubes, we use rowsState which contains current page data.
        // Ideally we should fetch all for export if selection spans multiple pages.
        const selectedItems = rowsState.filter((item: any) => externalSelectedGuids?.includes(item.guid));
        
        // Map to only include visible table columns
        const exportData = selectedItems.map((item: any) => ({
          "Tube Name": item.tube_name ?? "--",
          "Quantity": item.quantity ?? "--",
          "Storage Temperature": item.storage_temperature ?? "--",
          "Special Instructions": item.special_instructions ?? "--",
          "Status": item.is_deleted ? "Inactive" : "Active"
        }));
        
        exportToCSV(exportData, 'test-tubes');
        if (onExportComplete) {
          onExportComplete(selectedItems.length);
        }
      } catch (err) {
        console.error('Failed to export tubes:', err);
      }
    }
  }), [rowsState, externalSelectedGuids, onExportComplete]);

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

  async function updateTubeStatus(guid: string) {
    const current = rowsState.find(r => r.guid === guid)?.status as ('Active' | 'Inactive' | undefined)
    if (!current) {
      setToastType('error')
      setToastMsg('Missing tube identifier')
      setToastOpen(true)
      return
    }
    const next: 'Active' | 'Inactive' = current === 'Active' ? 'Inactive' : 'Active'
    setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: next } : r))
    setInFlight(prev => new Set(prev).add(guid))
    try {
      const res = await deleteTubeByGuid(guid)
      const ok = !!(res && res.status === 200)
      if (!ok) {
        setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
        setToastType('error')
        setToastMsg(res?.message || 'Status update failed')
        setToastOpen(true)
      } else {
        setToastType('success')
        setToastMsg(`Tube status set to ${next}`)
        setToastOpen(true)
      }
    } catch (e: any) {
      setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, status: current } : r))
      setToastType('error')
      setToastMsg(e?.message || 'Status update failed')
      setToastOpen(true)
    } finally {
      setInFlight(prev => { const n = new Set(prev); n.delete(guid); return n })
    }
  }

  const pageWindow = 1
  const makePages = () => {
    const pages: (number | string)[] = []
    const first = 1
    const last = Math.max(1, Math.ceil((totalCount || 0) / pageSize))
    const start = Math.max(first, page - pageWindow)
    const end = Math.min(last, page + pageWindow)
    pages.push(first)
    if (start > first + 1) pages.push('…')
    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) pages.push(p)
    }
    if (end < last - 1) pages.push('…')
    if (last > first) pages.push(last)
    return pages
  }

  const pageData = rowsState
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))

  const areAllVisibleSelected = pageData.length > 0 && pageData.every((row: any) => row.guid && isRowSelected(row.guid));

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto h-[calc(100vh-235px)] scrollbar-custom">
        <table className="min-w-full text-sm text-gray-700">
          <thead className='sticky top-0 z-20'>
            {/* Column Headers */}
            <tr className="bg-[#EDF3EF] text-gray-800">
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
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
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Tube Name
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Quantity
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Storage Temperature
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                Special Instructions
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 w-[160px] min-w-[160px] max-w-[160px]">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-gray-200 rounded-tr-2xl">
                Actions
              </th>
            </tr>
            <tr className="bg-[#EDF3EF]">
              <th className="px-4 py-2 border-b border-gray-200"></th>

              {/* TUBE NAME */}
              <th className="px-4 py-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full px-3 py-1 rounded-full border border-gray-200 text-sm 
                              focus:outline-none pr-8"
                    value={search.tube_name}
                    onChange={(e) => { setSearch({ ...search, tube_name: e.target.value }) }}
                  />
                  {search.tube_name && (
                    <button
                      onClick={() => { setSearch({ ...search, tube_name: '' }) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* QUANTITY */}
              <th className="px-4 py-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full px-3 py-1 rounded-full border border-gray-200 text-sm 
                              focus:outline-none pr-8"
                    value={search.quantity}
                    onChange={(e) => { setSearch({ ...search, quantity: e.target.value }) }}
                  />
                  {search.quantity && (
                    <button
                      onClick={() => { setSearch({ ...search, quantity: '' }) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* STORAGE TEMPERATURE  USING StatusDropdown */}
              <th className="px-4 py-2 border-b border-gray-200">
                <StatusDropdown
                  value={search.storage_temperature}
                  options={Object.values(StorageTemperatureEnum)}
                  onChange={(value) => { setSearch({ ...search, storage_temperature: value }) }}
                  placeholder="Storage Temp"
                  dropdownWidth={210}
                />
              </th>

              {/* SPECIAL INSTRUCTIONS */}
              <th className="px-4 py-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full px-3 py-1 rounded-full border border-gray-200 text-sm 
                              focus:outline-none pr-8"
                    value={search.special_instructions}
                    onChange={(e) => { setSearch({ ...search, special_instructions: e.target.value }) }}
                  />
                  {search.special_instructions && (
                    <button
                      onClick={() => { setSearch({ ...search, special_instructions: '' }) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* STATUS USING StatusDropdown */}
              <th className="px-4 py-2 border-b border-gray-200 w-[160px] min-w-[160px] max-w-[160px]">
                <StatusDropdown
                  value={search.status}
                  options={['Active', 'Inactive']}
                  onChange={(value) => { setSearch({ ...search, status: value }) }}
                  placeholder="Select"
                />
              </th>

              <th className="px-4 py-2 border-b border-gray-200"></th>
            </tr>

          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                </div>
              </td>
            </tr>
            ) : error ? (
              <tr><td className="px-4 py-6 text-center text-red-600" colSpan={7}>{error}</td></tr>
            ) : pageData.length === 0 ? (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No tubes data</td></tr>
            ) : (
              pageData.map((row, i) => {
                const tubeGuid =
                  (row as any).guid ||
                  (row as any).tube_guid ||
                  (row as any).tubeGuid
                return (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-white'
                      } border-b border-gray-100 hover:bg-green-50 transition`}
                  >
                    <td className="px-2 py-3">
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
                    <td className="px-4 py-3 font-medium">{row.tube_name}</td>
                    <td className="px-4 py-3">{row.quantity ?? '--'}</td>
                    <td className="px-4 py-3">{row.storage_temperature ?? '--'}</td>
                    <td className="px-4 py-3">{row.special_instructions != "{}" ? row.special_instructions : '--'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border font-medium ${row.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700 border-green-300'}`}>
                        {row.status}
                        {inFlight.has(tubeGuid) && (
                          <svg className="animate-spin h-3 w-3 text-current" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-green-600">
                        <Eye
                          onClick={() => {
                            if (tubeGuid) {
                              router.push(`/records/testtubes/view?tube_guid=${tubeGuid}`)
                            } else {
                              setToastType('error')
                              setToastMsg('Missing tube identifier')
                              setToastOpen(true)
                            }
                          }}
                          className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                        />
                        {canEdit() && (
                          <Pencil
                            onClick={() => {
                              if (tubeGuid) {
                                router.push(`/records/testtubes/new?mode=edit&tube_guid=${tubeGuid}`)
                              } else {
                                setToastType('error')
                                setToastMsg('Missing tube identifier')
                                setToastOpen(true)
                              }
                            }}
                            className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                          />
                        )}
                        {canDelete() && (
                          <button
                            type="button"
                            onClick={() => tubeGuid && !inFlight.has(tubeGuid) && updateTubeStatus(tubeGuid)}
                            disabled={inFlight.has(tubeGuid)}
                            className={`p-1 rounded transition hover:bg-gray-100 
                            ${inFlight.has(tubeGuid) ? "opacity-40 cursor-not-allowed" : ""}`}
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl">
        {/* Left: items per page + range */}
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
            {pageData.length === 0 ? '0-0' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)}`} of {totalCount}
          </span>
        </div>

        {/* Right: pager */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button
            disabled={page === 1}
            onClick={() => { setPage(1) }}
            className="px-2 py-1 text-xs border rounded disabled:opacity-50"
          >
            « First
          </button>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 text-xs border rounded disabled:opacity-50"
          >
            ‹ Back
          </button>
          {makePages().map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>
            )
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 text-xs border rounded disabled:opacity-50"
          >
            Next ›
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
            className="px-2 py-1 text-xs border rounded disabled:opacity-50"
          >
            Last »
          </button>
        </div>
      </div>
      {/* Confirmation modal removed in favor of inline optimistic toggle */}
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />
    </div>
  )
});

TubeTable.displayName = 'TubeTable';

export default TubeTable
