import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { userApi, User } from '@/services/userService'

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUser = (id: string | null): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await userApi.getUserById(id)
      setUser(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [fetchUser, id])

  return { user, loading, error, refetch }
}
