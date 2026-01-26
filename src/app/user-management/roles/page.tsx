'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Trash2 } from 'lucide-react'
import { Avatar } from 'antd'
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | undefined) => (
        <span className="text-sm text-gray-600">{text?.trim() ? text : '—'}</span>
      ),
    },
    {
      title: 'Modules',
      key: 'modules',
      render: (record: any) => {
        const permissions = record?.permissions
        const modules = [
          { key: 'projects', label: 'Projects' },
          { key: 'task', label: 'Task' },
          { key: 'users', label: 'Users' },
          { key: 'settings', label: 'Settings' },
        ]

        const enabledModules = modules.filter((m) =>
          Array.isArray(permissions?.[m.key]) && permissions[m.key].length > 0
        )

        if (enabledModules.length === 0) {
          return <span className="text-sm text-gray-500">—</span>
        }

        if (enabledModules.length === modules.length) {
          return <span className="text-sm text-gray-700">All modules</span>
        }

        return (
          <span className="text-sm text-gray-700">
            {enabledModules.map((m) => m.label).join(', ')}
          </span>
        )
      },
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
      render: (record: any) => {
        const count = record?.userCount || 0

        // Generate random placeholder colors for profile avatars
        const avatarColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#f04864']
        const getRandomColor = () => avatarColors[Math.floor(Math.random() * avatarColors.length)]

        const name = record?.name || 'User'

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{count} Users</span>
            {count > 0 && (
              <Avatar.Group size="small" maxCount={3}>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {name?.charAt(0) || 'U'}
                </Avatar>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {name?.charAt(1) || 'S'}
                </Avatar>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {name?.charAt(2) || 'R'}
                </Avatar>
              </Avatar.Group>
            )}
          </div>
        )
      },
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
