"use client";
import React, { useState } from "react";
import { ArrowLeft, Eye, FileText, MapPin } from "lucide-react";
import { getAttachmentsForOrder } from "../../orders/view/services/viewOrderService";

const MileageDetailsView = ({ data, onBack, loading = false }) => {
  const [activeTab, setActiveTab] = useState("details");

  if (!data) return null;

  const getFullName = (t: any) => {
    if (!t) return "";
    if (typeof t === "string") return t;
    return `${t.first_name ?? ""} ${t.middle_name ?? ""} ${t.last_name ?? ""}`.trim();
  };

  const viewDocument = async (key: string) => {
    try {
      const url = await getAttachmentsForOrder(data.order?.guid, key);
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="bg-[#f7f9fb] relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-2">Loading order details...</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeft
          className="w-5 h-5 cursor-pointer text-gray-600 hover:text-green-600 transition"
          onClick={onBack}
        />
        <h2 className="text-lg font-semibold text-gray-800" onClick={onBack}>
          {getFullName(data.technician)}
        </h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-semibold text-sm ${activeTab === "details"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-600"
              }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-semibold text-sm ${activeTab === "attachments"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-600"
              }`}
            onClick={() => setActiveTab("attachments")}
          >
            Attachments
          </button>
        </div>

        {/* ====== DETAILS TAB ====== */}
        {activeTab === "details" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Technician Info */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5">
              <h3 className="text-[#344256] font-semibold mb-3 border-b border-gray-200 pb-2">
                Technician Info
              </h3>
              <div className="space-y-2 text-sm ">
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Technician </span>
                  <span className="text-[#344256] font-semibold break-words">{getFullName(data.technician) || '--'}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Order Id</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.phlebio_order_id}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Total Miles</span>
                  <span className="text-[#344256] font-semibold break-words">{data.trip?.actual_distance_miles ?? "--"} </span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Total Miles (exp)</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.travel_miles ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Collection Date</span>
                  <span className="text-[#344256] font-semibold break-words">{data.trip?.trip_date ?? "--"} </span>
                </div>
                {/* <div className="flex items-center">
                <span className="text-[#495057] font-normal  ">Collection Time</span> 
                <span className="text-[#344256] font-semibold">{data.performed_date} </span> 
              </div> */}
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Order Status</span>{" "}
                  <span
                    className={`font-semibold ${data.trip?.status === "Performed"
                      ? "text-blue-500"
                      : data.trip?.status === "Delivered to Lab"
                        ? "text-green-600"
                        : "text-orange-500"
                      }`}
                  >
                    {data.trip?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E5E7EB]">
              <h3 className="text-[#344256] font-semibold mb-3 border-b border-gray-200 pb-2">
                Patient Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Patient Name</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.patient?.first_name ?? "--"} {data.order?.patient?.last_name ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto]  items-center">
                  <span className="text-[#495057] font-normal  ">Patient DOB</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.patient?.date_of_birth ? new Date(data.order.patient.date_of_birth).toLocaleDateString("en-US").replace(/\//g, "-") : ""}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Service Address</span>
                  <span className="text-[#344256] font-semibold break-words">
                    {data.order?.service_address ?? "--"}
                  </span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Dx Codes</span>
                  <span className="text-green-600 font-semibold break-words">{data.order?.icd_code?.map((dx: any) => `[${dx}]`).join(", ") ||
                    "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Residence Type</span>
                  <span className="text-[#344256] font-semibold break-words">{data.trip?.residence_type ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Primary Insurance</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.primary_insurance?.name ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Primary Ins Number</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.primary_insurance_policy_number ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Secondary Insurance</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.secondary_insurance?.name ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Secondary Ins Number</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.secondary_insurance_policy_number ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Provider</span>
                  <span className="text-[#344256] font-semibold break-words">{getFullName(data.order?.physician)}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Client</span>
                  <span className="text-[#344256] font-semibold break-words">{data.order?.partner?.name ?? "--"}</span>
                </div>
                <div className="grid  grid-cols-1 md:grid-cols-[200px_auto] items-center">
                  <span className="text-[#495057] font-normal  ">Lab Test</span>
                  <span className="text-[#344256] font-semibold break-words">
                    {data.order?.tube_data?.map((tube: any) => `[${tube.tube_name}]`).join(", ") || "--"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ====== ATTACHMENTS TAB ====== */}
        {activeTab === "attachments" && (
          <div className="grid md:grid-cols-2 gap-6">
            {(data.trip?.attachments || []).map((doc: string, i: number) => {
              const fileName = doc ? doc.split("/").pop() : "";
              if (!fileName) return null;

              return (
                <div
                  key={i}
                >
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between bg-[#DDE2E5] rounded-[24px] px-4 py-3 mt-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-gray-800 text-sm font-medium" title={fileName}>
                            {fileName}
                          </p>
                        </div>
                      </div>
                      <Eye
                        className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition"
                        onClick={() => viewDocument(doc)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {(!data.trip?.attachments || data.trip?.attachments.length === 0) && (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No attachments found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MileageDetailsView;
