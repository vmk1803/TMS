'use client'

import { useRouter } from 'next/navigation'
import { Tag } from 'antd'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import ListPage from '@/components/common/ListPage'

const DeleteConfirmationModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function OrganizationsTable() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Simple debounced search
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Use the hook for all organization operations
  const {
    organizations,
    loading,
    pagination,
    deleteOrganization,
    refetch
  } = useOrganizations({
    autoFetch: false, // Don't auto-fetch to prevent navigation blocking
    searchString: debouncedSearchQuery,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Trigger initial data fetch immediately
  useEffect(() => {
    refetch()
  }, [refetch])

  /* -------------------------------- Columns -------------------------------- */
  const columns = [
    {
      title: 'Organization',
      dataIndex: 'organizationName',
      key: 'organizationName',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Locations',
      dataIndex: 'locations',
      key: 'locations',
      render: (locations: string[]) => locations?.length || 0,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Active</Tag>, // Organizations don't have status field, assuming all active
    },
  ]

  /* -------------------------------- Filters -------------------------------- */
  const filters = {
    searchPlaceholder: 'Search organizations',
    dropdowns: [],
  }

  /* -------------------------------- Handlers -------------------------------- */
  const handleCreate = () => {
    router.push('/user-management/organizations/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/organizations/${record._id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/organizations/create?organizationId=${record._id}`)
  }

  const handleDelete = (record: any) => {
    setOrganizationToDelete(record)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (organizationToDelete) {
      await deleteOrganization(organizationToDelete._id)
      setOrganizationToDelete(null)
      // Modal closes automatically
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false)
    setOrganizationToDelete(null)
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
        title="Organizations"
        description="Manage tenant organizations, usage, roles and billing"
        data={organizations}
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
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
      />
    </>
  )
}
