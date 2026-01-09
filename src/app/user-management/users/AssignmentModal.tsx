"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import CustomSelect from "../../../components/common/CustomSelect";
import { useRoles } from "../../../hooks/useRoles";
import { useDepartments } from "../../../hooks/useDepartments";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  type: 'role' | 'department';
  currentValueId?: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  currentValueId,
}) => {
  const { roles, loading: rolesLoading } = useRoles({ fetchAll: true });
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true });

  const [selectedValueId, setSelectedValueId] = useState<string>("");

  // Reset selected value when modal opens
  useEffect(() => {
    if (isOpen && currentValueId) {
      setSelectedValueId(currentValueId);
    }
  }, [isOpen, currentValueId]);

  const isRoleType = type === 'role';
  const data = isRoleType ? roles : departments;
  const loading = isRoleType ? rolesLoading : departmentsLoading;

  const options = data.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  const handleConfirm = () => {
    if (selectedValueId && selectedValueId !== currentValueId) {
      onConfirm(selectedValueId);
    }
  };

  const isSaveDisabled = !selectedValueId || selectedValueId === currentValueId;

  const label = isRoleType ? 'Role' : 'Department';
  const title = `Assign ${label}`;

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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white w-[95%] md:w-[420px] rounded-2xl shadow-2xl overflow-visible relative z-10"
          >
            <div className="flex justify-between items-center px-6 py-3 bg-[#E6F5EC] border-b border-[#DDE2E5] rounded-t-2xl">
              <h2 className="text-base font-semibold text-primaryText">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <CustomSelect
                label={label}
                value={selectedValueId}
                options={options}
                onChange={setSelectedValueId}
                disabled={loading}
                required
              />

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSaveDisabled}
                  className="px-6 py-2 bg-secondary hover:bg-secondary text-white rounded-full text-sm font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
