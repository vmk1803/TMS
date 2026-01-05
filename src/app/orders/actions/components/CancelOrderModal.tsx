'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import api from '../../../../lib/api'

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  orderGuid?: string
  onCancelSuccess?: (orderGuid: string) => void
  onRefresh?: () => void
  onError?: (message: string) => void
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  orderGuid,
  onCancelSuccess,
  onRefresh,
  onError,
}) => {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCancelOrder = async () => {
    if (!orderGuid) return //alert('Order GUID missing!')

    try {
      setLoading(true)
      const payload = {
        status: 'CANCELLED',
        reasons: [note],
      }

      const endpoint = `/orders/updateOrderByGuid/${orderGuid}`
      await api.patch(endpoint, payload)

      onCancelSuccess?.(orderGuid)
      onRefresh?.()
      setNote('')
      onClose()
    } catch (err: any) {
      // console.error(err)
      onError?.(err?.response?.data?.message || 'Failed to cancel order')
      //alert('Failed to cancel order')
    } finally {
      setLoading(false)
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
            className="bg-white w-[95%] md:w-[600px] rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center px-6 py-4 bg-green-100 border-b">
              <h2 className="text-lg font-semibold text-primaryText">Cancel Order</h2>
              <button onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <label className="text-sm font-medium">Reason <span className="text-red-500">*</span></label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border rounded-full"
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading || !note.trim()}
                className="px-5 py-2 bg-green-600 text-white rounded-full disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CancelOrderModal
