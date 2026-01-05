import { Table, Input, Dropdown, Button } from 'antd'
import { Search, ChevronDown, Eye } from 'lucide-react'

const groups = [
  {
    id: 1,
    name: 'Support Agents',
    manager: 'Sarah Johnson',
    members: '21+',
    department: 'Support',
    type: 'Task',
    modified: '2024-09-01',
  },
]

export default function AssignedGroupsTab() {
  const columns = [
    { title: '', render: () => <input type="checkbox" /> },
    { title: 'Group Name', dataIndex: 'name' },
    { title: 'Manager', dataIndex: 'manager' },
    { title: 'Members', dataIndex: 'members' },
    { title: 'Departments', dataIndex: 'department' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Last modified', dataIndex: 'modified' },
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
          <Dropdown menu={{ items: [{ key: 'all', label: 'All Company' }] }}>
            <Button className='rounded-xl'>All Company <ChevronDown size={14} /></Button>
          </Dropdown>
          <Dropdown menu={{ items: [{ key: 'all', label: 'All Departments' }] }}>
            <Button className='rounded-xl'>All Departments <ChevronDown size={14} /></Button>
          </Dropdown>
          <Dropdown menu={{ items: [{ key: 'all', label: 'All Groups' }] }}>
            <Button className='rounded-xl'>All Groups <ChevronDown size={14} /></Button>
          </Dropdown>
        </div>
      </div>

      <Table columns={columns} dataSource={groups} pagination={false} rowKey="id" />
    </div>
  )
}
