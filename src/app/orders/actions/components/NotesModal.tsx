'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { updateOrderByGuid } from '../services/orderActionService'
interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  order_guid: string
  type: string
  onRefresh?: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, order_guid, type, onRefresh, onSuccess, onError }) => {
  const [note, setNote] = useState('')

  const handleSave = async () => {
    try {
      let data = type === 'Admin Notes' ? { admin_notes: note } : { technician_notes: note }
      let response = await updateOrderByGuid(order_guid, data)
      onSuccess?.(`${type} updated successfully`)
      onRefresh?.()
      onClose()
    } catch (error: any) {
      onError?.(error?.message || 'Failed to update order')
      // throw new Error(error?.message || 'Failed to update order')
    }
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
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white w-[95%] md:w-[600px] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-lightGreen border-b border-[#DDE2E5] rounded-t-2xl">
              <h2 className="text-lg font-semibold text-primaryText">{type}</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <label className="block text-sm font-medium text-primaryText">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your admin notes here..."
                className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:border-green-400 focus:ring-1 focus:ring-green-200 outline-none transition-all"
              />
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
                onClick={() => { handleSave(); }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all shadow-md"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotesModal
