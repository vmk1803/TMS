"use client";
import React, { useState } from "react";
import TravelMileageTable from "./TravelMileageTable";
import { Download } from "lucide-react";
// import MileageDetailsTable from "./MileageDetailsTable";
import ButtonLight from "../../../components/common/ButtonLight";
import { ExportIcon, PlusIcon } from "../../../components/Icons";
import DateOfBirthPicker from "@/components/common/DateOfBirthPicker";

import { exportToCSV } from "../../../utils/exportToCSV";
import Title from "@/components/common/Title";
import { fetchTechnicians } from "../../orders/assign/services/technicianService";
import { Technician } from "@/types/technician";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const MileagePage = () => {
  const [activeTab, setActiveTab] = useState("travel");
  const [isDetailView, setIsDetailView] = useState(false); // Hide header/tabs
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isTechnicianOpen, setIsTechnicianOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let active = true;
    const loadTechnicians = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchTechnicians();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!active) return;
        setTechnicians(list);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load technicians");
        setTechnicians([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTechnicians();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isTechnicianOpen) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsTechnicianOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTechnicianOpen]);

  const displayName = (t: Technician) => {
    const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
    return name || t.user_name || t.email || t.guid;
  };

  const filteredTechnicians = technicians.filter(t =>
    displayName(t).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const todayLabel = () => {
  //   const d = selectedDate ? new Date(selectedDate) : new Date();
  //   return d.toLocaleDateString("en-US", {
  //     month: "short",
  //     day: "2-digit",
  //     year: "numeric",
  //   });
  // };

  // Helper to fetch full name safely
  const getFullName = (item: any) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return `${item.first_name ?? ""} ${item.middle_name ?? ""} ${item.last_name ?? ""}`.trim();
  };

  const handleExport = () => {
    if (selectedRows.length > 0) {
      // Map selected rows to include ONLY visible table columns with new data structure
      const exportData = selectedRows.map(row => ({
        "Order Number": row.order?.phlebio_order_id || "",
        "Technician": getFullName(row.technician),
        "Miles": row.trip?.actual_distance_miles ?? "--",
        "Patient Name": getFullName(row.order?.patient),
        "DOB": row.order?.patient?.date_of_birth ? new Date(row.order.patient.date_of_birth).toLocaleDateString('en-US').replace(/\//g, '-') : "--",
        "Client Name": row.order?.partner?.name ?? "--",
        "Performed Date": row.trip?.trip_date ? new Date(row.trip.trip_date).toLocaleDateString('en-US').replace(/\//g, '-') : "--",
        "Residence Type": row.trip?.residence_type ?? "--",
        "Insurance Name": row.order?.primary_insurance?.name ?? "--",
        "Lab Tests": row.trip?.labtests_collected ?? "--",
        "Service Address": row.order?.service_address ?? "--",
        "Status": row.trip?.status ?? ""
      }));

      exportToCSV(exportData, "travel_mileage_export");
      setSelectedRows([]);
    }
  };

  return (
    <>
      {/* ✅ Hide header + tabs when detail/edit view is open */}
      {!isDetailView && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <Title
              heading="Travel Mileage"
              subheading="Record and track travel distances for accurate reimbursement and reporting."
            />
            <div className="flex gap-3">
              {/* Technician Dropdown */}
              <div ref={containerRef} className="relative w-52">
                <div className="w-full px-3 py-2 rounded-full border border-gray-200 bg-white text-left flex justify-between items-center text-sm text-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsTechnicianOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={isTechnicianOpen}
                    className="flex-1 text-left truncate"
                  >
                    <span className="truncate">
                      {selectedTech ? displayName(selectedTech) : loading ? "Loading technicians..." : "Select Technician"}
                      {error ? ` · ${error}` : ""}
                    </span>
                  </button>

                  {selectedTech ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTech(null);
                        setSearchTerm("");
                      }}
                      aria-label="Clear selected technician"
                      className="ml-3 text-gray-400 hover:text-gray-700 focus:outline-none"
                    >
                      ×
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-green-600 ml-2" />
                  )}
                </div>

                <AnimatePresence>
                  {isTechnicianOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-xl border border-gray-200 z-50 max-h-64 overflow-hidden flex flex-col"
                    >
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <ul className="overflow-y-auto flex-1">
                        {filteredTechnicians.length === 0 ? (
                          <li className="px-4 py-2 text-xs text-gray-500">No technicians found</li>
                        ) : (
                          filteredTechnicians.map((t) => (
                            <li
                              key={t.guid}
                              onClick={() => {
                                setSelectedTech(t);
                                setIsTechnicianOpen(false);
                                setSearchTerm("");
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                            >
                              {displayName(t)}
                            </li>
                          ))
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <DateOfBirthPicker
                onChange={(date) => setSelectedDate(date)}
                value={selectedDate}
                placeholder="MM-DD-YYYY" //{todayLabel()}
                className="rounded-full font-normal text-sm border-formBorder bg-white"
              />
              <ButtonLight
                label="Export CSV"
                Icon={ExportIcon}
                onClick={handleExport}
                disabled={selectedRows.length === 0}
                count={selectedRows.length}
              />
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div
        className={`flex flex-col ${isDetailView ? "border-none" : "border-transparent"
          } rounded-xl mt-6 bg-white`}
      >
        {activeTab === "travel" && (
          <TravelMileageTable
            setIsDetailView={setIsDetailView}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            technicianFilter={selectedTech?.guid || ""}
            dateFilter={selectedDate}
          />
        )}
      </div>
    </>
  );
};

export default MileagePage;
