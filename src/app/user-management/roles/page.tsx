'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Trash2 } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import PermissionDisplay from '@/components/user-management/PermissionDisplay'
import ListPage from '@/components/common/ListPage'

const DeleteConfirmationModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function RolesPage() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [permissionFilter, setPermissionFilter] = useState('all')

  // Use the roles hook for all data management
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  const {
    roles,
    loading,
    pagination,
    deleteRole,
    refetch
  } = useRoles({
    autoFetch: false, // Don't auto-fetch to prevent navigation blocking
    searchString: debouncedSearchQuery,
    permissionSection: permissionFilter,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Trigger initial data fetch immediately
  useEffect(() => {
    refetch()
  }, [refetch])

  /* ----------------------------- TABLE COLUMNS ----------------------------- */
  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any) => (
        <PermissionDisplay permissions={permissions} />
      ),
    },
    {
      title: 'Assigned Users',
      key: 'users',
      render: (record: any) => (
        <span className="text-sm text-gray-500">{record.userCount || 0} Users</span>
      ),
    },
  ]

  /* -------------------------------- Filters -------------------------------- */
  const filters = {
    searchPlaceholder: 'Search roles',
    dropdowns: [
      {
        label: permissionFilter === 'all' ? 'All Permissions' :
               permissionFilter.charAt(0).toUpperCase() + permissionFilter.slice(1),
        items: [
          { key: 'all', label: 'All Permissions' },
          { key: 'projects', label: 'Projects' },
          { key: 'task', label: 'Task' },
          { key: 'users', label: 'Users' },
          { key: 'settings', label: 'Settings' },
        ],
        onClick: ({ key }: { key: string }) => {
          setPermissionFilter(key)
        }
      },
    ],
  }

  /* -------------------------------- Handlers -------------------------------- */
  const handleCreate = () => {
    router.push('/user-management/roles/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/roles/${record._id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/roles/create?roleId=${record._id}`)
  }

  const handleDelete = (record: any) => {
    setRoleToDelete(record)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    const success = await deleteRole(roleToDelete._id)
    if (success) {
      setDeleteModalVisible(false)
      setRoleToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalVisible(false)
    setRoleToDelete(null)
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
        title="Roles"
        description="Define roles and their permissions"
        data={roles}
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
        title="Delete Role"
      />
    </>
  )
}
