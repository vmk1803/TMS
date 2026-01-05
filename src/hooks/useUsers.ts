import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  User,
  PaginatedUsersResponse,
  userApi
} from '@/services/userService'

interface UseUsersOptions {
  page?: number
  pageSize?: number
  searchString?: string
  departmentId?: string
  roleId?: string
  status?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  pagination: PaginatedUsersResponse['pagination_info'] | null
  refetch: () => Promise<void>
  deleteUser: (userId: string) => Promise<boolean>
}

export const useUsersByOrganization = (organizationId: string, options: Omit<UseUsersOptions, 'organizationId' | 'roleId' | 'fetchAll'> = {}): UseUsersReturn => {
  const { page = 1, pageSize = 10, searchString, departmentId, status, autoFetch = true } = options

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const fetchedUsers = await userApi.getUsersByOrganization(organizationId)
      setUsers(fetchedUsers)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch organization users'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const refetch = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await userApi.deleteUser(userId)
      message.success('User deleted successfully')
      // Remove user from local state
      setUsers(prev => prev.filter(user => user._id !== userId))
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user'
      message.error(errorMessage)
      return false
    }
  }, [])

  useEffect(() => {
    if (autoFetch && organizationId) {
      fetchUsers()
    }
  }, [fetchUsers, autoFetch, organizationId])

  return {
    users,
    loading,
    error,
    pagination: null, // No pagination for organization users
    refetch,
    deleteUser
  }
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { page = 1, pageSize = 10, searchString, departmentId, roleId, status, autoFetch = true, fetchAll = false } = options
  const effectivePageSize = fetchAll ? 1000 : pageSize

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedUsersResponse['pagination_info'] | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        // Fetch all users without pagination
        const allUsers = await userApi.getAllUsers()
        setUsers(allUsers)
        setPagination(null) // No pagination info for fetchAll
      } else {
        const params = {
          page,
          page_size: effectivePageSize,
          ...(searchString && { search_string: searchString }),
          ...(departmentId && { department_id: departmentId }),
          ...(roleId && { role_id: roleId }),
          ...(status && status !== 'all' && { status })
        }

        const response = await userApi.getUsers(params)
        setUsers(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, effectivePageSize, searchString, departmentId, roleId, status, fetchAll])

  const refetch = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await userApi.deleteUser(userId)
      message.success('User deleted successfully')
      // Remove user from local state
      setUsers(prev => prev.filter(user => user._id !== userId))
      // Update pagination info
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total_records: prev.total_records - 1,
          total_pages: Math.ceil((prev.total_records - 1) / prev.page_size)
        } : null)
      }
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user'
      message.error(errorMessage)
      return false
    }
  }, [pagination])

  useEffect(() => {
    if (autoFetch) {
      fetchUsers()
    }
  }, [fetchUsers, autoFetch])

  return {
    users,
    loading,
    error,
    pagination,
    refetch,
    deleteUser
  }
}
