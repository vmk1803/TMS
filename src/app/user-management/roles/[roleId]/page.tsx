'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from 'antd'
import { ChevronLeft } from 'lucide-react'
import RoleDetailsTab from './RoleDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'
import AssignedGroupsTab from './AssignedGroupsTab'

const TABS = [
  { key: 'details', label: 'Role Details' },
  { key: 'users', label: 'Assigned Users (4)' },
  { key: 'groups', label: 'Assigned Groups (4)' },
]

// Dummy roles data (same as in roles page)
const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access to all system features and settings',
    permissions: ['Create', 'Read', 'Update', 'Delete', 'Manage Users'],
    userCount: 5,
    status: 'Active',
    createdDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manage teams and projects with limited admin access',
    permissions: ['Create', 'Read', 'Update', 'Manage Teams'],
    userCount: 12,
    status: 'Active',
    createdDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'User',
    description: 'Standard user with basic access to assigned tasks',
    permissions: ['Read', 'Update'],
    userCount: 45,
    status: 'Active',
    createdDate: '2023-03-10',
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'Read-only access to projects and tasks',
    permissions: ['Read'],
    userCount: 8,
    status: 'Inactive',
    createdDate: '2023-04-05',
  },
]

export default function RoleDetailsPage() {
  const [activeTab, setActiveTab] = useState('details')
  const params = useParams()
  const router = useRouter()
  const roleId = parseInt(params.roleId as string)
  const role = roles.find(r => r.id === roleId)

  const handleBack = () => {
    router.push('/user-management/roles')
  }

  const handleEdit = () => {
    router.push(`/user-management/roles/create?roleId=${roleId}`)
  }

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
          <ChevronLeft size={14} />
          <span className="text-sm text-gray-500">Back</span>
        </div>
        <Button type="primary" className="rounded-xl bg-secondary" onClick={handleEdit}>
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium ${
              activeTab === tab.key
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'details' && <RoleDetailsTab role={role} />}
      {activeTab === 'users' && <AssignedUsersTab />}
      {activeTab === 'groups' && <AssignedGroupsTab />}
    </div>
  )
}
