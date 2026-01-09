"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmText = "Yes",
  cancelText = "No",
}) => {
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
            className="bg-white w-[95%] md:w-[420px] rounded-2xl shadow-2xl overflow-hidden"
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

            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {body}
              </h3>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-6 py-2 bg-secondary hover:bg-secondary text-white rounded-full text-sm font-medium transition-all shadow-md"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
