"use client";
import React from "react";

const AuditEventSummary = () => {
  const eventData = {
    "Time Stamp": "2024-01-15 20:00:00",
    "Entity Type": "Order",
    Action: "Rejected",
    Actor: "Maria Rodriguez",
    Summary: "Order Assigned To Technician Maria Rodriguez",
  };

  return (
    <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-green-700 mb-3">
        Event Summary
      </h3>

      <hr className="border-gray-200 mb-4" />

      {/* --- Two-column table-like layout --- */}
      <div className="grid grid-cols-12 gap-x-6">
        {/* Labels */}
        <div className="col-span-5 md:col-span-4">
          <div className="flex flex-col space-y-3">
            {Object.keys(eventData).map((key, index) => (
              <p
                key={index}
                className="text-sm font-medium text-gray-600"
              >
                {key}
              </p>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="col-span-7 md:col-span-8">
          <div className="flex flex-col space-y-3">
            {Object.entries(eventData).map(([key, value], index) => (
              <p
                key={index}
                className={`text-sm font-semibold ${
                  key === "Action"
                    ? "text-red-600"
                    : key === "Actor"
                    ? "text-gray-800"
                    : key === "Summary"
                    ? "text-gray-700 leading-relaxed"
                    : "text-gray-700"
                }`}
              >
                {value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditEventSummary;
