"use client";
import React from "react";

const LegendBox = () => {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-full shadow-md px-4 py-2 flex gap-4 text-sm font-medium z-[1000]">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 bg-[#007BFF] rounded-full"></span> Routine
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 bg-[#FF3B30] rounded-full"></span> STAT
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 bg-[#009728] rounded-full"></span> STAT + Fasting
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 bg-[#FFC107] rounded-full"></span> Fasting
      </span>
    </div>
  );
};

export default LegendBox;
