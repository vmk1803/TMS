import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '@/lib/api'
import { UserTrendsResponse } from '@/types/user'

interface UseUserTrendsOptions {
  autoFetch?: boolean
  year?: number
  roleId?: string
}

interface UseUserTrendsReturn {
  data: UserTrendsResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: { year?: number; roleId?: string }) => void
}

export const useUserTrends = (options: UseUserTrendsOptions = {}): UseUserTrendsReturn => {
  const { autoFetch = true, year: initialYear, roleId: initialRoleId } = options
  
  const [data, setData] = useState<UserTrendsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ 
    year: initialYear || new Date().getFullYear(), 
    roleId: initialRoleId 
  })

  const fetchUserTrends = useCallback(async () => {
    const controller = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      if (filters.roleId) {
        params.append('roleId', filters.roleId)
      }
      
      const response = await api.get(`/user-management/analytics/user-trends?${params.toString()}`, {
        signal: controller.signal
      })
      
      setData(response.data.data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User trends fetch was cancelled')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user trends'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
    
    return () => {
      controller.abort()
    }
  }, [filters.year, filters.roleId])

  const refetch = useCallback(async () => {
    await fetchUserTrends()
  }, [fetchUserTrends])

  const updateFilters = useCallback((newFilters: { year?: number; roleId?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchUserTrends()
    }
  }, [autoFetch, fetchUserTrends])

  return {
    data,
    loading,
    error,
    refetch,
    updateFilters
  }
}