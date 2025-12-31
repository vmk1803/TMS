"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  OrdersSummaryRangeOption,
  CustomDateRange,
} from "../../../hooks/useDashboardDateFilters";
import { getTechRoutes, type StatusCount } from "../../techrouts/services/techRoutesService";
import AllDatesPicker from "@/components/common/AllDatesPicker";

const DASHBOARD_RANGE_OPTIONS: OrdersSummaryRangeOption[] = [
  "Today",
  "Yesterday",
  "Last Week",
  "Last Month",
  "Last Year",
  "Custom",
];

const DashboardOrdersSummary: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [selectedOption, setSelectedOption] = useState<OrdersSummaryRangeOption>("Today");
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    fromDate: null,
    toDate: null,
  });
  const [statusCount, setStatusCount] = useState<StatusCount | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date
  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}-${day}-${year}`;
  };

  // Get date range based on selected option
  const getDateRange = () => {
    const today = new Date();

    if (selectedOption === "Yesterday") {
      const d = new Date(today);
      d.setDate(today.getDate() - 1);
      const formatted = formatDate(d);
      return { created_from: formatted, created_to: formatted };
    }

    if (selectedOption === "Last Week") {
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return {
        created_from: formatDate(lastWeekStart),
        created_to: formatDate(lastWeekEnd),
      };
    }

    if (selectedOption === "Last Month") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        created_from: formatDate(start),
        created_to: formatDate(end),
      };
    }

    if (selectedOption === "Last Year") {
      const year = today.getFullYear() - 1;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return {
        created_from: formatDate(start),
        created_to: formatDate(end),
      };
    }

    if (selectedOption === "Custom" && customDateRange.fromDate && customDateRange.toDate) {
      return {
        created_from: formatDate(customDateRange.fromDate),
        created_to: formatDate(customDateRange.toDate),
      };
    }

    const formattedToday = formatDate(today);
    return { created_from: formattedToday, created_to: formattedToday };
  };

  // Fetch data using getTechRoutes
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const dateRange = getDateRange();
        const filters = {
          created_from: dateRange.created_from,
          created_to: dateRange.created_to,
        };

        const res = await getTechRoutes(1, 1000, filters); // Get all data with large page size
        if (!active) return;

        setStatusCount(res?.status_count);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to fetch orders summary");
        setStatusCount(undefined);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedOption, customDateRange]);

  // Calculate merged counts according to requirements
  const counts = {
    completed: (statusCount?.performed ?? 0) + (statusCount?.delivered_to_lab ?? 0) + (statusCount?.completed ?? 0),
    pending: (statusCount?.pending ?? 0) + (statusCount?.assigned ?? 0) + (statusCount?.partially_collected ?? 0) + (statusCount?.confirmed ?? 0) + (statusCount?.en_route ?? 0) + (statusCount?.arrived ?? 0),
    rejected: statusCount?.rejected ?? 0,
    onHold: statusCount?.on_hold ?? 0,
    cancelled: statusCount?.cancelled ?? 0,
    total: statusCount?.total ?? 0
  };

  const stats = [
    { label: "Total", value: counts.total, color: "bg-blue-50", },
    {
      label: "Completed",
      value: counts.completed,
      color: "bg-green-50",
    
    },
    {
      label: "Pending",
      value: counts.pending,
      color: "bg-yellow-50",
 
    },
    {
      label: "On Hold",
      value: counts.onHold,
      color: "bg-purple-50",
    
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      color: "bg-orange-50",
    
    },
    {
      label: "Rejected",
      value: counts.rejected,
      color: "bg-red-50",

    },
  ];



  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg lg:text-2xl font-semibold text-primaryText">
          Orders
        </h3>

        <div className="flex items-center gap-2">
          {selectedOption === "Custom" && (
            <>
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600">From:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={
                      customDateRange.fromDate ? customDateRange.fromDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      const d = new Date(year, (month || 1) - 1, day || 1);
                      setCustomDateRange(prev => ({ ...prev, fromDate: d }));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600">To:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={
                      customDateRange.toDate ? customDateRange.toDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      const d = new Date(year, (month || 1) - 1, day || 1);
                      setCustomDateRange(prev => ({ ...prev, toDate: d }));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 transition"
            >
              {selectedOption}
              <ChevronDown size={14} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 p-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 py-1">
                {DASHBOARD_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedOption(option);
                      if (option !== "Custom") setCustomDateRange({ fromDate: null, toDate: null });
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-1.5 text-xs rounded-xl ${selectedOption === option
                      ? "bg-green-100 text-green-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`flex gap-2 items-center px-3 py-4 rounded-2xl ${item.color}`}
          >
           
            <div>
              {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
              <p className="text-xs text-gray-500 font-bold">{item.label}</p>
              <p className="font-semibold text-xl">
                {loading ? "-" : item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOrdersSummary;
