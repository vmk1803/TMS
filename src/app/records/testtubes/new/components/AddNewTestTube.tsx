'use client'
import React from 'react'
import { ArrowLeft, ChevronDown, Eye } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import FileUploadBox from './FileUploadBox'
import { useNewTestTubeForm } from '../../hooks/useNewTestTubeForm'
import { StorageTemperatureEnum } from '../../../../../types/testTubes'
import SuccessUpdateModal from '../../../../../components/common/SuccessUpdateModal'
import CustomSelect from '../../../../../components/common/CustomSelect'

const AddNewTestTube = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { form, errors, submitting, handleChange, handleSubmit, showSuccess, handleCloseSuccess, isEdit, existingImageUrl } = useNewTestTubeForm()
  const handleBack = () => router.back();
  const tubeGuid = searchParams.get('tube_guid') || '';
  
  
  return (
    <div className="w-full bg-[#F8FAF9] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">{isEdit ? 'Edit Test Tube' : 'Add New Test Tube'}</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 h-[calc(100vh-250px)] overflow-y-auto scrollbar-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tube Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tube Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter tube name"
              value={form.tubeName}
              onChange={(e) => handleChange('tubeName', e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-600"
            />
            {errors.tubeName ? (
              <p className="text-xs text-red-600 mt-1">{errors.tubeName}</p>
            ) : null}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Special Instructions</label>
            <input
              type="text"
              placeholder="Enter any note"
              value={form.specialInstructions || ''}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-600"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Quantity</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter quantity "
              value={form.quantity || ''}
              onChange={(e) => {
                // allow digits and a single decimal point
                let v = String(e.target.value).replace(/[^0-9.]/g, '')
                const parts = v.split('.')
                if (parts.length > 2) {
                  v = parts[0] + '.' + parts.slice(1).join('')
                }
                handleChange('quantity', v)
              }}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-600"
            />
          </div>

          {/* Storage Temperature */}
          <CustomSelect
            label="Storage Temperature"
            value={form.storageTemperature || ''}
            options={[
              { label: "Room Temperature", value: StorageTemperatureEnum.ROOM_TEMPERATURE },
              { label: "Frozen", value: StorageTemperatureEnum.FROZEN },
              { label: "Refrigerated", value: StorageTemperatureEnum.REFRIGERATED },
              { label: "Image", value: StorageTemperatureEnum.IMAGE }
            ]}
            onChange={(value) => handleChange('storageTemperature', value as StorageTemperatureEnum | '')}
          />
        </div>

        {/* Upload Image */}
        <div className='py-5'>
            <FileUploadBox onFileSelect={(file) => handleChange('imageFile', file)} />

            {isEdit && existingImageUrl && !form.imageFile ? (
              <div className="mt-4 bg-gray-100 rounded-2xl px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-green-600 text-sm font-semibold">DOC</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 break-all">
                      {form.tubeName || 'Document'}
                    </p>
                  </div>
                </div>
                <Eye
                  className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition"
                  onClick={() => {
                    if (existingImageUrl) {
                      window.open(existingImageUrl, '_blank')
                    }
                  }}
                />
              </div>
            ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 mt-4 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-[#ffffff]">
        <button
          onClick={() => router.push('/records/testtubes')}
          className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition"
          disabled={submitting}
        >
          {submitting ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Success Modal */}
      <SuccessUpdateModal
        isOpen={showSuccess}
        onClose={handleCloseSuccess}
        title="Test Tube"
        heading={isEdit ? 'Test Tube Updated Successfully' : 'New Test Tube Created Successfully'}
        // description={isEdit ? 'Test Tube Has Been Updated Successfully.' : 'Test Tube Has Been Created Successfully.'}
      />
    </div>
  )
}

export default AddNewTestTube
