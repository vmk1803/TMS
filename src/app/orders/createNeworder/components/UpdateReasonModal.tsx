'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '../../../../components/common/Toast'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateOrder } from '../../../../store/ordersSlice'
import { getUploadedFiles, clearUploadedFiles } from '../hooks/useFileUploadManager'

interface UpdateReasonModalProps {
  isOpen: boolean
  onClose: () => void
}

const UpdateReasonModal: React.FC<UpdateReasonModalProps> = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [toastMessage, setToastMessage] = useState('')

  const router = useRouter()
  const dispatch = useAppDispatch()
  const orderGuid = useAppSelector((state) => state.orders?.orderGuid)
  const orderInfo = useAppSelector((state) => state.orders?.orderInfo)

  if (!isOpen) return null

  const handleUpdate = async () => {
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const resultAction = await dispatch(updateOrder(reason.trim()))
      if (updateOrder.fulfilled.match(resultAction)) {
       
        // Upload new attachments if any
        if (orderGuid && Array.isArray(orderInfo?.uploadDocuments)) {
          const uploadDocuments = orderInfo.uploadDocuments
          const filesToUpload = uploadDocuments.filter((doc: any) => doc.isNewUpload === true)

          if (filesToUpload.length > 0) {
            // Get File objects from global storage
            const fileMap = getUploadedFiles()
            const files: File[] = []

            filesToUpload.forEach((doc: any) => {
              const file = fileMap.get(doc.id)
              if (file) {
                files.push(file)
              } else {
                console.warn(`File not found in storage for document: ${doc.name}`)
              }
            })

            if (files.length > 0) {
              try {
                const { uploadAttachmentsForOrder } = await import('../../view/services/viewOrderService')
                await uploadAttachmentsForOrder(orderGuid, files)
              } catch (error) {
                console.error(`Failed to upload files:`, error)
              }
            }

            // Clear uploaded files after successful upload
            clearUploadedFiles()
          }
        } else {
          if (!orderGuid) {
            console.warn('No order GUID available for upload')
          } else {
            console.log('No new files to upload')
          }
        }

        setToastType('success')
        setToastMessage('Order updated successfully')
        setShowToast(true)
        setTimeout(() => {
          handleClose()
          router.push('/orders')
        }, 2000)
      } else {
        const errorMsg = (resultAction.payload as any)?.message || (resultAction.payload as any)?.error || 'Failed to update order'
        setError(errorMsg)
        setToastType('error')
        setToastMessage(errorMsg)
        setShowToast(true)
      }
    } catch (e: any) {
      const msg = e.message || 'Failed to update order'
      setError(msg)
      setToastType('error')
      setToastMessage(msg)
      setShowToast(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
        <div className="bg-white w-[95%] md:w-[600px] rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 bg-lightGreen border-b border-[#DDE2E5] rounded-t-2xl">
            <h2 className="text-lg font-semibold text-primaryText">Reason for Order Update</h2>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-red-500 transition-all"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="p-6 space-y-3">
            <label className="block text-sm font-medium text-primaryText">
              Reason <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder="Enter reason for updating this order"
              className={`w-full h-32 border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-400 transition-all ${error ? 'border-red-500' : 'border-gray-200'
                }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all shadow-md"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      <Toast
        open={showToast}
        type={toastType}
        message={toastMessage || (toastType === 'success' ? 'Order updated successfully' : 'Failed to update order')}
        onClose={() => setShowToast(false)}
      />
    </>
  )
}

export default UpdateReasonModal
