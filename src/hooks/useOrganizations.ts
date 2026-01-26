import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  Organization,
  PaginatedOrganizationsResponse,
  CreateOrganizationData,
  CreateOrganizationResponse,
  UpdateOrganizationData,
  organizationApi
} from '@/services/organizationService'

interface UseOrganizationsOptions {
  page?: number
  pageSize?: number
  searchString?: string
  status?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseOrganizationsReturn {
  organizations: Organization[]
  loading: boolean
  error: string | null
  pagination: PaginatedOrganizationsResponse['pagination_info'] | null
  refetch: () => Promise<void>
  createOrganization: (data: CreateOrganizationData) => Promise<CreateOrganizationResponse | null>
  updateOrganization: (id: string, data: UpdateOrganizationData) => Promise<Organization | null>
  deleteOrganization: (id: string) => Promise<boolean>
  bulkUpdateStatus: (organizationIds: string[], status: string) => Promise<boolean>
}

export const useOrganizations = (options: UseOrganizationsOptions = {}): UseOrganizationsReturn => {
  const { page = 1, pageSize = 10, searchString, status, autoFetch = true, fetchAll = false } = options

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedOrganizationsResponse['pagination_info'] | null>(null)

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        // Fetch all organizations without pagination
        const allOrganizations = await organizationApi.getAllOrganizations()
        setOrganizations(allOrganizations)
        setPagination(null) // No pagination info for fetchAll
      } else {
        // Fetch paginated organizations
        const params = {
          page,
          page_size: pageSize,
          ...(searchString && { search_string: searchString }),
          ...(status && { status })
        }

        const response = await organizationApi.getOrganizations(params)
        setOrganizations(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch organizations'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchString, status, fetchAll])

  const refetch = useCallback(async () => {
    await fetchOrganizations()
  }, [fetchOrganizations])

  const createOrganization = useCallback(async (data: CreateOrganizationData): Promise<CreateOrganizationResponse | null> => {
    try {
      setLoading(true)
      const response = await organizationApi.createOrganization(data)
      message.success(response.message || 'Organization created successfully')
      await refetch() // Refresh the list
      return response
    } catch (err: any) {
      console.error('Create organization error:', err) // Log full error for debugging

      let errorMessage = 'Failed to create organization'

      // Handle different error response formats
      if (err.response?.data) {
        const errorData = err.response.data

        // Check for message field
        if (errorData.message) {
          errorMessage = errorData.message
        }

        // Check for error field
        if (errorData.error) {
          errorMessage = errorData.error
        }

        // Check for type field
        if (errorData.type) {
          errorMessage = `${errorData.type}: ${errorMessage}`
        }

        // Check for validation errors in details
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

        // Check for specific database/validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const dbErrors = errorData.errors.map((error: any) =>
            `${error.field || 'Field'}: ${error.message || error}`
          )
          errorMessage = `Database errors:\n${dbErrors.join('\n')}`
        }

        // Handle MongoDB duplicate key errors
        if (errorData.code === 11000) {
          errorMessage = 'Duplicate entry: An organization with this email already exists'
        }
      }

      // Fallback to network error or generic error
      if (!err.response) {
        errorMessage = `Network error: ${err.message || 'Unable to connect to server'}`
      }

      // Add HTTP status code if available
      if (err.response?.status) {
        errorMessage = `[${err.response.status}] ${errorMessage}`
      }

      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const updateOrganization = useCallback(async (id: string, data: UpdateOrganizationData): Promise<Organization | null> => {
    try {
      setLoading(true)
      const updatedOrganization = await organizationApi.updateOrganization(id, data)
      message.success('Organization updated successfully')
      return updatedOrganization
    } catch (err: any) {
      console.error('Update organization error:', err) // Log full error for debugging

      let errorMessage = 'Failed to update organization'

      // Handle different error response formats
      if (err.response?.data) {
        const errorData = err.response.data

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        if (errorData.type) {
          errorMessage = `${errorData.type}: ${errorMessage}`
        }

        // Handle validation errors
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

        // Handle MongoDB duplicate key errors
        if (errorData.code === 11000) {
          errorMessage = 'Duplicate entry: An organization with this email already exists'
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

  const deleteOrganization = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await organizationApi.deleteOrganization(id)
      message.success('Organization deleted successfully')
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      console.error('Delete organization error:', err) // Log full error for debugging

      let errorMessage = 'Failed to delete organization'

      // Handle different error response formats
      if (err.response?.data) {
        const errorData = err.response.data

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        if (errorData.type) {
          errorMessage = `${errorData.type}: ${errorMessage}`
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

  const bulkUpdateStatus = useCallback(async (organizationIds: string[], status: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await organizationApi.bulkUpdateStatus(organizationIds, status)
      message.success(response.message)
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update organization statuses'
      setError(errorMessage)
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [refetch])

  useEffect(() => {
    if (autoFetch) {
      fetchOrganizations()
    }
  }, [fetchOrganizations, autoFetch])

  return {
    organizations,
    loading,
    error,
    pagination,
    refetch,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    bulkUpdateStatus
  }
}

// Hook for single organization
interface UseOrganizationReturn {
  organization: Organization | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateOrganization: (data: UpdateOrganizationData) => Promise<Organization | null>
  deleteOrganization: () => Promise<boolean>
}

export const useOrganization = (id: string | null): UseOrganizationReturn => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganization = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await organizationApi.getOrganization(id)
      setOrganization(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch organization'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchOrganization()
  }, [fetchOrganization])

  const updateOrganization = useCallback(async (data: UpdateOrganizationData): Promise<Organization | null> => {
    if (!id) return null

    try {
      setLoading(true)
      const updatedOrganization = await organizationApi.updateOrganization(id, data)
      setOrganization(updatedOrganization)
      message.success('Organization updated successfully')
      return updatedOrganization
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update organization'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  const deleteOrganization = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      setLoading(true)
      await organizationApi.deleteOrganization(id)
      message.success('Organization deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete organization'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchOrganization()
    }
  }, [fetchOrganization, id])

  return {
    organization,
    loading,
    error,
    refetch,
    updateOrganization,
    deleteOrganization
  }
}
