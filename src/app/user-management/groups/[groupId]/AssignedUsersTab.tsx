import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'
import { useState } from 'react'
import { useGroupMembers } from '@/hooks/useGroups'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'

interface AssignedUsersTabProps {
  groupId: string
  memberIds: string[]
}

export default function AssignedUsersTab({ groupId, memberIds }: AssignedUsersTabProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Departments for filter dropdown
  const { departments, loading: departmentsLoading } = useDepartments({ fetchAll: true })

  // Fetch group members using the new efficient API
  const {
    members,
    loading: membersLoading,
    error: membersError,
    pagination
  } = useGroupMembers(groupId, {
    page: currentPage,
    pageSize: itemsPerPage,
    searchString: debouncedSearchQuery,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  })

  const columns = [
    { title: '', render: () => <input type="checkbox" /> },
    { title: 'Name', dataIndex: 'name',
      render: (text: string, record: any) => `${record.firstName} ${record.lastName}`
    },
    { title: 'Mobile Number', dataIndex: 'mobileNumber' },
    { title: 'Email ID', dataIndex: 'email' },
    { title: 'Organization', dataIndex: 'organization',
      render: (org: any) => org?.organizationName || 'N/A'
    },
    { title: 'Role', dataIndex: 'role',
      render: (role: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            role?.name === 'Admin'
              ? 'bg-blue-100 text-blue-700'
              : role?.name === 'Manager'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {role?.name || 'N/A'}
        </span>
      ),
    },
    { title: 'Department', dataIndex: 'department',
      render: (dept: any) => dept?.name || 'N/A'
    },
    { title: 'Last Login', dataIndex: 'lastLogin',
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

  const departmentFilterItems = [
    { key: 'all', label: 'All Departments' },
    ...departments.map(dept => ({
      key: dept._id,
      label: dept.name
    }))
  ]

  const statusFilterItems = [
    { key: 'all', label: 'All Status' },
    { key: 'true', label: 'Active' },
    { key: 'false', label: 'Inactive' }
  ]

  if (membersError) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center text-red-600">
          Error loading members: {membersError}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative w-[30%]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input
            placeholder="Search members"
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
              onClick: ({ key }) => {
                setSelectedDepartment(key)
                setCurrentPage(1) // Reset to first page when filtering
              }
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
              onClick: ({ key }) => {
                setSelectedStatus(key)
                setCurrentPage(1) // Reset to first page when filtering
              }
            }}
          >
            <Button className='rounded-xl'>
              {selectedStatus === 'all'
                ? 'All Status'
                : selectedStatus === 'true' ? 'Active' : 'Inactive'
              } <ChevronDown size={14} />
            </Button>
          </Dropdown>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        pagination={false}
        rowKey="_id"
        loading={membersLoading}
        scroll={{ x: 'max-content' }}
      />

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              Items per page:
              <select
                className="border rounded px-2 py-1 bg-[#efeff5]"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              {pagination.current_page * pagination.page_size - pagination.page_size + 1}–{Math.min(pagination.current_page * pagination.page_size, pagination.total_records)} of {pagination.total_records}
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.current_page === 1}
              onClick={() => setCurrentPage(pagination.current_page - 1)}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              const pageNum = pagination.current_page <= 3
                ? i + 1
                : pagination.current_page - 2 + i
              if (pageNum > pagination.total_pages) return null

              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 ${
                    pagination.current_page === pageNum ? 'bg-secondary text-white' : ''
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.current_page === pagination.total_pages}
              onClick={() => setCurrentPage(pagination.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
