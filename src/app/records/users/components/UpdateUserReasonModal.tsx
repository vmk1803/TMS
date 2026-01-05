'use client'

import React, { useState } from 'react'

interface UpdateUserReasonModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => Promise<void>
    isSubmitting: boolean
}

const UpdateUserReasonModal: React.FC<UpdateUserReasonModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting
}) => {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleUpdate = async () => {
        if (!reason.trim()) {
            setError('Reason is required')
            return
        }

        try {
            setError('')
            await onConfirm(reason.trim())
            // Reset state after successful update
            setReason('')
        } catch (e: any) {
            // Error handling is done in parent component
            console.error('Update failed:', e)
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
                        <h2 className="text-lg font-semibold text-primaryText">Reason for User Update</h2>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-gray-600 hover:text-red-500 transition-all"
                            disabled={isSubmitting}
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-3">
                        <label className="block text-sm font-medium text-primaryText">
                            Reason<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError('')
                            }}
                            placeholder="Enter reason for updating this user"
                            className={`w-full h-32 border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-400 transition-all ${error ? 'border-red-500' : 'border-gray-200'
                                }`}
                            disabled={isSubmitting}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all shadow-md disabled:opacity-60"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUserReasonModal
