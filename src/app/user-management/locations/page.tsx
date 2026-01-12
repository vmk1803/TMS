'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useLocations } from '@/hooks/useLocations'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'

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
    deleteLocation
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
        label: 'All Companies',
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
      />

      <DeleteConfirmationModal
        isOpen={deleteModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Location"
      />
    </>
  )
}
