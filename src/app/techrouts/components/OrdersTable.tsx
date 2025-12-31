"use client";
import React, { useState } from "react";
import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS_ALL_ORDERS } from "../../../lib/orderEnums";
import StatusFilterDropdown from "@/components/common/StatusFilterDropdown";
import Tooltip from "@/components/common/ToolTip";

const statusColors: Record<string, string> = {
  PENDING: "bg-[#FFF4D6] text-[#CA8A04]",
  REJECTED: "bg-[#FFE2E2] text-[#DC2626]",
  ASSIGNED: "bg-[#E0EDFF] text-[#2563EB]",
  COMPLETED: "bg-[#DFFBEA] text-[#059669]",
  CANCELLED: "bg-[#FFE2E2] text-[#DC2626]",
};

interface OrdersTableProps {
  data: any[]
  page: number
  pageSize: number
  totalPages: number
  limit: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  selectedOrders: string[]
  onSelectionChange: (selected: string[]) => void
}

const OrdersTable: React.FC<OrdersTableProps> = ({ data, page, pageSize, totalPages, limit, total, onPageChange, onPageSizeChange, selectedOrders, onSelectionChange }) => {
  const router = useRouter();

  const [search, setSearch] = useState<any>({
    phlebio_order_id: "",
    patient_name: "",
    service_address: "",
    status: [] as string[],
  });

  const orders = Array.isArray(data) ? data : [];

  const filteredOrders = orders.filter((o: any) => {
    const orderId = String(o?.phlebio_order_id ?? '').toLowerCase()
    const patientName = `${o?.patient?.first_name ?? ''} ${o?.patient?.middle_name ?? ''} ${o?.patient?.last_name ?? ''}`.trim().toLowerCase()
    const serviceAddress = (o?.service_address || "").trim().toLowerCase()
    const status = String(o?.status ?? '').toUpperCase()

    const qOrder = String(search.phlebio_order_id || '').toLowerCase()
    const qPatient = String(search.patient_name || '').toLowerCase()
    const qAddress = String(search.service_address || '').toLowerCase()
    const qStatus = (Array.isArray(search.status) ? search.status : []).map((s: string) => s.toUpperCase());

    return (
      (!qOrder || orderId.includes(qOrder)) &&
      (!qPatient || patientName.includes(qPatient)) &&
      (!qAddress || serviceAddress.includes(qAddress)) &&
      (qStatus.length === 0 || qStatus.includes(status))
    )
  })

  const updateFilter = (key: string, value: any) => {
    setSearch((prev: any) => ({ ...prev, [key]: value }));
  };

  // Handle individual row selection
  const handleRowSelect = (orderGuid: string) => {
    if (selectedOrders.includes(orderGuid)) {
      onSelectionChange(selectedOrders.filter(guid => guid !== orderGuid));
    } else {
      onSelectionChange([...selectedOrders, orderGuid]);
    }
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    const currentPageOrderGuids = filteredOrders
      .map((o: any) => o?.order_guid)
      .filter((guid: string) => guid);

    const allSelected = currentPageOrderGuids.every((guid: string) =>
      selectedOrders.includes(guid)
    );

    if (allSelected) {
      // Deselect all on current page
      onSelectionChange(
        selectedOrders.filter(guid => !currentPageOrderGuids.includes(guid))
      );
    } else {
      // Select all on current page
      const newSelection = [...selectedOrders];
      currentPageOrderGuids.forEach((guid: string) => {
        if (!newSelection.includes(guid)) {
          newSelection.push(guid);
        }
      });
      onSelectionChange(newSelection);
    }
  };

  // Check if all rows on current page are selected
  const isAllSelected = () => {
    const currentPageOrderGuids = filteredOrders
      .map((o: any) => o?.order_guid)
      .filter((guid: string) => guid);

    return currentPageOrderGuids.length > 0 &&
      currentPageOrderGuids.every((guid: string) => selectedOrders.includes(guid));
  };

  const pageWindow = 1;
  const makePages = () => {
    const pages: (number | string)[] = [];
    const add = (p: number | string) => pages.push(p);
    const first = 1;
    const last = totalPages;
    const start = Math.max(first, page - pageWindow);
    const end = Math.min(last, page + pageWindow);
    add(first);
    if (start > first + 1) add("…");
    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) add(p);
    }
    if (end < last - 1) add("…");
    if (last > first) add(last);
    return pages;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-[calc(80vh-230px)] scrollbar-custom flex flex-col">
      <div className="overflow-auto flex-1 scrollbar-custom">
        <table className="w-full text-xs text-gray-700 min-w-full">
          <thead>
            <tr
              className="bg-[#F2F6F3] text-gray-800 sticky top-0 z-30"
              style={{ height: 48 }}
            >
              <th className="px-4 py-3 border-b text-left rounded-tl-2xl">
                <input
                  type="checkbox"
                  className="accent-green-600 cursor-pointer"
                  checked={isAllSelected()}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 border-b text-left font-semibold">Order</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Patient Name</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Service Address</th>
              <th className="px-4 py-3 border-b text-left font-semibold">Status</th>
              <th className="px-4 py-3 border-b text-left rounded-tr-2xl"></th>
            </tr>

            <tr
              className="bg-[#F2F6F3] sticky z-20"
              style={{ top: 48 }}
            >
              <th></th>

              {/* Order Search */}
              <th className="px-4 py-2 border-b">
                <div className="relative">
                  <input
                    value={search.phlebio_order_id}
                    onChange={(e) => updateFilter("phlebio_order_id", e.target.value)}
                    placeholder="Search"
                    className="w-full ps-8 pr-8 py-1.5 rounded-full border border-gray-200 text-sm focus:ring-green-200 focus:outline-none"
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  {search.phlebio_order_id && (
                    <button
                      onClick={() => updateFilter("phlebio_order_id", "")}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </th>
              <th className="px-4 py-2 border-b">
                <div className="relative">
                  <input
                    value={search.patient_name}
                    onChange={(e) => updateFilter("patient_name", e.target.value)}
                    placeholder="Search"
                    className="w-full ps-8 pr-8 py-1.5 rounded-full border border-gray-200 text-sm focus:ring-green-200 focus:outline-none"
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  {search.patient_name && (
                    <button
                      onClick={() => updateFilter("patient_name", "")}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </th>

              <th className="px-4 py-2 border-b">
                <div className="relative">
                  <input
                    value={search.service_address}
                    onChange={(e) => updateFilter("service_address", e.target.value)}
                    placeholder="Search"
                    className="w-full ps-8 pr-8 py-1.5 rounded-full border border-gray-200 text-sm focus:ring-green-200 focus:outline-none"
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  {search.service_address && (
                    <button
                      onClick={() => updateFilter("service_address", "")}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </th>

              <th className="px-4 py-2 border-b w-40">
                <StatusFilterDropdown
                  selectedStatuses={search.status}
                  onChange={(statuses) => updateFilter("status", statuses)}
                  options={STATUS_OPTIONS_ALL_ORDERS}
                />
              </th>

              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2 pt-10">
                    <p className="text-sm font-medium">No orders found</p>
                    <p className="text-xs text-gray-400">Select a technician and date to view orders</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o: any, i: number) => {
                const orderId = o?.phlebio_order_id ?? "";
                const patientName = `${o?.patient?.first_name ?? ""} ${o?.patient?.middle_name ?? ""} ${o?.patient?.last_name ?? ""}`.trim();
                const serviceAddress = (o?.service_address || "").trim();
                const status = o?.status ?? "";
                const statusKey = typeof status === "string" ? status.toUpperCase() : "";

                return (
                  <tr key={i} className="border-b bg-white">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="accent-green-600 cursor-pointer"
                        checked={selectedOrders.includes(o?.order_guid || "")}
                        onChange={() => handleRowSelect(o?.order_guid)}
                      />
                    </td>
                    <td className="px-4 py-3">{orderId}</td>
                    <td className="px-4 py-3">{patientName}</td>
                    <td className="px-4 py-3">
                      <Tooltip text={serviceAddress}>
                        {serviceAddress}
                      </Tooltip>
                    </td>
                    <td className="px-1 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[statusKey] || "bg-gray-100 text-gray-600"}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!o?.order_guid) return;
                          router.push(`/orders/view?orderGuid=${o.order_guid}&readonly=true`);
                        }}
                      >
                        <Eye className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 z-40 bg-[#F9FAFB] border-t border-gray-100 rounded-b-2xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Items per page:</span>
              <select
                className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-green-600"
                value={pageSize}
                onChange={(e) => {
                  onPageChange(1);
                  onPageSizeChange(Number(e.target.value));
                }}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {(() => {
              const perPage = Number(limit || pageSize) || 10;
              const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
              const endIdx = Math.min(page * perPage, total);
              return <span className="text-xs text-gray-600">{startIdx}-{endIdx} of {total}</span>;
            })()}
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(1)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              « First
            </button>
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              ‹ Back
            </button>
            {makePages().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(p)}
                  className={`px-3 py-1 text-xs border rounded ${page === p ? "bg-green-600 text-white" : ""}`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="px-2 text-xs text-gray-500">
                  {p}
                </span>
              )
            )}
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(totalPages)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              Last »
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default OrdersTable;
