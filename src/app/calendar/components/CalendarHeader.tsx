"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  goPrev: () => void;
  goNext: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  goNext,
  goPrev,
}) => {
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
        >
          <ChevronLeft className="w-4 h-4 text-green-600" />
        </button>
        <span className="font-semibold text-gray-800">{formattedDate}</span>
        <button
          onClick={goNext}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
        >
          <ChevronRight className="w-4 h-4 text-green-600" />
        </button>
      </div>

      <div className="flex border border-gray-200 rounded-full overflow-hidden p-2">
        {["day", "week", "month"].map((item) => (
          <button
            key={item}
            onClick={() => setView(item as "day" | "week" | "month")}
            className={`px-5 py-2 text-sm font-medium capitalize transition ${
              view === item
                ? "bg-[#009728] text-white rounded-full"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;
