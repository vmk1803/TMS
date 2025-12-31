'use client'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SuccessUpdateModal from '../../../../../components/common/SuccessUpdateModal'
import Toast from '../../../../../components/common/Toast'
import { useNewLabTestForm } from '../../hooks/useNewLabTestForm'
import { useSearchParams } from 'next/navigation'
import { getAllTubes } from '../../../testtubes/services/testTubesService'
import { AddNewLabTestProps } from '@/types/labTests'

const SAMPLE_TYPES = ['Blood', 'Urine', 'Stool', 'Saliva', 'Other']

const AddNewLabTest = ({ guidProp }: AddNewLabTestProps) => {
  const searchParams = useSearchParams()
  const guid = guidProp || searchParams.get('guid') || undefined
  const {
    formData,
    errors,
    showDropdown,
    setShowDropdown,
    showSuccess,
    setShowSuccess,
    dropdownRef,
    handleSelect,
    handleChange,
    handleBack,
    handleCancel,
    handleCreate,
    handleUpdate,
    isEditMode,
  } = useNewLabTestForm(guid)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [tubes, setTubes] = useState<Array<{ tube_name: string }>>([])
  const [showTubeDropdown, setShowTubeDropdown] = useState(false)
  const [tubeSearch, setTubeSearch] = useState('')
  const tubeDropdownRef = React.useRef<HTMLDivElement | null>(null)

  // Fetch tubes on component mount
  useEffect(() => {
    const fetchTubes = async () => {
      try {
        const res = await getAllTubes(1)
        if (res?.data) {
          setTubes(res.data)
        }
      } catch (e) {
        console.error('Failed to fetch tubes:', e)
      }
    }
    fetchTubes()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (tubeDropdownRef.current && !tubeDropdownRef.current.contains(e.target as Node)) {
        setShowTubeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectTube = (tubeName: string) => {
    // Single selection: replace current value
    handleChange('tubeName', tubeName)
    // Reset search and close dropdown after selection
    setTubeSearch('')
    setShowTubeDropdown(false)
  }

  const filteredTubes = tubes.filter((tube) =>
    tube.tube_name.toLowerCase().includes(tubeSearch.toLowerCase())
  )

  return (
    <div className="w-full bg-[#F8FAF9] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-800 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">{isEditMode ? 'Edit Lab Test' : 'Add New Lab Test'}</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 h-[calc(100vh-250px)] overflow-y-auto scrollbar-custom">
        {/* Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Test Code */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Test Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter test code"
              value={formData.testCode}
              onChange={(e) => {
                const filteredValue = e.target.value.replace(/[^a-zA-Z_]/g, '');
                handleChange('testCode', filteredValue.toUpperCase());
              }}
              className={`w-full rounded-2xl border ${errors.testCode ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            />
            {errors.testCode && (
              <p className="mt-1 text-xs text-red-600">{errors.testCode}</p>
            )}
          </div>

          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Test Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter test name"
              value={formData.testName}
              onChange={(e) => handleChange('testName', e.target.value)}
              className={`w-full rounded-2xl border ${errors.testName ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            />
            {errors.testName && (
              <p className="mt-1 text-xs text-red-600">{errors.testName}</p>
            )}
          </div>

          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Sample Type<span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setShowDropdown((prev) => !prev)}
              className={`w-full rounded-2xl border ${errors.sampleType ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm flex justify-between items-center cursor-pointer hover:border-green-500 transition-all`}
            >
              <span className={formData.sampleType ? 'text-gray-800' : 'text-gray-400'}>
                {formData.sampleType || 'Select'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-green-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''
                  }`}
              />
            </div>
            {errors.sampleType && (
              <p className="mt-1 text-xs text-red-600">{errors.sampleType}</p>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-50"
                >
                  {SAMPLE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSelect(type)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all ${formData.sampleType === type
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Turnaround Time */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Turnaround Time (Hours)
            </label>
            <input
              type="number"
              min={1}
              step="1"
              placeholder="Enter hours"
              value={formData.tat}
              onChange={(e) => {
                let val = e.target.value;
                // Allow empty (optional field)
                if (val === "") {
                  handleChange("tat", "");
                  return;
                }
                const num = Number(val);
                // If invalid (0, negative, decimal) → clear field
                if (isNaN(num) || num < 1 || !Number.isInteger(num)) {
                  handleChange("tat", "");
                  return;
                }
                // Valid number ≥ 1
                handleChange("tat", String(num));
              }}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm 
                        focus:outline-none focus:border-green-600"
            />
          </div>
        </div>
        {/* Test Tube Name + Fasting Toggle in Same Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">

          {/* Test Tube Name Single-Select Dropdown */}
          <div className="relative" ref={tubeDropdownRef}>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Test Tube Name<span className="text-red-500">*</span>
            </label>

            {/* Display Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search test tubes..."
                value={formData.tubeName || tubeSearch}
                onChange={(e) => {
                  setTubeSearch(e.target.value)
                  setShowTubeDropdown(true)
                  // Clear selection when user types
                  if (formData.tubeName) {
                    handleChange('tubeName', '')
                  }
                }}
                onFocus={() => setShowTubeDropdown(true)}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 pr-16 text-sm focus:outline-none focus:border-green-600"
              />
              {formData.tubeName && (
                <button
                  onClick={() => {
                    handleChange('tubeName', '')
                    setTubeSearch('')
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600 transition-transform duration-200 pointer-events-none ${showTubeDropdown ? 'rotate-180' : ''
                  }`}
              />
            </div>

            {/* Dropdown with search results */}
            <AnimatePresence>
              {showTubeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                >
                  {filteredTubes.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {tubeSearch ? 'No tubes found' : 'No tubes available'}
                    </div>
                  ) : (
                    filteredTubes.map((tube, index) => {
                      const isSelected = formData.tubeName === tube.tube_name
                      return (
                        <button
                          key={`tube-${index}-${tube.tube_name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTube(tube.tube_name)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition-all ${isSelected
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                          <span>{tube.tube_name}</span>
                          {isSelected && (
                            <span className="float-right text-xs font-semibold">Selected</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fasting Required Toggle */}
          <div className="flex items-center gap-3 mt-7">
            <label className="text-sm font-medium text-gray-800">
              Fasting Required
            </label>
            <button
              type="button"
              onClick={() => handleChange('fasting', !formData.fasting)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${formData.fasting ? 'bg-green-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.fasting ? 'translate-x-5' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

        </div>

      </div>

      <div className="flex justify-end gap-2 p-4 mt-4 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-[#ffffff]">
        <button
          onClick={handleCancel}
          className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true)
            const result = await (isEditMode ? handleUpdate() : handleCreate())
            if (result) {
              setToastType(result.ok ? 'success' : 'error')
              setToastMessage(result.message)
              setToastOpen(true)
            }
            setSubmitting(false)
          }}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition"
        >
          {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
        </button>
      </div>

      <SuccessUpdateModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          handleBack()
        }}
        title="Lab Test"
        heading={isEditMode ? 'Lab Test Updated Successfully' : 'Lab test created successfully'}
      />
      <Toast open={toastOpen} type={toastType} message={toastMessage} onClose={() => setToastOpen(false)} />
    </div>
  )
}

export default AddNewLabTest
