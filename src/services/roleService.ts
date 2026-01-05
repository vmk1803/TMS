import api from '@/lib/api'

// Types
export interface Role {
  _id: string
  name: string
  description?: string
  permissions: {
    projects: string[]
    task: string[]
    users: string[]
    settings: string[]
  }
  userCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface CreateRoleData {
  name: string
  description?: string
  permissions: {
    projects: string[]
    task: string[]
    users: string[]
    settings: string[]
  }
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: {
    projects?: string[]
    task?: string[]
    users?: string[]
    settings?: string[]
  }
}

export interface PaginatedRolesResponse {
  records: Role[]
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
export const roleApi = {
  // Get all roles with pagination
  getRoles: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      permission_section?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedRolesResponse> => {
    const response = await api.get('/user-management/roles', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get role by ID
  getRole: async (id: string): Promise<Role> => {
    const response = await api.get(`/user-management/roles/${id}`)
    return response.data.data
  },

  // Create role
  createRole: async (data: CreateRoleData): Promise<Role> => {
    const response = await api.post('/user-management/roles', data)
    return response.data.data
  },

  // Update role
  updateRole: async (id: string, data: UpdateRoleData): Promise<Role> => {
    const response = await api.patch(`/user-management/roles/${id}`, data)
    return response.data.data
  },

  // Get all roles without pagination
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/user-management/roles/all')
    return response.data.data || response.data
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/user-management/roles/${id}`)
  },
}
