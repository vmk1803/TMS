"use client";
import React from "react";
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

const CalendarWeekView: React.FC<Props> = ({ currentDate }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const { data, loading } = useOrderStatusCounts("week", currentDate);

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get summary for a specific date
  const getSummaryForDate = (date: Date) => {
    const dateStr = formatDate(date);
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
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((date, idx) => {
        const summary = getSummaryForDate(date);
        const statusItems = [
          { label: "Pending", count: summary.pending },
          { label: "Completed", count: summary.completed },
          { label: "On Hold", count: summary.on_hold },
          { label: "Rejected", count: summary.rejected },
          { label: "Cancelled", count: summary.cancelled },
        ];

        return (
          
          <div
            key={idx}
            className={`rounded-xl border ${idx === currentDate.getDay() ? "bg-green-50" : "bg-white"
              } p-3`}
          >
            <div className="text-gray-700 font-semibold text-center mb-2">
              {date.toLocaleDateString("en-US", { weekday: "short" })}{" "}
              <span className="block text-xl">{date.getDate()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs border-l-4 border-blue-400 bg-blue-50 rounded px-2 py-1 flex justify-between">
                <span>Total Orders</span>
                <span>{loading ? "--" : summary.total}</span>
              </div>
              {statusItems.map((item, i) => (
                <div
                  key={i}
                  className={`text-xs border-l-4 rounded px-2 py-1 flex justify-between ${getStatusStyles(
                    item.label
                  )}`}
                >
                  <span>{item.label}</span>
                  <span>{item.count}</span>
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

export default CalendarWeekView;
