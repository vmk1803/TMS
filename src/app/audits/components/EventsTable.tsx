"use client";
import React, { use, useEffect } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseGlobalAuditsReturn } from '../hooks/globalAuditsHook';
import { formatUTCToCSTString } from "../services/GlobalAuditsService";

interface EventsTableProps {
  audits: UseGlobalAuditsReturn;
  selectedRows?: any[];
  setSelectedRows?: (rows: any[]) => void;
}

const EventsTable: React.FC<EventsTableProps> = ({ audits, selectedRows = [], setSelectedRows }) => {
  const router = useRouter();
  const [auditsData, setAuditsData] = React.useState<any[]>([]);
  const { page, setPage, pageSize, setPageSize, data, loading, error, totalPages, limit, total, filters, setFilters, reload } = audits;

  useEffect(() => {
    setAuditsData(data);
  }, [data, filters, page, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setSelectedRows) return;
    if (e.target.checked) {
      // Select all visible rows
      const newSelected = [...selectedRows];
      auditsData.forEach((row: any) => {
        if (!newSelected.some((selected) => selected.guid === row.guid)) {
          newSelected.push(row);
        }
      });
      setSelectedRows(newSelected);
    } else {
      // Deselect all visible rows
      const newSelected = selectedRows.filter(
        (selected: any) => !auditsData.some((row: any) => row.guid === selected.guid)
      );
      setSelectedRows(newSelected);
    }
  };

  const handleSelectRow = (row: any) => {
    if (!setSelectedRows) return;
    const isSelected = selectedRows.some((selected: any) => selected.guid === row.guid);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((selected: any) => selected.guid !== row.guid));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const isAllSelected = auditsData.length > 0 && auditsData.every((row: any) => selectedRows.some((selected: any) => selected.guid === row.guid));

  const pageWindow = 1;
  const makePages = () => {
    const pages: (number | string)[] = []
    const add = (p: number | string) => pages.push(p)
    const first = 1
    const last = totalPages
    const start = Math.max(first, page - pageWindow)
    const end = Math.min(last, page + pageWindow)
    add(first)
    if (start > first + 1) add('…')
    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) add(p)
    }
    if (end < last - 1) add('…')
    if (last > first) add(last)
    return pages
  };
  return (
    <div className="rounded-xl border border-gray-200 overflow-auto scrollbar-custom">
      <div className="flex-1 overflow-auto h-[calc(100vh-332px)] scrollbar-custom">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-[#EDF3EF] text-[#344256] !text-xs uppercase sticky top-0 z-[10]">
          <tr>
            <th className="p-3 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                style={{ accentColor: '#009728' }}
              />
            </th>
            <th className="p-3 text-left">Timestamp</th>
            <th className="p-3 text-left">Entity Type</th>
            <th className="p-3 text-left">Action</th>
            <th className="p-3 text-left">Actor</th>
            <th className="p-3 text-left">Summary</th>
            <th className="p-3 text-center">Difference</th>
          </tr>
        </thead>
        <tbody className="!text-xs align-top">
          {auditsData.length === 0 && (
            <tr>
              <td colSpan={7} className="py-20 text-center text-text80 font-bold text-base">
                No Audits Found
              </td>
            </tr>
          )}
          {auditsData.map((item, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 transition">
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.some((selected: any) => selected.guid === item.guid)}
                  onChange={() => handleSelectRow(item)}
                  style={{ accentColor: '#009728' }}
                />
              </td>
              <td className="p-3">
                {formatUTCToCSTString(item.changed_at)}
              </td>
              <td className="p-3">
                <span className="px-3 py-1 bg-[#DDE2E5] text-[#495057] rounded-full text-xs font-medium">
                  {item.table_name}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={` py-1 rounded-full text-xs font-medium ${item.color}`}
                >
                  {item.action_type}
                </span>
              </td>
              <td className="p-3">{item.changed_person}</td>
              <td className="p-3">{item.reason}</td>
              <td className="p-3 text-center">
                <Eye onClick={() => router.push(`/audits/view?auditGuid=${item.guid}`)} className="w-4 h-4 text-secondary cursor-pointer inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3 border-t border-gray-100 bg-[#F9FAFB] rounded-b-2xl sticky bottom-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Items per page:</span>
            <select
              className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); }}
            >
              {[10, 25, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
          </div>
          {(() => {
            const perPage = Number(pageSize) || 10
            const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1
            const endIdx = Math.min(page * perPage, total)
            return (<span className="text-xs text-gray-600">{startIdx}-{endIdx} of {total}</span>)
          })()}
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">« First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">‹ Back</button>
          {makePages().map((p, idx) => typeof p === 'number' ? (
            <button key={idx} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${page === p ? 'bg-green-600 text-white' : ''}`}>{p}</button>
          ) : <span key={idx} className="px-2 text-xs text-gray-500">{p}</span>)}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next ›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Last »</button>
        </div>
      </div>
   </div>
  );
};

export default EventsTable;
