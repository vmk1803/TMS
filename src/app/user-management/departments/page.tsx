'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useDepartments } from '@/hooks/useDepartments'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'
import { message } from 'antd'
import { Download } from 'lucide-react'
import { departmentApi } from '@/services/departmentService'
import { exportToCSV } from '@/utils/csvGenerator'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

const DeleteConfirmModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

const ConfirmationModal = dynamic(() => import('@/components/common/ConfirmationModal'), {
  loading: () => null
})

export default function DepartmentsListPage() {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Bulk operation states
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<'delete' | null>(null)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  // Filter states
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null)
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string | null>(null)

  // Simple debounced search
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // CSV Export functionality
  const { isExporting, exportData } = useCSVExport()

  // Fetch all organizations for dropdown
  const { organizations } = useOrganizations({ fetchAll: true, autoFetch: true })

  // Fetch all departments for dropdown
  const { departments: allDepartments } = useDepartments({ fetchAll: true, autoFetch: true })

  // Use the departments hook for main list with filters
  const {
    departments,
    loading,
    pagination,
    deleteDepartment,
    refetch
  } = useDepartments({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    organizationId: selectedOrganization || undefined,
    departmentId: selectedDepartmentFilter || undefined,
    page: currentPage,
    pageSize: itemsPerPage
  })

  /* -------------------------------- Columns -------------------------------- */
  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Organization',
      dataIndex: 'organizationName',
      key: 'organizationName',
      render: (text: string, record: any) => record.organization?.organizationName || 'N/A',
    },
    {
      title: 'Head of Department',
      dataIndex: ['headOfDepartment', 'fname'],
      key: 'headOfDepartment',
      render: (text: string, record: any) => {
        const head = record.headOfDepartment
        return head ? `${head?.firstName || ''} ${head?.lastName || ''}`.trim() || 'N/A' : 'N/A'
      },
    },
    {
      title: 'Users Count',
      dataIndex: 'usersCount',
      key: 'usersCount',
      render: (count: number | undefined) => (
        <span className="font-medium text-gray-900">{count ?? 0}</span>
      ),
    }
  ]

  /* -------------------------------- Filters -------------------------------- */
  const filters = {
    searchPlaceholder: 'Search departments',
    dropdowns: [
      {
        label: selectedDepartmentFilter
          ? allDepartments.find(d => d._id === selectedDepartmentFilter)?.name || 'All Departments'
          : 'All Departments',
        items: [
          { key: 'all', label: 'All Departments' },
          ...allDepartments.map(d => ({ key: d._id, label: d.name }))
        ],
        onClick: (item: { key: string }) => {
          setSelectedDepartmentFilter(item.key === 'all' ? null : item.key)
          setCurrentPage(1) // Reset to first page
        }
      },
      {
        label: selectedOrganization
          ? organizations.find(o => o._id === selectedOrganization)?.organizationName || 'All Companies'
          : 'All Companies',
        items: [
          { key: 'all', label: 'All Companies' },
          ...organizations.map(o => ({ key: o._id, label: o.organizationName }))
        ],
        onClick: (item: { key: string }) => {
          setSelectedOrganization(item.key === 'all' ? null : item.key)
          setCurrentPage(1) // Reset to first page
        }
      }
    ],
  }

  /* -------------------------------- Handlers -------------------------------- */
  const handleCreate = () => {
    router.push('/user-management/departments/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/departments/${record._id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/departments/create?departmentId=${record._id}`)
  }

  const handleDelete = (record: any) => {
    setSelectedDepartment(record)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedDepartment) return;

    const success = await deleteDepartment(selectedDepartment._id)
    if (success) {
      message.success('Department deleted successfully')
      setDeleteOpen(false)
      setSelectedDepartment(null)
    } else {
      message.error('Failed to delete department')
    }
  }

  const cancelDelete = () => {
    setDeleteOpen(false)
    setSelectedDepartment(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Reset filters when needed
  const resetFilters = () => {
    setSelectedOrganization(null)
    setSelectedDepartmentFilter(null)
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const filters = {
      searchString: debouncedSearchQuery,
      organizationId: selectedOrganization || undefined,
      departmentId: selectedDepartmentFilter || undefined,
    }
    exportData('departments', filters)
  }

  /* -------------------------------- Bulk Actions -------------------------------- */
  const handleBulkDelete = (selectedIds: string[], selectedRecords: any[]) => {
    setBulkSelectedIds(selectedIds)
    setBulkOperation('delete')
    setBulkConfirmOpen(true)
  }

  const confirmBulkOperation = async () => {
    if (!bulkOperation || bulkSelectedIds.length === 0) return

    setBulkLoading(true)
    try {
      const result = await departmentApi.bulkOperation({
        ids: bulkSelectedIds,
        operation: bulkOperation
      });

      if (result?.failedCount > 0) {
        message.warning(
          `${result.successCount} department(s) deleted. ${result.failedCount} failed.`
        )
      } else {
        message.success(
          `${result.successCount} department(s) deleted successfully`
        )
      }

      // Refresh the data using hook refetch
      await refetch()

      setBulkConfirmOpen(false)
      setBulkOperation(null)
      setBulkSelectedIds([])
    } catch (error: any) {
      console.error('Bulk operation failed:', error)
      message.error(error?.response?.data?.message || error?.message || 'Bulk operation failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const cancelBulkOperation = () => {
    setBulkConfirmOpen(false)
    setBulkOperation(null)
    setBulkSelectedIds([])
  }

  const handleBulkExportCSV = (selectedIds: string[], selectedRecords: any[]) => {
    exportToCSV(
      selectedRecords.map(dept => ({
        'Department Name': dept.name,
        'Organization': dept.organization?.organizationName || 'N/A',
        'Description': dept.description || 'N/A',
        'Head of Department': dept.headOfDepartment
          ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`
          : 'N/A',
        'Created Date': dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : 'N/A'
      })),
      { filename: `selected-departments-${new Date().toISOString().split('T')[0]}` }
    )

    message.success(`Exported ${selectedRecords.length} department(s) to CSV`)
  }

  const bulkActions = [
    {
      key: 'delete',
      label: 'Delete',
      onClick: handleBulkDelete,
      loading: bulkLoading && bulkOperation === 'delete',
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

  return (
    <>
      <ListPage
        title="Departments"
        description="Create and Manage Organizational Departments"
        data={departments}
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

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Department"
      />

      {/* Bulk Operation Confirmation */}
      <ConfirmationModal
        isOpen={bulkConfirmOpen}
        onClose={cancelBulkOperation}
        onConfirm={confirmBulkOperation}
        title="Bulk Delete Departments"
        body={`Do you really want to delete ${bulkSelectedIds.length} department${bulkSelectedIds.length > 1 ? 's' : ''}?`}
        confirmText="Yes"
        cancelText="No"
      />
    </>
  )
}
