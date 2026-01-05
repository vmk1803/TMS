"use client";
import React, { useEffect, useState, useRef } from "react";
import { Eye, X } from "lucide-react";
import MileageDetailsView from "./MileageDetailsView";
import { useTravelMileage } from "../hooks/useTravelMileage";
import DateOfBirthPicker from "@/components/common/DateOfBirthPicker";
import { getTravelMileageByGuid } from "../services/travelMileageService";
import StatusFilterDropdown from "@/components/common/StatusFilterDropdown";

const TravelMileageTable = ({
  setIsDetailView,
  selectedRows = [],
  setSelectedRows,
  technicianFilter,
  dateFilter,
}: any) => {
  /* eslint-disable react-hooks/exhaustive-deps */
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({
    phlebio_order_id: "",
    technician: "",
    phlebio_travel_miles: "",
    patient_name: "",
    date_of_birth: "",
    partner_name: "",
    performed_date: "",
    residence_type: "",
    insurance_name: "",
    test_name: "",
    service_address: "",
  });
  // const [technician, setTechnician] = useState(""); // Removed local state
  // const [date, setDate] = useState(""); // Removed local state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    data = [],
    loading,
    error,
    totalPages,
    limit,
    total,
    filters,
    setFilters,
  } = useTravelMileage(1, 10);

  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Frontend filtering based on status filter
  useEffect(() => {
    if (statusFilter && statusFilter.length > 0) {
      const filtered = data.filter((item: any) => {
        const itemStatus = item.trip?.status;
        return itemStatus && statusFilter.includes(itemStatus);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [data, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const newFilters: any = {};
      // Remove default statuses - let frontend handle status filtering
      // newFilters.statuses = ["PERFORMED", "DELIVERED TO LAB", "ARRIVED"];

      // Global Filters
      if (technicianFilter) {
        newFilters.technician_guid = technicianFilter;
      }
      if (dateFilter) {
        newFilters.performed_date = dateFilter;
      }
      // Remove status filter from API call - handled in frontend
      // if (statusFilter && statusFilter.length > 0) {
      //   newFilters.statuses = statusFilter;
      // }

      // Column Filters - Merge and override if handled above, or add new
      Object.entries(columnFilters).forEach(([key, value]) => {
        if (value) {
          // Don't overwrite global technician/date filters if they exist
          if (key === 'technician' && technicianFilter) return;
          if (key === 'technician_guid' && technicianFilter) return;
          if (key === 'performed_date' && dateFilter) return;

          // Map column filter names to API filter names
          if (key === 'phlebio_travel_miles') {
            newFilters.travel_miles = value;
            return;
          }
          if (key === 'residence_type') {
            newFilters.residency_type = value;
            return;
          }
          if (key === 'test_name') {
            newFilters.labtests_collected = value;
            return;
          }
          if (key === 'service_address') {
            newFilters.service_address = value;
            return;
          }

          newFilters[key] = value;
        }
      });

      setFilters(newFilters);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [technicianFilter, dateFilter, columnFilters, setFilters]);

  // Helper to update column filters
  const handleColumnFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all visible rows
      const newSelected = [...selectedRows];
      filteredData.forEach((row: any) => {
        if (
          !newSelected.some(
            (selected) => selected.order?.phlebio_order_id === row.order?.phlebio_order_id
          )
        ) {
          newSelected.push(row);
        }
      });
      setSelectedRows(newSelected);
    } else {
      // Deselect all visible rows
      const newSelected = selectedRows.filter(
        (selected: any) =>
          !filteredData.some(
            (row: any) => row.order?.phlebio_order_id === selected.order?.phlebio_order_id
          )
      );
      setSelectedRows(newSelected);
    }
  };

  const handleSelectRow = (row: any) => {
    const isSelected = selectedRows.some(
      (selected: any) => selected.order?.phlebio_order_id === row.order?.phlebio_order_id
    );
    if (isSelected) {
      setSelectedRows(
        selectedRows.filter(
          (selected: any) => selected.order?.phlebio_order_id !== row.order?.phlebio_order_id
        )
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((row: any) =>
      selectedRows.some(
        (selected: any) => selected.order?.phlebio_order_id === row.order?.phlebio_order_id
      )
    );

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

  const getFullName = (t: any) => {
    if (!t) return "";
    if (typeof t === "string") return t;
    return `${t.first_name ?? ""} ${t.middle_name ?? ""} ${t.last_name ?? ""
      }`.trim();
  };

  const handleView = async (row: any) => {
    setOrderDetailLoading(true);
    try {
      const tripDetails = await getTravelMileageByGuid(row.trip?.guid);
      setSelectedItem(tripDetails.data?.[0] || tripDetails);
      setIsDetailView(true);
    } catch (error) {
      console.error('Failed to fetch travel mileage details:', error);
      // Fallback to row data if API call fails
      setSelectedItem(row);
      setIsDetailView(true);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedItem(null);
    setIsDetailView(false);
  };

  // CSV Export function for travel mileage data
  const downloadTravelMileageCsv = (travelData: any[], filename = 'travel-mileage.csv') => {
    if (!travelData || travelData.length === 0) return;

    const escapeCsv = (value: any): string => {
      if (value === null || value === undefined) return '';
      let s = String(value);
      s = s.replace(/\r\n|\r/g, '\n');
      return s.includes('"') || s.includes(',') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    // Define CSV columns for travel mileage
    const headers = [
      'Order ID',
      'Technician',
      'Miles',
      'Patient Name',
      'Date of Birth',
      'Client Name',
      'Performed Date',
      'Residence Type',
      'Insurance Name',
      'Performed Tests',
      'Address',
      'Status'
    ];

    const rows = [headers.join(',')];

    for (const item of travelData) {
      const row = [
        escapeCsv(item.order?.phlebio_order_id || ''),
        escapeCsv(getFullName(item.technician)),
        escapeCsv(item.trip?.actual_distance_miles || ''),
        escapeCsv(getFullName(item.order?.patient)),
        escapeCsv(item.order?.patient?.date_of_birth
          ? new Date(item.order.patient.date_of_birth).toLocaleDateString("en-US").replace(/\//g, "-")
          : ''),
        escapeCsv(item.order?.partner?.name || ''),
        escapeCsv(item.trip?.trip_date
          ? new Date(item.trip.trip_date).toLocaleDateString("en-US").replace(/\//g, "-")
          : ''),
        escapeCsv(item.trip?.residence_type || ''),
        escapeCsv(item.order?.primary_insurance?.name || ''),
        escapeCsv(item.trip?.labtests_collected || ''),
        escapeCsv(item.order?.service_address || ''),
        escapeCsv(item.trip?.status || '')
      ];
      rows.push(row.join(','));
    }

    const csvString = rows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {selectedItem ? (
        <MileageDetailsView data={selectedItem} onBack={handleBack} loading={orderDetailLoading} />
      ) : (
        <div className="w-full bg-white border border-[#BDD8C5] rounded-2xl shadow-sm overflow-hidden">
          {/* <div className="flex flex-wrap justify-between items-center gap-4 p-4 border-b border-gray-100">
            <div className="flex items-center w-full md:w-1/3 relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full bg-[#F8FAFC] border border-[#DDE2E5] px-4 py-2 pl-9 text-sm text-gray-600 focus:outline-none"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="bg-[#F8FAFC] border border-[#DDE2E5] rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none"
              >
                <option value="">Select Technician</option>
                <option value="John Smith">John Smith</option>
                <option value="Jane Doe">Jane Doe</option>
              </select>

              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#DDE2E5] rounded-full px-4 py-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm text-gray-600 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div> */}

          <div className="overflow-x-auto h-[calc(100vh-255px)] scrollbar-custom">
            <table className="min-w-max w-full text-xs text-primaryText">
              <thead className="bg-[#EDF3EF] text-[#344256] sticky top-0 z-[10] font-semibold uppercase text-xs border-b">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ accentColor: "#009728" }}
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Order Id</th>
                  <th className="px-4 py-2 text-left">Technician</th>
                  <th className="px-4 py-2 text-left">Miles</th>
                  <th className="px-4 py-2 text-left">Patient Name</th>
                  <th className="px-4 py-2 text-left">Dob</th>
                  <th className="px-4 py-2 text-left">Client Name</th>
                  <th className="px-4 py-2 text-left">Performed Date</th>
                  <th className="px-4 py-2 text-left">Residence Type</th>
                  <th className="px-4 py-2 text-left">Insurance Name</th>
                  <th className="px-4 py-2 text-left">Performed Tests</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left sticky !right-[80px] w-[150px] min-w-[150px] z-[9] bg-[#EDF3EF]">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left sticky right-0 w-[50px] min-w-[50px] z-[9] bg-[#EDF3EF]">
                    Actions
                  </th>
                </tr>
                <tr>
                  <th className="px-4 pb-2 border-b border-gray-200"></th>

                  {/* Order ID */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.phlebio_order_id}
                        onChange={(e) =>
                          handleColumnFilterChange("phlebio_order_id", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.phlebio_order_id && (
                        <button
                          onClick={() => handleColumnFilterChange("phlebio_order_id", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Technician */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.technician}
                        onChange={(e) =>
                          handleColumnFilterChange("technician", e.target.value)
                        }
                        disabled={!!technicianFilter}
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.technician && !technicianFilter && (
                        <button
                          onClick={() => handleColumnFilterChange("technician", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Miles */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.phlebio_travel_miles}
                        onChange={(e) =>
                          handleColumnFilterChange("phlebio_travel_miles", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.phlebio_travel_miles && (
                        <button
                          onClick={() => handleColumnFilterChange("phlebio_travel_miles", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Patient Name */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.patient_name}
                        onChange={(e) =>
                          handleColumnFilterChange("patient_name", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.patient_name && (
                        <button
                          onClick={() => handleColumnFilterChange("patient_name", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* DOB */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <DateOfBirthPicker
                      onChange={(date) =>
                        handleColumnFilterChange("date_of_birth", date || "")
                      }
                      value={columnFilters.date_of_birth}
                      placeholder="MM-DD-YYYY"
                      className="rounded-full font-normal text-sm border border-gray-200 bg-white"
                    />
                  </th>

                  {/* Client Name */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.partner_name}
                        onChange={(e) =>
                          handleColumnFilterChange("partner_name", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.partner_name && (
                        <button
                          onClick={() => handleColumnFilterChange("partner_name", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Performed Date */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <DateOfBirthPicker
                      onChange={(date) =>
                        handleColumnFilterChange("performed_date", date || "")
                      }
                      value={columnFilters.performed_date}
                      placeholder="MM-DD-YYYY"
                      className="rounded-full font-normal text-sm border border-gray-200 bg-white"
                    />
                  </th>

                  {/* Residence Type */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.residence_type}
                        onChange={(e) =>
                          handleColumnFilterChange("residence_type", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.residence_type && (
                        <button
                          onClick={() => handleColumnFilterChange("residence_type", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Insurance */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.insurance_name}
                        onChange={(e) =>
                          handleColumnFilterChange("insurance_name", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.insurance_name && (
                        <button
                          onClick={() => handleColumnFilterChange("insurance_name", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Performed Tests */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.test_name}
                        onChange={(e) =>
                          handleColumnFilterChange("test_name", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.test_name && (
                        <button
                          onClick={() => handleColumnFilterChange("test_name", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Address */}
                  <th className="px-4 pb-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={columnFilters.service_address}
                        onChange={(e) =>
                          handleColumnFilterChange("service_address", e.target.value)
                        }
                        className="rounded-full font-normal ps-8 py-2 w-full text-sm pr-8 border border-gray-200"
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

                      {columnFilters.service_address && (
                        <button
                          onClick={() => handleColumnFilterChange("service_address", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>

                  {/* Status Filter Column */}
                  <th className="px-4 pb-2 border-b border-gray-200 sticky !right-[80px] w-[150px] min-w-[150px] z-[9] bg-[#EDF3EF]">
                    {/* <div className="relative">
                <select
                  className="
                    w-full text-sm px-3 py-2 rounded-full
                    bg-white cursor-pointer  pr-8
                  relative"
                >
                  <option value="">Select</option>
                  <option className="bg-white hover:bg-green-50" value="">
                    Performed
                  </option>
                  <option className="bg-white hover:bg-green-50" value="">
                    Deliver to lab
                  </option>
                </select>
                  <button
                    className="absolute right-7 top-1/2 -translate-y-1/2 
                          text-gray-400 "
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                            <svg
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                           </div> */}
                    <StatusFilterDropdown
                      selectedStatuses={statusFilter}
                      onChange={setStatusFilter}
                    />
                  </th>

                  {/* Actions column */}
                  <th className="px-4 pb-2 border-b border-gray-200 sticky right-0 w-[50px] min-w-[50px] z-[9] bg-[#EDF3EF]"></th>
                </tr>

              </thead>
              <tbody>
                {!loading && (!filteredData || filteredData.length === 0) ? (
           <tr>
            <td colSpan={14} className="relative h-[300px]">
              <div className="sticky left-0 w-full h-full flex flex-col items-center justify-center text-gray-500">
           

                <p className="text-lg font-medium">No data found</p>
                <p className="text-sm mt-2">
                  There are no travel mileage records available
                </p>
              </div>
            </td>
          </tr>

                ) : (
                  (filteredData || []).map((row: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b text-[#344256] font-normal hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.some(
                            (selected: any) =>
                              selected.order?.phlebio_order_id === row.order?.phlebio_order_id
                          )}
                          onChange={() => handleSelectRow(row)}
                          style={{ accentColor: "#009728" }}
                        />
                      </td>
                      <td className="p-3">{row?.order?.phlebio_order_id}</td>
                      <td className="p-3">{getFullName(row?.technician)}</td>
                      <td className="p-3">{row?.trip?.actual_distance_miles ?? "--"}</td>
                      <td className="p-3">{getFullName(row?.order?.patient)}</td>
                      <td className="p-3">
                        {row?.order?.patient?.date_of_birth
                          ? new Date(row.order.patient.date_of_birth)
                            .toLocaleDateString("en-US")
                            .replace(/\//g, "-")
                          : "--"}
                      </td>
                      <td className="p-3">{row?.order?.partner?.name ?? "--"}</td>
                      <td className="p-3">
                        {row?.trip?.trip_date
                          ? new Date(row.trip.trip_date)
                            .toLocaleDateString("en-US")
                            .replace(/\//g, "-")
                          : "--"}
                      </td>
                      <td className="p-3">{row?.trip?.residence_type ?? "--"}</td>
                      <td className="p-3">
                        {row?.order?.primary_insurance?.name ?? "--"}
                      </td>
                      <td className="p-3">{row?.trip?.labtests_collected ?? "--"}</td>
                      <td className="p-3">{row?.order?.service_address ?? "--"}</td>
                      <td className="p-3 sticky !right-[80px] w-[150px] min-w-[150px] z-[9] bg-[#fff]">
                        <span
                          className={`font-medium ${row?.trip?.status === "PERFORMED"
                            ? "bg-blue-100 text-blue-600 px-4 py-1 rounded-full min-w-[100px]"
                            : row?.trip?.status === "DELIVERED TO LAB"
                              ? "bg-green-100 text-green-600 px-4 py-1 rounded-full min-w-[100px]"
                              : "bg-orange-100 text-orange-500 px-4 py-1 rounded-full min-w-[100px]"
                            }`}
                        >
                          {row?.trip?.status ?? ""}
                        </span>
                      </td>
                      <td className="p-3 text-green-600 sticky right-0 w-[50px] min-w-[50px] z-[9] bg-[#fff]">
                        <Eye
                          className="w-4 h-4 cursor-pointer hover:scale-110 transition"
                          onClick={() => handleView(row)}
                        />
                      </td>
                    </tr>
                  ))
                )}
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
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              {/* CSV export handled by top Export CSV button in filters */}
              {(() => {
                const perPage = Number(limit || pageSize) || 10;
                const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
                const endIdx = Math.min(page * perPage, total);
                return (
                  <span className="text-xs text-gray-600">
                    {startIdx}-{endIdx} of {total}
                  </span>
                );
              })()}
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
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
              {makePages().map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={idx}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs border rounded ${page === p ? "bg-green-600 text-white" : ""
                      }`}
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
        </div>
      )}
    </>
  );
};

export default TravelMileageTable;
