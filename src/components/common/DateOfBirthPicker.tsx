'use client'

import React, { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar, X as ClearIcon } from 'lucide-react'
import "react-datepicker/dist/react-datepicker.css"

//////////////////////////
// Tiny helpers (added)
//////////////////////////
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
]

function MonthDropdown({
  selectedMonth,
  onSelect
}: { selectedMonth: number, onSelect: (m: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  return (
    <div ref={ref} className="dp-dropdown">
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(s => !s)
        }}
      >
        <span className="dp-label">{MONTHS[selectedMonth]}</span>
        <svg className="dp-arrow" viewBox="0 0 20 20" width="14" height="14"><path fill="currentColor" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
      </button>

      {open && (
        <ul className="dp-dropdown-panel" role="listbox">
          {MONTHS.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === selectedMonth}
              className={`dp-item ${i === selectedMonth ? "selected" : ""}`}
              onClick={() => {
                onSelect(i)
                setOpen(false)
              }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------------------------
   YEAR DROPDOWN — UPDATED
   Only shows previous years (no future years).
   Currently shows: currentYear down to currentYear - 100.
   --------------------------- */
function YearDropdown({
  selectedYear,
  onSelect
}: { selectedYear: number, onSelect: (y: number) => void }) {

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  // Build years: currentYear down to (currentYear - 100)
  const currentYear = new Date().getFullYear()
  const spanBack = 100 // change this number if you want fewer/more years
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - spanBack; y--) {
    years.push(y)
  }
  // ensure selectedYear is included if it's older than spanBack
  if (selectedYear < currentYear - spanBack) {
    years.push(selectedYear)
    years.sort((a, b) => b - a) // keep descending order
  }

  return (
    <div ref={ref} className="dp-dropdown">
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(s => !s)
        }}
      >
        <span className="dp-label">{selectedYear}</span>
        <svg className="dp-arrow" viewBox="0 0 20 20" width="14" height="14"><path fill="currentColor" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
      </button>

      {open && (
        <ul className="dp-dropdown-panel dp-years" role="listbox">
          {years.map((y) => (
            <li
              key={y}
              role="option"
              aria-selected={y === selectedYear}
              className={`dp-item ${y === selectedYear ? "selected" : ""}`}
              onClick={() => {
                onSelect(y)
                setOpen(false)
              }}
            >
              {y}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

//////////////////////////
// Your original component (unchanged logic)
//////////////////////////
interface DateOfBirthPickerProps {
  value?: string | Date | null
  onChange: (date: string | null) => void
  name?: string
  error?: boolean
  placeholder?: string
  className?: string
}

const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  value,
  onChange,
  name,
  error = false,
  placeholder = 'MM-DD-YYYY',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const datePickerRef = useRef<any>(null)

  // --- Format date to MM-DD-YYYY ---
  const formatDate = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}-${dd}-${yyyy}`
  }

  // --- Parse formatted date ---
  const parseDate = (value: string): Date | null => {
    if (!value) return null
    const [mm, dd, yyyy] = value.split('-').map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    return isNaN(d.getTime()) ? null : d
  }

  // --- STRICT VALIDATION ---
  const validateDateFormat = (dateString: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
    if (!regex.test(dateString)) return false

    const [mm, dd, yyyy] = dateString.split("-").map(Number)

    const currentYear = new Date().getFullYear()
    if (yyyy > currentYear) return false
    if (mm < 1 || mm > 12) return false
    if (dd < 1 || dd > 31) return false

    const date = new Date(yyyy, mm - 1, dd)
    return !isNaN(date.getTime())
  }

  // --- Initialize input from props ---
  useEffect(() => {
    if (value instanceof Date) {
      setInputValue(formatDate(value))
      return
    }

    if (typeof value === 'string' && value.length === 10) {
      // Handle yyyy-mm-dd format from backend
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-');
        setInputValue(`${m}-${d}-${y}`);
        return;
      }
      setInputValue(value)
      return
    }

    setInputValue('')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, "");

    let mm = "";
    let dd = "";
    let yyyy = "";

    if (val.length >= 1) {
      mm = val.substring(0, 2);
      if (parseInt(mm) > 12) mm = "12";
    }

    if (val.length >= 3) {
      dd = val.substring(2, 4);
      if (parseInt(dd) > 31) dd = "31";
    }

    if (val.length >= 5) {
      yyyy = val.substring(4, 8);
      const currentYear = new Date().getFullYear();
      if (parseInt(yyyy) > currentYear) yyyy = currentYear.toString();
    }

    let formatted = mm;
    if (dd) formatted += "-" + dd;
    if (yyyy) formatted += "-" + yyyy;

    setInputValue(formatted);

    // TODAY date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = formatDate(today);

    // User typed full date but invalid → set today
    if (formatted.length === 10 && !validateDateFormat(formatted)) {
      setInputValue(todayFormatted);
      onChange(todayFormatted);
      return;
    }

    // If date is valid but > today → force today
    const typedDate = parseDate(formatted);
    if (typedDate && typedDate > today) {
      setInputValue(todayFormatted);
      onChange(todayFormatted);
      return;
    }

    // Valid date → send value
    if (formatted.length === 10 && validateDateFormat(formatted)) {
      onChange(formatted)
    } else if (formatted.length === 0) {
      onChange(null)
    }
  };


  // Handle date change from calendar picker
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setInputValue('')
      onChange(null)
      setIsOpen(false)
      return
    }

    const formatted = formatDate(date)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
  }

  const displayDate = inputValue ? parseDate(inputValue) : null

  const handleCalendarClick = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
          className={`w-full rounded-2xl border ${error ? 'border-red-500' : 'border-formBorder'
            } bg-formBg px-3 py-2 pr-10 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500 ${className}`}
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('')
              onChange(null)
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
        <div
          ref={datePickerRef}
          className="absolute z-50 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <DatePicker
            selected={displayDate}
            onChange={handleDateChange}
            dateFormat="MM-dd-yyyy"
            maxDate={new Date()}
            inline
            /* replaced native selects with tiny custom header (only change) */
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
                  <YearDropdown selectedYear={date.getFullYear()} onSelect={changeYear} />
                </div>

                <button className="nav-btn" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>▶</button>
              </div>
            )}
          />
        </div>
      )}

      <style jsx global>{`
        .react-datepicker {
          font-family: 'Poppins', sans-serif;
          border:none;
          font-size:14px!important;
          font-weight:500!important;
        }
        .react-datepicker__header {
          background-color: #EDF3EF;
          border-bottom: 1px solid #BDE2CA;
        }
        .react-datepicker__day--selected {
          background-color: #009728 !important;
          color: white !important;
        }
        .react-datepicker__day:hover {
          background-color: #EDF3EF !important;
        }
           .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name{
           font-size:12px!important;
           }
           .react-datepicker__month-select,.react-datepicker__year-select {
              background: white;
              border: 1px solid #ccc;
              padding: 6px 10px;
              border-radius: 8px;
              font-size: 14px;
              color: #333;
              cursor: pointer;
              margin-top:10px;
            }

            .react-datepicker__month-select:focus, .react-datepicker__year-select:focus {
              border-color: #3b82f6;
              outline: none;
            }
              .react-datepicker__year-dropdown-container--select, .react-datepicker__month-dropdown-container--select, .react-datepicker__month-year-dropdown-container--select, .react-datepicker__year-dropdown-container--scroll, .react-datepicker__month-dropdown-container--scroll, .react-datepicker__month-year-dropdown-container--scroll{
               margin:0 5px!important;
                  }
                .react-datepicker__month-select option,
        .react-datepicker__year-select option {
          padding: 8px; /* works in some browsers */
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
  )
}

export default DateOfBirthPicker
