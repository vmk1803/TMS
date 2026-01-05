'use client'

import React, { useRef, useState } from 'react'
import { FileText, Eye, Trash2, Plus, AlertCircle } from 'lucide-react'
import {
  deleteAttachmentForOrder,
  getAttachmentsForOrder,
  uploadAttachmentsForOrder,
} from '../services/viewOrderService'
import { canEdit } from '../../../../utils/rbac'

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const maxSizeMB = 10

const AttachmentsTab = ({
  orderData,
  onRefresh,
}: {
  orderData: any
  onRefresh?: () => void
}) => {
  const [docs, setDocs] = useState(orderData?.attachments ?? [])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [warningMessage, setWarningMessage] = useState<string>('')

  const openFilePicker = () => fileInputRef.current?.click()

  const showWarning = (msg: string) => {
    setWarningMessage(msg)
    setTimeout(() => setWarningMessage(''), 5000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles: File[] = []

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        showWarning(
          'Unsupported file format. Only PNG, PDF, JPG, JPEG, DOCX are accepted.'
        )
        continue
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        showWarning(`File size must be less than ${maxSizeMB}MB.`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      const res = await uploadAttachmentsForOrder(
        orderData.order_guid,
        validFiles
      )

      if (res?.success) {
        setDocs((prev: any) => [...prev, ...res.data])
        onRefresh?.()
      }
    } catch (err) {
      console.error(err)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const viewDocument = async (key: string) => {
    try {
      const url = await getAttachmentsForOrder(orderData.order_guid, key)
      if (url) window.open(url, '_blank')
    } catch (err) {
      console.error(err)
    }
  }

  const deleteDocument = async (key: string) => {
    try {
      await deleteAttachmentForOrder(orderData.order_guid, key)
      setDocs((prev: any) => prev.filter((doc: string) => doc !== key))
      onRefresh?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Warning Message (same as FileUploadBox) */}
      {warningMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
          <p className="text-sm text-yellow-800">{warningMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-semibold text-primaryText">
          Total Documents
        </h3>

        {canEdit() && (
          <button
            onClick={openFilePicker}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add Files
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {docs.map((doc: string, i: number) => {
          const fileName = doc.split('/').pop()

          return (
            <div
              key={i}
              className="grid grid-cols-[80%_20%] items-center bg-[#DDE2E5] rounded-3xl p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-green-600" size={24} />
                <p
                  className="text-primaryText font-medium w-[80%] truncate cursor-help"
                  title={fileName}
                >
                  {fileName}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 text-green-600">
                <Eye
                  size={24}
                  className="cursor-pointer"
                  onClick={() => viewDocument(doc)}
                />
                {canEdit() && (
                  <Trash2
                    size={22}
                    className="cursor-pointer"
                    onClick={() => deleteDocument(doc)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AttachmentsTab
