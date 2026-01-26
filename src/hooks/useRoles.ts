import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  Role,
  PaginatedRolesResponse,
  CreateRoleData,
  UpdateRoleData,
  roleApi
} from '@/services/roleService'

interface UseRolesOptions {
  page?: number
  pageSize?: number
  searchString?: string
  permissionSection?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseRolesReturn {
  roles: Role[]
  loading: boolean
  error: string | null
  pagination: PaginatedRolesResponse['pagination_info'] | null
  refetch: () => Promise<void>
  createRole: (data: CreateRoleData) => Promise<Role | null>
  updateRole: (id: string, data: UpdateRoleData) => Promise<Role | null>
  deleteRole: (id: string) => Promise<boolean>
}

export const useRoles = (options: UseRolesOptions = {}): UseRolesReturn => {
  const { page = 1, pageSize = 10, searchString, permissionSection, autoFetch = true, fetchAll = false } = options
  const effectivePageSize = fetchAll ? 1000 : pageSize

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedRolesResponse['pagination_info'] | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        const allRoles = await roleApi.getAllRoles()
        setRoles(allRoles)
        setPagination(null)
      } else {
        const params = {
          page,
          page_size: effectivePageSize,
          ...(searchString && { search_string: searchString }),
          ...(permissionSection && permissionSection !== 'all' && { permission_section: permissionSection })
        }

        const response = await roleApi.getRoles(params)
        setRoles(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch roles'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, effectivePageSize, searchString, permissionSection, fetchAll])

  const refetch = useCallback(async () => {
    await fetchRoles()
  }, [fetchRoles])

  const createRole = useCallback(async (data: CreateRoleData): Promise<Role | null> => {
    try {
      setLoading(true)
      const response = await roleApi.createRole(data);
      message.success('Role created successfully')
      await refetch() // Refresh the list
      message.success('Role created successfully')
      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create role'
      console.log(errorMessage, 'errorMessage')
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const updateRole = useCallback(async (id: string, data: UpdateRoleData): Promise<Role | null> => {
    try {
      setLoading(true)
      const updatedRole = await roleApi.updateRole(id, data)
      await refetch() // Refresh the list
      message.success('Role updated successfully')
      return updatedRole
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update role'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await roleApi.deleteRole(id)
      message.success('Role deleted successfully')
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete role'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [refetch])

  useEffect(() => {
    if (autoFetch) {
      fetchRoles()
    }
  }, [fetchRoles, autoFetch])

  return {
    roles,
    loading,
    error,
    pagination,
    refetch,
    createRole,
    updateRole,
    deleteRole
  }
}

// Hook for single role
interface UseRoleReturn {
  role: Role | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateRole: (data: UpdateRoleData) => Promise<Role | null>
  deleteRole: () => Promise<boolean>
}

export const useRole = (id: string | null): UseRoleReturn => {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await roleApi.getRole(id)
      setRole(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch role'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchRole()
  }, [fetchRole])

  const updateRole = useCallback(async (data: UpdateRoleData): Promise<Role | null> => {
    if (!id) return null

    try {
      setLoading(true)
      const updatedRole = await roleApi.updateRole(id, data)
      setRole(updatedRole)
      message.success('Role updated successfully')
      return updatedRole
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update role'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  const deleteRole = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      setLoading(true)
      await roleApi.deleteRole(id)
      message.success('Role deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete role'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchRole()
    }
  }, [fetchRole, id])

  return {
    role,
    loading,
    error,
    refetch,
    updateRole,
    deleteRole
  }
}
