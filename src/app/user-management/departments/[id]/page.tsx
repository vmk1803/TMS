'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer, { HeaderAction } from '@/components/common/TabContainer'
import DepartmentDetailsTab from './DepartmentDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import { useDepartment } from '@/hooks/useDepartments'
import { useUsers } from '@/hooks/useUsers'
import { useState } from 'react'

const getTabs = (userCount: number) => [
  { key: 'details', label: 'Department Details' },
  { key: 'users', label: `Assigned Users (${userCount})`, disabled: !userCount },
]

export default function DepartmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.id as string

  const { department, loading: departmentLoading, error: departmentError, updateDepartment } = useDepartment(departmentId)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const { users, loading: usersLoading, bulkUpdateUsers } = useUsers({ 
    departmentId: selectedDepartment === 'all' ? departmentId : selectedDepartment,
    roleId: selectedRole === 'all' ? undefined : selectedRole,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [ConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/user-management/departments/create?departmentId=${departmentId}`)
  }

  const handleRemoveUsers = async () => {
    if (selectedRows.length === 0) return

    const success = await bulkUpdateUsers(selectedRows, { 'organizationDetails.department': null })
    if (success) {
      setSelectedRows([])
    }
  }

  const getHeaderActions = (activeTab: string): HeaderAction[] => {
    if (activeTab === 'details') {
      return [{
        label: 'Edit',
        onClick: handleEdit,
        type: 'primary'
      }]
    } else if (activeTab === 'users') {
      const actions: HeaderAction[] = [{
        label: 'Remove',
        onClick: () => setConfirmationModalOpen(true),
        danger: true,
        disabled: selectedRows.length === 0
      }, {
        label: 'Add Users',
        onClick: () => router.push(`/user-management/users`),
        type: 'primary'
      }]
      return actions
    }
    return []
  }

  // Create activity logs from department dates (matching organizations format)
  const creator = department?.createdBy;
  const creatorName = creator && typeof creator === 'object' ? `${creator.firstName} ${creator.lastName}` : 'System';
  const createdDate = department?.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'Date not available';

  // Transform department data to match DepartmentDetailsCard expectations
  const departmentData = department ? {
    ...department,
    description: department.description || '',
    company: department.organization?.organizationName || '',
    head: department.headOfDepartment
      ? `${department.headOfDepartment.firstName} ${department.headOfDepartment.lastName}`
      : '',
    usersCount: '0', // TODO: Add users count API
    manager: department.headOfDepartment ? {
      _id: department.headOfDepartment._id,
      avatar: 'https://via.placeholder.com/150',
      name: `${department.headOfDepartment.firstName} ${department.headOfDepartment.lastName}`,
      role: 'Head of Department',
      company: department.organization?.organizationName || '',
      email: department.headOfDepartment.email,
      phone: department.headOfDepartment.mobileNumber || '',
      lastLogin: department.headOfDepartment.lastLogin,
    } : null,
    logs: [
      {
        title: `Created by ${creatorName}`,
        date: '',
        subtitle: `Created on ${createdDate}`
      },
    ],
  } : null

  if (departmentLoading) {
    return <div className="text-center py-8">Loading department...</div>
  }

  if (departmentError) {
    return <div className="text-center py-8 text-red-500">Error: {departmentError}</div>
  }

  if (!departmentData) {
    return <div className="text-center py-8">Department not found</div>
  }

  return (
    <>
      <TabContainer
        tabs={getTabs(users.length)}
        backRoute="/user-management/departments"
        getHeaderActions={getHeaderActions}
      >
        {(activeTab) => {
          switch (activeTab) {
            case 'details':
              return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} updateDepartment={updateDepartment} />
            case 'users':
            return <AssignedUsersTab
              users={users}
              loading={usersLoading}
              error={null}
              onSelectionChange={setSelectedRows}
              currentDepartmentId={departmentId}
              selectedDepartment={selectedDepartment}
              selectedRole={selectedRole}
              selectedStatus={selectedStatus}
              onDepartmentChange={setSelectedDepartment}
              onRoleChange={setSelectedRole}
              onStatusChange={setSelectedStatus}
            />
            default:
              return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} updateDepartment={updateDepartment} />
          }
        }}
      </TabContainer>

      <ConfirmationModal
        isOpen={ConfirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleRemoveUsers}
        title="Remove Users from Department"
        body={`Are you sure you want to remove ${selectedRows.length} user${selectedRows.length > 1 ? 's' : ''} from this department?`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  )
}
