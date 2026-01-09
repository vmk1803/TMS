import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'

interface AssignedUsersTabProps {
  roleId: string
}

export default function AssignedUsersTab({ roleId }: AssignedUsersTabProps) {
  const router = useRouter()
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
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

  // Fetch users with role filtering
  const {
    users,
    loading,
    error,
    pagination
  } = useUsers({
    roleId,
    page: currentPage,
    pageSize,
    searchString: debouncedSearchQuery,
    departmentId: selectedDepartment === 'all' ? undefined : selectedDepartment,
    status: selectedStatus === 'all' ? undefined : selectedStatus
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
                : selectedStatus === 'active' ? 'Active' : 'Inactive'
              } <ChevronDown size={14} />
            </Button>
          </Dropdown>
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

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              Items per page:
              <select
                className="border rounded px-2 py-1 bg-[#efeff5]"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
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
