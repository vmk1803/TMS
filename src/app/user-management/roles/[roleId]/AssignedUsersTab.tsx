import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'

const users = [
  {
    id: 1,
    name: 'Sarah Johnson',
    mobile: '+9123654 562211',
    email: 'sarah.johnson@email.com',
    company: 'Gold Wealth partners',
    role: 'Admin',
    department: 'Operations',
    lastLogin: '2025-11-25',
    status: 'Active',
  },
]

export default function AssignedUsersTab() {
  const columns = [
    { title: '', render: () => <input type="checkbox" /> },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Mobile Number', dataIndex: 'mobile' },
    { title: 'Email ID', dataIndex: 'email' },
    { title: 'Company', dataIndex: 'company' },
    { title: 'Role', dataIndex: 'role',
      render: (role) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              role === 'Admin'
                ? 'bg-blue-100 text-blue-700'
                : role === 'Manager'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {role}
          </span>
        ),

     },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Last Login', dataIndex: 'lastLogin' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <span className={`px-3 py-1 rounded-full text-xs ${
          s === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {s}
        </span>
      ),
    },
    {
      title: 'Actions',
      render: () => <Eye size={16} className="cursor-pointer text-secondary" />,
    },
  ]

  return (
    <div className="bg-white rounded-2xl border">
      <div className="flex items-center justify-between p-4">
        <div className="relative w-[30%]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input placeholder="Search" className="pl-9 rounded-xl" />
        </div>

        <div className="flex gap-3">
          <Dropdown menu={{ items: [{ key: 'all', label: 'All Departments' }] }}>
            <Button className='rounded-xl'>All Departments <ChevronDown size={14} /></Button>
          </Dropdown>
          <Dropdown menu={{ items: [{ key: 'all', label: 'All Status' }] }}>
            <Button className='rounded-xl'>All Status <ChevronDown size={14} /></Button>
          </Dropdown>
        </div>
      </div>

      <Table columns={columns} dataSource={users} pagination={false} rowKey="id" />
    </div>
  )
}
