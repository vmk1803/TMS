'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  data?: any
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message = 'Order Created Successfully',
  data
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="overlay"
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white w-[95%] md:w-[480px] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 bg-green-50 border-b border-gray-200">
              <h3 className="text-base font-semibold text-primaryText">Create Order</h3>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="text-green-600" size={56} />
              <h3 className="text-lg font-medium text-primaryText">{message}</h3>
              <p className="text-sm text-gray-600 mt-2">
                The order has been submitted successfully. You can track its status in the dashboard. Your order ID is <strong>{data?.data?.phlebio_order_id || 'N/A'}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SuccessModal
