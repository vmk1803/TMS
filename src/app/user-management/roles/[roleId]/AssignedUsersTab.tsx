import { Table, Input } from 'antd'
import { Search, Eye } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDepartments } from '@/hooks/useDepartments'
import SearchableDropdown from '@/components/common/SearchableDropdown'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import Pagination from '@/components/common/Pagination'
import type { PaginatedUsersResponse, User } from '@/services/userService'

interface AssignedUsersTabProps {
  roleId: string
  onSelectionChange?: (count: number) => void

  users: User[]
  loading: boolean
  error: string | null
  pagination: PaginatedUsersResponse['pagination_info'] | null

  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void

  selectedDepartment: string
  setSelectedDepartment: (deptId: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void

  searchQuery: string
  setSearchQuery: (value: string) => void
  isDebouncing: boolean

  bulkUpdateUsers: (userIds: string[], updates: Record<string, any>) => Promise<boolean>
}

export interface AssignedUsersTabRef {
  handleRemove: () => void
}

const AssignedUsersTab = forwardRef<AssignedUsersTabRef, AssignedUsersTabProps>((props, ref) => {
  const {
    roleId,
    onSelectionChange,
    users,
    loading,
    error,
    pagination,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedDepartment,
    setSelectedDepartment,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    isDebouncing,
    bulkUpdateUsers,
  } = props
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  // Departments for filter dropdown
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

  useImperativeHandle(ref, () => ({
    handleRemove: () => {
      if (selectedUsers.length === 0) return
      setShowRemoveModal(true)
    }
  }), [selectedUsers.length])

  useEffect(() => {
    onSelectionChange?.(selectedUsers.length)
  }, [selectedUsers.length, onSelectionChange])

  const displayedUserIds = useMemo(() => users.map(u => u._id), [users])
  const selectedDisplayedUserIds = useMemo(
    () => selectedUsers.filter(id => displayedUserIds.includes(id)),
    [selectedUsers, displayedUserIds]
  )

  const isAllDisplayedSelected =
    displayedUserIds.length > 0 && selectedDisplayedUserIds.length === displayedUserIds.length
  const isSomeDisplayedSelected =
    selectedDisplayedUserIds.length > 0 && selectedDisplayedUserIds.length < displayedUserIds.length

  const toggleSelectAllDisplayed = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => Array.from(new Set([...prev, ...displayedUserIds])))
    } else {
      setSelectedUsers(prev => prev.filter(id => !displayedUserIds.includes(id)))
    }
  }

  const handleRemoveUsers = async () => {
    if (selectedUsers.length === 0) return

    const success = await bulkUpdateUsers(selectedUsers, { 'organizationDetails.role': null })
    if (success) {
      setSelectedUsers([])
      setShowRemoveModal(false)
      setCurrentPage(1)
    }
  }

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={isAllDisplayedSelected}
          ref={(el) => {
            if (el) el.indeterminate = isSomeDisplayedSelected
          }}
          onChange={(e) => toggleSelectAllDisplayed(e.target.checked)}
          aria-label="Select all rows"
        />
      ),
      render: (text: string, record: any) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(record._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers(prev => [...prev, record._id])
            } else {
              setSelectedUsers(prev => prev.filter(id => id !== record._id))
            }
          }}
          aria-label={`Select ${(record.firstName || '').toString()} ${(record.lastName || '').toString()}`.trim()}
        />
      )
    },
    {
      title: 'Name',
      render: (text: string, record: any) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A'
    },
    { title: 'Mobile Number', dataIndex: 'mobileNumber' },
    { title: 'Email ID', dataIndex: 'email' },
    {
      title: 'Company',
      render: (text: string, record: any) => record.organizationDetails?.organization?.organizationName || 'N/A'
    },
    {
      title: 'Role',
      render: (text: string, record: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            record.organizationDetails?.role?.name === 'Admin'
              ? 'bg-blue-100 text-blue-700'
              : record.organizationDetails?.role?.name === 'Manager'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {record.organizationDetails?.role?.name || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Department',
      render: (text: string, record: any) => record.organizationDetails?.department?.name || 'N/A'
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Status',
      dataIndex: 'active',
      render: (active: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs ${
          active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      render: (text: string, record: any) => (
        <Eye
          size={16}
          className="cursor-pointer text-secondary hover:text-secondary/80"
          onClick={() => router.push(`/user-management/users/${record._id}`)}
        />
      ),
    },
  ]

  const departmentFilterItems = [
    { key: 'all', label: 'All Departments' },
    ...departments.map(dept => ({
      key: dept._id,
      label: dept.name
    }))
  ]

  const statusFilterItems = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ]

  if (error) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center text-red-600">
          Error loading users: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border">
      <div className="flex items-center justify-between p-4">
        <div className="relative w-[25%]">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            <Search size={16} />
          </div>
          <Input
            placeholder="Search users"
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isDebouncing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <SearchableDropdown
            label={
              selectedDepartment === 'all'
                ? 'All Departments'
                : departments.find(d => d._id === selectedDepartment)?.name || 'All Departments'
            }
            items={departmentFilterItems}
            disabled={departmentsLoading}
            className="rounded-xl"
            onClick={({ key }) => {
              setSelectedDepartment(key)
              setCurrentPage(1) // Reset to first page when filtering
            }}
          />
          <SearchableDropdown
            label={
              selectedStatus === 'all'
                ? 'All Status'
                : selectedStatus === 'active'
                  ? 'Active'
                  : 'Inactive'
            }
            items={statusFilterItems}
            className="rounded-xl"
            onClick={({ key }) => {
              setSelectedStatus(key)
              setCurrentPage(1) // Reset to first page when filtering
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        pagination={false}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 'max-content' }}
      />

      {pagination && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={pagination.total_records}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          maxPageButtons={3}
          resetPageOnPageSizeChange
          clampPageToRange
        />
      )}

      <ConfirmationModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemoveUsers}
        title="Remove Users from Role"
        body={`Are you sure you want to remove ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} from this role?`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  )
})

AssignedUsersTab.displayName = 'AssignedUsersTab'

export default AssignedUsersTab
