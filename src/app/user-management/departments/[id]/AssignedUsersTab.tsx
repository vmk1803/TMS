import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { User } from '@/services/userService'

interface AssignedUsersTabProps {
  users: User[]
  loading: boolean
  error: string | null
}

export default function AssignedUsersTab({ users: baseUsers, loading, error }: AssignedUsersTabProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Filter users based on search and status filters
  const filteredUsers = useMemo(() => {
    return baseUsers.filter(user => {
      // Search filter
      const searchLower = debouncedSearchQuery.toLowerCase()
      const matchesSearch = !debouncedSearchQuery ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.fname?.toLowerCase().includes(searchLower) ||
        user.lname?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.mobileNumber?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && user.active) ||
        (selectedStatus === 'inactive' && !user.active)

      return matchesSearch && matchesStatus
    })
  }, [baseUsers, debouncedSearchQuery, selectedStatus])

  const columns = [
    { title: '', render: () => <input type="checkbox" /> },
    {
      title: 'Name',
      render: (text: string, record: any) => `${record.firstName || record.fname || ''} ${record.lastName || record.lname || ''}`.trim() || 'N/A'
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
          {record.organizationDetails?.role?.name || record.role || 'N/A'}
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
      render: () => <Eye size={16} className="cursor-pointer text-secondary" />,
    },
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
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}
