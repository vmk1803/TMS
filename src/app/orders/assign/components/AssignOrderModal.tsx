"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useTechnicians } from "../hooks/useTechnicians";

interface AssignOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (technicianGuid: string | null) => void;
  assigning?: boolean;
}

const AssignOrderModal: React.FC<AssignOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assigning,
}: AssignOrderModalProps) => {
  const { options } = useTechnicians(1, 10);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTechGuid, setSelectedTechGuid] = useState<string | null>(null);
  const [selectedTechLabel, setSelectedTechLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetSelection = () => {
    setSelectedTechGuid(null);
    setSelectedTechLabel("");
    setSearchTerm("");
    setDropdownOpen(false);
  };

  const handleClose = () => {
    resetSelection();
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedTechGuid);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetSelection();
    }
  }, [isOpen]);

  return (
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
            <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC] border-b border-[#DDE2E5]">
              <h2 className="text-lg font-semibold text-gray-800">Assign</h2>
              <button onClick={handleClose} className="text-gray-600 hover:text-red-500 transition">
                <X size={22} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <label className="block text-sm font-medium text-gray-700">Technician <span className="text-red-500">*</span></label>

              <div className="relative pb-9">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-left flex justify-between items-center text-gray-600"
                >
                  <span className="truncate">{selectedTechLabel || "Select"}</span>
                  <div className="flex items-center gap-2">
                    {selectedTechGuid && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          resetSelection();
                        }}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <X size={14} />
                      </span>
                    )}
                    <ChevronDown className="text-green-600 w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-xl border border-gray-200 z-50 max-h-60 overflow-hidden flex flex-col"
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
                      <ul className="overflow-y-auto scrollbar-custom flex-1">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((opt) => (
                            <li
                              key={opt.guid}
                              onClick={() => {
                                setSelectedTechGuid(opt.guid);
                                setSelectedTechLabel(opt.label);
                                setDropdownOpen(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                            >
                              {opt.label}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-sm text-gray-500 text-center">
                            No Item Found
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end gap-3 pt-9 pb-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedTechGuid || assigning}
                >
                  {assigning ? 'Assigning...' : 'Assign Order'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignOrderModal;
