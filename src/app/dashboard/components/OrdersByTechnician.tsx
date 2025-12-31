"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  getPartnerOrderCountsByType,
  type PartnerOrderCountItem,
} from "../services/ordersCountService";
import AllDatesPicker from "@/components/common/AllDatesPicker";

const options = [
  "Today",
  "Yesterday",
  "Last Week",
  "Last Month",
  "Last Year",
  "Custom",
];

type RangeOption = (typeof options)[number];

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLastWeekRange(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start_date: formatDate(start), end_date: formatDate(end) };
}

function getLastMonthRange(today: Date) {
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);

  return { start_date: formatDate(start), end_date: formatDate(end) };
}

function getLastYearRange(today: Date) {
  const year = today.getFullYear() - 1;
  return {
    start_date: formatDate(new Date(year, 0, 1)),
    end_date: formatDate(new Date(year, 11, 31)),
  };
}

function getRangeForOption(
  option: RangeOption,
  fromDate: Date | null,
  toDate: Date | null,
  today: Date
) {
  if (option === "Yesterday") {
    const d = new Date(today);
    d.setDate(today.getDate() - 1);
    const f = formatDate(d);
    return { start_date: f, end_date: f };
  }

  if (option === "Last Week") return getLastWeekRange(today);
  if (option === "Last Month") return getLastMonthRange(today);
  if (option === "Last Year") return getLastYearRange(today);

  if (option === "Custom" && fromDate && toDate) {
    return {
      start_date: formatDate(fromDate),
      end_date: formatDate(toDate),
    };
  }

  const todayFormatted = formatDate(today);
  return { start_date: todayFormatted, end_date: todayFormatted };
}

const OrdersByTechnician = () => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<RangeOption>("Today");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // CUSTOM RANGE STATE
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [items, setItems] = useState<PartnerOrderCountItem[]>([]);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => new Date(), []);

  const range = useMemo(
    () => getRangeForOption(selectedOption, fromDate, toDate, today),
    [selectedOption, fromDate, toDate, today]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getPartnerOrderCountsByType({
          type: "technician",
          start_date: range.start_date,
          end_date: range.end_date,
        });
        if (!active) return;
        setItems(res || []);
      } catch (e) {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [range.start_date, range.end_date]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800">Orders By Technician</h4>

        <div className="flex items-start gap-3">

          {/* CUSTOM DATE (FROM / TO) STACKED */}
          {selectedOption === "Custom" && (
            <div className="flex flex-col gap-2">

              {/* FROM DATE */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 w-8">From:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={fromDate ? formatDate(fromDate) : ""}
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      setFromDate(new Date(year, (month || 1) - 1, day || 1));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>

              {/* TO DATE */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 w-8">To:</label>
                <div className="w-32">
                  <AllDatesPicker
                    value={toDate ? formatDate(toDate) : ""}
                    onChange={(date) => {
                      if (!date) return;
                      const [month, day, year] = date.split("-").map(Number);
                      setToDate(new Date(year, (month || 1) - 1, day || 1));
                    }}
                    placeholder="MM-DD-YYYY"
                    className="py-1 text-xs"
                  />
                </div>
              </div>

            </div>
          )}

          {/* DROPDOWN UNTOUCHED */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              {selectedOption}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 p-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-lg z-20 py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedOption(option as RangeOption);
                      if (option !== "Custom") {
                        setFromDate(null);
                        setToDate(null);
                      }
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${selectedOption === option
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

      {/* TABLE */}
      <div className="max-h-64 overflow-y-auto scrollbar-custom pr-1">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Total Orders</th>
              <th className="py-2 text-left">Completed</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                  </div>
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-xs text-gray-400">
                  No data
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.entity_id} className="border-b last:border-none">
                  <td className="py-2">{item.entity_name}</td>
                  <td className="py-2">{item.order_count}</td>
                  <td className="py-2">{item.completed_order_count ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersByTechnician;
