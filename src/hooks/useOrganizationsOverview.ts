import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '@/lib/api'
import { OrganizationOverview } from '@/types/user'

interface OrganizationsOverviewResponse {
  organizationsOverview: OrganizationOverview[]
  totalUsers: number
  year?: number
}

interface UseOrganizationsOverviewOptions {
  autoFetch?: boolean
  year?: number
}

interface UseOrganizationsOverviewReturn {
  data: OrganizationsOverviewResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: { year?: number }) => void
}

export const useOrganizationsOverview = (options: UseOrganizationsOverviewOptions = {}): UseOrganizationsOverviewReturn => {
  const { autoFetch = true, year: initialYear } = options
  
  const [data, setData] = useState<OrganizationsOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ year: initialYear })

  const fetchOrganizationsOverview = useCallback(async () => {
    const controller = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      
      const response = await api.get(`/user-management/analytics/organizations-overview?${params.toString()}`, {
        signal: controller.signal
      })
      
      setData(response.data.data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Organizations overview fetch was cancelled')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch organizations overview'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
    
    return () => {
      controller.abort()
    }
  }, [filters.year])

  const refetch = useCallback(async () => {
    await fetchOrganizationsOverview()
  }, [fetchOrganizationsOverview])

  const updateFilters = useCallback((newFilters: { year?: number }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchOrganizationsOverview()
    }
  }, [autoFetch, fetchOrganizationsOverview])

  return {
    data,
    loading,
    error,
    refetch,
    updateFilters
  }
}