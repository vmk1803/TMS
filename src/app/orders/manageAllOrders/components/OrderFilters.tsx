"use client";
import React, { useState, useRef, useEffect } from "react";
import { Download, Filter, Search } from "lucide-react";
import OrderFilterDrawer from "./OrderFilterDrawer";
import BulkUpdateModal from "./BulkUpdateModal";
import { bulkOrderUpdate } from "../services/bulkOrderUpdateService";
import Toast from "@/components/common/Toast";
import { useRouter } from "next/navigation";
import { fetchOrderByPhlebioId } from "../services/barcodeSearchService";

interface OrderFiltersProps {
  filters: Record<string, any>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onExport?: () => void;
  selectedCount?: number;
  selectedOrderGuids?: string[];
  onRefresh?: () => void;
  onClearSelection?: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  setFilters,
  setPage,
  onExport,
  selectedCount = 0,
  selectedOrderGuids = [],
  onRefresh,
  onClearSelection
}) => {
  const [todayOnly, setTodayOnly] = useState(false);
  // const [assignedOnly, setAssignedOnly] = useState(false);
  const [emrOrders, setEmrOrders] = useState(false);
  const [labsquireOrders, setLabsquireOrders] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);

  const router = useRouter();

  //  Auto Focus Ref for Barcode Input
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchingBarcode, setSearchingBarcode] = useState(false);

  // Bulk Update State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] =
    useState<"RESET_PENDING" | "BATCH_DOS" | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: ""
  });

  // Auto focus when component loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function applyFilters() {
    const newFilters: Record<string, any> = { ...filters };
    if (todayOnly) {
      newFilters['date_of_service'] = new Date().toISOString().split('T')[0];
    } else {
      delete newFilters['date_of_service']
    }
    // if (assignedOnly) {
    //   newFilters["status"] = "ASSIGNED";
    // } else {
    //   delete newFilters["status"];
    // }
    if (emrOrders) {
      newFilters["emr_order_id"] = true;
    } else {
      delete newFilters["emr_order_id"];
    }
    if (labsquireOrders) {
      newFilters["lab_order_id"] = true;
    } else {
      delete newFilters["lab_order_id"];
    }
    setFilters(newFilters);
  }

  useEffect(() => {
    applyFilters();
  }, [todayOnly, emrOrders,labsquireOrders]);

  const handleBulkUpdate = async (date: string) => {
    if (!bulkAction || selectedOrderGuids.length === 0) return;

    try {
      setLoading(true);
      const payload: any = {
        order_guids: selectedOrderGuids,
        date_of_service: date
      };

      if (bulkAction === "RESET_PENDING") {
        payload.status = "PENDING";
      }

      await bulkOrderUpdate(payload);

      setToast({
        open: true,
        type: "success",
        message: "Orders updated successfully"
      });
      setShowBulkModal(false);
      setBulkAction(null);
      if (onRefresh) onRefresh();
      if (onClearSelection) onClearSelection();
    } catch (error: any) {
      setToast({
        open: true,
        type: "error",
        message: error.message || "Failed to update orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const openBulkModal = (action: "RESET_PENDING" | "BATCH_DOS") => {
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const handleBarcodeSearch = async (searchValue?: string) => {
    const valueToSearch = searchValue || barcodeInput;
    if (!valueToSearch.trim()) return;

    try {
      setSearchingBarcode(true);
      const orderData = await fetchOrderByPhlebioId(valueToSearch.trim());

      if (orderData && orderData.guid) {
        router.push(`/orders/view?orderGuid=${orderData.guid}`);
        setBarcodeInput("");

        //  Refocus after scan completes
        setTimeout(() => {
          inputRef.current?.focus();
        }, 200);
      } else {
        setToast({
          open: true,
          type: "error",
          message: "Order not found"
        });
      }
    } catch (error: any) {
      setToast({
        open: true,
        type: "error",
        message: error.message || "Failed to search order"
      });
    } finally {
      setSearchingBarcode(false);
    }
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBarcodeSearch();
    }
  };

  const handleBarcodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    setBarcodeInput(pastedText);
    if (pastedText.trim()) {
      handleBarcodeSearch(pastedText);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between bg-white p-3 rounded-t-xl shadow-sm border border-gray-200 flex-wrap gap-3">

        {/* Left Section */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">

            {/* Today Only */}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <div
                onClick={() => setTodayOnly(!todayOnly)}
                className={`w-10 h-5 flex items-center rounded-full p-[2px] transition-all ${todayOnly ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${todayOnly ? "translate-x-5" : "translate-x-0"
                    }`}
                ></div>
              </div>
              Today’s Service
            </label>

            {/* Assigned Only */}
            {/* <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <div
                onClick={() => setAssignedOnly(!assignedOnly)}
                className={`w-10 h-5 flex items-center rounded-full p-[2px] transition-all ${assignedOnly ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${assignedOnly ? "translate-x-5" : "translate-x-0"
                    }`}
                ></div>
              </div>
              Assigned Only
            </label> */}

            {/* EMR Orders */}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <div
                onClick={() => setEmrOrders(!emrOrders)}
                className={`w-10 h-5 flex items-center rounded-full p-[2px] transition-all ${emrOrders ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emrOrders ? "translate-x-5" : "translate-x-0"
                    }`}
                ></div>
              </div>
              EMR Orders
            </label>
              {/* LABSQUIRE Orders */}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <div
                onClick={() => setLabsquireOrders(!labsquireOrders)}
                className={`w-10 h-5 flex items-center rounded-full p-[2px] transition-all ${
                  labsquireOrders ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    labsquireOrders ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </div>
              Labsquire Orders
            </label>
            <button
              onClick={() => openBulkModal("BATCH_DOS")}
              disabled={selectedCount === 0}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${selectedCount > 0
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              Batch DOS
            </button>

            <button
              onClick={() => openBulkModal("RESET_PENDING")}
              disabled={selectedCount === 0}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${selectedCount > 0
                ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              Reset Pending
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Barcode Scanner Input */}
          <div className="relative">
            <input
              ref={inputRef} // Auto-focus reference
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={handleBarcodeKeyPress}
              onPaste={handleBarcodePaste}
              placeholder="Scan Barcode"
              disabled={searchingBarcode}
              className="pl-9 pr-3 py-2 rounded-full text-sm border border-gray-300 focus:outline-none focus:border-green-600 w-48 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${searchingBarcode
                ? "text-gray-400"
                : "text-gray-500 cursor-pointer hover:text-green-600"
                }`}
              onClick={
                searchingBarcode ? undefined : () => handleBarcodeSearch()
              }
            />
          </div>

          <button
            onClick={() => onExport && onExport()}
            disabled={selectedCount === 0}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-full text-sm transition-all ${selectedCount === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
          >
            <Download size={16} /> Export CSV
            {selectedCount > 0 && (
              <span className="ml-1 bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowDrawer(true)}
            className="bg-secondary text-white p-2 rounded-xl hover:bg-primary transition-all"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <OrderFilterDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onApply={(drawerFilters) => {
          // Don't reset page - let the URL handle pagination state
          setFilters((prev) => {
            const next = { ...prev, ...drawerFilters } as Record<string, any>
            const possibleKeysToRemove = ['dos_from', 'dos_to', 'created_from', 'created_to', 'partner_name']
            possibleKeysToRemove.forEach((k) => {
              if (!(k in drawerFilters) && k in next) {
                delete next[k]
              }
            })
            return next
          })
        }}
        onClear={() => {
          // Don't reset page - let the URL handle pagination state
          // Only clear drawer-specific filters, not table header filters
          setFilters((prev) => {
            const next = { ...prev };
            // Remove only drawer filters
            delete next.dos_from;
            delete next.dos_to;
            delete next.created_from;
            delete next.created_to;
            delete next.partner_name;
            return next;
          });
          setTodayOnly(false);
          // setAssignedOnly(false);
          setEmrOrders(false);
        }}
      />

      <BulkUpdateModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkAction(null);
          if (onClearSelection) onClearSelection();
        }}
        onUpdate={handleBulkUpdate}
        title={
          bulkAction === "RESET_PENDING"
            ? "Reset Pending Status"
            : "Batch Update DOS"
        }
        loading={loading}
      />

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default OrderFilters;
