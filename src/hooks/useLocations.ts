import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  Location,
  PaginatedLocationsResponse,
  CreateLocationData,
  CreateLocationResponse,
  UpdateLocationData,
  locationApi
} from '@/services/locationService'

interface UseLocationsOptions {
  page?: number
  pageSize?: number
  searchString?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseLocationsReturn {
  locations: Location[]
  loading: boolean
  error: string | null
  pagination: PaginatedLocationsResponse['pagination_info'] | null
  refetch: () => Promise<void>
  createLocation: (data: CreateLocationData) => Promise<CreateLocationResponse | null>
  updateLocation: (id: string, data: UpdateLocationData) => Promise<Location | null>
  deleteLocation: (id: string) => Promise<boolean>
}

export const useLocations = (options: UseLocationsOptions = {}): UseLocationsReturn => {
  const { page = 1, pageSize = 10, searchString, autoFetch = true, fetchAll = false } = options

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedLocationsResponse['pagination_info'] | null>(null)

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        // Fetch all locations without pagination
        const allLocations = await locationApi.getAllLocations()
        setLocations(allLocations)
        setPagination(null) // No pagination info for fetchAll
      } else {
        // Fetch paginated locations
        const params = {
          page,
          page_size: pageSize,
          ...(searchString && { search_string: searchString })
        }

        const response = await locationApi.getLocations(params)
        setLocations(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch locations'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchString, fetchAll])

  const refetch = useCallback(async () => {
    await fetchLocations()
  }, [fetchLocations])

  const createLocation = useCallback(async (data: CreateLocationData): Promise<CreateLocationResponse | null> => {
    try {
      setLoading(true)
      const response = await locationApi.createLocation(data)
      message.success(response.message || 'Locations created successfully')
      await refetch() // Refresh the list
      return response
    } catch (err: any) {
      // Check for specific validation errors
      let errorMessage = err.response?.data?.message || err.message || 'Failed to create location'

      // If validation errors are present, show specific field errors
      if (err.response?.data?.details) {
        const details = err.response.data.details
        if (details && typeof details === 'object') {
          const fieldErrors: string[] = []

          // Handle nested validation errors (addresses[0].country, etc.)
          Object.keys(details).forEach(field => {
            if (details[field] && Array.isArray(details[field])) {
              details[field].forEach((error: string) => {
                fieldErrors.push(`${field}: ${error}`)
              })
            } else if (typeof details[field] === 'string') {
              fieldErrors.push(`${field}: ${details[field]}`)
            }
          })

          if (fieldErrors.length > 0) {
            errorMessage = `Validation failed:\n${fieldErrors.join('\n')}`
          }
        }
      }

      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const updateLocation = useCallback(async (id: string, data: UpdateLocationData): Promise<Location | null> => {
    try {
      setLoading(true)
      const updatedLocation = await locationApi.updateLocation(id, data)
      message.success('Location updated successfully')
      await refetch() // Refresh the list
      return updatedLocation
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update location'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const deleteLocation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await locationApi.deleteLocation(id)
      message.success('Location deleted successfully')
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete location'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [refetch])

  useEffect(() => {
    if (autoFetch) {
      fetchLocations()
    }
  }, [fetchLocations, autoFetch])

  return {
    locations,
    loading,
    error,
    pagination,
    refetch,
    createLocation,
    updateLocation,
    deleteLocation
  }
}

// Hook for single location
interface UseLocationReturn {
  location: Location | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateLocation: (data: UpdateLocationData) => Promise<Location | null>
  deleteLocation: () => Promise<boolean>
}

export const useLocation = (id: string | null): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLocation = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await locationApi.getLocation(id)
      setLocation(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch location'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchLocation()
  }, [fetchLocation])

  const updateLocation = useCallback(async (data: UpdateLocationData): Promise<Location | null> => {
    if (!id) return null

    try {
      setLoading(true)
      const updatedLocation = await locationApi.updateLocation(id, data)
      setLocation(updatedLocation)
      message.success('Location updated successfully')
      return updatedLocation
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update location'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  const deleteLocation = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      setLoading(true)
      await locationApi.deleteLocation(id)
      message.success('Location deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete location'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchLocation()
    }
  }, [fetchLocation, id])

  return {
    location,
    loading,
    error,
    refetch,
    updateLocation,
    deleteLocation
  }
}
