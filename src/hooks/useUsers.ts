import { useState, useEffect } from 'react'
import { message } from 'antd'
import { User, userApi } from '@/services/userService'

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      // const data = await userApi.getAllUsers()
      // The users route is not desgined yet.
      setUsers([])
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  }
}
