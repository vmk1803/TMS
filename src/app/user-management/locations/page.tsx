'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import { Trash2, Download } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useLocations } from '@/hooks/useLocations'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'
import { exportToCSV } from '@/utils/csvGenerator'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

const DeleteConfirmationModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function LocationsPage() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<any>(null)
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false)
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')

  // Use the locations hook for all data management
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // CSV Export functionality
  const { isExporting, exportData } = useCSVExport()

  // Fetch organizations for the dropdown
  const { organizations, loading: organizationsLoading } = useOrganizations({
    fetchAll: true,
    autoFetch: true
  })

  const {
    locations: rawLocations,
    loading,
    pagination,
    deleteLocation,
    bulkDeleteLocations
  } = useLocations({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    organizationId: selectedOrganizationId || undefined,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Locations now include userCount from the API
  const locations = rawLocations

  /* ----------------------------- TABLE COLUMNS ----------------------------- */
  const columns = [
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'streetAddress',
      key: 'address',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      render: (org: any) => org?.organizationName || 'N/A',
    },
    {
      title: 'No.of Users',
      dataIndex: 'userCount',
      key: 'users',
      render: (count: number) => count || 0,
    },
    {
      title: 'Time Zone',
      dataIndex: 'timeZone',
      key: 'timeZone',
    },
  ]

  /* -------------------------------- Filters -------------------------------- */
  const organizationItems = [
    { key: '', label: 'All Companies' },
    ...(organizations?.map(org => ({
      key: org._id,
      label: org.organizationName
    })) || [])
  ]

  const filters = {
    searchPlaceholder: 'Search locations',
    dropdowns: [
      {
        label: selectedOrganizationId ?
          organizationItems.find(item => item.key === selectedOrganizationId)?.label : 'All Companies',
        items: organizationItems,
        onClick: ({ key }: { key: string }) => {
          setSelectedOrganizationId(key)
          setCurrentPage(1) // Reset to first page when changing filter
        }
      },
    ],
  }

  /* -------------------------------- Handlers -------------------------------- */
  const handleCreate = () => {
    router.push('/user-management/locations/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/locations/${record.id || record._id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/locations/create?locationId=${record.id || record._id}`)
  }

  const handleDelete = (record: any) => {
    setLocationToDelete(record)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!locationToDelete) return

    const success = await deleteLocation(locationToDelete.id)
    if (success) {
      message.success('Location deleted successfully')
      setDeleteModalVisible(false)
      setLocationToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalVisible(false)
    setLocationToDelete(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleExportCSV = () => {
    const filters = {
      searchTerm: debouncedSearchQuery,
      organizationId: selectedOrganizationId || undefined,
    }
    exportData('locations', filters)
  }

  const handleBulkDelete = (selectedIds: string[], selectedRecords: any[]) => {
    setSelectedLocationIds(selectedIds)
    setBulkDeleteModalVisible(true)
  }

  const handleBulkExportCSV = (selectedIds: string[], selectedRecords: any[]) => {
    exportToCSV(
      selectedRecords.map(location => ({
        Name: location.locationName,
        Organization: location.organizationDetails?.organizationName || 'N/A',
        Address: location.address,
        'Phone Number': location.phoneNumber,
        'User Count': location.userCount || 0,
        'Time Zone': location.timeZone
      })),
      {
        filename: `selected-locations-${new Date().toISOString().split('T')[0]}`
      }
    )
  }

  // Bulk actions configuration
  const bulkActions = [
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: handleBulkDelete,
      loading: isBulkDeleting,
      danger: true
    },
    {
      key: 'export',
      label: 'Export CSV',
      icon: <Download size={16} />,
      onClick: handleBulkExportCSV,
      className: 'border-secondary'
    }
  ]

  const confirmBulkDelete = async () => {
    if (selectedLocationIds.length === 0) return

    setIsBulkDeleting(true)

    try {
      const result = await bulkDeleteLocations(selectedLocationIds)

      if (result.success) {
        if (result.failedCount > 0) {
          message.warning(`${result.successCount} location(s) deleted. ${result.failedCount} failed.`)
        } else {
          message.success(result.message || `${result.successCount} location(s) deleted successfully`)
        }

        // Close modal after a successful request (even if some failed)
        setBulkDeleteModalVisible(false)
        setSelectedLocationIds([])
      } else {
        message.error(result.message || 'Failed to delete locations')
      }
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete locations')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const cancelBulkDelete = () => {
    setBulkDeleteModalVisible(false)
    setSelectedLocationIds([])
  }

  return (
    <>
      <ListPage
        title="Locations"
        description="Manage physical and virtual locations"
        data={locations}
        columns={columns}
        filters={filters}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExportCSV={handleExportCSV}
        isExporting={isExporting}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isDebouncing}
        pagination={pagination}
        pageSize={itemsPerPage}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
        bulkActions={bulkActions}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Location"
      />

      <DeleteConfirmationModal
        isOpen={bulkDeleteModalVisible}
        onClose={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedLocationIds.length} Location${selectedLocationIds.length > 1 ? 's' : ''}`}
        loading={isBulkDeleting}
      />
    </>
  )
}
