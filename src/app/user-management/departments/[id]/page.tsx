'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import DepartmentDetailsTab from './DepartmentDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import { useDepartment } from '@/hooks/useDepartments'
import { useUsers } from '@/hooks/useUsers'

const getTabs = (userCount: number) => [
  { key: 'details', label: 'Department Details' },
  { key: 'users', label: `Assigned Users (${userCount})` },
]

export default function DepartmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.id as string

  const { department, loading: departmentLoading, error: departmentError } = useDepartment(departmentId)
  const { users, loading: usersLoading } = useUsers({ departmentId })

  const handleEdit = () => {
    router.push(`/user-management/departments/create?departmentId=${departmentId}`)
  }

  // Create activity logs from department dates
  const logs = []
  if (department?.createdAt) {
    logs.push({
      title: 'Department created',
      date: new Date(department.createdAt).toLocaleDateString()
    })
  }
  if (department?.updatedAt && department.updatedAt !== department.createdAt) {
    logs.push({
      title: 'Department updated',
      date: new Date(department.updatedAt).toLocaleDateString()
    })
  }

  // Transform department data to match DepartmentDetailsCard expectations
  const departmentData = department ? {
    ...department,
    description: '', // TODO: Add to API if needed
    company: department.organization?.name || '',
    head: department.headOfDepartment
      ? `${department.headOfDepartment.fname} ${department.headOfDepartment.lname}`
      : '',
    usersCount: '0', // TODO: Add users count API
    manager: department.headOfDepartment ? {
      avatar: 'https://via.placeholder.com/150',
      name: `${department.headOfDepartment.fname} ${department.headOfDepartment.lname}`,
      role: 'Head of Department',
      company: department.organization?.name || '',
      email: department.headOfDepartment.email,
      phone: '', // TODO: Add phone to API if needed
    } : null,
    logs: logs,
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
    <TabContainer
      tabs={getTabs(users.length)}
      backRoute="/user-management/departments"
      editRoute={`/user-management/departments/create?departmentId=${departmentId}`}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} />
          case 'users':
            return <AssignedUsersTab users={users} loading={usersLoading} error={null} />
          default:
            return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} />
        }
      }}
    </TabContainer>
  )
}
