'use client'

import { Card, Tag, Button } from 'antd'
import { Eye, Trash } from 'lucide-react'
import ActivityLogsStepper from '@/components/common/ActivityLogsStepper'

export default function DepartmentDetailsCard({ data, onEdit }: any) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Section */}
      <div className="col-span-2 space-y-6">
        <Card className="rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{data.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {data.description}
              </p>
            </div>

            <Tag color={data.status === 'active' ? 'green' : 'red'}>{data.status === 'active' ? 'Active' : 'Inactive'}</Tag>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Assigned Company
            </p>
            <Tag className="mt-1">{data.company}</Tag>
          </div>
        </Card>

        {/* Assigned Manager */}
        {data.manager && (
          <Card className="rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Assigned Manager</h3>
                <Tag color="green">Active</Tag>
              </div>
              <div className="flex gap-2">
                <Eye size={16} className="cursor-pointer text-gray-500" />
                <Trash size={16} className="cursor-pointer text-gray-500" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={data.manager.avatar}
                className="w-12 h-12 rounded-full"
              />

              <div>
                <p className="font-medium">{data.manager.name}</p>
                <p className="text-sm text-gray-500">
                  {data.manager.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Company</p>
                <p>{data.manager.company}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p>{data.manager.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p>{data.manager.phone}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Activity Logs */}
      <Card className="rounded-xl bg-[#F1FAF7]">
        <h3 className="font-semibold mb-6">Activity Logs</h3>
        <ActivityLogsStepper logs={data.logs} />
      </Card>
    </div>
  )
}
