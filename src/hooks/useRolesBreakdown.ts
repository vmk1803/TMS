import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '@/lib/api'
import { RoleBreakdown } from '@/types/user'

interface RolesBreakdownResponse {
  roleBreakdown: RoleBreakdown[]
  totalUsers: number
  year?: number
}

interface UseRolesBreakdownOptions {
  autoFetch?: boolean
  year?: number
}

interface UseRolesBreakdownReturn {
  data: RolesBreakdownResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: { year?: number }) => void
}

export const useRolesBreakdown = (options: UseRolesBreakdownOptions = {}): UseRolesBreakdownReturn => {
  const { autoFetch = true, year: initialYear } = options
  
  const [data, setData] = useState<RolesBreakdownResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ year: initialYear })

  const fetchRolesBreakdown = useCallback(async () => {
    const controller = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      
      const response = await api.get(`/user-management/analytics/roles-breakdown?${params.toString()}`, {
        signal: controller.signal
      })
      
      setData(response.data.data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Roles breakdown fetch was cancelled')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch roles breakdown'
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
    await fetchRolesBreakdown()
  }, [fetchRolesBreakdown])

  const updateFilters = useCallback((newFilters: { year?: number }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchRolesBreakdown()
    }
  }, [autoFetch, fetchRolesBreakdown])

  return {
    data,
    loading,
    error,
    refetch,
    updateFilters
  }
}