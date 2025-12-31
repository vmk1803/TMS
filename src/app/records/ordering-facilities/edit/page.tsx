'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import AddOrderingFacilities from '../new/components/AddOrderingFacilities'

const Page = () => {
    const searchParams = useSearchParams()
    const guid = searchParams.get('guid')

    if (!guid) {
        return (
            <div className="bg-[#F8FAF9] min-h-screen flex items-center justify-center">
                <p className="text-red-600">No facility GUID provided</p>
            </div>
        )
    }

    return <AddOrderingFacilities guid={guid} />
}

export default Page
