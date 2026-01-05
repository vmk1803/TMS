"use client";

import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { Eye, Pencil, ToggleLeft, ToggleRight, X } from "lucide-react";
import StatusDropdown from "../../../../components/common/StatusDropdown";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { searchParamsToFilters, updateUrlWithFilters, searchParamsToPagination } from "../../../../utils/filterPersistence";
import Toast from "../../../../components/common/Toast";
import { deleteTestByGuid } from "../services/labTestsService";
import { useLabTests } from "../hooks/useAllLabTests";
import { canEdit, canDelete } from "../../../../utils/rbac";

const SAMPLE_TYPES = ["BLOOD", "URINE", "SALIVA", "SWAB", "OTHER"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const ITEMS_PER_PAGE = 10;

export interface LabTestsTableRef {
  exportSelected: () => Promise<void>;
}

interface LabTestsTableProps {
  onSelectionChange?: (guids: string[]) => void;
  clearSelectionKey?: number;
  selectedGuids?: string[];
  onExportComplete?: (count: number) => void;
}

const LabTestsTable = forwardRef<LabTestsTableRef, LabTestsTableProps>(({ onSelectionChange, clearSelectionKey, selectedGuids: externalSelectedGuids, onExportComplete }, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize pagination state from URL parameters
  const paginationFromUrl = searchParamsToPagination(searchParams);
  const [page, setPage] = useState(paginationFromUrl.page);
  const [pageSize, setPageSize] = useState(paginationFromUrl.pageSize);

  // Initialize search state from URL parameters
  const [search, setSearch] = useState(() => {
    const urlFilters = searchParamsToFilters(searchParams, ['code', 'name', 'sampleType', 'tubeName', 'tat', 'fasting', 'active']);
    return {
      code: urlFilters.code || "",
      name: urlFilters.name || "",
      sampleType: urlFilters.sampleType || "",
      tubeName: urlFilters.tubeName || "",
      tat: urlFilters.tat || "",
      fasting: urlFilters.fasting || "",
      active: urlFilters.active || "",
    };
  });

  // Update URL when search filters change
  const DEBOUNCE_MS = 300;
  useEffect(() => {
    const id = setTimeout(() => {
      updateUrlWithFilters(router, pathname, search, page, pageSize);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search, router, pathname, page, pageSize]);

  const searchToApiFilterMap: Record<string, string> = {
    code: "test_code",
    name: "test_name",
    sampleType: "sample_type",
    tubeName: "tube_name",
    tat: "tat_minutes",
    fasting: "fasting",
    active: "is_deleted",
  };

  const apiFilters: Record<any, any> = {};
  Object.entries(search).forEach(([k, v]) => {
    if (!v || !searchToApiFilterMap[k]) return;
    if (k === 'fasting') {
      apiFilters[searchToApiFilterMap[k]] = v === 'Yes' ? true : false;
      return;
    }
    if (k === 'active') {
      apiFilters[searchToApiFilterMap[k]] = v === 'Active' ? 'false' : 'true';
      return;
    }
    apiFilters[searchToApiFilterMap[k]] = v;
  });

  // Fetch backend data using hook
  const { data, totalCount, loading, refetch } = useLabTests({
    page,
    pageSize,
    filters: apiFilters,
  });

  const [rowsState, setRowsState] = useState<any[]>([]);
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mapped = data.map((t: any) => ({
      guid: t.guid,
      code: t.test_code,
      name: t.test_name,
      sampleType: t.sample_type,
      tubeName: t.tube_name || "",
      tat: Math.ceil(t.tat_minutes / 60),
      fasting: t.fasting ? "Yes" : "No",
      active: t.is_deleted ? "Inactive" : "Active",
    }));
    setRowsState(prev => {
      const prevMap = new Map(prev.map(r => [r.guid, r]));
      return mapped.map(r => {
        const existing = prevMap.get(r.guid);
        if (existing) {
          if (inFlight.has(r.guid)) return existing;
          return { ...r, active: existing.active };
        }
        return r;
      });
    });
  }, [data, inFlight]);

  // Expose export method via ref
  useImperativeHandle(ref, () => ({
    exportSelected: async () => {
      try {
        const { exportToCSV } = await import('../../../../utils/exportToCSV');
        // Use rowsState for current page data.
        const selectedItems = rowsState.filter((item: any) => externalSelectedGuids?.includes(item.guid));
        
        // Map to only include visible table columns
        const exportData = selectedItems.map((item: any) => ({
          "Code": item.code ?? "--",
          "Name": item.name ?? "--",
          "Sample Type": item.sample_type ?? "--",
          "Tat (hrs)": item.tat ?? "--",
          "Fasting": item.fasting ?? "--",
          "Status": item.is_deleted ? "Inactive" : "Active"
        }));
        
        exportToCSV(exportData, 'lab-tests');
        if (onExportComplete) {
          onExportComplete(selectedItems.length);
        }
      } catch (err) {
        console.error('Failed to export lab tests:', err);
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

  const areAllVisibleSelected = rowsState.length > 0 && rowsState.every((row: any) => row.guid && isRowSelected(row.guid));

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [toastMessage, setToastMessage] = useState("");

  async function updateLabTestStatus(guid: string) {
    const current = rowsState.find(r => r.guid === guid)?.active as ("Active" | "Inactive" | undefined);
    if (!current) {
      setToastType("error");
      setToastMessage("Missing lab test identifier");
      setToastOpen(true);
      return;
    }
    const next: "Active" | "Inactive" = current === "Active" ? "Inactive" : "Active";
    setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, active: next } : r));
    setInFlight(prev => new Set(prev).add(guid));
    try {
      const res = await deleteTestByGuid(guid);
      const ok = !!(res && res.success);
      if (!ok) {
        setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, active: current } : r));
        setToastType("error");
        setToastMessage(res?.message || "Status update failed");
        setToastOpen(true);
      } else {
        setToastType("success");
        setToastMessage(`Lab Test status set to ${next}`);
        setToastOpen(true);
      }
    } catch (e: any) {
      setRowsState(prev => prev.map(r => r.guid === guid ? { ...r, active: current } : r));
      setToastType("error");
      setToastMessage(e?.message || "Status update failed");
      setToastOpen(true);
    } finally {
      setInFlight(prev => { const n = new Set(prev); n.delete(guid); return n; });
    }
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <div className="overflow-x-auto h-[calc(100vh-235px)] scrollbar-custom">
        <table className="min-w-max w-full text-sm text-gray-700">
          <thead className="bg-[#EDF3EF] sticky top-0 z-20 shadow-sm">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={areAllVisibleSelected}
                  style={{ accentColor: '#009728' }}
                  onChange={(e) => {
                    if (rowsState.length === 0) return;
                    if (areAllVisibleSelected) {
                      const visibleGuids = rowsState.map((row: any) => row.guid).filter(Boolean);
                      const remaining = (externalSelectedGuids || []).filter((g) => !visibleGuids.includes(g));
                      updateSelection(remaining);
                    } else {
                      const visibleGuids = rowsState.map((row: any) => row.guid).filter(Boolean);
                      const next = Array.from(new Set([...(externalSelectedGuids || []), ...visibleGuids]));
                      updateSelection(next);
                    }
                  }}
                  className="accent-green-600"
                />
              </th>
              <th className="px-4 py-2 text-left font-medium">Code</th>
              <th className="px-4 py-2 text-left font-medium ">Name</th>
              <th className="px-4 py-2 text-left font-medium ">Sample Type</th>
              <th className="px-4 py-2 text-left font-medium w-20 min-w-[80px] max-w-[80px]">Tat (hrs)</th>
              <th className="px-4 py-2 text-left font-medium ">Fasting</th>
              <th className="px-4 py-2 text-left font-medium ">Status</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
            <tr className="bg-[#EDF3EF] border-b border-gray-200">
              <th className="px-2 py-2" />
              <th className="px-4 py-2">
                <div className="relative">
                  <input
                    placeholder="Search"
                    className="w-full px-3 py-1.5 rounded-full bg-white border border-gray-300 
                              text-xs focus:ring-green-300 focus:border-green-500 outline-none pr-8"
                    value={search.code}
                    onChange={(e) => setSearch({ ...search, code: e.target.value })}
                  />
                  {search.code && (
                    <button
                      onClick={() => setSearch({ ...search, code: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* NAME */}
              <th className="px-4 py-2">
                <div className="relative">
                  <input
                    placeholder="Search"
                    className="w-full px-3 py-1.5 rounded-full bg-white border border-gray-300 
                              text-xs focus:ring-green-300 focus:border-green-500 outline-none pr-8"
                    value={search.name}
                    onChange={(e) => setSearch({ ...search, name: e.target.value })}
                  />
                  {search.name && (
                    <button
                      onClick={() => setSearch({ ...search, name: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* SAMPLE TYPE → STATUS DROPDOWN UI */}
              <th className="px-4 py-2">
                <StatusDropdown
                  value={search.sampleType}
                  options={SAMPLE_TYPES}
                  onChange={(value) => setSearch({ ...search, sampleType: value })}
                  placeholder="Sample Type"
                />
              </th>

              {/* TAT */}
              <th className="px-4 py-2 w-20 min-w-[80px] max-w-[80px]">
                <div className="relative">
                  <input
                    placeholder="Tat"
                    className="w-full px-3 py-1.5 rounded-full bg-white border border-gray-300 
                              text-xs focus:ring-green-300 focus:border-green-500 outline-none pr-8"
                    value={search.tat}
                    onChange={(e) => setSearch({ ...search, tat: e.target.value })}
                  />
                  {search.tat && (
                    <button
                      onClick={() => setSearch({ ...search, tat: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>

              {/* FASTING → STATUS DROPDOWN UI */}
              <th className="px-4 py-2">
                <StatusDropdown
                  value={search.fasting}
                  options={["Yes", "No"]}
                  onChange={(value) => setSearch({ ...search, fasting: value })}
                  placeholder="Fasting"
                />
              </th>

              {/* STATUS */}
              <th className="px-4 py-2">
                <StatusDropdown
                  value={search.active}
                  options={STATUS_OPTIONS}
                  onChange={(value) => setSearch({ ...search, active: value })}
                  placeholder="Select"
                />
              </th>

              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rowsState.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No Labtests found
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                  </div>
                </td>
              </tr>
            )}
            {rowsState.map((row, i) => (
              <tr
                key={row.guid}
                className={`border-b border-gray-100 hover:bg-green-50 transition`}
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
                <td className="px-4 py-3 font-medium">{row.code}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                    {row.sampleType}
                  </span>
                </td>
                <td className="px-4 py-3 min-w-[120px] max-w-[120px]">{row.tat}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium border ${row.fasting === 'Yes' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>{row.fasting}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-4 py-1 text-xs rounded-full border font-medium
                      ${row.active === "Active"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {row.active}
                      {inFlight.has(row.guid) && (
                        <svg className="animate-spin h-3 w-3 text-current" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      )}
                    </span>
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-green-600">
                    {canEdit() && (
                      <button
                        type="button"
                        onClick={() => router.push(`/records/lab-tests/edit/${row.guid}`)}
                        className="p-1 rounded hover:bg-green-100"
                        aria-label="Edit lab test"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => router.push(`/records/lab-tests/view?guid=${row.guid}`)}
                      className="p-1 rounded hover:bg-green-100"
                      aria-label="View lab test"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canDelete() && (
                      <button
                        type="button"
                        onClick={() => !inFlight.has(row.guid) && updateLabTestStatus(row.guid)}
                        aria-label="Toggle lab test status"
                        disabled={inFlight.has(row.guid)}
                        className={`p-1 rounded transition hover:bg-gray-100 
                        ${inFlight.has(row.guid) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {row.active === "Active" ? (
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
            {rowsState.length === 0 ? '0-0' : `${(page - 1) * pageSize + 1}-${(page - 1) * pageSize + rowsState.length}`} of {totalCount}
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
      {/* Confirmation modal removed: using optimistic toggle */}
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
});

LabTestsTable.displayName = 'LabTestsTable';

export default LabTestsTable;
