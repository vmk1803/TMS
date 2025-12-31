'use client'

import { useParams, useRouter } from 'next/navigation'
import TabContainer from '@/components/common/TabContainer'
import DepartmentDetailsTab from './DepartmentDetailsTab'
import AssignedUsersTab from '../../roles/[roleId]/AssignedUsersTab'
import { useDepartment } from '@/hooks/useDepartments'

const getTabs = (department: any) => [
  { key: 'details', label: 'Department Details' },
  { key: 'users', label: `Assigned Users (${department?.usersCount || 0})` },
]

export default function DepartmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.id as string

  const { department, loading, error } = useDepartment(departmentId)

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

  if (loading) {
    return <div className="text-center py-8">Loading department...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  if (!departmentData) {
    return <div className="text-center py-8">Department not found</div>
  }

  return (
    <TabContainer
      tabs={getTabs(departmentData)}
      backRoute="/user-management/departments"
      editRoute={`/user-management/departments/create?departmentId=${departmentId}`}
    >
      {(activeTab) => {
        switch (activeTab) {
          case 'details':
            return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} />
          case 'users':
            return <AssignedUsersTab />
          default:
            return <DepartmentDetailsTab department={departmentData} onEdit={handleEdit} />
        }
      }}
    </TabContainer>
  )
}
