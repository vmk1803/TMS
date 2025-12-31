"use client";
import React from "react";
import type { TubeDTO } from "../../../../../types/testTubes";

interface Props {
  tube: TubeDTO | null;
}

const TestTubeInfoCard: React.FC<Props> = ({ tube }) => {
  const infoRows: { label: string; value: string }[] = [
    { label: "Tube Name", value: tube?.tube_name || "-" },
    { label: "Quantity", value: tube?.quantity != null ? String(tube.quantity) : "-" },
    { label: "Storage Temperature", value: tube?.storage_temperature || "-" },
    { label: "Special Instructions", value: tube?.special_instructions || "-" },
  ];

  return (
    <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-primaryText mb-4">
        Test Tube Info
      </h3>

      {/* --- Table-like layout --- */}
      <div className="grid grid-cols-12  md:grid-cols-12 gap-x-6">
        {/* Left Column: Labels */}
        <div className="col-span-5 md:col-span-4">
        <div className="flex flex-col space-y-3">
          {infoRows.map((row, index) => (
            <p
              key={index}
              className="text-text70 text-sm font-medium text-gray-600"
            >
              {row.label}
            </p>
          ))}
        </div>
        </div>

        {/* Right Column: Values */}
        <div className="col-span-7 md:col-span-8">
        <div className="flex flex-col space-y-3">
          {infoRows.map((row, index) => (
            <p
              key={index}
              className="text-sm font-medium text-gray-700 break-all"
            >
              {row.value}
            </p>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default TestTubeInfoCard;
