'use client'

import { Card, Button } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ActivityLogsStepper from '@/components/common/ActivityLogsStepper'

export default function LocationDetails({ data, onEdit }: any) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
          <ChevronLeft size={16} className='text-secondary cursor-pointer'/>
          <span className="text-sm text-gray-500">Back</span>
        </div>
        <Button type="primary" className="rounded-xl bg-secondary cursor-pointer" onClick={onEdit}>
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
      {/* ================= LEFT SECTION ================= */}
      <div className="col-span-2 space-y-6">
        {data.locations.map((location: any, idx: number) => (
          <Card key={idx} className="rounded-xl">
            <h4 className="font-bold  mb-4">
              Location {idx + 1}
            </h4>

            <div className="grid grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-500">Country</p>
                <p className="font-medium">{location.country}</p>
              </div>

              <div>
                <p className="text-gray-500">City</p>
                <p className="font-medium">{location.city}</p>
              </div>

              <div>
                <p className="text-gray-500">Time Zone</p>
                <p className="font-medium">{location.timeZone}</p>
              </div>

              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-medium">{location.addressLine}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ================= ACTIVITY LOGS ================= */}
      <Card className="rounded-xl bg-[#F1FAF7]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold">Activity Logs</h4>
        </div>

        <ActivityLogsStepper logs={data.logs} />
      </Card>
      </div>
    </div>
  )
}
