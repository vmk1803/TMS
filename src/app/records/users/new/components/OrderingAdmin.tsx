'use client'
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import UploadProfilePicture from './UploadProfilePicture'

const OrderingAdmin = () => {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'BAYLOR SCOTT & WHITE MEDICAL CENTER – LAKE POINTE',
    'KINEX PODIATRY',
    "PHYSICIANS' GROUP OF THE WOODLANDS",
  ])

  const facilities = [
    'BAYLOR SCOTT & WHITE MEDICAL CENTER – LAKE POINTE',
    'KINEX PODIATRY',
    "PHYSICIANS' GROUP OF THE WOODLANDS",
    'SUMMIT HEALTH FAMILY & URGENT CARE',
    'WELLMED AT CLEBURNE',
    '1 STOP HEALTH CARE SERVICES',
  ]

  const handleToggleFacility = (name: string) => {
    if (selectedFacilities.includes(name)) {
      setSelectedFacilities(selectedFacilities.filter((item) => item !== name))
    } else {
      setSelectedFacilities([...selectedFacilities, name])
    }
  }

  const handleFacilityRemove = (name: string) => {
    setSelectedFacilities(selectedFacilities.filter((item) => item !== name))
  }

  return (
    <div className=''>
      {/* --- Personal Info Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-b-xl">
        {['First Name', 'Last Name', 'Email', 'Mobile Number', 'User Name'].map(
          (label, index) => (
            <div key={index}>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                {label}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={`Enter ${label}`}
                className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:border-green-600"
              />
            </div>
          )
        )}

        {/* Date of Birth */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:border-green-600"
          />
        </div>
      </div>

      {/* --- Email Events --- */}
      <div className="my-4 p-4 bg-white rounded-xl">
        <h3 className="text-[18px] font-semibold text-primaryText mb-3">
          Email Events
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            'Patient info update',
            'Billing info update',
            'Mark for physician',
            'Report finalized',
          ].map((item, i) => (
            <label
              key={i}
              className="flex items-center gap-2 text-primaryText text-sm"
            >
              <input
                type="checkbox"
                defaultChecked
                className="accent-green-600 w-4 h-4 rounded"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* --- Ordering Facilities --- */}
      <div className="p-4 relative bg-white rounded-xl mb-4">
        <h3 className="text-[18px] font-semibold text-primaryText mb-3">
          Ordering Facilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left side: multi-select dropdown */}
          <div className="relative">
            <label className="block text-sm text-primaryText mb-2 font-medium">
              List of Ordering Facilities
            </label>

            {/* Custom Dropdown Input */}
            <div
              className="relative"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText flex items-center justify-between cursor-pointer focus-within:border-green-600">
                <span className="text-gray-500">Select</span>
                <ChevronDown
                  className={`w-4 h-4 text-green-600 transition-transform duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Dropdown Content */}
              {showDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                  {/* Search Box */}
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Facilities List */}
                  <ul className="py-1">
                    {facilities
                      .filter((item) =>
                        item.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((name, i) => (
                        <li
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                            selectedFacilities.includes(name)
                              ? 'bg-green-600 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFacility(name)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedFacilities.includes(name)}
                              readOnly
                              className="accent-green-600 w-4 h-4 rounded"
                            />
                            <span>{name}</span>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Selected Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedFacilities.map((name, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {name}
                  <button
                    onClick={() => handleFacilityRemove(name)}
                    className="text-green-700 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Right side: List of Facilities Assigned */}
          <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              List of Facilities Assigned
            </label>
            <select className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 text-sm text-primaryText focus:border-green-600">
              <option value="">Select</option>
              <option>North Point Clinic</option>
              <option>Texas Diagnostic Center</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl mb-4">
        <UploadProfilePicture  />
      </div>
    </div>
  )
}

export default OrderingAdmin
