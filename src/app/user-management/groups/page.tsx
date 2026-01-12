'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useGroups } from '@/hooks/useGroups'
import { useDepartments } from '@/hooks/useDepartments'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useCSVExport } from '@/hooks/useCSVExport'

// Lazy load heavy components
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

const DeleteConfirmModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

export default function GroupsListPage() {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')

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

  // Groups data with search and department filtering
  const {
    groups: rawGroups,
    loading,
    pagination,
    deleteGroup
  } = useGroups({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    page: currentPage,
    pageSize: itemsPerPage
  })

  // Format groups data for the table
  const groups = rawGroups.map(group => ({
    ...group, // Keep all original properties including id/_id
    name: group.name,
    manager: `${group.manager.firstName} ${group.manager.lastName}`,
    members: group.members.length.toString(),
    department: group.department.name,
    type: 'Task', // Default value as requested
    modified: group.updatedAt ? new Date(group.updatedAt).toLocaleDateString() : 'N/A'
  }))

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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Last modified',
      dataIndex: 'modified',
      key: 'modified',
    },
  ]

  const filters = {
    searchPlaceholder: "Search groups",
    dropdowns: [
      {
        label: 'All Company',
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
        label: 'All Groups',
        items: [{ key: 'all', label: 'All Groups' }]
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
    console.log(record, 'record')
    const groupId = record.id || record._id
    router.push(`/user-management/groups/create?groupId=${groupId}`)
  }

  const handleDelete = (record: any) => {
    setGroupToDelete(record)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!groupToDelete) return

    const success = await deleteGroup(groupToDelete.id)
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
      searchTerm: debouncedSearchQuery,
      departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    }
    exportData('groups', filters)
  }

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
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Group"
      />
    </>
  )
}
