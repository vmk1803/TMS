"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { getPhysicianByGuid } from "../../services/physiciansService";
import { canEdit } from "../../../../../utils/rbac";

const PhysicianDetails = () => {
  const router = useRouter();
  const params = useSearchParams();
  const guid = params.get("guid");

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!guid) return;
      try {
        setLoading(true);
        setError(null);
        const d = await getPhysicianByGuid(guid);
        if (!active) return;
        setData(d || null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load physician details");
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

  const physicianInfo = useMemo(() => {
    if (!data) {
      return {
        "NPI Number*": "-",
        "Physician Name": "-",
        "Phone Number": "-",
        Email: "-",
        Fax: "-",
        "Address*": "-",
        Specialization: "-",
      };
    }
    const name = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(" ");
    const addressParts = [data.address_line1, data.address_line2, data.city, data.state, data.zipcode]
      .filter(Boolean)
      .join(", ");
    return {
      "NPI Number*": data.npi || "-",
      "Physician Name": name || "-",
      "Phone Number": data.phone_number || "-",
      Email: data.email || "-",
      Fax: data.fax || "-",
      "Address*": addressParts || "-",
      Specialization: data.specialization || "-"
    };
  }, [data]);

  const orderingFacilitySettings = useMemo(() => {
    if (!data) {
      return {
        Fax: "-",
        "Email Notification": "-",
      };
    }
    return {
      // Fax: data.fax_notification ? "Yes" : "No",
      "Email Notification": data.email_notification ? "Yes" : "No",
    };
  }, [data]);

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-700 flex items-center gap-1 hover:text-green-600 transition-all"
        >
          ← Physicians
        </button>

        <div className="flex gap-3">
          {canEdit() && (
            <button
              disabled={!guid}
              onClick={() => {
                if (!guid) return;
                router.push(`/records/physicians/new?guid=${encodeURIComponent(guid)}`);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition disabled:opacity-50"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Physician Info */}
          <div>
            <h3 className="text-lg font-semibold text-primaryText mb-4">
              Physician Info
            </h3>
            <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">

              {loading && (
                <div className="py-4 text-sm text-gray-600">Loading physician details...</div>
              )}
              {error && !loading && (
                <div className="py-4 text-sm text-red-600">{error}</div>
              )}
              {!loading && !error && (
                <div className="grid grid-cols-12 gap-x-6">
                  {/* Labels */}
                  <div className="col-span-5 md:col-span-4">
                    <div className="flex flex-col space-y-3">
                      {Object.keys(physicianInfo).map((key, index) => (
                        <p
                          key={index}
                          className="text-text70 text-sm font-medium text-gray-600"
                        >
                          {key}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="col-span-7 md:col-span-8">
                    <div className="flex flex-col space-y-3">
                      {Object.entries(physicianInfo).map(([key, value], index) => (
                        <p
                          key={index}
                          className={`text-sm font-medium ${value === "Yes"
                            ? "text-green-700"
                            : value === "No"
                              ? "text-red-600"
                              : "text-gray-800"
                            }`}
                        >
                          {value}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Ordering Facilities Settings */}
          <div>
            <h3 className="text-lg font-semibold text-primaryText mb-4">
              Ordering Facilities Settings
            </h3>
            <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">

              {loading && (
                <div className="py-4 text-sm text-gray-600">Loading ordering facility settings...</div>
              )}
              {error && !loading && (
                <div className="py-4 text-sm text-red-600">{error}</div>
              )}
              {!loading && !error && (
                <div className="grid grid-cols-12 gap-x-6">
                  {/* Labels */}
                  <div className="col-span-5 md:col-span-4">
                    <div className="flex flex-col space-y-3">
                      {Object.keys(orderingFacilitySettings).map((key, index) => (
                        <p
                          key={index}
                          className="text-text70 text-sm font-medium text-gray-600"
                        >
                          {key}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="col-span-7 md:col-span-8">
                    <div className="flex flex-col space-y-3">
                      {Object.entries(orderingFacilitySettings).map(
                        ([key, value], index) => (
                          <p
                            key={index}
                            className={`text-sm font-medium ${value === "Yes"
                              ? "text-green-700"
                              : value === "No"
                                ? "text-red-600"
                                : "text-gray-800"
                              }`}
                          >
                            {value}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PhysicianDetails;
