'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  UserCheck,
  FileText,
  Phone,
  Printer,
  ClipboardList,
} from 'lucide-react'
import { hasFullAccess } from '../../../../utils/rbac'
import { printRequisitionForm } from '../../actions/services/orderActionService'

interface OrderDetailsHeaderProps {
  onAssignOrder?: () => void
  onProgressNotes?: () => void
  orderGuid?: string
  orderData?: any
}

const OrderDetailsHeader: React.FC<OrderDetailsHeaderProps> = ({
  onAssignOrder,
  onProgressNotes,
  orderGuid,
  orderData
}) => {

  const router = useRouter()
  const [hovered, setHovered] = useState<number | null>(null)
  const [printingRequisition, setPrintingRequisition] = useState(false)

  // Disable rule
  const disableReassign = useMemo(() => {
    if (!orderData) return false

    const blockStatuses = [
      'PENDING',
      'PERFORMED',
      'COMPLETED',
      'CANCELLED',
      'DELIVERED TO LAB'
    ]

    return blockStatuses.includes(orderData.status) &&
           orderData.order_type !== 'RETURN VISIT'
  }, [orderData])

  const handlePrintRequisition = async () => {
    if (!orderGuid) return
    
    try {
      setPrintingRequisition(true)
      const result = await printRequisitionForm(orderGuid)
      const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(result.signedUrl)}`
      window.open(viewerUrl, '_blank')
    } catch (error: any) {
      console.error('Failed to print requisition form:', error)
    } finally {
      setPrintingRequisition(false)
    }
  }

  const allActions = [
    { icon: <UserCheck size={18} />, title: 'Reassign Order', onClick: onAssignOrder },
    { icon: <FileText size={18} />, title: 'Admin Notes', onClick: onProgressNotes },
    // { icon: <Phone size={18} />, title: 'Schedule Notes' },
    // { icon: <ClipboardList size={18} />, title: 'Blood Collection / Lab Requisition' },
    { icon: <Printer size={18} />, title: 'Print Requisition', onClick: handlePrintRequisition },
  ]

  // Filter actions based on user permissions
  const actions = useMemo(() => {
    if (hasFullAccess()) return allActions
    return allActions.filter(a => a.title === 'Print Requisition')
  }, [])

  return (
    <div className="flex items-center justify-between bg-transparent mb-6 relative">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-all"
      >
        <ArrowLeft size={16} />
        <span className="font-medium">Order Details</span>
      </button>

      <div className="flex items-center gap-3 flex-wrap justify-end">
        {actions.map((action, i) => {
          const isReassign = action.title === 'Reassign Order'
          const isPrintRequisition = action.title === 'Print Requisition'
          const isDisabled = isReassign && disableReassign

          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
              onMouseEnter={() => !isDisabled && !printingRequisition && setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {hovered === i && !isDisabled && !printingRequisition && (
                <div className="absolute w-[120px] -top-10 left-1/2 -translate-x-1/2 
                bg-white text-gray-800 text-xs font-medium rounded-md shadow-md px-3 py-1 z-50 text-center">
                  {action.title}
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 
                  w-2 h-2 bg-white rotate-45 shadow-sm"></div>
                </div>
              )}

              {/* Icon button */}
              <button
                disabled={isDisabled || (isPrintRequisition && printingRequisition)}
                onClick={!isDisabled && !printingRequisition ? action.onClick : undefined}
                className={`p-2 rounded-lg shadow-sm transition-all
                  ${isDisabled || (isPrintRequisition && printingRequisition)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : hovered === i
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
              >
                {isPrintRequisition && printingRequisition ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                ) : (
                  action.icon
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderDetailsHeader
