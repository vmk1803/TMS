'use client';
import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Title from '../../components/common/Title'
import ButtonDarkRounded from '../../components/common/ButtonDarkRounded'
import { AssignIcon, PlusIcon } from '../../components/Icons'
import { TravelIcon, TotalIcon, PerfumedIcon } from '@/components/Icons'
import ButtonLight from '../../components/common/ButtonLight'
import OrderFilters from './manageAllOrders/components/OrderFilters'
import { useOrders } from './manageAllOrders/hooks/useOrders'
import AssignOrderModal from './assign/components/AssignOrderModal'
import Toast from '../../components/common/Toast'
import SuccessUpdateModal from '../../components/common/SuccessUpdateModal'
import { assignTechnician } from './manageAllOrders/services/assignTechnicianService'
import { exportToCSV } from '../../utils/exportToCSV'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { canCreateOrder, canAssign, canViewMap } from '../../utils/rbac'

// Lazy load the data table component
const DataTable = dynamic(() => import('./manageAllOrders/components/DataTable'), {
  loading: () => <LoadingSpinner size="medium" message="Loading orders..." />,
  ssr: false,
})

const Page = () => {
  const router = useRouter()
  const ordersState = useOrders(1, 10)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOrderGuids, setSelectedOrderGuids] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)
  const [clearSelectionKey, setClearSelectionKey] = useState(0)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleAssign = async (technicianGuid: string | null) => {
    if (!technicianGuid || selectedOrderGuids.length === 0) return
    try {
      setAssigning(true)
      const res = await assignTechnician({
        order_guids: selectedOrderGuids,
        technician_guid: technicianGuid,
      })
      // clear selection and refresh table
      setSelectedOrderGuids([])
      setClearSelectionKey((k) => k + 1)
      if (ordersState.reload) {
        ordersState.reload()
      }
      setShowAssignModal(false)
      setShowSuccessModal(true)

    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to assign technician'
      setToastType('error')
      setToastMessage(msg)
      setToastOpen(true)
    } finally {
      setAssigning(false)
    }
  }

  const handleExport = () => {
    if (selectedOrderGuids.length === 0) return

    // Filter orders data to only include selected orders
    const selectedOrders = ordersState.data.filter((order: any) =>
      selectedOrderGuids.includes(order.order_guid)
    )
    const exportData = selectedOrders.map((order: any) => {
    // Format date helper
    const formatDate = (date: string | null | undefined) =>
      date ? new Date(date).toLocaleDateString("en-US").replace(/\//g, "-") : "--";

    return {
      "Order Number": order.phlebio_order_id ?? "--",
      "Patient Name": order.patient
        ? `${order.patient.first_name || ""} ${order.patient.last_name || ""}`.trim()
        : "--",
      "DOB": formatDate(order.patient?.date_of_birth),
      "EMR Order": order.emr_order_id ?? "--",
      "LabSquire Order": order.lab_order_id ?? "--",
      // Order Information
      "Order Type": order.order_type ?? "--",
      "Urgency": order.urgency ?? "--",
      "Fasting": order.fasting ? "Yes" : "No",
      "TAT": order.tat ?? "--",
      // Tests
      "Lab Tests":
        order.test_info?.length > 0
          ? order.test_info.map((t: any) => t.test_name).join(", ")
          : "--",
      // Partner (Ordering Facility)
      "Ordering Facility": order.partner?.name ?? "--",
      // Physician Info
      "Physician": order.physician
        ? `${order.physician.first_name || ""} ${order.physician.last_name || ""}`.trim()
        : "--",
      "Order Date": formatDate(order.created_at),
      "Service Date": formatDate(order.date_of_service),
      "Service Address": order.service_address ?? "--",
     "Technician": order.technician_data
      ? `${order.technician_data.first_name || ""} ${order.technician_data.last_name || ""}`.trim()
      : "--",
      // Notes
      "Admin Notes": order.admin_notes ?? "--",
      "Technician Notes": order.technician_notes ?? "--",
      "Status": order.status ?? "--",
    };
  });

    // Call the global export utility
    exportToCSV(exportData, 'orders')

    // Clear selection after export
    setSelectedOrderGuids([])
    setClearSelectionKey((k) => k + 1)

    // Show success toast
    setToastType('success')
    setToastMessage(`Successfully exported ${selectedOrders.length} order(s)`)
    setToastOpen(true)
  }

  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams?.get?.('status')
    if (status) {
      // Don't reset page - let the URL handle pagination state
      if (status.toUpperCase() === 'ALL-ORDERS') {
        ordersState.setFilters((prev) => {
          const updated = { ...prev }
          delete updated.statuses
          delete updated.status
          return updated
        })
        return
      }
      // Convert status to statuses array format that API expects
      ordersState.setFilters((prev) => {
        const updated = { ...prev }
        updated.statuses = [String(status).toUpperCase()]
        delete updated.status
        return updated
      })
    }
  }, [searchParams])

  return (
    <>
      <div className='flex justify-between'>

        <Title
          heading="Manage all orders"
          subheading="Comprehensive view to track, monitor, and handle orders across all stages"
        />
        <div className="flex gap-3">
          {canViewMap() && selectedOrderGuids.length > 0 && (
            <ButtonLight
              label="Show On Map"
              Icon={TravelIcon}
              onClick={() => {
                if (!selectedOrderGuids.length) return
                const param = encodeURIComponent(selectedOrderGuids.join(','))
                router.push(`/orders/assign?orderGuids=${param}`)
              }}
            />
          )}
          {canAssign() && (
            <ButtonLight
              label="Assign"
              Icon={AssignIcon}
              onClick={() => setShowAssignModal(true)}
              disabled={selectedOrderGuids.length === 0 || assigning}
            />
          )}
          {canCreateOrder() && (
            <ButtonDarkRounded label="Create New Order" Icon={PlusIcon} link="/orders/patientLookUp" />
          )}
        </div>

      </div>
      <div className='flex flex-col border border-tableBorder rounded-xl mt-4 min-h-[calc(100vh-190px)] h-[calc(100vh-180px)] '>
        <OrderFilters
          filters={ordersState.filters}
          setFilters={ordersState.setFilters}
          setPage={ordersState.setPage}
          onExport={handleExport}
          selectedCount={selectedOrderGuids.length}
          selectedOrderGuids={selectedOrderGuids}
          onRefresh={ordersState.reload}
          onClearSelection={() => {
            setSelectedOrderGuids([]);
            setClearSelectionKey((k) => k + 1);
          }}
        />
        <Suspense fallback={<LoadingSpinner size="medium" message="Loading orders..." />}>
          <DataTable
            page={ordersState.page}
            setPage={ordersState.setPage}
            pageSize={ordersState.pageSize}
            setPageSize={ordersState.setPageSize}
            data={ordersState.data}
            loading={ordersState.loading}
            totalPages={ordersState.totalPages}
            limit={ordersState.limit}
            total={ordersState.total}
            filters={ordersState.filters}
            setFilters={ordersState.setFilters}
            onSelectionChange={setSelectedOrderGuids}
            clearSelectionKey={clearSelectionKey}
            onRefresh={ordersState.reload}
          />
        </Suspense>
      </div>
      <AssignOrderModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={handleAssign}
        assigning={assigning}
      />
      <SuccessUpdateModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Orders Assign"
        heading="Orders assigned successfully"
      />
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  )
}

export default Page