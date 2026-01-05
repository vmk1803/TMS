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

const CalendarDayView: React.FC<Props> = ({ currentDate }) => {
  const { aggregatedSummary, loading } = useOrderStatusCounts("day", currentDate);

  // Create status items array from aggregated summary
  const statusItems = [
    { label: "Pending", count: aggregatedSummary.pending },
    { label: "Completed", count: aggregatedSummary.completed },
    { label: "On Hold", count: aggregatedSummary.on_hold },
    { label: "Rejected", count: aggregatedSummary.rejected },
    { label: "Cancelled", count: aggregatedSummary.cancelled },
  ];

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
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#D4EBDD] rounded-t-xl px-5 py-3 font-semibold text-gray-700">
        {currentDate.toLocaleDateString("en-US", { weekday: "long" })}{" "} 
        <span className="text-[#fff] bg-[#009728] rounded-full p-[10px]">
          {String(currentDate.getDate()).padStart(2, "0")}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="border-l-4 bg-blue-50 border-blue-400 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="font-medium text-gray-700 text-sm">Total Orders</span>
          <span className="text-sm text-gray-600">({loading ? "--" : aggregatedSummary.total})</span>
        </div>

        {statusItems.map((item, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-lg px-4 py-3 flex justify-between items-center ${getStatusStyles(
              item.label
            )}`}
          >
            <span className="font-medium text-gray-700 text-sm">
              {item.label}
            </span>
            <span className="text-sm text-gray-600">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default CalendarDayView;
