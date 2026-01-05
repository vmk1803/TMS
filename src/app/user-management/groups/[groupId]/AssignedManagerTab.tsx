import { Table } from 'antd'

export default function AssignedManagerTab() {
  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Mobile Number', dataIndex: 'mobile' },
    { title: 'Email ID', dataIndex: 'email' },
    { title: 'Company', dataIndex: 'company' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Last Login', dataIndex: 'lastLogin' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
          {s}
        </span>
      ),
    },
  ]

  const data = [
    {
      id: 1,
      name: 'Emily Davis',
      mobile: '+9123654 987654',
      email: 'emily.davis@email.com',
      company: 'Creative Minds Inc.',
      role: 'Manager',
      department: 'Marketing',
      lastLogin: '2026-01-05',
      status: 'Active',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="id"
      />
    </div>
  )
}
