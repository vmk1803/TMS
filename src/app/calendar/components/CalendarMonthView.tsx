"use client";
import React, { useState } from "react";
import { useOrderStatusCounts } from "../hooks/useOrderStatusCounts";

interface Props {
  currentDate: Date;
}

function getStatusStyles(status: string) {
  const key = status.toLowerCase();

  if (key.includes("pending")) {
    return "border-amber-400 bg-amber-50";
  }

  if (key.includes("completed")) {
    return "border-emerald-400 bg-emerald-50";
  }

  if (key.includes("on_hold") || key.includes("on hold")) {
    return "border-orange-400 bg-orange-50";
  }

  if (key.includes("rejected")) {
    return "border-red-400 bg-red-50";
  }

  if (key.includes("cancelled")) {
    return "border-gray-400 bg-gray-50";
  }

  return "border-gray-300 bg-[#F8FAFC]";
}

const CalendarMonthView: React.FC<Props> = ({ currentDate }) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyStartDays = Array.from({ length: startDay });

  const { data, loading } = useOrderStatusCounts("month", currentDate);

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number): string => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  // Helper function to get summary for a specific day
  const getSummaryForDay = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    const found = data.find(item => item.date === dateStr);
    return found?.summary || {
      total: 0,
      on_hold: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    };
  };

  return (
    <>
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-l-4 border-amber-400 bg-amber-100"></div>
          <span className="font-bold text-gray-700">Pending:</span>
          <span className="text-gray-600">Pending, Assigned, Confirmed, En-Route, Arrived</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-l-4 border-emerald-400 bg-emerald-100"></div>
          <span className="font-bold text-gray-700">Completed:</span>
          <span className="text-gray-600">Performed, Partially Collected, Delivered To Lab</span>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-7 rounded-xl text-sm overflow-hidden">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div
          key={d}
          className="text-[#495057] text-left px-4 text-base font-medium py-2 Uppercase bg-[#DDE2E5]"
        >
          {d}
        </div>
      ))}

      {emptyStartDays.map((_, i) => (
        <div key={i} className="bg-[#F5F5F5] m-1 rounded-xl p-3 text-gray-300">
          --
        </div>
      ))}

      {daysArray.map((day) => {
        const summary = getSummaryForDay(day);
        const statusItems = [
          { label: "Pending", count: summary.pending },
          { label: "Completed", count: summary.completed },
          { label: "On Hold", count: summary.on_hold },
          { label: "Rejected", count: summary.rejected },
          { label: "Cancelled", count: summary.cancelled },
        ];

        return (
          <div
            key={day}
            className="relative bg-white m-1 rounded-xl p-2 border hover:shadow-md cursor-pointer transition"
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <div className="text-primaryText text-xs">{day}</div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between px-2 py-1 rounded border-l-4 border-[#70A5F8] bg-[#F1FBFF]">
                <span className="text-primaryText text-xs">Total Orders</span>
                <span className="text-primaryText text-xs">({loading ? "--" : summary.total})</span>
              </div>
              {statusItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2 py-1 rounded border-l-4 text-xs ${getStatusStyles(
                    item.label
                  )}`}
                >
                  <span className="text-primaryText text-[11px] leading-none">
                    {item.label}
                  </span>
                  <span className="text-primaryText text-[11px] leading-none">
                    ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default CalendarMonthView;
