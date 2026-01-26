'use client'

import { Card, Tag, Avatar, Button } from 'antd'
import { Eye, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ConfirmationModal from '@/components/common/ConfirmationModal'

interface Group {
  id: string
  _id: string
  name: string
  department: {
    _id: string
    name: string
  }
  manager: {
    _id: string
    firstName: string
    lastName: string
    role?: string
    department?: string,
    email: string,
    mobileNumber?: string,
    lastLogin?: string,
    active?: boolean
  }
  members: Array<{
    _id: string
    firstName: string
    lastName: string
  }>
  description?: string
  createdAt?: string
  updatedAt?: string
}

interface GroupDetailsTabProps {
  group: Group
  updateGroup: (data: any) => Promise<any>
}

export default function GroupDetailsTab({ group, updateGroup }: GroupDetailsTabProps) {
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleViewProfile = () => {
    router.push(`/user-management/users/${group.manager._id}`)
  }

  const handleRemoveManager = () => {
    setIsModalVisible(true)
  }

  const handleModalConfirm = async () => {
    await updateGroup({ manager: null })
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <>
    <div className="grid grid-cols-3 gap-6">
      {/* ================= LEFT SECTION ================= */}
      <div className="col-span-2 space-y-6">
        {/* Group Details Card */}
        <Card className="rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                {group.name}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {group.description}
              </p>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Assigned Department */}
          <div className="mt-4">
            <p className="text-sm font-bold text-black mb-2">
              Assigned Department
            </p>
            <div className="flex flex-wrap gap-2">
              {group.department ? (
                <Tag key={group.department._id} className="rounded-full bg-gray-100 border-none">
                  {group.department?.name || 'N/A'}
                </Tag>
              ) : (
                <p className="text-xs text-gray-500">No department assigned</p>
              )}
            </div>
          </div>
        </Card>

        {/* Assigned Manager Card */}
        <Card className="rounded-xl">
          {group.manager?._id ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Assigned Manager</h3>
                  <Tag className={`${group.manager?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-none`}>
                    {group.manager?.active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>

                <div className="flex gap-2">
                  <Button type="text" icon={<Eye size={16} />} onClick={handleViewProfile} />
                  <Button type="text" icon={<Trash2Icon size={16} />} onClick={handleRemoveManager} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar size={48} src={`https://picsum.photos/48/48?random=${Math.random()}`} />

                <div>
                  <p className="font-medium">{`${group.manager?.firstName || ''} ${group.manager?.lastName || ''}`}</p>
                  <p className="text-sm text-gray-500">
                    {group.manager?.role || 'Manager'}
                    {group.manager?.role && group.manager?.department && ' • '}
                    {group.manager?.department || ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Group</p>
                  <p>{group.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Address</p>
                  <p>{group.manager?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p>{group.manager?.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Login</p>
                  <p>{group.manager?.lastLogin ? new Date(group.manager.lastLogin).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4">Assigned Manager</h3>
              <p className="text-gray-500">Manager not assigned</p>
            </>
          )}
        </Card>
      </div>

      {/* ================= ACTIVITY LOGS ================= */}
      <Card className="rounded-xl bg-[#F1FAF7]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold">Activity Logs</h4>
        </div>

        <div className="space-y-6">
          {/* Stepper with colored dots */}
          <div className="relative">
            {/* Connecting lines */}
            <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-gray-200"></div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1: Group Created */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-secondary">Group Created</p>
                  <p className="text-gray-500">
                    Created on {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Step 2: Manager Assigned */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-600">Manager Assigned</p>
                  <p className="text-gray-500">
                    {group.manager?.firstName || ''} {group.manager?.lastName || ''} assigned as manager
                  </p>
                </div>
              </div>

              {/* Step 3: Members Added */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-600">Members Added</p>
                  <p className="text-gray-500">{group.members?.length || 0} members added to group</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

      <ConfirmationModal
        isOpen={isModalVisible}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        title="Remove Assigned Manager"
        body="Are you sure you want to remove this assigned manager from the group?"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  )
}
