"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";
import {
  useOrdersSummaryDate,
  CustomDateRange,
} from "../../../hooks/useDashboardDateFilters";
import AllDatesPicker from "@/components/common/AllDatesPicker";

const options = [
  "Today",
  "Yesterday",
  "Last Week",
  "Last Month",
  "Last Year",
  "Custom",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#FFD372",
  COMPLETED: "#87D58E",
  REJECTED: "#FFA691",
  "ON HOLD": "#AEA6FC",
  ASSIGNED: "#a0bfeaff",
  CONFIRMED: "#aedabdff",
  "EN-ROUTE": "#dbb8b8ff",
  ARRIVED: "#e1ddb0ff",
  PERFORMED: "#c2bcddff",
  "DELIVERED TO LAB": "#e5ced0ff",
  CANCELLED: "#e9e6e6ff",
  "PARTIALLY COLLECTED": "#fed59fff",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const key = data.status || "";
    const color = STATUS_COLORS[key] || "#E5E7EB";

    return (
      <div className="bg-white p-1 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          ></span>
          <span className="font-semibold text-gray-800">{data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()} : <span className="font-medium text-[#22C55E]">{data.count}</span></span>
        </div>
      </div>
    );
  }
  return null;
};

const OrdersSummaryChart = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    byStatus,
    total,
    selectedOption,
    setSelectedOption,
    customDateRange,
    setCustomDateRange,
    loading,
  } = useOrdersSummaryDate("Today");

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

  const visibleStatus = byStatus.filter((item) => Number(item.count) > 0);



  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-800 text-[16px]">Orders Summary</h4>

        <div className="flex items-start gap-3">
          {/* FROM & TO stacked vertically */}
          {selectedOption === "Custom" && (
            <div className="flex flex-col gap-2">
              {/* FROM DATE */}
              {/* FROM DATE */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 w-8">From:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={
                      customDateRange.fromDate
                        ? customDateRange.fromDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      const d = new Date(year, (month || 1) - 1, day || 1);
                      setCustomDateRange((prev) => ({ ...prev, fromDate: d }));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>

              {/* TO DATE */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 w-8">To:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={
                      customDateRange.toDate
                        ? customDateRange.toDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      const d = new Date(year, (month || 1) - 1, day || 1);
                      setCustomDateRange((prev) => ({ ...prev, toDate: d }));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom Dropdown - stays same position */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              {selectedOption}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 p-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedOption(option as any);
                      if (option !== "Custom")
                        setCustomDateRange({ fromDate: null, toDate: null });
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${selectedOption === option
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

      {/* Chart + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Chart */}
        <div className="h-44 w-44 mx-auto sm:mx-0">
          {loading || !visibleStatus.length ? (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              {loading ? "Loading..." : "No data"}
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={visibleStatus}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="percentage"
                >
                  {visibleStatus.map((entry) => {
                    const key = entry.status?.toUpperCase() || "";
                    const color = STATUS_COLORS[key] || "#E5E7EB";
                    return <Cell key={entry.status} fill={color} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 mt-4 sm:mt-0">
          {visibleStatus.map((d) => {
            const key = d.status?.toUpperCase() || "";
            const color = STATUS_COLORS[key] || "#E5E7EB";

            return (
              <div key={d.status} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="text-gray-700">{d.status}</span>
                <span className="font-semibold text-gray-800">
                  {loading || !total ? "-" : `${Math.round(d.percentage)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersSummaryChart;
