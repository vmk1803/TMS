'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useDepartments } from '@/hooks/useDepartments'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'
import { Tag } from 'antd'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

const DeleteConfirmModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function DepartmentsListPage() {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter states
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null)
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

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
    deleteDepartment
  } = useDepartments({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    organizationId: selectedOrganization || undefined,
    departmentId: selectedDepartmentFilter || undefined,
    status: selectedStatus || undefined,
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
        return head ? `${head.fname} ${head.lname}` : 'N/A'
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
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
      },
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
      setDeleteOpen(false)
      setSelectedDepartment(null)
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
    setSelectedStatus(null)
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const filters = {
      searchTerm: debouncedSearchQuery,
      organizationId: selectedOrganization || undefined,
      departmentId: selectedDepartmentFilter || undefined,
      status: selectedStatus || undefined,
    }
    exportData('departments', filters)
  }

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
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Department"
      />
    </>
  )
}
