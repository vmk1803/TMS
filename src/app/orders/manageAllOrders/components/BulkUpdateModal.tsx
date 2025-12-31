import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import DateCalenderPicker from "@/components/common/DateCalenderPicker";

interface BulkUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (date: string) => void;
    title: string;
    loading?: boolean;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
    isOpen,
    onClose,
    onUpdate,
    title,
    loading = false,
}) => {
    const [dateOfService, setDateOfService] = useState("");

    useEffect(() => {
        if (isOpen) {
            setDateOfService("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpdate = () => {
        if (dateOfService) {
            onUpdate(dateOfService);
        }
    };

    const isFormValid = !!dateOfService;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Date of Service <span className="text-red-500">*</span>
                        </label>
                        <DateCalenderPicker
                            value={dateOfService}
                            onChange={(date) => setDateOfService(date || "")}
                            placeholder="Select Date"
                            className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={!isFormValid || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUpdateModal;
