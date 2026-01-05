'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useUsers } from '@/hooks/useUsers'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useDepartments } from '@/hooks/useDepartments'
import { useRoles } from '@/hooks/useRoles'
import { User } from '@/services/userService'

// Lazy load the DeleteConfirmationModal component
const DeleteConfirmationModal = dynamic(() => import('@/components/common/DeleteConfirmationModal'), {
  loading: () => null
})

// Lazy load the ListPage component
const ListPage = dynamic(() => import('@/components/common/ListPage'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
})

// Helper function to get user display name
const getUserDisplayName = (user: User): string => {
  const firstName = user.firstName || user.fname
  const lastName = user.lastName || user.lname
  return `${firstName || ''} ${lastName || ''}`.trim() || user.email.split('@')[0]
}

// Helper function to generate initials avatar
const getInitialsAvatar = (user: User): string => {
  const firstName = user.firstName || user.fname
  const lastName = user.lastName || user.lname
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  return initials || user.email[0].toUpperCase()
}

export default function UsersPage() {
  const router = useRouter()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Use the debounced search hook
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Fetch all departments and roles for filter dropdowns
  const {
    departments,
    loading: departmentsLoading
  } = useDepartments({
    autoFetch: true,
    fetchAll: true
  })

  const {
    roles,
    loading: rolesLoading
  } = useRoles({
    autoFetch: true,
    fetchAll: true
  })

  // Use the users hook with filter parameters
  const {
    users: rawUsers,
    loading: usersLoading,
    pagination,
    deleteUser
  } = useUsers({
    autoFetch: true,
    searchString: debouncedSearchQuery,
    departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    roleId: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus,
    page: currentPage,
    pageSize: itemsPerPage
  })

  const loading = usersLoading || departmentsLoading || rolesLoading

  // Transform users to match UI expectations
  const users = rawUsers.map(user => ({
    id: user._id,
    _id: user._id,
    name: getUserDisplayName(user),
    avatar: getInitialsAvatar(user),
    mobile: user.mobileNumber || '-',
    email: user.email,
    company: user.organizationDetails?.organization?.organizationName || 'N/A',
    role: user.organizationDetails?.role?.name || user.role || 'N/A',
    department: user.organizationDetails?.department?.name || 'N/A',
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    status: user.active ? 'Active' : 'Inactive',
  }))

  /* ----------------------------- TABLE COLUMNS ----------------------------- */
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Email ID',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            role === 'super admin' || role === 'admin' || role === 'Admin'
              ? 'bg-blue-100 text-blue-700'
              : role === 'Manager' || role === 'manager'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {role}
        </span>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {status}
        </span>
      ),
    },
  ]

  /* -------------------------------- FILTER ITEMS -------------------------------- */
  const departmentItems = [
    { key: 'all', label: 'All Departments' },
    ...departments.map(dept => ({
      key: dept._id,
      label: dept.name
    }))
  ]

  const roleItems = [
    { key: 'all', label: 'All Roles' },
    ...roles.map(role => ({
      key: role._id,
      label: role.name
    }))
  ]

  const statusItems = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ]

  /* -------------------------------- Helper Functions -------------------------------- */
  const getDepartmentLabel = () => {
    if (selectedDepartment === 'all') return 'All Departments'
    const dept = departments.find(d => d._id === selectedDepartment)
    return dept?.name || 'All Departments'
  }

  const getRoleLabel = () => {
    if (selectedRole === 'all') return 'All Roles'
    const role = roles.find(r => r._id === selectedRole)
    return role?.name || 'All Roles'
  }

  const getStatusLabel = () => {
    const status = statusItems.find(s => s.key === selectedStatus)
    return status?.label || 'All Status'
  }

  /* -------------------------------- Filters -------------------------------- */
  const filters = {
    searchPlaceholder: 'Search by name or email',
    dropdowns: [
      {
        label: getDepartmentLabel(),
        items: departmentItems,
        onClick: ({ key }: { key: string }) => {
          setSelectedDepartment(key)
          setCurrentPage(1)
        }
      },
      {
        label: getRoleLabel(),
        items: roleItems,
        onClick: ({ key }: { key: string }) => {
          setSelectedRole(key)
          setCurrentPage(1)
        }
      },
      {
        label: getStatusLabel(),
        items: statusItems,
        onClick: ({ key }: { key: string }) => {
          setSelectedStatus(key)
          setCurrentPage(1)
        }
      },
    ],
  }

  /* -------------------------------- Handlers -------------------------------- */
  const handleCreate = () => {
    router.push('/user-management/users/create')
  }

  const handleView = (record: any) => {
    router.push(`/user-management/users/${record.id || record._id}`)
  }

  const handleEdit = (record: any) => {
    router.push(`/user-management/users/create?userId=${record.id || record._id}`)
  }

  const handleDelete = (record: any) => {
    setUserToDelete(record)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    const success = await deleteUser(userToDelete.id)
    if (success) {
      setDeleteModalVisible(false)
      setUserToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalVisible(false)
    setUserToDelete(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1)
  }

  return (
    <>
      <ListPage
        title="Users"
        description="Manage user accounts and permissions across tenants"
        data={users}
        columns={columns}
        filters={filters}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isDebouncing}
        pagination={pagination}
        pageSize={itemsPerPage}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete User"
      />
    </>
  )
}
