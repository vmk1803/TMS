import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'
import { User } from '@/services/userService'

interface AssignedUsersTabProps {
  organizationId: string
  users: User[]
  loading: boolean
  error: string | null
}

export default function AssignedUsersTab({ organizationId, users, loading: usersLoading, error: usersError }: AssignedUsersTabProps) {
  const router = useRouter()
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Departments for filter dropdown
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
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

    // Status filter
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && user.active) ||
      (selectedStatus === 'inactive' && !user.active)

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const columns = [
    { title: '', render: () => <input type="checkbox" /> },
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
    <div className="bg-white rounded-2xl border">
      <div className="flex items-center justify-between p-4">
        <div className="relative w-[30%]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input
            placeholder="Search users"
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isDebouncing && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Dropdown
            menu={{
              items: departmentFilterItems,
              onClick: ({ key }) => setSelectedDepartment(key)
            }}
            disabled={departmentsLoading}
          >
            <Button className='rounded-xl'>
              {selectedDepartment === 'all'
                ? 'All Departments'
                : departments.find(d => d._id === selectedDepartment)?.name || 'All Departments'
              } <ChevronDown size={14} />
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items: statusFilterItems,
              onClick: ({ key }) => setSelectedStatus(key)
            }}
          >
            <Button className='rounded-xl'>
              {selectedStatus === 'all'
                ? 'All Status'
                : selectedStatus === 'active' ? 'Active' : 'Inactive'
              } <ChevronDown size={14} />
            </Button>
          </Dropdown>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        pagination={false}
        rowKey="_id"
        loading={usersLoading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}
