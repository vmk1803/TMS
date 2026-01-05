import { Table } from 'antd'
import { useUser } from '@/hooks/useUser'

interface AssignedManagerTabProps {
  managerId: string
}

export default function AssignedManagerTab({ managerId }: AssignedManagerTabProps) {
  const { user: manager, loading, error } = useUser(managerId)

  const columns = [
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
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading manager details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center text-red-600">
          Error loading manager: {error}
        </div>
      </div>
    )
  }

  if (!manager) {
    return (
      <div className="bg-white rounded-2xl border p-6">
        <div className="text-center text-gray-600">
          Manager not found
        </div>
      </div>
    )
  }

  const managerData = [manager]

  return (
    <div className="bg-white rounded-2xl border">
      <Table
        columns={columns}
        dataSource={managerData}
        pagination={false}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}
