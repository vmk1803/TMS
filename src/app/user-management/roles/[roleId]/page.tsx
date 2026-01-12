'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, message } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useRole } from '@/hooks/useRoles'
import { useUsers } from '@/hooks/useUsers'
import RoleDetailsTab from './RoleDetailsTab'
import AssignedUsersTab from './AssignedUsersTab'

export default function RoleDetailsPage() {
  const [activeTab, setActiveTab] = useState('details')
  const params = useParams()
  const router = useRouter()
  const roleId = params.roleId as string

  // Use the useRole hook to fetch role data
  const { role, loading, error } = useRole(roleId)

  // Get user count for the role
  const { pagination } = useUsers({ roleId })

  // Show error message if failed to load role
  if (error) {
    message.error('Failed to load role details')
  }

  const TABS = [
    { key: 'details', label: 'Role Details' },
    { key: 'users', label: `Assigned Users (${pagination?.total_records || 0})` },
  ]

  const handleBack = () => {
    router.push('/user-management/roles')
  }

  const handleEdit = () => {
    router.push(`/user-management/roles/create?roleId=${roleId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Error state
  if (error || !role) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error ? 'Error Loading Role' : 'Role Not Found'}
          </h2>
          <p className="text-gray-500 mb-4">
            {error || 'The role you are looking for does not exist.'}
          </p>
          <Button onClick={handleBack} className="rounded-xl">
            Back to Roles
          </Button>
        </div>
      </div>
    )
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
      {activeTab === 'users' && <AssignedUsersTab roleId={roleId} />}
    </div>
  )
}
