"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useInsuranceDetails } from "../../hooks/useInsuranceDetails";
import { canEdit } from "../../../../../utils/rbac";

const InsuranceDetails = () => {
  const router = useRouter();
  const params = useSearchParams();
  const guid = params.get('guid') || ''
  const { data, loading, error } = useInsuranceDetails(guid)

  const rows = useMemo(() => {
    return {
      "Insurance Name": data?.name ?? '-',
      "Insurance Type": data?.insurance_type ?? '-',
      "Carrier Code": data?.insurance_code ?? '-'
    }
  }, [data])

  return (
    <div className="bg-[#F9FAFB]">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-700 flex items-center gap-1 hover:text-green-600 transition-all"
        >
          ← Insurance Details
        </button>

        <div className="flex gap-3">
          {canEdit() && (
            <button
              onClick={() => router.push(`/records/insurance/new?guid=${guid}`)}
              className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl px-4 py-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 lg:gap-y-0">
            {Object.entries(rows).map(([label, value], index) => (
              <div key={index} className="flex flex-col">
                <p className="text-sm text-text70">{label}</p>
                <p
                  className={`text-sm  font-medium ${value === "Active" ? "text-secondary" : "text-primaryText"
                    }`}
                >
                  {value as string}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceDetails;
