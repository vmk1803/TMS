'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useLocations } from '@/hooks/useLocations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import ListPage from '@/components/common/ListPage'

const DeleteConfirmationModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function LocationsPage() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Use the locations hook for all data management
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  const {
    locations: rawLocations,
    loading,
    pagination,
    deleteLocation,
    refetch
  } = useLocations({
    autoFetch: false, // Don't auto-fetch to prevent navigation blocking
    searchString: debouncedSearchQuery,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Trigger initial data fetch immediately
  useEffect(() => {
    refetch()
  }, [refetch])

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
  const filters = {
    searchPlaceholder: 'Search locations',
    dropdowns: [
      {
        label: 'All Companies',
        items: [
          { key: 'all', label: 'All Companies' },
          { key: 'nimbus', label: 'Nimbus Capital' },
          { key: 'grey', label: 'Grey Tech Solutions' },
        ],
        onClick: ({ key }: { key: string }) => {
          // Handle company filter change
          console.log('Selected company:', key)
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
