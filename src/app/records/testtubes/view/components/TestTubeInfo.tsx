"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import TestTubeInfoCard from "./TestTubeInfoCard";
import { getTubeByGuid } from "../../services/testTubesService";
import type { TubeDTO } from "../../../../../types/testTubes";
import { canEdit } from "../../../../../utils/rbac";

const TestTubeInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tubeGuid = searchParams.get("tube_guid") || "";
  const [tube, setTube] = useState<TubeDTO | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tubeGuid) return;
      try {
        const res = await getTubeByGuid(tubeGuid);
        if (res?.data) {
          setTube(res.data);
        }
      } catch {
        // swallow - could add toast in future
      }
    };
    load();
  }, [tubeGuid]);

  return (
    <div className="bg-[#F9FAFB]">
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 flex items-center gap-1 hover:text-green-600 transition-all"
        >
          ← Edit Test Tube
        </button>

        <div className="flex gap-3">
          {canEdit() && (
            <button
              className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
              onClick={() => {
                if (!tubeGuid) return;
                router.push(`/records/testtubes/new?mode=edit&tube_guid=${tubeGuid}`)
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* --- Content --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-white p-4 rounded-2xl">
        {/* --- Left Card: Test Tube Info --- */}
        <TestTubeInfoCard tube={tube} />

        {/* --- Right Card: Documents --- */}
        <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primaryText mb-4">
            Documents
          </h3>

          {tube?.image_url ? (
            <div className="flex flex-col gap-3">
              <div className="bg-gray-200 rounded-2xl px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-2">
                    <FileText className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 break-all">
                      {tube.tube_name || 'Document'}
                    </p>
                  </div>
                </div>
                <Eye 
                  className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition"
                  onClick={() => {
                    if (tubeGuid && tube?.image_url) {
                      window.open(tube.image_url, '_blank')
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No document uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTubeInfo;
