"use client";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTechnicians } from "../../orders/assign/services/technicianService";
import type { Technician } from "../../../types/technician";
import AllDatesPicker from "@/components/common/AllDatesPicker";

interface RouteFiltersProps {
  onFiltersChange?: (filters: { technician_guid?: string; date_of_service?: string }) => void;
  defaultDate?: string | null;
}

const RouteFilters: React.FC<RouteFiltersProps> = ({ onFiltersChange, defaultDate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Format date to MM-DD-YYYY
  const formatDateToMMDDYYYY = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  // Initialize with today's date as default
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return formatDateToMMDDYYYY(new Date());
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync state with prop if it changes (only if defaultDate is provided)
  useEffect(() => {
    if (defaultDate && !selectedDate) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate, selectedDate]);

  const toIsoDate = (mmddyyyy: string | null): string | undefined => {
    if (!mmddyyyy) return undefined;
    const parts = mmddyyyy.split("-");
    if (parts.length === 3) {
      const [mm, dd, yyyy] = parts;
      return `${mm}-${dd}-${yyyy}`;
    }
    return undefined;
  };

  // Send filters when tech or date changes
  useEffect(() => {
    const created = toIsoDate(selectedDate || null);

    const payload: {
      technician_guid?: string;
      date_of_service?: string;
    } = {};

    if (selectedTech?.guid) payload.technician_guid = selectedTech.guid;
    if (created) payload.date_of_service = created;

    onFiltersChange?.(payload);
  }, [selectedTech, selectedDate]);

  // Load technicians
  useEffect(() => {
    let active = true;
    const load = async () => {
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
    load();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const todayLabel = useMemo(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [selectedDate]);

  const displayName = (t: Technician) => {
    const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
    return name || t.user_name || t.email || t.guid;
  };

  const filteredTechnicians = technicians.filter(t =>
    displayName(t).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* Technician Dropdown */}
      <div ref={containerRef} className="relative w-full sm:w-auto">
        <div className="w-full sm:w-[280px] px-3 py-2 rounded-full border border-gray-200 bg-white text-left flex justify-between items-center text-sm text-gray-700">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
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
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 mt-2 w-full sm:w-[280px] bg-white shadow-lg rounded-xl border border-gray-200 z-50 max-h-64 overflow-hidden flex flex-col"
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
                        setOpen(false);
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

      {/* Date Picker */}
      <div className="relative" id="routefilters-datepicker">
        <AllDatesPicker
          value={selectedDate}
          onChange={(val) => setSelectedDate(val)}
          className="w-[180px]"
        />
      </div>
    </div>
  );
};

export default RouteFilters;
