"use client";
import React, { useState, useEffect, useMemo } from "react";
import { CompletedIcon, PendingIcon, PerfumedIcon, RejectIcon, TotalIcon } from "../../../../../components/Icons";
import { ChevronDown } from "lucide-react";
import { getTechniciansByGuid } from "../../services/viewUserService";

const OrdersPerformed = ({ userData }: { userData: any }) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("Today");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const range = useMemo(() => {
    const today = new Date();
    if (selectedOption === "Yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const f = formatDate(d);
      return { from: f, to: f, isRange: false };
    }
    if (selectedOption === "Last Week") {
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return { from: formatDate(lastWeekStart), to: formatDate(lastWeekEnd), isRange: true };
    }
    if (selectedOption === "Last Month") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: formatDate(start), to: formatDate(end), isRange: true };
    }
    if (selectedOption === "Last Year") {
      const year = today.getFullYear() - 1;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { from: formatDate(start), to: formatDate(end), isRange: true };
    }
    if (selectedOption === "Custom" && customDate) {
      const f = formatDate(customDate);
      return { from: f, to: f, isRange: false };
    }
    const fToday = formatDate(today);
    return { from: fToday, to: fToday, isRange: false };
  }, [selectedOption, customDate]);

  useEffect(() => {
    const technicianGuid = userData?.guid || userData?.user_guid || userData?.id;
    if (!technicianGuid) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = range.isRange ? { from_date: range.from, to_date: range.to } : { from_date: range.from };
        const res = await getTechniciansByGuid(technicianGuid, params);
        if (!active) return;
        setOrders(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load orders");
        setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [range.from, range.to, range.isRange, userData?.guid, userData?.user_guid, userData?.id]);

  const getCountForStatus = (status: string) => {
    return orders.filter(o => (o.status || o.order_status || "").toUpperCase() === status.toUpperCase()).length;
  };
  const total = useMemo(() => orders.length, [orders]);
  const completed = getCountForStatus("COMPLETED");
  const pending = getCountForStatus("PENDING") + getCountForStatus("ASSIGNED");
  const rejected = getCountForStatus("CANCELLED");
  const performed = getCountForStatus("PERFORMED");

  const stats = [
    { label: "Total", value: total, color: "bg-blue-50", icon: <TotalIcon /> },
    { label: "Completed", value: completed, color: "bg-green-50", icon: <CompletedIcon /> },
    { label: "Pending", value: pending, color: "bg-yellow-50", icon: <PendingIcon /> },
    { label: "Rejected", value: rejected, color: "bg-red-50", icon: <RejectIcon /> },
    { label: "Performed", value: performed, color: "bg-purple-50", icon: <PerfumedIcon /> },
  ];

  const options = [
    "Today",
    "Yesterday",
    "Last Week",
    "Last Month",
    "Last Year",
    "Custom",
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    const d = new Date(year, (month || 1) - 1, day || 1);
    setCustomDate(d);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg lg:text-2xl font-semibold text-primaryText">
          Orders
        </h3>

        <div className="flex items-center gap-2">
              {selectedOption === "Custom" && (
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={
                customDate
                  ? customDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={handleDateChange}
              className="border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700"
            />
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 transition"
            >
              {selectedOption}
              <ChevronDown size={14} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 p-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedOption(option);
                      if (option !== "Custom") setCustomDate(null);
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-1.5 text-xs rounded-xl ${
                      selectedOption === option
                        ? "bg-green-100 text-green-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`flex gap-2 items-center px-3 py-4 rounded-2xl ${item.color}`}
          >
            <div className="mb-2">{item.icon}</div>
            <div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
              <p className="font-semibold text-lg">
                {loading ? "-" : item.value}
              </p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPerformed;