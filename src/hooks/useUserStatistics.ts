import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { userApi } from '@/services/userService'
import { UserStatistics } from '@/types/user'

interface UseUserStatisticsOptions {
  autoFetch?: boolean
}

interface UseUserStatisticsReturn {
  statistics: UserStatistics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUserStatistics = (options: UseUserStatisticsOptions = {}): UseUserStatisticsReturn => {
  const { autoFetch = true } = options
  
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    const controller = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await userApi.getUserStatistics({ 
        signal: controller.signal
      })
      setStatistics(data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Statistics fetch was cancelled')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user statistics'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
    
    return () => {
      controller.abort()
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchStatistics()
  }, [fetchStatistics])

  useEffect(() => {
    if (autoFetch) {
      fetchStatistics()
    }
  }, [autoFetch, fetchStatistics])

  return {
    statistics,
    loading,
    error,
    refetch
  }
}