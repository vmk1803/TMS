"use client";
import { useRouter } from "next/navigation";
import React from "react";
import AuditEventSummary from "./AuditEventSummary";
import AuditDiff from "./AuditDiff";

const AuditDetails = () => {
  const router = useRouter();

  return (
    <div className="bg-[#F9FAFB]">
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 flex items-center gap-1 hover:text-green-600 transition-all"
        >
          ← Audit Details
        </button>

        <div className="flex gap-3">
          {/* <button className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition">
            Edit
          </button> */}
        </div>
      </div>

      {/* --- Two Card Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-white p-4 rounded-2xl">
        {/* Left: Event Summary */}
        {/* <AuditEventSummary /> */}

        {/* Right: Diff */}
        <AuditDiff />
      </div>
    </div>
  );
};

export default AuditDetails;
