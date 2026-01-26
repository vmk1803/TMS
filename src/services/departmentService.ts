import api from '@/lib/api'

// Types
export interface Department {
  id: string
  _id: string
  name: string
  usersCount?: number
  description?: string
  organization: {
    _id: string
    organizationName: string
    email: string
    contactNumber: string
    description: string
    locations: string[]
    createdBy: string
    deletedAt: string | null
    createdAt: string
    updatedAt: string
    __v: number
  }
  headOfDepartment: {
    _id: string
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    gender: string
    active: boolean
    organizationDetails: {
      role: string
      department: string
      organization: string
      location: string
      reportingManager: string
    }
    password: string
    passwordSetting: string
    assets: any[]
    deletedAt: string | null
    createdAt: string
    updatedAt: string
    __v: number
    lastLogin: string | null
  } | null
  createdBy: {
    _id: string
    firstName: string
    lastName: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateDepartmentData {
  name: string
  organization: string
  headOfDepartment: string
  description?: string
}

export interface CreateDepartmentResponse {
  department: Department
  message: string
}

export interface UpdateDepartmentData {
  name?: string
  organization?: string
  headOfDepartment?: string
  description?: string
}

export interface PaginatedDepartmentsResponse {
  records: Department[]
  pagination_info: {
    total_records: number
    total_pages: number
    page_size: number
    current_page: number
    next_page: number | null
    prev_page: number | null
  }
}

// API Functions
export const departmentApi = {
  // Get all departments with pagination
  getDepartments: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      organization_id?: string
      department_id?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedDepartmentsResponse> => {
    const response = await api.get('/user-management/departments', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get department by ID
  getDepartment: async (id: string): Promise<Department> => {
    const response = await api.get(`/user-management/departments/${id}`)
    return response.data.data
  },

  // Get departments by organization
  getDepartmentsByOrganization: async (organizationId: string, params?: {
    page?: number
    page_size?: number
    search_string?: string
  }): Promise<PaginatedDepartmentsResponse> => {
    const response = await api.get(`/user-management/departments/organization/${organizationId}`, { params })
    return response.data.data
  },

  // Create department
  createDepartment: async (data: CreateDepartmentData): Promise<CreateDepartmentResponse> => {
    const response = await api.post('/user-management/departments', data)
    return {
      department: response.data.data,
      message: response.data.message
    }
  },

  // Update department
  updateDepartment: async (id: string, data: UpdateDepartmentData): Promise<Department> => {
    const response = await api.patch(`/user-management/departments/${id}`, data)
    return response.data.data
  },

  // Get all departments without pagination
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/user-management/departments/all')
    return response.data.data || response.data
  },

  // Delete department
  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/user-management/departments/${id}`)
  },

  // Bulk operations
  bulkOperation: async (data: { ids: string[], operation: 'delete' }): Promise<{
    successCount: number
    failedCount: number
    successIds: string[]
    failedIds: string[]
  }> => {
    const response = await api.post('/user-management/departments/bulk-update', data)
    return response.data.data
  },
}
