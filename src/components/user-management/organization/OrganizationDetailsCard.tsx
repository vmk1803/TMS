'use client'

import { Card, Tag, Avatar, Button } from 'antd'
import { Eye, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import ActivityLogsStepper from '@/components/common/ActivityLogsStepper'

export default function OrganizationDetailsCard({ data, onEdit, updateOrganization }: any) {
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleViewProfile = () => {
    router.push(`/user-management/users/${data.primaryAdmin._id}`)
  }

  const handleRemoveAdmin = () => {
    setIsModalVisible(true)
  }

  const handleModalConfirm = async () => {
    await updateOrganization({ primaryAdmin: null })
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

        {/* Company Header */}
        <Card className="rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-green-700">
                {data.organizationName}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {data.description}
              </p>
            </div>

            <Tag className="bg-green-100 text-green-700 border-none">
              Active
            </Tag>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Assigned Departments */}
          <div className="mt-4">
            <p className="text-sm font-bold text-black mb-2">
              Assigned Departments
            </p>
            <div className="flex flex-wrap gap-2">
              {data.departments && data.departments.length > 0 ? (
                data.departments.map((dept: any) => (
                  <Tag key={dept._id || dept.name} className="rounded-full bg-gray-100 border-none">
                    {dept.name}
                  </Tag>
                ))
              ) : (
                <p className="text-xs text-gray-500">No departments assigned</p>
              )}
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="rounded-xl">
          <h3 className="font-semibold mb-4">Contact Information</h3>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Mobile Number</p>
              <p className="font-medium">{data.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
          </div>
        </Card>

        {/* Locations */}
        <Card className="rounded-xl">
          <h3 className="font-semibold mb-4">Locations</h3>

          <div className="grid grid-cols-2 gap-4">
            {data.locations.map((loc: any, idx: number) => {
              // Format address from location fields
              const addressParts = [];
              if (loc.streetAddress) addressParts.push(loc.streetAddress);
              if (loc.addressLine) addressParts.push(loc.addressLine);
              if (loc.city) addressParts.push(loc.city);
              const stateZip = [loc.state, loc.zip].filter(Boolean).join(' ');
              if (stateZip) addressParts.push(stateZip);
              if (loc.country) addressParts.push(loc.country);
              const formattedAddress = addressParts.join(', ');

              return (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-4 text-sm"
                >
                  <p className="text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{formattedAddress || 'No address available'}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Assigned Primary Admin */}
        <Card className="rounded-xl">
          {data.primaryAdmin && data.primaryAdmin.email ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Assigned Primary Admin</h3>
                  <Tag className="bg-green-100 text-green-700 border-none">
                    Active
                  </Tag>
                </div>

                <div className="flex gap-2">
                  <Button type="text" icon={<Eye size={16} />} onClick={handleViewProfile} />
                  <Button type="text" icon={<Trash2Icon size={16} />} onClick={handleRemoveAdmin} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar size={48} src={`https://picsum.photos/48/48?random=${Math.random()}`} />

                <div>
                  <p className="font-medium">{`${data.primaryAdmin.firstName} ${data.primaryAdmin.lastName}`}</p>
                  <p className="text-sm text-gray-500">
                    {data.primaryAdmin.role}
                    {data.primaryAdmin.role && data.primaryAdmin.department && ' • '}
                    {data.primaryAdmin.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Company</p>
                  <p>{data.organizationName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Address</p>
                  <p>{data.primaryAdmin.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p>{data.primaryAdmin.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Login</p>
                  <p>{data.primaryAdmin.lastLogin ? new Date(data.primaryAdmin.lastLogin).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4">Assigned Primary Admin</h3>
              <p className="text-gray-500">Primary admin not available</p>
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
      title="Remove Primary Admin"
      body="Are you sure you want to remove this primary admin from the organization?"
      confirmText="Remove"
      cancelText="Cancel"
    />
    </>
  )
}
