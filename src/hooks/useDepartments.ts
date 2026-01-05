import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import {
  Department,
  PaginatedDepartmentsResponse,
  CreateDepartmentData,
  CreateDepartmentResponse,
  UpdateDepartmentData,
  departmentApi
} from '@/services/departmentService'

interface UseDepartmentsOptions {
  page?: number
  pageSize?: number
  searchString?: string
  organizationId?: string
  autoFetch?: boolean
  fetchAll?: boolean
}

interface UseDepartmentsReturn {
  departments: Department[]
  loading: boolean
  error: string | null
  pagination: PaginatedDepartmentsResponse['pagination_info'] | null
  refetch: () => Promise<void>
  createDepartment: (data: CreateDepartmentData) => Promise<CreateDepartmentResponse | null>
  updateDepartment: (id: string, data: UpdateDepartmentData) => Promise<Department | null>
  deleteDepartment: (id: string) => Promise<boolean>
}

export const useDepartments = (options: UseDepartmentsOptions = {}): UseDepartmentsReturn => {
  const { page = 1, pageSize = 10, searchString, organizationId, autoFetch = true, fetchAll = false } = options
  const effectivePageSize = fetchAll ? 1000 : pageSize

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedDepartmentsResponse['pagination_info'] | null>(null)

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (fetchAll) {
        const allDepartments = await departmentApi.getAllDepartments()
        setDepartments(allDepartments)
        setPagination(null)
      } else {
        const params = {
          page,
          page_size: effectivePageSize,
          ...(searchString && { search_string: searchString }),
          ...(organizationId && { organization_id: organizationId })
        }

        const response = await departmentApi.getDepartments(params)
        setDepartments(response.records)
        setPagination(response.pagination_info)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch departments'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, effectivePageSize, searchString, organizationId, fetchAll])

  const refetch = useCallback(async () => {
    await fetchDepartments()
  }, [fetchDepartments])

  const createDepartment = useCallback(async (data: CreateDepartmentData): Promise<CreateDepartmentResponse | null> => {
    try {
      setLoading(true)
      const response = await departmentApi.createDepartment(data)
      message.success(response.message || 'Department created successfully')
      await refetch() // Refresh the list
      return response
    } catch (err: any) {
      console.error('Create department error:', err)

      let errorMessage = 'Failed to create department'

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
          errorMessage = 'Duplicate entry: A department with this name already exists in the organization'
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

  const updateDepartment = useCallback(async (id: string, data: UpdateDepartmentData): Promise<Department | null> => {
    try {
      setLoading(true)
      const updatedDepartment = await departmentApi.updateDepartment(id, data)
      message.success('Department updated successfully')
      await refetch() // Refresh the list
      return updatedDepartment
    } catch (err: any) {
      console.error('Update department error:', err)

      let errorMessage = 'Failed to update department'

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
          errorMessage = 'Duplicate entry: A department with this name already exists in the organization'
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

  const deleteDepartment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await departmentApi.deleteDepartment(id)
      message.success('Department deleted successfully')
      await refetch() // Refresh the list
      return true
    } catch (err: any) {
      console.error('Delete department error:', err)

      let errorMessage = 'Failed to delete department'

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

  useEffect(() => {
    if (autoFetch) {
      fetchDepartments()
    }
  }, [fetchDepartments, autoFetch])

  return {
    departments,
    loading,
    error,
    pagination,
    refetch,
    createDepartment,
    updateDepartment,
    deleteDepartment
  }
}

// Hook for single department
interface UseDepartmentReturn {
  department: Department | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateDepartment: (data: UpdateDepartmentData) => Promise<Department | null>
  deleteDepartment: () => Promise<boolean>
}

export const useDepartment = (id: string | null): UseDepartmentReturn => {
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDepartment = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await departmentApi.getDepartment(id)
      setDepartment(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch department'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  const refetch = useCallback(async () => {
    await fetchDepartment()
  }, [fetchDepartment])

  const updateDepartment = useCallback(async (data: UpdateDepartmentData): Promise<Department | null> => {
    if (!id) return null

    try {
      setLoading(true)
      const updatedDepartment = await departmentApi.updateDepartment(id, data)
      setDepartment(updatedDepartment)
      message.success('Department updated successfully')
      return updatedDepartment
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update department'
      message.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  const deleteDepartment = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    try {
      setLoading(true)
      await departmentApi.deleteDepartment(id)
      message.success('Department deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete department'
      message.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchDepartment()
    }
  }, [fetchDepartment, id])

  return {
    department,
    loading,
    error,
    refetch,
    updateDepartment,
    deleteDepartment
  }
}
