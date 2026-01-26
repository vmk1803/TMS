'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Download } from 'lucide-react'
import { useGroups } from '@/hooks/useGroups'
import { useDepartments } from '@/hooks/useDepartments'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'
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

export default function GroupsListPage() {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // CSV Export functionality
  const { isExporting, exportData } = useCSVExport()

  // Departments for filter dropdown
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

  // All groups for dropdown filter
  const { groups: allGroupsForFilter, loading: allGroupsLoading } = useGroups({ fetchAll: true })

  // Groups data with search and department filtering
  const {
    groups: rawGroups,
    loading,
    pagination,
    deleteGroup,
    bulkDeleteGroups
  } = useGroups({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    group: selectedGroup === 'all' ? undefined : selectedGroup,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Format groups data for the table
  const groups = rawGroups?.length ? rawGroups.map(group => ({
    ...group, // Keep all original properties including id/_id
    name: group.name,
    manager: group.manager ? `${group.manager.firstName} ${group.manager.lastName}` : 'N/A',
    members: group.members?.length?.toString() || '0',
    department: group.department?.name || 'N/A',
    createdAt: group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A',
    updatedAt: group.updatedAt ? new Date(group.updatedAt).toLocaleDateString() : 'N/A'
  })) : []

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: 'Departments',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'created',
    },
    {
      title: 'Last modified',
      dataIndex: 'updatedAt',
      key: 'modified',
    },
  ]

  const filters = {
    searchPlaceholder: "Search groups",
    dropdowns: [
      {
        label: 'All Organizations',
        items: [{ key: 'all', label: 'All Company' }]
      },
      {
        label: 'All Departments',
        items: [
          { key: 'all', label: 'All Departments' },
          ...departments.map(dept => ({
            key: dept._id,
            label: dept.name
          }))
        ],
        onClick: ({ key }: { key: string }) => {
          setSelectedDepartment(key)
          setCurrentPage(1) // Reset to first page when filtering
        }
      },
      {
        label: selectedGroup === 'all' ? 'All Groups' : allGroupsForFilter.find(group => (group.id || group._id) === selectedGroup)?.name || 'All Groups',
        items: [
          { key: 'all', label: 'All Groups' },
          ...allGroupsForFilter.map(group => ({
            key: group.id || group._id,
            label: group.name
          }))
        ],
        onClick: ({ key }: { key: string }) => {
          setSelectedGroup(key)
          setCurrentPage(1) // Reset to first page when filtering
        }
      },
    ]
  }

  const handleCreate = () => {
    router.push('/user-management/groups/create')
  }

  const handleView = (record: any) => {
    const groupId = record.id || record._id
    router.push(`/user-management/groups/${groupId}`)
  }

  const handleEdit = (record: any) => {
    const groupId = record.id || record._id
    router.push(`/user-management/groups/create?groupId=${groupId}`)
  }

  const handleDelete = (record: any) => {
    setGroupToDelete(record)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!groupToDelete) return

    const groupId = groupToDelete.id || groupToDelete._id
    const success = await deleteGroup(groupId)
    if (success) {
      setDeleteOpen(false)
      setGroupToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteOpen(false)
    setGroupToDelete(null)
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
      search_string: debouncedSearchQuery,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      group: selectedGroup !== 'all' ? selectedGroup : undefined,
    }
    exportData('groups', filters)
  }

  // Bulk actions
  const handleBulkDelete = (selectedIds: string[]) => {
    setBulkSelectedIds(selectedIds)
    setBulkDeleteOpen(true)
  }

  const confirmBulkDelete = async () => {
    if (bulkSelectedIds.length === 0) return
    setIsBulkDeleting(true)
    try {
      await bulkDeleteGroups(bulkSelectedIds)
      setBulkDeleteOpen(false)
      setBulkSelectedIds([])
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const cancelBulkDelete = () => {
    setBulkDeleteOpen(false)
    setBulkSelectedIds([])
  }

  const handleBulkExportCSV = (_selectedIds: string[], selectedRecords: any[]) => {
    exportToCSV(
      selectedRecords.map((g: any) => ({
        'Group Name': g.name,
        'Manager': g.manager,
        'Members': g.members,
        'Department': g.department,
        'Created Date': g.createdAt,
        'Last Modified': g.updatedAt,
      })),
      { filename: `selected-groups-${new Date().toISOString().split('T')[0]}` }
    )
  }

  const bulkActions = [
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      onClick: (selectedIds: string[]) => handleBulkDelete(selectedIds),
      loading: isBulkDeleting,
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
        title="Groups"
        description="Create and Manage Groups For Routing, Permissions and Collaboration."
        data={groups}
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

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Group"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={bulkDeleteOpen}
        onClose={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        title="Delete Groups"
        body={`Do you really want to delete ${bulkSelectedIds.length} group${bulkSelectedIds.length > 1 ? 's' : ''}?`}
        confirmText="Yes"
        cancelText="No"
      />
    </>
  )
}
