"use client";
import React, { useEffect, useState } from "react";

interface AvailabilityProps {
  userData?: any;
  onChange?: (days: { name: string; available: boolean }[]) => void;
}

const BASE_DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Availability = ({ userData, onChange }: AvailabilityProps) => {
  const [days, setDays] = useState(
    BASE_DAY_NAMES.map((name) => ({ name, available: false }))
  );

  // Adapt incoming data to days state
  useEffect(() => {
    let available: string[] = [];
    if (Array.isArray(userData)) {
      available = userData as string[];
    } else if (userData) {
      if (Array.isArray(userData.available_days)) available = userData.available_days;
      else if (Array.isArray(userData.availability)) available = userData.availability;
      else if (Array.isArray(userData.days)) available = userData.days;
    }
    setDays(BASE_DAY_NAMES.map((name) => ({ name, available: available.includes(name) })));
  }, [userData]);

  const toggleDay = (index: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], available: !next[index].available };
      onChange?.(next);
      return next;
    });
  };
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-5">
      <h3 className="text-lg lg:text-2xl font-semibold text-primaryText mb-4">Availability</h3>

      <div className="flex flex-wrap gap-5">
        {days.map((day, index) => (
          <label
            key={day.name}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={day.available}
              onChange={() => toggleDay(index)}
              className="h-4 w-4 accent-green-600 cursor-pointer"
            />
            <span
              className={`text-sm font-medium ${
                day.available ? "text-secondary" : "text-primaryText"
              }`}
            >
              {day.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Availability;
