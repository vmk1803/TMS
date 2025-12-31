'use client'

import React, { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar, X as ClearIcon } from 'lucide-react'
import "react-datepicker/dist/react-datepicker.css"

interface AllDatesPickerProps {
    value?: string | Date | null
    onChange: (date: string | null) => void
    name?: string
    error?: boolean
    placeholder?: string
    className?: string
}

/* ---------- Tiny helpers (minimal & local) ---------- */
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
    <div ref={ref} className="dp-dropdown" style={{ display: 'inline-block' }}>
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(s => !s) }}
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
              onClick={() => { onSelect(i); setOpen(false) }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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

  // Show previous years only (no future years)
  const currentYear = new Date().getFullYear()
  const spanBack = 100 // change to 50 or 120 if desired
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - spanBack; y--) years.push(y)
  // ensure selectedYear is included if older than spanBack
  if (selectedYear < currentYear - spanBack) {
    years.push(selectedYear)
    years.sort((a, b) => b - a)
  }

  return (
    <div ref={ref} className="dp-dropdown" style={{ display: 'inline-block' }}>
      <button
        type="button"
        className="dp-dropdown-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(s => !s) }}
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
              onClick={() => { onSelect(y); setOpen(false) }}
            >
              {y}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- Main component (your original logic preserved) ---------- */
const AllDatesPicker: React.FC<AllDatesPickerProps> = ({
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

  // Format date to MM-DD-YYYY
  const formatDate = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}-${dd}-${yyyy}`
  }

  // Parse MM-DD-YYYY string to Date
  const parseDate = (str: string): Date | null => {
    if (!str) return null
    const parts = str.split('-')
    if (parts.length !== 3) return null

    const [mm, dd, yyyy] = parts.map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    return isNaN(d.getTime()) ? null : d
  }

  // Strict validation
  const validateDate = (value: string) => {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
    if (!regex.test(value)) return false
    const d = parseDate(value)
    return d !== null
  }

  // Initialize from props
  useEffect(() => {
    if (value instanceof Date) {
      setInputValue(formatDate(value))
    } else if (typeof value === 'string' && value.length === 10) {
      setInputValue(value)
    } else {
      setInputValue('')
    }
  }, [value])

  // --- FIXED: Manual input restricts month/day/year ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d]/g, '') // only digits

    let mm = ""
    let dd = ""
    let yyyy = ""

    if (raw.length >= 1) {
      mm = raw.substring(0, 2)
      if (parseInt(mm) > 12) mm = "12"
    }

    if (raw.length >= 3) {
      dd = raw.substring(2, 4)
      if (parseInt(dd) > 31) dd = "31"
    }

    if (raw.length >= 5) {
      yyyy = raw.substring(4, 8)
    }

    // Build formatted
    let formatted = mm
    if (dd) formatted += "-" + dd
    if (yyyy) formatted += "-" + yyyy

    setInputValue(formatted)

    // When full 10 characters & valid
    if (formatted.length === 10 && validateDate(formatted)) {
      onChange(formatted)
    } else if (formatted.length === 0) {
      onChange(null)
    }
  }

  // Calendar change
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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
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
          className={`w-full rounded-2xl border ${
            error ? 'border-red-500' : 'border-formBorder'
          } bg-formBg px-3 py-2 pr-10 text-sm text-primaryText focus:outline-none focus:border-green-600 placeholder:text-gray-500 ${className}`}
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('')
              onChange(null)
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            <ClearIcon className="w-4 h-4 mr-3" />
          </button>
        )}

        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

export default AllDatesPicker