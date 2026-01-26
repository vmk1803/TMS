'use client'

import { Card, Tag, Avatar, Button } from 'antd'
import { Eye, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import ActivityLogsStepper from '@/components/common/ActivityLogsStepper'

export default function DepartmentDetailsCard({ data, onEdit, updateDepartment }: any) {
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleViewProfile = () => {
    router.push(`/user-management/users/${data.manager._id}`)
  }

  const handleRemoveManager = () => {
    setIsModalVisible(true)
  }

  const handleModalConfirm = async () => {
    await updateDepartment({ headOfDepartment: null })
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

          {/* Department Header */}
          <Card className="rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-green-700">
                  {data.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {data.description}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Assigned Organization */}
            <div className="mt-4">
              <p className="text-sm font-bold text-black mb-2">
                Assigned Organization
              </p>
              <Tag className="rounded-full bg-gray-100 border-none">
                {data.company}
              </Tag>
            </div>
          </Card>

          {/* Assigned Manager */}
          <Card className="rounded-xl">
            {data.manager && data.manager.email ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Assigned Manager</h3>
                    <Tag className="bg-green-100 text-green-700 border-none">
                      Active
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
                    <p className="font-medium">{data.manager?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {data.manager?.role || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-500">Organization</p>
                    <p>{data.manager?.company || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email Address</p>
                    <p>{data.manager?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone Number</p>
                    <p>{data.manager?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p>{data.manager?.lastLogin ? new Date(data.manager.lastLogin).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold mb-4">Assigned Manager</h3>
                <p className="text-gray-500">Assigned manager not available</p>
              </>
            )}
          </Card>
        </div>

        {/* ================= ACTIVITY LOGS ================= */}
        <Card className="rounded-xl bg-[#F1FAF7]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold">Activity Logs</h4>
          </div>

          <ActivityLogsStepper logs={data.logs} />
        </Card>
      </div>

      <ConfirmationModal
        isOpen={isModalVisible}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        title="Remove Assigned Manager"
        body="Are you sure you want to remove this assigned manager from the department?"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  )
}
