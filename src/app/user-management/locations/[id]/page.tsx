'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLocation } from '@/hooks/useLocations'
import LocationDetails from '../LocationDetails'

export default function LocationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const locationId = params.id as string

  const { location, loading, error } = useLocation(locationId)

  if (loading) {
    return <div className="text-center py-8">Loading location details...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  if (!location) {
    return <div className="text-center py-8">Location not found</div>
  }

  const data = {
    locations: [location], // Single location wrapped in array for compatibility
    logs: [
      {
        title: 'Created',
        date: location.createdAt ? `Created on ${new Date(location.createdAt).toLocaleDateString()}` : 'Created date not available',
      },
      {
        title: 'Updated',
        date: location.updatedAt ? `Updated on ${new Date(location.updatedAt).toLocaleDateString()}` : 'Updated date not available',
      },
      // You can add more logs here if you have activity tracking
    ],
  }

  const handleEdit = () => {
    router.push(`/user-management/locations/create?locationId=${locationId}`)
  }

  return <LocationDetails data={data||[]} onEdit={handleEdit} />
}
