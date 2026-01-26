import { Table, Input, Button } from 'antd'
import { Search, Eye } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'
import { useRoles } from '@/hooks/useRoles'
import SearchableDropdown from '@/components/common/SearchableDropdown'
import Pagination from '@/components/common/Pagination'
import { User } from '@/services/userService'

interface AssignedUsersTabProps {
  organizationId: string
  users: User[]
  loading: boolean
  error: string | null
  onSelectionChange?: (selected: string[]) => void
}

export default function AssignedUsersTab({ organizationId, users, loading: usersLoading, error: usersError, onSelectionChange }: AssignedUsersTabProps) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Departments for filter dropdown
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

  // Roles for filter dropdown
  const { roles, loading: rolesLoading } = useRoles({ fetchAll: true })

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = debouncedSearchQuery.toLowerCase()
      const matchesSearch = !debouncedSearchQuery ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.mobileNumber?.toLowerCase().includes(searchLower)

      // Department filter
      const matchesDepartment = selectedDepartment === 'all' ||
        user.organizationDetails?.department?._id === selectedDepartment

      // Role filter
      const matchesRole = selectedRole === 'all' ||
        user.organizationDetails?.role?._id === selectedRole

      // Status filter
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && user.active) ||
        (selectedStatus === 'inactive' && !user.active)

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus
    })
  }, [users, debouncedSearchQuery, selectedDepartment, selectedRole, selectedStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedUsers)
  }, [selectedUsers, onSelectionChange])

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [currentPage, filteredUsers, pageSize])

  const displayedUserIds = useMemo(() => pagedUsers.map(u => u._id), [pagedUsers])
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
          aria-label={`Select ${record.firstName || ''} ${record.lastName || ''}`.trim()}
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

  const roleFilterItems = [
    { key: 'all', label: 'All Roles' },
    ...roles.map(role => ({
      key: role._id,
      label: role.name
    }))
  ]

  const statusFilterItems = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ]

  if (usersError) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center text-red-600">
          Error loading users: {usersError}
        </div>
      </div>
    )
  }

  return (
    <div className="assigned-users-tab bg-white rounded-2xl border">
      <style jsx>{`
        .assigned-users-tab .ant-checkbox-indeterminate .ant-checkbox-inner {
          background-color: white !important;
        }
        .assigned-users-tab .ant-checkbox-indeterminate .ant-checkbox-inner::after {
          background-color: #d9d9d9 !important;
        }
      `}</style>
      <div className="flex items-center justify-between p-4">
        <div className="relative w-[30%]">
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
            onClick={({ key }) => setSelectedDepartment(key)}
          />
          <SearchableDropdown
            label={
              selectedRole === 'all'
                ? 'All Roles'
                : roles.find(r => r._id === selectedRole)?.name || 'All Roles'
            }
            items={roleFilterItems}
            onClick={({ key }) => setSelectedRole(key)}
          />
          <SearchableDropdown
            label={
              selectedStatus === 'all'
                ? 'All Status'
                : selectedStatus === 'active' ? 'Active' : 'Inactive'
            }
            items={statusFilterItems}
            onClick={({ key }) => setSelectedStatus(key)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={pagedUsers}
        pagination={false}
        rowKey="_id"
        loading={usersLoading}
        scroll={{ x: 'max-content' }}
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={filteredUsers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        maxPageButtons={3}
        resetPageOnPageSizeChange
        clampPageToRange
      />
    </div>
  )
}
