"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { getAllUsers } from "../../app/records/users/services/viewUserService";
import { assignOrder } from "../../app/techrouts/services/techRoutesService";
import Toast from "../common/Toast";
import type { Technician } from "../../types/technician";

interface ReAssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrderGuids: string[];
  onSuccess: () => void;
  onError?: (msg: string) => void;
  order_id?: string;
}

const ReAssignTechnicianModal: React.FC<ReAssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  selectedOrderGuids,
  onSuccess,
  onError,
  order_id,
}) => {
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedTechnicianGuid, setSelectedTechnicianGuid] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    message: "",
  });

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ open: true, type, message });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const resetSelection = () => {
    setSelectedTechnician("");
    setSelectedTechnicianGuid("");
    setSearchTerm("");
    setTechDropdownOpen(false);
  };

  // Fetch technicians when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
    }
  }, [isOpen]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers({
        page: 1,
        pageSize: 10000,
        filters: { user_type: "TECHNICIAN", is_deleted: false },
      });
      setTechnicians(response.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch technicians");
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTechnicians = technicians.filter((tech) => {
    const fullName = `${tech.first_name} ${tech.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleTechnicianSelect = (tech: Technician) => {
    setSelectedTechnician(`${tech.first_name} ${tech.last_name}`);
    setSelectedTechnicianGuid(tech.guid);
    setSearchTerm("");
    setTechDropdownOpen(false);
  };

const handleReassign = async () => {
  if (!selectedTechnicianGuid || !progressNotes.trim()) return;

  try {
    setSubmitting(true);
    setError(null);

    await assignOrder(selectedOrderGuids, selectedTechnicianGuid, progressNotes);

    showToast("success", "Order re-assigned successfully!");

    resetSelection();
    setProgressNotes("");

    onSuccess(); // parent toast also triggers
  } catch (err: any) {
    const msg = err?.response?.data || "Failed to re-assign order";

    showToast("error", typeof msg === "string" ? msg : "Something went wrong");

    if (onError) onError(typeof msg === "string" ? msg : "Something went wrong");

    setError(err);
  } finally {
    setSubmitting(false);
  }
};

  const handleClose = () => {
    resetSelection();
    setProgressNotes("");
    setError(null);
    onClose();
  };

  const isFormValid = selectedTechnicianGuid && progressNotes.trim();

  return (
    <>
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
        offsetY={90}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white w-[95%] md:w-[430px] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC] border-b border-[#DDE2E5]">
                <h2 className="text-lg font-semibold text-gray-800">
                  Re Assign ({order_id || `${selectedOrderGuids.length} Order`})
                </h2>
                <button onClick={handleClose} className="text-gray-600 hover:text-red-500 transition">
                  <X size={22} />
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-5 space-y-5">
                <label className="block text-sm font-medium text-gray-700">
                  Technician <span className="text-red-500">*</span>
                </label>

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-left flex justify-between items-center"
                  >
                    <span>{loading ? "Loading..." : selectedTechnician || "Select"}</span>

                    <div className="flex items-center gap-2">
                      {selectedTechnicianGuid && (
                        <X
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          size={16}
                          onClick={(e) => {
                            e.stopPropagation();
                            resetSelection();
                          }}
                        />
                      )}
                      <ChevronDown className="text-green-600 w-5 h-5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {techDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-xl border border-gray-200 z-50 max-h-60 overflow-y-auto"
                      >
                        <div className="p-2 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                          />
                        </div>

                        {filteredTechnicians.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500 text-sm">No technicians found</div>
                        ) : (
                          filteredTechnicians.map((tech) => (
                            <div
                              key={tech.guid}
                              onClick={() => handleTechnicianSelect(tech)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                            >
                              {tech.first_name} {tech.last_name}
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notes */}
                <label className="block text-sm font-medium text-gray-700">
                  Technician Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Enter Technician notes..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm"
                />

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReassign}
                    disabled={!isFormValid || submitting}
                    className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-50"
                  >
                    {submitting ? "Re-Assigning..." : "Re-Assign Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReAssignTechnicianModal;
