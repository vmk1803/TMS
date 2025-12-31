'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import OrderingFacilitiesDetails from './components/OrderingFacilitiesDetails'

const Page = () => {
  const searchParams = useSearchParams()
  const guid = searchParams.get('guid')

  if (!guid) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center">
        <p className="text-red-600">No facility GUID provided</p>
      </div>
    )
  }

  return <OrderingFacilitiesDetails guid={guid} />
}

export default Page