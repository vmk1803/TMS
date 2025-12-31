'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import OrderSummary from './OrderSummary'
import Tabs from './Tabs'
import InformationTab from './InformationTab'
import AttachmentsTab from './AttachmentsTab'
import NotesTab from './NotesTab'
import { getOrderByGuid } from '../services/viewOrderService'

import OrderDetailsHeader from './OrderDetailsHeader'
import ReAssignTechnicianModal from '../../../../components/common/ReAssignTechnicianModal'
import NotesModal from '../../actions/components/NotesModal'

const OrderDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('Information')
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

  const searchParams = useSearchParams()
  const orderGuid = searchParams?.get('orderGuid')
  const isReadOnly = searchParams?.get('readonly') === 'true'

  const fetchOrder = async (guid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const orderData = await getOrderByGuid(guid)
      setOrder(orderData)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch order')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (orderGuid) {
      fetchOrder(orderGuid)
    }
  }, [orderGuid])

  const refreshOrder = () => {
    if (orderGuid) {
      fetchOrder(orderGuid)
    }
  }

  const disableReassign = useMemo(() => {
    if (!order) return false

    const blockStatuses = [
      'PENDING',
      'PERFORMED',
      'COMPLETED',
      'CANCELLED',
      'DELIVERED TO LAB'
    ]

    return (
      blockStatuses.includes(order.status) &&
      order.order_type !== 'RETURN VISIT'
    )
  }, [order])

  const handleAssignClick = () => {
    if (disableReassign) return 
    setIsAssignModalOpen(true) 
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Information':
        return <InformationTab orderData={order} isReadOnly={isReadOnly} />
      case 'Attachments':
        return <AttachmentsTab orderData={order} onRefresh={refreshOrder} />
      case 'Notes':
        return <NotesTab orderData={order} />
      default:
        return <InformationTab orderData={order} isReadOnly={isReadOnly} />
    }
  }

  return (
    <div className="p-6 bg-[#F9FBFD] min-h-screen">
      <OrderDetailsHeader
        onAssignOrder={handleAssignClick}
        onProgressNotes={() => setIsNotesModalOpen(true)}
        orderGuid={orderGuid}
        orderData={order}
      />
      <OrderSummary orderData={order} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderTabContent()}

      {/* Modals */}
      {orderGuid && (
        <>
          <ReAssignTechnicianModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            selectedOrderGuids={[orderGuid]}
            onSuccess={() => {
              setIsAssignModalOpen(false)
              const fetchOrder = async (guid: string) => {
                try {
                  const updated = await getOrderByGuid(guid)
                  setOrder(updated)
                } catch (error) {
                  console.error("Failed to refresh order", error)
                }
              }
              fetchOrder(orderGuid)
            }}
          />
          <NotesModal
            isOpen={isNotesModalOpen}
            onClose={() => setIsNotesModalOpen(false)}
            order_guid={orderGuid}
            type="Admin Notes"
          />
        </>
      )}
    </div>
  )
}

export default OrderDetailsPage
