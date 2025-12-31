'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactDOM from 'react-dom'
import { ChevronDown, X } from 'lucide-react'

const scheduleOptions = [
  '1-Called and LVM',
  '2-Bad Phone Number',
  '3-Call Back On',
  '4-Pt Refused',
  '5-Appointment Set',
]

const ScheduleNotesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [scheduleNote, setScheduleNote] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownButtonRef = useRef<HTMLDivElement | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)

  // ✅ Handle select
  const handleSelect = (value: string) => {
    setSelectedSchedule(value)
    setShowDropdown(false)
  }

  // ✅ Close dropdown when clicking outside (ignore clicks inside the portal)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('.schedule-dropdown-portal')
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ Open dropdown & calculate position
  const openDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
    setShowDropdown(!showDropdown)
  }

  // ✅ Handle save
  const handleSave = () => {
    setScheduleNote('')
    setSelectedSchedule('')
    setIsConfirmed(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white w-[95%] md:w-[600px] rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 rounded-t-2xl bg-lightGreen border-b border-[#DDE2E5]">
              <h2 className="text-xl font-semibold text-primaryText">Schedule Notes</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Schedule Dropdown */}
              <div>
                <label className="block text-sm font-medium text-primaryText mb-1">
                  Schedule
                </label>
                <div
                  ref={dropdownButtonRef}
                  onClick={openDropdown}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 flex justify-between items-center cursor-pointer hover:border-green-400 transition-all"
                >
                  <span>{selectedSchedule || 'Select'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Schedule Note */}
              <div>
                <label className="block text-sm font-medium text-primaryText mb-1">
                  Schedule Note
                </label>
                <textarea
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  placeholder="Enter schedule note..."
                  className="w-full h-28 border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:border-green-400 focus:ring-1 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirmed"
                  checked={isConfirmed}
                  onChange={() => setIsConfirmed(!isConfirmed)}
                  className="w-4 h-4 accent-green-600 rounded focus:ring-green-400"
                />
                <label htmlFor="confirmed" className="text-sm text-primaryText">
                  Confirmed Appointment
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all shadow-md"
              >
                Save
              </button>
            </div>
          </motion.div>

          {/* ✅ Dropdown Portal (renders outside modal boundaries safely) */}
          {showDropdown &&
            dropdownPos &&
            ReactDOM.createPortal(
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  width: dropdownPos.width,
                }}
                className="schedule-dropdown-portal z-[10000] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {scheduleOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`block w-full text-left px-4 py-2 text-sm transition-all ${
                      selectedSchedule === option
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>,
              document.body
            )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScheduleNotesModal
