'use client'

import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'

export default function UserDetailsPage() {
  return (
    <div className="p-6 bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> User Details
        </button>

        <div className="flex gap-2">
          {['Reset Password', 'Deactivate', 'Assign Role', 'Assign Department'].map(
            (btn) => (
              <button
                key={btn}
                className="px-4 py-2 text-sm border border-secondary text-secondary rounded-2xl"
              >
                {btn}
              </button>
            )
          )}
          <button className="px-5 py-2 text-sm bg-secondary text-white rounded-2xl">
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Card */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-semibold">Personal Info</h2>
            <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              Active
            </span>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="https://i.pravatar.cc/120"
              alt="profile"
              width={96}
              height={96}
              className="rounded-full"
            />
            <h3 className="mt-4 font-semibold text-lg">Michael Smith</h3>
            <p className="text-sm text-gray-500">
              HR Officer • Human Resources
            </p>
          </div>

          <InfoItem label="Gender" value="Female" />
          <InfoItem label="Email Address" value="michael.smith@email.com" />
          <InfoItem label="Phone Number" value="+62 812-3456-7890" />
          <InfoItem label="Created Date" value="2023-07-11" />
        </div>

        {/* Right Section */}
        <div className="col-span-12 md:col-span-8 space-y-6">
       
          <div className='grid grid-cols-[1fr_1fr] space-x-4'>
        {/* Organizational Details */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Organizational Details</h2>

            <DetailRow label="Company Name" value="Tom Jhon" />
            <DetailRow label="Department" value="Male" />
            <DetailRow label="Reporting manager" value="tomjhon@gmail.com" />
            <DetailRow
              label="Location"
              value="220 S. Elm Street Sherman Texas 75090"
            />

            <button className="mt-3 text-sm text-green-700">
              Show On Map
            </button>
          </div>

          {/* Assigned Asset */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Assigned Asset</h2>

            <DetailRow
              label="Laptop"
              value="Mac Book Pro – Issued 2023-08-01"
            />
            <DetailRow
              label="Phone"
              value="iPhone 13 – Issued 2023-08-01"
            />
            <DetailRow label="Status" value="Active" />
          </div>
          </div>
     

          {/* Activity Logs */}
          <div className="bg-[#F1FAFF] rounded-xl p-6">
            <h2 className="font-semibold mb-4">Activity Logs</h2>

            <LogItem
              title="Last Login"
              desc="2025-11-29 09:30 AM"
            />
            <LogItem
              title="Login History"
              desc="10 Login in Last 30 Days"
            />
            <LogItem
              title="Actions"
              desc="Changed Password on 2025-11-01 by User
Updated Profile on 2025-10-22 by Admin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


function InfoItem({ label, value }: any) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: any) {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
      <span className="text-gray-500">{label}</span>
      <span className="col-span-2 font-medium">{value}</span>
    </div>
  )
}

function LogItem({ title, desc }: any) {
  return (
    <div className="flex gap-3 mb-4">
      <span className="w-3 h-3 mt-1 rounded-full bg-green-600" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-600 whitespace-pre-line">
          {desc}
        </p>
      </div>
    </div>
  )
}
