import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '@/lib/api'
import { UsersByDepartmentResponse } from '@/types/user'

interface UseUsersByDepartmentOptions {
  autoFetch?: boolean
  departmentId?: string
  organizationId?: string
  year?: number
}

interface UseUsersByDepartmentReturn {
  data: UsersByDepartmentResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateFilters: (filters: { departmentId?: string; organizationId?: string; year?: number }) => void
}

export const useUsersByDepartment = (options: UseUsersByDepartmentOptions = {}): UseUsersByDepartmentReturn => {
  const { autoFetch = true, departmentId: initialDepartmentId, organizationId: initialOrganizationId, year: initialYear } = options
  
  const [data, setData] = useState<UsersByDepartmentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ 
    departmentId: initialDepartmentId, 
    organizationId: initialOrganizationId,
    year: initialYear
  })

  const fetchUsersByDepartment = useCallback(async () => {
    const controller = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.departmentId) {
        params.append('departmentId', filters.departmentId)
      }
      if (filters.organizationId) {
        params.append('organizationId', filters.organizationId)
      }
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      
      const response = await api.get(`/user-management/analytics/users-by-department?${params.toString()}`, {
        signal: controller.signal
      })
      
      setData(response.data.data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Users by department fetch was cancelled')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users by department'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
    
    return () => {
      controller.abort()
    }
  }, [filters.departmentId, filters.organizationId, filters.year])

  const refetch = useCallback(async () => {
    await fetchUsersByDepartment()
  }, [fetchUsersByDepartment])

  const updateFilters = useCallback((newFilters: { departmentId?: string; organizationId?: string; year?: number }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchUsersByDepartment()
    }
  }, [autoFetch, fetchUsersByDepartment])

  return {
    data,
    loading,
    error,
    refetch,
    updateFilters
  }
}