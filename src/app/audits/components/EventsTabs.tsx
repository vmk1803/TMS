"use client";
import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import { UseGlobalAuditsReturn } from '../hooks/globalAuditsHook';

interface EventsTabsProps {
  activeTab: "Events";
  setActiveTab: (tab: "Events") => void;
  audits: UseGlobalAuditsReturn;
}

const EventsTabs: React.FC<EventsTabsProps> = ({ activeTab, setActiveTab, audits }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const SELECT_LABEL = "Select Entity";
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"single" | "custom">("single");
  const [singleDate, setSingleDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const [options, setOptions] = useState<string[]>([
    "Order",
    "User",
    "Test",
    "Test Tube",
    "Facility",
    "Physician ",
    "Insurance"
  ]);

  const { page, setPage, pageSize, setPageSize, data, loading, error, totalPages, limit, total, filters, setFilters, reload } = audits;

  useEffect(() => {
    const newFilters: any = {};
    if(selectedOption === "Facility") {
      newFilters.table_name = 'partner';
    }else if(selectedOption === "Test") {
      newFilters.table_name = "Test"
    }else if(selectedOption === "Test Tube") {
      newFilters.table_name = "Test Tube";
    }else if(selectedOption === "Physician ") {
      newFilters.table_name = "Physician";
    }else if(selectedOption === "Order") {
      newFilters.table_name = "Order";
    // }else if(selectedOption === "Patient") {
    //   newFilters.table_name = "Patient";
    }else if(selectedOption === "User") {
      newFilters.table_name = "User";
    }else if(selectedOption === "Insurance") {
      newFilters.table_name = "Insurance";
    }
    if (dateMode === "single" && singleDate) {
      newFilters.changed_at = singleDate;
    }
    setFilters(newFilters);
  }, [selectedOption, dateMode, singleDate, setFilters]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border-b border-gray-200 rounded-t-xl px-4 gap-3">
      {/* Tabs */}
      <div className="flex items-center gap-6">
        {["Events"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "Events")}
            className={`text-base font-semibold relative py-4 ${
              activeTab === tab
                ? "text-green-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-600"
                : "text-gray-500 hover:text-green-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Search */}
        {/* <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-200 rounded-full pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div> */}

        {/* --- Custom Dropdown --- */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border border-gray-200 rounded-full px-9 py-2 text-sm text-gray-700 flex items-center gap-4 hover:bg-gray-100 transition"
            >
              {selectedOption || SELECT_LABEL}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {selectedOption && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption("");
                  try {
                    const newFilters = { ...(filters || {}) } as Record<string, any>;
                    delete newFilters.table_name;
                    setFilters(newFilters);
                  } catch (err) {
                    setFilters({});
                  }
                }}
                title={`Clear selected ${selectedOption}`}
                className="border border-gray-200 rounded-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                ×
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-50">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedOption(option);
                    setDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedOption === option
                      ? "bg-green-100 text-secondary font-medium"
                      : "text-gray-700 hover:text-secondary hover:bg-green-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setDatePickerOpen(!datePickerOpen)}
            className="border border-gray-200 rounded-full px-9 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition"
          >
            {fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate && !toDate ? `${fromDate}` : toDate && !fromDate ? `${toDate}` : 'Select Date'}
            <Calendar size={16} className="text-green-600" />
          </button>

          {datePickerOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg p-4 z-50">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDateMode("single")}
                    className={`px-3 py-1 rounded-full text-sm ${dateMode === 'single' ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600'}`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setDateMode("custom")}
                    className={`px-3 py-1 rounded-full text-sm ${dateMode === 'custom' ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600'}`}
                  >
                    Custom
                  </button>
                </div>

                {dateMode === 'single' ? (
                  <div>
                    <label className="text-xs text-gray-500">Date</label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  <>
                    <label className="text-xs text-gray-500">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    />

                    <label className="text-xs text-gray-500">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                  </>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                      setSingleDate("");
                      setDatePickerOpen(false);
                      // If user cleared custom range, apply empty date filters so API reloads
                      const newFilters: any = {};
                      newFilters.table_name = selectedOption ? selectedOption.toUpperCase().replace(" ", "_") : undefined;
                      setFilters(newFilters);
                      // Don't reset page - let the URL handle pagination state
                    }}
                    className="px-3 py-1 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>

                  {dateMode === 'custom' ? (
                    <button
                      onClick={() => {
                        const newFilters: any = {};
                        newFilters.table_name = selectedOption ? selectedOption.toUpperCase().replace(" ", "_") : undefined;
                        if (fromDate) newFilters.from_date = fromDate;
                        if (toDate) newFilters.to_date = toDate;
                        setFilters(newFilters);
                        setDatePickerOpen(false);
                      }}
                      className="px-3 py-1 text-sm rounded-full bg-green-600 text-white hover:opacity-95"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={() => setDatePickerOpen(false)}
                      className="px-3 py-1 text-sm rounded-full bg-green-600 text-white hover:opacity-95"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsTabs;
