import api from '@/lib/api'

// Types
export interface User {
  _id: string
  // Primary name fields (new format)
  firstName?: string
  lastName?: string
  // Legacy name fields
  fname?: string
  lname?: string
  email: string
  mobileNumber?: string
  gender?: string
  passwordSetting?: string
  assets?: Array<{
    assetId: string
    assetName: string
  }>
  active: boolean
  // Organization details (new format)
  organizationDetails?: {
    role: {
      _id: string
      name: string
    }
    department: {
      _id: string
      name: string
    }
    organization: {
      _id: string
      organizationName: string
    }
    location: {
      country: string
      city: string
      id: string
    }
    reportingManager?: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
  }
  // Legacy role field (string instead of object)
  role?: string
  // Timestamps
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
}

export interface PaginatedUsersResponse {
  records: User[]
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
export const userApi = {
  // Get users with pagination, search, and filters
  getUsers: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      department_id?: string
      role_id?: string
      status?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedUsersResponse> => {
    const response = await api.get('/user-management/users', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get all users without pagination
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/user-management/users/all')
    return response.data.data || response.data
  },

  // Get users by organization
  getUsersByOrganization: async (organizationId: string): Promise<User[]> => {
    const response = await api.get(`/user-management/users/organization/${organizationId}`)
    return response.data.data || response.data
  },

  // Get user by id
  getUserById: async (id: string, options?: { signal?: AbortSignal }): Promise<User> => {
    const response = await api.get(`/user-management/users/${id}`, {
      signal: options?.signal
    })
    return response.data.data
  },

  // Create user
  createUser: async (data: any): Promise<User> => {
    const response = await api.post('/user-management/users', data)
    return response.data.data
  },

  // Update user
  updateUser: async (id: string, data: any): Promise<User> => {
    const response = await api.patch(`/user-management/users/${id}`, data)
    return response.data.data
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/user-management/users/${id}`)
  },
}
