'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Trash2 } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'
import PermissionDisplay from '@/components/user-management/PermissionDisplay'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

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

  // CSV Export functionality
  const { isExporting, exportData } = useCSVExport()

  const {
    roles,
    loading,
    pagination,
    deleteRole
  } = useRoles({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    permissionSection: permissionFilter,
    page: currentPage,
    pageSize: itemsPerPage
  })

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

  const handleExportCSV = () => {
    const filters = {
      searchTerm: debouncedSearchQuery,
      permissionSection: permissionFilter !== 'all' ? permissionFilter : undefined,
    }
    exportData('roles', filters)
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
        title="Delete Role"
      />
    </>
  )
}
