'use client'

import { Search, Eye, Pencil, MoreVertical, Plus, Download, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Table, Dropdown, Input, Button, Avatar, Tooltip } from 'antd'

const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access with all permissions',
    modules: 'All modules',
    permissions: ['View', 'Create', 'Edit', '+3 More'],
    users: 10,
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Department-level management access',
    modules: 'Users, Tasks, Projects',
    permissions: ['Read', 'Update', 'Assign', 'View Reports'],
    users: 10,
  },
  {
    id: 3,
    name: 'User',
    description: 'Standard user access',
    modules: 'Profile, Tasks',
    permissions: ['Read (self)', 'Update (self)', '+2 More'],
    users: 10,
  },
  {
    id: 4,
    name: 'Service Desk Agent',
    description: 'Department-level management access',
    modules: 'Tickets, SLA, Assets',
    permissions: ['Ticket Read', 'Ticket Update', 'Asset View'],
    users: 10,
  },
  {
    id: 5,
    name: 'Asset Manager',
    description: 'Department-level management access',
    modules: 'Asset Inventory',
    permissions: ['Asset Create', 'Asset Assign', 'Asset Delete'],
    users: 10,
  },
]

export default function RolesPage() {
  const router = useRouter()

  const columns = [
    {
      title: '',
      render: () => <input type="checkbox" />,
      width: 40,
    },
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-2">
          {permissions.map((p) => (
            <span
              key={p}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Assigned Users',
      key: 'users',
      render: (record: any) => (
        <div className="flex items-center gap-2">
          <Avatar.Group maxCount={3} size="small">
            <Avatar src="https://i.pravatar.cc/32?img=1" />
            <Avatar src="https://i.pravatar.cc/32?img=2" />
            <Avatar src="https://i.pravatar.cc/32?img=3" />
          </Avatar.Group>
          <span className="text-xs text-gray-500">
            +{record.users} Users Assigned
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex justify-center gap-3 text-green-700">
          <Eye size={16} className="cursor-pointer" onClick={() => router.push(`/user-management/roles/${record.id}`)} />
          <Pencil size={16} className="cursor-pointer" onClick={() => router.push(`/user-management/roles/create?roleId=${record.id}`)} />
          <MoreVertical size={16} className="cursor-pointer" />
        </div>
      ),
    },
  ]

  return (
    <div className="bg-[#F7F9FB]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">
            Define roles and their permissions
          </p>
        </div>

        <div className="flex gap-3">
          <Button className="flex items-center gap-2 border rounded-xl">
            <Download size={16} /> Export CSV
          </Button>
          <Button
            type="primary"
            className="flex items-center gap-2 rounded-xl bg-secondary"
            onClick={() => router.push('/user-management/roles/create')}
          >
            <Plus size={16} /> Create New
          </Button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="relative w-[35%]">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <Input placeholder="Search" className="pl-9 rounded-xl" />
          </div>

          <div className="flex gap-3">
            <Dropdown
              menu={{
                items: [
                  { key: 'all', label: 'All Modules' },
                  { key: 'users', label: 'Users' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'assets', label: 'Assets' },
                ],
              }}
            >
              <Button className="flex items-center gap-2 rounded-xl">
                All Modules <ChevronDown size={14} />
              </Button>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  { key: 'all', label: 'All Roles' },
                  { key: 'admin', label: 'Admin' },
                  { key: 'manager', label: 'Manager' },
                  { key: 'user', label: 'User' },
                ],
              }}
            >
              <Button className="flex items-center gap-2 rounded-xl">
                All Roles <ChevronDown size={14} />
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={roles}
          pagination={false}
          rowKey="id"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            Items per page:
            <select className="border rounded px-2 py-1">
              <option>10</option>
            </select>
          </div>
          <div>1–10 of 1000</div>
        </div>
      </div>
    </div>
  )
}
