import api from '@/lib/api'

// Types
export interface Department {
  id: string
  _id: string
  name: string
  organization: {
    _id: string
    name: string
  }
  headOfDepartment: {
    _id: string
    fname: string
    lname: string
    email: string
  }
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateDepartmentData {
  name: string
  organization: string
  headOfDepartment: string
  status?: string
}

export interface CreateDepartmentResponse {
  department: Department
  message: string
}

export interface UpdateDepartmentData {
  name?: string
  organization?: string
  headOfDepartment?: string
  status?: string
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
}
