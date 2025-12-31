"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTestByGuid } from "../../services/labTestsService";
import type { LabTest } from "../../../../../types/labTests";
import { canEdit } from "../../../../../utils/rbac";

const LabTestDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guid = searchParams.get("guid") || "";
  const [data, setData] = useState<LabTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!guid) return;
      try {
        setLoading(true);
        setError(null);
        const res: any = await getTestByGuid(guid);
        if (!active) return;
        setData(res?.data || null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load lab test details");
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [guid]);
  const labTestDetails: Record<string, string> = data
    ? {
        "Test Code*": data.test_code || "",
        "Test Name*": data.test_name || "",
        "Sample Type*": String(data.sample_type || ""),
        "Turnaround Time (Hours)": String(Math.ceil((data.tat_minutes || 0) / 60)),
        "Fasting Required": data.fasting ? "Yes" : "No",
        Active: data.is_deleted ? "No" : "Yes",

      }
    : {};

  return (
    <div className="bg-[#F6F9FB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-gray-700 hover:text-green-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-base font-medium text-primaryText">
            Lab Test Details
          </h2>
        </div>

        <div className="flex gap-3">
          {canEdit() && (
            <button onClick={() => guid && router.push(`/records/lab-tests/new?guid=${encodeURIComponent(guid)}`)} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium shadow transition-all">
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
        ) : (
          <div className="grid grid-cols-1 gap-y-5 gap-x-12">
            {Object.entries(labTestDetails).map(([label, value], index) => (
              <div key={index} className="grid grid-cols-2">
                <p className="text-sm text-gray-600 font-medium">{label}</p>
                <p
                  className={`text-sm font-semibold ${value === "Yes"
                    ? "text-green-700"
                    : value === "No"
                      ? "text-red-600"
                      : "text-gray-800"
                    }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTestDetails;
