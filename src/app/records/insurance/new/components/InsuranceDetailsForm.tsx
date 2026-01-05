'use client'
import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateInsurance } from '../../hooks/useCreateInsurance'
import { useEditInsurance } from '../../hooks/useEditInsurance'
import SuccessUpdateModal from '../../../../../components/common/SuccessUpdateModal'

const STATUS_OPTIONS = ['Active', 'Inactive']

const InsuranceDetailsForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const guid = params.get('guid') || undefined
  const creating = !guid
  const createHook = useCreateInsurance()
  const editHook = useEditInsurance(guid)
  const values = creating ? createHook.values : editHook.values
  const errors = creating ? createHook.errors : editHook.errors
  const setField = creating ? createHook.setField : editHook.setField
  const submitting = creating ? createHook.submitting : editHook.updating
  const success = creating ? createHook.success : editHook.success
  const resetSuccess = creating ? createHook.resetSuccess : editHook.resetSuccess

  const handleBack = () => router.back()
  const handleCancel = () => router.back()
  const handleSubmit = async () => {
    if (creating) {
      const ok = await createHook.submit()
      if (ok) {}
    } else {
      const ok = await editHook.submitUpdate()
      if (ok) {}
    }
  }

  return (
    <div className="w-full bg-[#F8FAF9] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-800 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Insurance Details</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 h-[calc(100vh-250px)] overflow-y-auto scrollbar-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Insurance Name (text input) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Insurance Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Insurance Name"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              className={`w-full rounded-2xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            />
            {errors.name ? (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            ) : null}
          </div>

          {/* Insurance Type (text input) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Insurance Type<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Insurance Type"
              value={values.insurance_type}
              onChange={(e) => setField('insurance_type', e.target.value)}
              className={`w-full rounded-2xl border ${errors.insurance_type ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            />
            {errors.insurance_type ? (
              <p className="text-xs text-red-500 mt-1">{errors.insurance_type}</p>
            ) : null}
          </div>

          {/* Carrier Code */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Carrier Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Carrier Code"
              value={values.insurance_code}
              onChange={(e) => setField('insurance_code', e.target.value)}
              className={`w-full rounded-2xl border ${errors.insurance_code ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            />
            {errors.insurance_code ? (
              <p className="text-xs text-red-500 mt-1">{errors.insurance_code}</p>
            ) : null}
          </div>

          {/* Status */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Status<span className="text-red-500">*</span>
            </label>
            <select
              value={values.status}
              onChange={(e) => setField('status', e.target.value)}
              className={`w-full rounded-2xl border ${errors.status ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-green-600`}
            >
              <option value="">Select</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status ? (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            ) : null}
          </div> */}
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
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-full px-6 py-2 text-sm font-medium transition"
        >
          {creating ? 'Create' : 'Update'}
        </button>
      </div>

      {/* Success Modal */}
      <SuccessUpdateModal
        isOpen={success}
        onClose={() => {
          resetSuccess()
          router.back()
        }}
        title="Insurance"
        heading={creating ? 'New Insurance Created Successfully' : 'Insurance Updated Successfully'}
        description={creating ? 'Insurance Has Been Created Successfully.' : 'Insurance Has Been Updated Successfully.'}
      />
    </div>
  )
}

export default InsuranceDetailsForm
