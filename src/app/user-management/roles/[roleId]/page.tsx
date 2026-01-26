'use client'

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, message } from 'antd'
import TabContainer, { HeaderAction } from '@/components/common/TabContainer'
import { useRole } from '@/hooks/useRoles'
import { useUsers } from '@/hooks/useUsers'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import RoleDetailsTab from './RoleDetailsTab'
import AssignedUsersTab, { AssignedUsersTabRef } from './AssignedUsersTab'

export default function RoleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.roleId as string

  const assignedUsersTabRef = useRef<AssignedUsersTabRef>(null)
  const [selectedUsersCount, setSelectedUsersCount] = useState(0)

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isDebouncing
  } = useDebouncedSearch({ debounceDelay: 1000 })

  // Use the useRole hook to fetch role data
  const { role, loading, error } = useRole(roleId)

  // Prefetch assigned users (and pagination count) on page load
  const {
    users,
    loading: usersLoading,
    error: usersError,
    pagination,
    bulkUpdateUsers
  } = useUsers({
    roleId,
    page: currentPage,
    pageSize,
    searchString: debouncedSearchQuery,
    departmentId: selectedDepartment === 'all' ? undefined : selectedDepartment,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  })

  // Show error message if failed to load role
  if (error) {
    message.error('Failed to load role details')
  }

  const TABS = [
    { key: 'details', label: 'Role Details' },
    { key: 'users', label: `Assigned Users (${pagination?.total_records || 0})` },
  ]

  const handleEdit = () => {
    router.push(`/user-management/roles/create?roleId=${roleId}`)
  }

  const getHeaderActions = (activeTab: string): HeaderAction[] => {
    switch (activeTab) {
      case 'details':
        return [
          {
            label: 'Edit',
            onClick: handleEdit,
            type: 'primary',
          },
        ]
      case 'users':
        return [
          {
            label: 'Remove',
            onClick: () => assignedUsersTabRef.current?.handleRemove(),
            type: 'default',
            danger: true,
            disabled: selectedUsersCount === 0,
          },
          {
            label: 'Add Users',
            onClick: () => router.push('/user-management/users'),
            type: 'primary',
          },
        ]
      default:
        return []
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Error state
  if (error || !role) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error ? 'Error Loading Role' : 'Role Not Found'}
          </h2>
          <p className="text-gray-500 mb-4">
            {error || 'The role you are looking for does not exist.'}
          </p>
          <Button onClick={() => router.push('/user-management/roles')} className="rounded-xl">
            Back to Roles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TabContainer
      tabs={TABS}
      backRoute="/user-management/roles"
      getHeaderActions={getHeaderActions}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <RoleDetailsTab role={role} />
          case 'users':
            return (
              <AssignedUsersTab
                ref={assignedUsersTabRef}
                roleId={roleId}
                onSelectionChange={setSelectedUsersCount}
                users={users}
                loading={usersLoading}
                error={usersError}
                pagination={pagination}
                currentPage={currentPage}
                pageSize={pageSize}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isDebouncing={isDebouncing}
                bulkUpdateUsers={bulkUpdateUsers}
              />
            )
          default:
            return <RoleDetailsTab role={role} />
        }
      }}
    </TabContainer>
  )
}
