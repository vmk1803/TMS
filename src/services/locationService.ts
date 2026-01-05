import api from '@/lib/api'

// Types
export interface Location {
  id: string
  // Address fields are now directly on the location (no more addresses array)
  country: string
  state?: string
  city: string
  timeZone: string
  addressLine?: string
  streetAddress: string
  zip: string
  userCount?: number
  createdAt?: string
  updatedAt?: string
  // Organization data from aggregation
  organization?: {
    _id: string
    organizationName: string
    email: string
  }
}

export interface LocationAddress {
  country: string
  state?: string
  city: string
  timeZone: string
  addressLine?: string
  streetAddress: string
  zip: string
}

export interface CreateLocationData {
  addresses: LocationAddress[]
}

export interface CreateLocationResponse {
  locations: Location[]
  message: string
}

export interface UpdateLocationData {
  addresses?: LocationAddress[]
}

export interface PaginatedLocationsResponse {
  records: Location[]
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
export const locationApi = {
  // Get all locations with pagination
  getLocations: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      organization_id?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedLocationsResponse> => {
    const response = await api.get('/user-management/locations', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get location by ID
  getLocation: async (id: string): Promise<Location> => {
    const response = await api.get(`/user-management/locations/${id}`)
    return response.data.data
  },

  // Get my locations
  getMyLocations: async (): Promise<Location[]> => {
    const response = await api.get('/user-management/locations/my')
    return response.data.data
  },

  // Get all locations without pagination
  getAllLocations: async (): Promise<Location[]> => {
    const response = await api.get('/user-management/locations/all')
    return response.data.data || response.data
  },

  // Create location
  createLocation: async (data: CreateLocationData): Promise<CreateLocationResponse> => {
    const response = await api.post('/user-management/locations', data)
    return {
      locations: response.data.data,
      message: response.data.message
    }
  },

  // Update location
  updateLocation: async (id: string, data: UpdateLocationData): Promise<Location> => {
    const response = await api.patch(`/user-management/locations/${id}`, data)
    return response.data.data
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/user-management/locations/${id}`)
  },
}
