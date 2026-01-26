'use client'

import { useRouter } from 'next/navigation'
import { Tag, Avatar, message } from 'antd'
import { useState } from 'react'
import { Download } from 'lucide-react'
import dynamic from 'next/dynamic'
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

const ConfirmationModal = dynamic(() => import('@/components/common/ConfirmationModal'), {
  loading: () => null
})

export default function OrganizationsTable() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState<{ [key: string]: boolean }>({})

  // Bulk operation states
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<'deactivate' | 'suspend' | null>(null)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([])

  // Simple debounced search
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // CSV Export functionality
  const { isExporting, exportData } = useCSVExport()

  // Use the hook for all organization operations
  const {
    organizations,
    loading,
    pagination,
    deleteOrganization,
    refetch,
    bulkUpdateStatus
  } = useOrganizations({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    status: selectedStatus || undefined,
    page: currentPage,
    pageSize: itemsPerPage
  })

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
      title: 'Departments',
      dataIndex: 'departmentCount',
      key: 'departmentCount',
      render: (count: number) => (
        <span className="font-medium text-gray-700">{count || 0}</span>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number, record: any) => {
        // Generate random placeholder colors for profile avatars
        const avatarColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#f04864'];
        const getRandomColor = () => avatarColors[Math.floor(Math.random() * avatarColors.length)];

        return (
          <div className="flex items-center gap-2">
            {count > 0 && (
              <Avatar.Group size="small" maxCount={3}>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {record.organizationName?.charAt(0) || 'U'}
                </Avatar>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {record.organizationName?.charAt(1) || 'S'}
                </Avatar>
                <Avatar style={{ backgroundColor: getRandomColor() }}>
                  {record.organizationName?.charAt(2) || 'R'}
                </Avatar>
              </Avatar.Group>
            )}
            <span className="font-medium text-gray-700 ml-1">
              {count > 0 ? `+${count} Users` : '0 Users'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'active':
              return { color: 'green', text: 'Active' }
            case 'suspended':
              return { color: 'default', text: 'Suspended', style: { backgroundColor: '#d1d5db', borderRadius: '9999px' } }
            case 'inactive':
              return { color: 'red', text: 'Inactive' }
            default:
              return { color: 'default', text: status ? status.charAt(0).toUpperCase() + status.slice(1) : '-' }
          }
        }

        const config = getStatusConfig(status)

        return (
          <Tag
            color={config.color}
            style={{
              borderRadius: '9999px',
              ...config.style
            }}
          >
            {config.text}
          </Tag>
        )
      },
    },
  ]

  /* -------------------------------- Filters -------------------------------- */
  const filters = {
    searchPlaceholder: 'Search organizations',
    dropdowns: [
      {
        label: selectedStatus
          ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
          : 'All Status',
        items: [
          { key: 'all', label: 'All Status' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
        ],
        onClick: (item: { key: string }) => {
          setSelectedStatus(item.key === 'all' ? null : item.key)
          setCurrentPage(1) // Reset to first page
        }
      },
    ],
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

  const handleExportCSV = () => {
    const filters = {
      searchTerm: debouncedSearchQuery,
      status: selectedStatus || undefined,
    }
    exportData('organizations', filters)
  }

  // Bulk action handlers - show confirmation
  const handleBulkDeactivate = (selectedIds: string[], selectedRecords: any[]) => {
    setBulkSelectedIds(selectedIds)
    setBulkOperation('deactivate')
    setBulkConfirmOpen(true)
  }

  const handleBulkSuspend = (selectedIds: string[], selectedRecords: any[]) => {
    setBulkSelectedIds(selectedIds)
    setBulkOperation('suspend')
    setBulkConfirmOpen(true)
  }

  // Confirmation handlers
  const confirmBulkOperation = async () => {
    if (!bulkOperation || bulkSelectedIds.length === 0) return

    const operation = bulkOperation
    setBulkActionLoading(prev => ({ ...prev, [operation]: true }))
    try {
      const status = operation === 'deactivate' ? 'inactive' : 'suspended'
      await bulkUpdateStatus(bulkSelectedIds, status)

      await refetch()
      message.success('Organizations updated successfully')

      setBulkConfirmOpen(false)
      setBulkOperation(null)
      setBulkSelectedIds([])
    } catch (error) {
      console.error('Bulk operation failed:', error)
      message.error('Bulk operation failed')
    } finally {
      setBulkActionLoading(prev => ({ ...prev, [operation]: false }))
    }
  }

  const cancelBulkOperation = () => {
    setBulkConfirmOpen(false)
    setBulkOperation(null)
    setBulkSelectedIds([])
  }

  const handleBulkExportCSV = (selectedIds: string[], selectedRecords: any[]) => {
    exportToCSV(
      selectedRecords.map(org => ({
        Organization: org.organizationName,
        Locations: org.locations?.length || 0,
        Departments: org.departmentCount || 0,
        Users: org.userCount || 0,
        Status: org.status,
        Email: org.email,
        Contact: org.contactNumber
      })),
      { filename: `selected-organizations-${new Date().toISOString().split('T')[0]}` }
    )
  }

  // Bulk actions configuration
  const bulkActions = [
    {
      key: 'deactivate',
      label: 'Deactivate',
      onClick: handleBulkDeactivate,
      loading: bulkActionLoading.deactivate,
      className: 'border-secondary'
    },
    {
      key: 'suspend',
      label: 'Suspend',
      onClick: handleBulkSuspend,
      loading: bulkActionLoading.suspend,
      className: 'border-secondary'
    },
    {
      key: 'export',
      label: 'Export CSV',
      icon: <Download size={16} />,
      onClick: handleBulkExportCSV,
      className: 'border-secondary'
    }
  ]

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
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
      />

      {/* Bulk Operation Confirmation */}
      <ConfirmationModal
        isOpen={bulkConfirmOpen}
        onClose={cancelBulkOperation}
        onConfirm={confirmBulkOperation}
        title={`Bulk ${bulkOperation === 'deactivate' ? 'Deactivate' : 'Suspend'} Organizations`}
        body={`Do you really want to ${bulkOperation} ${bulkSelectedIds.length} organization${bulkSelectedIds.length > 1 ? 's' : ''}?`}
        confirmText="Yes"
        cancelText="No"
      />
    </>
  )
}
