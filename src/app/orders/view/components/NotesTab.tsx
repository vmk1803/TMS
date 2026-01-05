"use client";
import React from "react";

// Format date → 11-27-2025 14:30
const formatDateTime = (d: any) => {
  if (!d) return "--";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "--";

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12; // Midnight or Noon → show 12

  const hh = String(hours).padStart(2, "0");

  return `${mm}-${dd}-${yyyy}   ${hh}:${min} ${ampm}`;
};

// Format date only
const formatUTCDateOnly = (d: any) => {
  if (!d) return "--";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "--";

  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = date.getUTCFullYear();

  return `${mm}-${dd}-${yyyy}`;
};
const InfoBox = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    {children}
  </div>
);

interface NotesTabProps {
  orderData?: any;
}

const NotesTab: React.FC<NotesTabProps> = ({ orderData }) => {
  const getStatusLabel = (status: string) => {
    if (!status) return "--";
    const s = status.toLowerCase();
    if (s.includes("create")) return "Created";
    if (s.includes("confirm")) return "Confirmed";
    if (s.includes("perform")) return "Performed";
    if (s.includes("partially collected")) return "Partially Collected";
    if (
      s.includes("enroute") ||
      s.includes("en route") ||
      s.includes("onroute") ||
      s.includes("on-route")
    )
      return "Enroute";
    if (s.includes("arrived")) return "Arrived";
    if (s.includes("cancel")) return "Cancelled";
    if (s.includes("assign")) return "Assigned";
    if (s.includes("deliver")) return "Delivered To Lab";
    if (s.includes("complete")) return "Completed";
    if (s.includes("reject")) return "Rejected";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const HISTORY_KEYS = [
    "order_status_history",
    "status_history",
    "history",
    "statusHistory",
    "orderHistory",
  ];

  const key =
    orderData &&
    typeof orderData === "object" &&
    HISTORY_KEYS.find((k) => orderData[k]);

  const raw = key ? orderData[key] : [];
  const list = Array.isArray(raw) ? raw : Object.values(raw || {});

  // TRANSFORM EACH EVENT TO CONSISTENT SHAPE
  const normalizeItem = (it: any) => ({
    status: it?.status || "",
    technician: it?.technician || null,
    remarks: it?.remarks || it?.note || "",
    createdAt: formatDateTime(it?.created_at),
    raw: it,
  });

  const eventsSorted = list.map(normalizeItem);

  // Extract technician name
  const technicianName = (ev: any) =>
    ev?.technician
      ? `${ev.technician.first_name ?? ""} ${
          ev.technician.last_name ?? ""
        }`.trim()
      : "--";

   const cancelledByName = (ev: any) => {
  
  const u =
  
    ev?.raw?.created_by_user;

  return u
    ? `${u.first_name ??  ""} ${
        u.last_name ?? ""
      }`.trim()
    : "--";
};

 
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoBox title="Progress Notes">
        <div className="mb-3">
          <h3 className="text-[20px] font-semibold text-primaryText">
            Progress Notes
          </h3>
        </div>

        <hr className="border-gray-200 mb-4" />

        <div className="space-y-4">
          {eventsSorted.map((ev: any, idx: number) => {
            const statusType = getStatusLabel(ev.status);

            return (
              <div key={idx}>
                <p className="text-primaryText text-base font-semibold mb-2">
                  {statusType}
                </p>

                <div className="grid grid-cols-2 gap-y-2">
                  {statusType === "Assigned" && (
                    <>
                      <p className="text-text70 text-sm">Order Assigned To</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">Date of Service</p>
                      <p className="text-primaryText text-sm font-medium">
                        {formatUTCDateOnly(orderData?.date_of_service)}
                      </p>
                    </>
                  )}
                     {statusType === "Rejected" && (
                    <>                            
                      {/* Technician */}
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      {/* Reasons */}
                      <p className="text-text70 text-sm">Reasons</p>
                      <p className="text-primaryText text-sm font-medium">
                        {(() => {
                          let r = ev.raw?.reasons;
                          if (!r) return "--";
                          if (Array.isArray(r)) {
                            const arr = r
                              .map((x) => String(x).replace(/'/g, "").trim())
                              .filter(Boolean);
                            return arr.length ? arr.join(", ") : "--";
                          }                    
                          if (typeof r === "string") {                     
                            r = r.replace(/[{}]/g, "").replace(/'/g, "").trim()                      
                            if (!r || r === "''" || r === `""`) return "--";                       
                            const parts = r.split(",").map((p) => p.trim()).filter(Boolean);
                            return parts.length ? parts.join(", ") : "--";
                          }
                          return "--";
                        })()}
                      </p>

                      {/* Status Notes */}
                      <p className="text-text70 text-sm">Status Notes</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.status_notes || "--"}
                      </p>
                    </>
                  )}
  
                  {statusType === "Confirmed" && (
                    <>
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">Date of Service</p>
                      <p className="text-primaryText text-sm font-medium">
                        {formatUTCDateOnly(orderData?.date_of_service)}
                      </p>

                      <p className="text-text70 text-sm">Appointment Time</p>
                      <p className="text-primaryText text-sm font-medium">
                        {orderData?.appointment_time || "--"}
                      </p>

                        <p className="text-text70 text-sm">Status Notes</p>
                        <p className="text-primaryText text-sm font-medium">
                         {ev.raw?.status_notes || "--"}
                        </p>
                      {/* <p className="text-text70 text-sm">Notes</p>
                      <p className="text-primaryText text-sm font-medium">
                        {"--"} 
                      </p> */}
                    </>
                  )}

                  {statusType === "Delivered To Lab" && (
                    <>
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">Delivered Lab</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.delivered_lab || "--"}
                      </p>
                    </>
                  )}

                  {statusType === "EN-ROUTE" && (
                    <>
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">Start Miles</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.travel_miles || "--"}
                      </p>
                    </>
                  )}

                  {(statusType === "Performed" ||  statusType === "Partially Collected") && (
                    <>
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">Draw Locality</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.draw_locality || "--"}
                      </p>

                      <p className="text-text70 text-sm">
                        Address Locality Type
                      </p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.address_locality_type || "--"}
                      </p>

                      <p className="text-text70 text-sm">Return Visit</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.return_visit ? "YES" : "NO"}
                      </p>
                    </>
                  )}

                  {statusType === "Arrived" && (
                    <>
                      <p className="text-text70 text-sm">Technician</p>
                      <p className="text-primaryText text-sm font-medium">
                        {technicianName(ev)}
                      </p>

                      <p className="text-text70 text-sm">End Miles</p>
                      <p className="text-primaryText text-sm font-medium">
                        {ev.raw?.travel_miles || "--"}
                      </p>
                    </>
                  )}
                  {statusType === "Cancelled" && (
                  <>
                    <p className="text-text70 text-sm">Cancelled By</p>
                    <p className="text-primaryText text-sm font-medium">
                      {cancelledByName(ev)}
                    </p>
                  </>
                )}

                  {/* Date & Time shown last for every status block */}
                  <p className="text-text70 text-sm">Date & Time</p>
                  <p className="text-primaryText text-sm font-medium">
                    {ev.createdAt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </InfoBox>

      <InfoBox title="Admin Notes">
        <div className="mb-3">
          <h3 className="text-[20px] font-semibold text-primaryText">
            Notes
          </h3>
        </div>

        <hr className="border-gray-200 mb-4" />

        <div className="mb-4">
          <p className="text-primaryText text-base font-semibold mb-2">
            Admin Notes
          </p>
          <p className="text-primaryText text-sm font-medium">
            {orderData?.admin_notes || "--"}
          </p>
        </div>

        <div>
          <p className="text-primaryText text-base font-semibold mb-2">
            Technician Notes
          </p>
          <p className="text-primaryText text-sm font-medium">
            {orderData?.technician_notes || "--"}
          </p>
        </div>
      </InfoBox>
    </div>
  );
};

export default NotesTab;
