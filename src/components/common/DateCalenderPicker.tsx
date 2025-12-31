// use client

import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X as ClearIcon } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateCalenderPickerProps {
  value?: string | Date | null;
  onChange: (value: string | null) => void;
  name?: string;
  error?: boolean;
  placeholder?: string;
  className?: string;
  minDate?: Date;
}

/* ---------- tiny helpers (minimal & local) ---------- */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function MonthDropdown({
  selectedMonth,
  onSelect,
}: { selectedMonth: number; onSelect: (m: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="dp-dropdown" style={{ display: 'inline-block' }}>
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(s => !s); }}
      >
        <span className="dp-label">{MONTHS[selectedMonth]}</span>
        <svg className="dp-arrow" viewBox="0 0 20 20" width="14" height="14" aria-hidden>
          <path fill="currentColor" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      {open && (
        <ul className="dp-dropdown-panel months" role="listbox" aria-label="Months">
          {MONTHS.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === selectedMonth}
              className={`dp-item ${i === selectedMonth ? 'selected' : ''}`}
              onClick={() => { onSelect(i); setOpen(false); }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * YearDropdown for this component:
 * - By default shows currentYear → currentYear + spanForward (future years only),
 *   because this DateCalenderPicker uses minDate = today (only future allowed).
 * - If you want past years instead, set allowFuture to false or change spanForward.
 */
function YearDropdown({
  selectedYear,
  onSelect,
  allowFuture = true,
  spanForward = 5,
}: { selectedYear: number; onSelect: (y: number) => void; allowFuture?: boolean; spanForward?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const currentYear = new Date().getFullYear();
  let years: number[] = [];

  if (allowFuture) {
    // future-oriented: current → current + spanForward
    for (let y = currentYear; y <= currentYear + spanForward; y++) years.push(y);
    if (!years.includes(selectedYear)) {
      // include selectedYear if it's beyond the span
      years.push(selectedYear);
      years.sort((a, b) => a - b);
    }
  } else {
    // past-oriented: current → current - spanBack (not used here)
    const spanBack = 100;
    for (let y = currentYear; y >= currentYear - spanBack; y--) years.push(y);
    if (!years.includes(selectedYear)) {
      years.push(selectedYear);
      years.sort((a, b) => b - a);
    }
  }

  return (
    <div ref={ref} className="dp-dropdown" style={{ display: 'inline-block' }}>
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(s => !s); }}
      >
        <span className="dp-label">{selectedYear}</span>
        <svg className="dp-arrow" viewBox="0 0 20 20" width="14" height="14" aria-hidden>
          <path fill="currentColor" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      {open && (
        <ul className="dp-dropdown-panel dp-years" role="listbox" aria-label="Years">
          {years.map((y) => (
            <li
              key={y}
              role="option"
              aria-selected={y === selectedYear}
              className={`dp-item ${y === selectedYear ? 'selected' : ''}`}
              onClick={() => { onSelect(y); setOpen(false); }}
            >
              {y}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Main component (kept exactly as you provided, only minimal header change) ---------- */
const DateCalenderPicker: React.FC<DateCalenderPickerProps> = ({
  value,
  onChange,
  name,
  error = false,
  placeholder = 'MM-DD-YYYY',
  className = '',
  minDate
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<any>(null);

  // Initialize from prop
  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        if (value.match(/^\d{2}-\d{2}-\d{4}$/)) {
          setInputValue(value);
        } else {
          const parsed = parseDate(value);
          if (parsed) setInputValue(formatDate(parsed));
          else setInputValue(value);
        }
      } else if (value instanceof Date) {
        setInputValue(formatDate(value));
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [p1, p2, p3] = parts.map((p) => parseInt(p, 10));
      // Detect YYYY-MM-DD
      if (p1 > 31 && p2 <= 12 && p3 <= 31) {
        const d = new Date(p1, p2 - 1, p3);
        return isNaN(d.getTime()) ? null : d;
      }
      // Assume MM-DD-YYYY
      if (p1 <= 12 && p2 <= 31 && p3 >= 1900) {
        const d = new Date(p3, p1 - 1, p2);
        return isNaN(d.getTime()) ? null : d;
      }
    }
    const iso = new Date(dateString);
    return isNaN(iso.getTime()) ? null : iso;
  };

  const validateDateFormat = (dateString: string): boolean => {
    // MM-DD-YYYY pattern
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [mmStr, ddStr, yyyyStr] = dateString.split("-");
    const mm = parseInt(mmStr, 10);
    const dd = parseInt(ddStr, 10);
    const yyyy = parseInt(yyyyStr, 10);

    // Today validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsed = new Date(yyyy, mm - 1, dd);
    if (isNaN(parsed.getTime())) return false;

    // Reject past dates → only allow today or future
    if (parsed < today) return false;
    if (minDate) {
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    if (parsed < min) return false;
  }
    // Days per month validation
    const daysInMonth = new Date(yyyy, mm, 0).getDate();
    if (dd > daysInMonth) return false;

    return true;
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");

    let mm = digits.slice(0, 2);
    let dd = digits.slice(2, 4);
    let yyyy = digits.slice(4, 8);

    // --- MONTH RESTRICTION (1–12) ---
    if (mm.length === 2) {
      const m = parseInt(mm, 10);
      if (m < 1) mm = "01";
      if (m > 12) mm = "12";
    }

    // --- DAY RESTRICTION BASED ON MONTH ---
    if (dd.length === 2) {
      const m = parseInt(mm, 10);
      const d = parseInt(dd, 10);

      // days in month
      const daysInMonth = new Date(
        yyyy ? parseInt(yyyy) : new Date().getFullYear(),
        m,
        0
      ).getDate();

      if (d < 1) dd = "01";
      if (d > daysInMonth) dd = String(daysInMonth).padStart(2, "0");
    }

    // --- YEAR RESTRICTION (>= today) ---
    if (yyyy.length === 4) {
      const todayYear = new Date().getFullYear();
      if (parseInt(yyyy) < todayYear) yyyy = String(todayYear);
    }

    // --- BUILD AUTO-FORMAT VALUE ---
    let formatted = mm;
    if (dd) formatted += "-" + dd;
    if (yyyy) formatted += "-" + yyyy;

    setInputValue(formatted);

    // Full format + valid date
    if (formatted.length === 10 && validateDateFormat(formatted)) {
      onChange(formatted);
    } else if (formatted.length === 0) {
      onChange(null);
    }
  };


  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formatted = formatDate(date);
      setInputValue(formatted);
      onChange(formatted);
    } else {
      setInputValue('');
      onChange(null);
    }
    setIsOpen(false);
  };

  const handleCalendarClick = () => setIsOpen(!isOpen);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const displayDate = inputValue ? parseDate(inputValue) : null;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={10}
          className={`w-full rounded-2xl border ${error ? 'border-red-500' : 'border-formBorder'} bg-formBg px-3 py-2 pr-10 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500 ${className}`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange(null);
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
            tabIndex={-1}
          >
            <ClearIcon className="w-4 h-4 mr-3" />
          </button>
        )}
        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          tabIndex={-1}
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
      {isOpen && (
        <div ref={datePickerRef} className="absolute z-50 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200">
          <DatePicker
            selected={displayDate}
            onChange={handleDateChange}
            dateFormat="MM-dd-yyyy"
            minDate={minDate ?? new Date()}
            openToDate={minDate ?? new Date()}
 // Only allow today and future dates
            inline
            /* minimal header override — replaces native selects only */
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
              changeMonth,
              changeYear,
            }) => (
              <div className="rdp-header-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                <button className="nav-btn" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>◀</button>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MonthDropdown selectedMonth={date.getMonth()} onSelect={changeMonth} />
                  {/* allowFuture true because minDate is today */}
                  <YearDropdown selectedYear={date.getFullYear()} onSelect={changeYear} allowFuture={true} spanForward={5} />
                </div>

                <button className="nav-btn" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>▶</button>
              </div>
            )}
          />
        </div>
      )}
      <style jsx global>{`
        .date-picker-inline .react-datepicker {
          font-family: 'Poppins', sans-serif;
          border: none;
          box-shadow: none;
          font-size: 0.8rem;
        }
        .date-picker-inline .react-datepicker__header {
          background-color: #EDF3EF;
          border-bottom: 1px solid #BDE2CA;
          padding: 0.2rem 0;
        }
        .date-picker-inline .react-datepicker__day-name, .date-picker-inline .react-datepicker__day, .date-picker-inline .react-datepicker__time-name {
          width: 1.7rem;
          line-height: 1.7rem;
          margin: 0.1rem;
        }
        .date-picker-inline .react-datepicker__current-month {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }
        .date-picker-inline .react-datepicker__day--disabled {
          color: #ccc;
          cursor: not-allowed;
        }
        .date-picker-inline .react-datepicker__day--today {
          font-weight: 600;
        }
        .date-picker-inline .react-datepicker__day--selected {
          background-color: #009728;
          color: white;
        }
        .date-picker-inline .react-datepicker__day--selected:hover {
          background-color: #008024;
        }
        .date-picker-inline .react-datepicker__day:hover {
          background-color: #EDF3EF;
        }

        /* ---------- Minimal added CSS for opened dropdown panels (non-invasive) ---------- */
        .dp-dropdown { position: relative; display: inline-block; }
        .dp-dropdown-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
        }
        .dp-dropdown-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.08); }
        .dp-label { flex: 1; text-align: left; }
        .dp-arrow { opacity: 0.7; }

        .dp-dropdown-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #ffffff;
          border: 1px solid rgba(34,48,60,0.08);
          border-radius: 10px;
          box-shadow: 0 12px 40px rgba(2,6,23,0.12);
          padding: 6px;
          z-index: 9999;
          max-height: 220px;
          overflow-y: auto;
          min-width: 160px;
        }

        .dp-dropdown-panel.dp-years { width: 120px; }

        .dp-item {
          list-style: none;
          padding: 10px 12px;
          margin: 4px 0;
          font-size: 13px;
          color: #0b1720;
          border-radius: 8px;
          cursor: pointer;
        }
        .dp-item:hover { background: rgba(14,165,161,0.06); }
        .dp-item.selected { background: #009728; color: #fff; }

        /* small scrollbar for webkit */
        .dp-dropdown-panel::-webkit-scrollbar { width: 10px; height: 10px; }
        .dp-dropdown-panel::-webkit-scrollbar-track { background: transparent; }
        .dp-dropdown-panel::-webkit-scrollbar-thumb { background: rgba(2,6,23,0.12); border-radius: 999px; }

        /* optional: keep header nav look consistent */
        .rdp-header-custom .nav-btn {
          background: transparent;
          border: none;
          font-size: 16px;
          padding: 6px 8px;
          cursor: pointer;
          color: #374151;
          border-radius: 8px;
        }
        .rdp-header-custom .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .rdp-header-custom .nav-btn:hover:not(:disabled) { background: rgba(16,24,40,0.04); }
      `}</style>
    </div>
  );
};

export default DateCalenderPicker;
