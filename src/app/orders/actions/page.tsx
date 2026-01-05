'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Title from '../../../components/common/Title'
import { printRequisitionForm } from './services/orderActionService'
import Toast from '../../../components/common/Toast'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const ActionsPage = () => {
  const searchParams = useSearchParams()
  const orderGuid = searchParams?.get('orderGuid')
  const action = searchParams?.get('action')
  
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSuccess = (message: string) => {
    setToastType('success')
    setToastMessage(message)
    setToastOpen(true)
  }

  const handleError = (message: string) => {
    setToastType('error')
    setToastMessage(message)
    setToastOpen(true)
  }

  useEffect(() => {
    const handleAction = async () => {
      if (!orderGuid || !action) return

      if (action === 'printRequisition') {
        setIsLoading(true)
        try {
          const result = await printRequisitionForm(orderGuid)
          // Open the signed URL in a new tab for viewing (force inline display)
          const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(result.signedUrl)}`;
          window.open(viewerUrl, '_blank')
          handleSuccess('Requisition form opened in new tab')
          
          // Close this tab after a short delay
          setTimeout(() => {
            window.close()
          }, 2000)
        } catch (error: any) {
          handleError(error.message || 'Failed to print requisition form')
        } finally {
          setIsLoading(false)
        }
      }
    }

    handleAction()
  }, [orderGuid, action])

  return (
    <>
      <div className="p-6 bg-[#F9FBFD] min-h-screen">
        <Title
          heading="Order Actions"
          subheading="Processing order action..."
        />
        
        {isLoading && (
          <div className="flex items-center justify-center mt-20">
            <LoadingSpinner size="large" message="Processing print requisition..." />
          </div>
        )}
        
        {!isLoading && !orderGuid && (
          <div className="flex items-center justify-center mt-20">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Request</h3>
              <p className="text-gray-600">Order GUID is required for this action.</p>
            </div>
          </div>
        )}
        
        {!isLoading && orderGuid && action !== 'printRequisition' && (
          <div className="flex items-center justify-center mt-20">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Action</h3>
              <p className="text-gray-600">The specified action is not supported.</p>
            </div>
          </div>
        )}
      </div>
      
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  )
}

export default ActionsPage
