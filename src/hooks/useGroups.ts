import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  Group,
  PaginatedGroupsResponse,
  CreateGroupData,
  CreateGroupResponse,
  UpdateGroupData,
  groupApi
} from '@/services/groupService'

interface UseGroupsOptions {
  page?: number
  pageSize?: number
  searchString?: string
  department?: string
  group?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseGroupsReturn {
  groups: Group[]
  loading: boolean
  error: string | null
  pagination: PaginatedGroupsResponse['pagination_info'] | null
  refetch: () => Promise<void>
  createGroup: (data: CreateGroupData) => Promise<CreateGroupResponse | null>
  updateGroup: (id: string, data: UpdateGroupData) => Promise<Group | null>
  deleteGroup: (id: string) => Promise<boolean>
  bulkDeleteGroups: (ids: string[]) => Promise<boolean>
}

export const useGroups = (options: UseGroupsOptions = {}): UseGroupsReturn => {
  const { page = 1, pageSize = 10, searchString, department, group, autoFetch = true, fetchAll = false } = options
  const effectivePageSize = fetchAll ? 1000 : pageSize

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedGroupsResponse['pagination_info'] | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        const allGroups = await groupApi.getAllGroups()
        setGroups(allGroups)
        setPagination(null)
      } else {
        const params = {
          page,
          page_size: effectivePageSize,
          ...(searchString && { search_string: searchString }),
          ...(department && { department }),
          ...(group && { group })
        }

        const response = await groupApi.getGroups(params)
        setGroups(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch groups'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, effectivePageSize, searchString, department, group, fetchAll])

  const refetch = useCallback(async () => {
    await fetchGroups()
  }, [fetchGroups])

  const createGroup = useCallback(async (data: CreateGroupData): Promise<CreateGroupResponse | null> => {
    try {
      setLoading(true)
      const response = await groupApi.createGroup(data)
      message.success(response.message || 'Group created successfully')
      await refetch() // Refresh the list
      return response
    } catch (err: any) {
      console.error('Create group error:', err)

      let errorMessage = 'Failed to create group'

      if (err.response?.data) {
        const errorData = err.response.data

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        if (errorData.details) {
          const details = errorData.details
          if (details && typeof details === 'object') {
            const fieldErrors: string[] = []
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

        if (errorData.code === 11000) {
          errorMessage = 'Duplicate entry: A group with this name already exists'
        }
      }

      if (!err.response) {
        errorMessage = `Network error: ${err.message || 'Unable to connect to server'}`
      }

      if (err.response?.status) {
        errorMessage = `[${err.response.status}] ${errorMessage}`
      }

      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const updateGroup = useCallback(async (id: string, data: UpdateGroupData): Promise<Group | null> => {
    try {
      setLoading(true)
      const updatedGroup = await groupApi.updateGroup(id, data)
      message.success('Group updated successfully')
      await refetch() // Refresh the list
      return updatedGroup
    } catch (err: any) {
      console.error('Update group error:', err)

      let errorMessage = 'Failed to update group'

      if (err.response?.data) {
        const errorData = err.response.data

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        if (errorData.details) {
          const details = errorData.details
          if (details && typeof details === 'object') {
            const fieldErrors: string[] = []
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

        if (errorData.code === 11000) {
          errorMessage = 'Duplicate entry: A group with this name already exists'
        }
      }

      if (!err.response) {
        errorMessage = `Network error: ${err.message || 'Unable to connect to server'}`
      }

      if (err.response?.status) {
        errorMessage = `[${err.response.status}] ${errorMessage}`
      }

      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await groupApi.deleteGroup(id)
      message.success('Group deleted successfully')
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      console.error('Delete group error:', err)

      let errorMessage = 'Failed to delete group'

      if (err.response?.data) {
        const errorData = err.response.data

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      }

      if (!err.response) {
        errorMessage = `Network error: ${err.message || 'Unable to connect to server'}`
      }

      if (err.response?.status) {
        errorMessage = `[${err.response.status}] ${errorMessage}`
      }

      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const bulkDeleteGroups = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return false
      setLoading(true)
      const result = await groupApi.bulkOperation({ ids, operation: 'delete' })
      const successCount = result?.successCount ?? 0
      const failedCount = result?.failedCount ?? 0

      if (successCount > 0 && failedCount === 0) {
        message.success(`${successCount} group${successCount > 1 ? 's' : ''} deleted successfully`)
      } else if (successCount > 0 && failedCount > 0) {
        message.warning(`Deleted ${successCount} group${successCount > 1 ? 's' : ''}, failed to delete ${failedCount}`)
      } else {
        message.error('Failed to delete selected groups')
      }

      await refetch()
      return successCount > 0
    } catch (err: any) {
      console.error('Bulk delete groups error:', err)

      let errorMessage = 'Failed to delete selected groups'
      if (err.response?.data) {
        const errorData = err.response.data
        if (errorData.message) errorMessage = errorData.message
        else if (errorData.error) errorMessage = errorData.error
      }
      if (!err.response) {
        errorMessage = `Network error: ${err.message || 'Unable to connect to server'}`
      }
      if (err.response?.status) {
        errorMessage = `[${err.response.status}] ${errorMessage}`
      }

      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [refetch])

  useEffect(() => {
    if (autoFetch) {
      fetchGroups()
    }
  }, [fetchGroups, autoFetch])

  return {
    groups,
    loading,
    error,
    pagination,
    refetch,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkDeleteGroups
  }
}

// Hook for single group
interface UseGroupReturn {
  group: Group | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateGroup: (data: UpdateGroupData) => Promise<Group | null>
  deleteGroup: () => Promise<boolean>
}

export const useGroup = (id: string | null): UseGroupReturn => {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroup = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await groupApi.getGroup(id)
      setGroup(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch group'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchGroup()
  }, [fetchGroup])

  const updateGroup = useCallback(async (data: UpdateGroupData): Promise<Group | null> => {
    if (!id) return null

    try {
      setLoading(true)
      const updatedGroup = await groupApi.updateGroup(id, data)
      setGroup(updatedGroup)
      message.success('Group updated successfully')
      return updatedGroup
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update group'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  const deleteGroup = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      setLoading(true)
      await groupApi.deleteGroup(id)
      message.success('Group deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete group'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchGroup()
    }
  }, [fetchGroup, id])

  return {
    group,
    loading,
    error,
    refetch,
    updateGroup,
    deleteGroup
  }
}

// Hook for group members
interface UseGroupMembersOptions {
  page?: number
  pageSize?: number
  searchString?: string
  department?: string
  status?: string
  autoFetch?: boolean
}

interface UseGroupMembersReturn {
  members: any[]
  loading: boolean
  error: string | null
  pagination: PaginatedGroupsResponse['pagination_info'] | null
  refetch: () => Promise<void>
}

export const useGroupMembers = (groupId: string | null, options: UseGroupMembersOptions = {}): UseGroupMembersReturn => {
  const { page = 1, pageSize = 10, searchString, department, status, autoFetch = true } = options

  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedGroupsResponse['pagination_info'] | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!groupId) return

    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        page_size: pageSize,
        ...(searchString && { search_string: searchString }),
        ...(department && { department }),
        ...(status && { status })
      }

      const response = await groupApi.getGroupMembers(groupId, params)
      setMembers(response.records)
      setPagination(response.pagination_info)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch group members'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [groupId, page, pageSize, searchString, department, status])

  const refetch = useCallback(async () => {
    await fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    if (autoFetch && groupId) {
      fetchMembers()
    }
  }, [fetchMembers, autoFetch, groupId])

  return {
    members,
    loading,
    error,
    pagination,
    refetch
  }
}
