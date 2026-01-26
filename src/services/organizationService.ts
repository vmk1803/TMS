import api from '@/lib/api'

// Types
export interface Organization {
  _id: string
  organizationName: string // Renamed from 'name'
  email: string
  contactNumber: string
  description: string
  status: string
  primaryAdmin: string // ObjectId as string
  locations: string[] // Array of location strings
  createdBy: string // ObjectId as string
  createdAt?: string
  updatedAt?: string
  // Optional aggregated fields
  departmentCount?: number
  userCount?: number
}

export interface CreateOrganizationData {
  organizationName: string // Renamed from 'name'
  email: string
  contactNumber: string
  description: string
  status?: string
  primaryAdmin?: string
  locations?: string[]
  createdAt: string
}

export interface CreateOrganizationResponse {
  organization: Organization
  message: string
}

export interface UpdateOrganizationData {
  organizationName?: string // Renamed from 'name'
  email?: string
  contactNumber?: string
  description?: string
  status?: string
  primaryAdmin?: string
  locations?: string[]
}

export interface PaginatedOrganizationsResponse {
  records: Organization[]
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
export const organizationApi = {
  // Get all organizations with pagination
  getOrganizations: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      status?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedOrganizationsResponse> => {
    const response = await api.get('/user-management/organizations', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get organization by ID
  getOrganization: async (id: string): Promise<Organization> => {
    const response = await api.get(`/user-management/organizations/${id}`)
    return response.data.data
  },

  // Get my organizations
  getMyOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/user-management/organizations/my')
    return response.data.data
  },

  // Get all organizations without pagination
  getAllOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/user-management/organizations/all')
    return response.data.data || response.data
  },

  // Create organization
  createOrganization: async (data: CreateOrganizationData): Promise<CreateOrganizationResponse> => {
    const response = await api.post('/user-management/organizations', data)
    return {
      organization: response.data.data,
      message: response.data.message
    }
  },

  // Update organization
  updateOrganization: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    const response = await api.patch(`/user-management/organizations/${id}`, data)
    return response.data.data
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(`/user-management/organizations/${id}`)
  },

  // Bulk update organization status
  bulkUpdateStatus: async (organizationIds: string[], status: string): Promise<{ message: string, modifiedCount: number }> => {
    const response = await api.post('/user-management/organizations/bulk-update', {
      organizationIds,
      status
    })
    return {
      message: response.data.message,
      modifiedCount: response.data.data.modifiedCount
    }
  },
}
