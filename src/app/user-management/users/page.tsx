'use client'

import { Search, Eye, Pencil, MoreVertical, Plus, Download, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Table, Dropdown, Input, Button } from 'antd'



const users = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/40?img=1',
    mobile: '+9123654 562211',
    email: 'sarah.johnson@email.com',
    company: 'Gold Wealth Partners',
    role: 'Admin',
    department: 'Operations',
    lastLogin: '2025-11-25',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/40?img=2',
    mobile: '+9123654 987654',
    email: 'emily.davis@email.com',
    company: 'Creative Minds Inc.',
    role: 'User',
    department: 'Marketing',
    lastLogin: '2026-01-05',
    status: 'Inactive',
  },
  {
    id: 3,
    name: 'Michael Smith',
    avatar: 'https://i.pravatar.cc/40?img=3',
    mobile: '+9123654 874512',
    email: 'michael.smith@email.com',
    company: 'Bright Futures LLC',
    role: 'Manager',
    department: 'Sales',
    lastLogin: '2025-10-12',
    status: 'Active',
  },
  {
    id: 4,
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/40?img=4',
    mobile: '+9123654 356789',
    email: 'david.brown@email.com',
    company: 'Tech Innovators Co.',
    role: 'Admin',
    department: 'Engineering',
    lastLogin: '2024-08-30',
    status: 'Active',
  },
]

export default function UsersPage() {
    const router = useRouter()

    const columns = [
      {
        title: '',
        key: 'checkbox',
        render: () => <input type="checkbox" />,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div className="flex items-center gap-3">
            <img src={record.avatar} className="w-8 h-8 rounded-full" />
            <span className="font-medium">{text}</span>
          </div>
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
        render: (status) => (
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
      {
        title: 'Actions',
        key: 'actions',
        render: () => (
          <div className="flex justify-center gap-3 text-green-700">
            <Eye size={16} onClick={() => router.push('/user-management/users/view')} className="cursor-pointer" />
            <Pencil size={16} className="cursor-pointer" />
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
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">
            Manage user accounts and permissions across tenants
          </p>
        </div>

        <div className="flex gap-3">
          {/* <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-2xl text-secondary border-secondary ">
             Deactivate
          </button> */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-2xl text-secondary border-secondary ">
            <Download size={16} /> Export CSV
          </button>
          <button  onClick={() => router.push('/user-management/users/create')} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-secondary rounded-2xl">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

    

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden min-h-[calc(100vh-190px)] h-[calc(100vh-180px)]">
          {/* Filters */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="relative" style={{ width: '35%' }}>
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input
            placeholder="Search"
            className="pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div className="flex gap-3">
          <Dropdown
            menu={{
              items: [
                { key: 'all', label: 'All Departments' },
                { key: 'operations', label: 'Operations' },
                { key: 'marketing', label: 'Marketing' },
                { key: 'sales', label: 'Sales' },
                { key: 'engineering', label: 'Engineering' },
              ]
            }}
          >
            <Button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-xl text-gray-600 bg-white">
              All Departments <ChevronDown size={14} />
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: [
                { key: 'all', label: 'All Roles' },
                { key: 'admin', label: 'Admin' },
                { key: 'manager', label: 'Manager' },
                { key: 'user', label: 'User' },
              ]
            }}
          >
            <Button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-xl text-gray-600 bg-white">
              All Roles <ChevronDown size={14} />
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: [
                { key: 'all', label: 'All Status' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
              ]
            }}
          >
            <Button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-xl text-gray-600 bg-white">
              All Status <ChevronDown size={14} />
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: [
                { key: 'select', label: 'Select Date' },
                // Add date options if needed
              ]
            }}
          >
            <Button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-xl text-gray-600 bg-white">
              Select Date <ChevronDown size={14} />
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className='min-h-[calc(100vh-250px)]'>
        <Table
          columns={columns}
          dataSource={users}
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
    </div>
  )
}
