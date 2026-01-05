import api from '@/lib/api'

// Types
export interface Group {
  id: string
  _id: string
  name: string
  department: {
    _id: string
    name: string
  }
  manager: {
    _id: string
    firstName: string
    lastName: string
  }
  members: Array<{
    _id: string
    firstName: string
    lastName: string
  }>
  description?: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export interface CreateGroupData {
  name: string
  department: string
  manager: string
  members: string[]
  description?: string
}

export interface CreateGroupResponse {
  group: Group
  message: string
}

export interface UpdateGroupData {
  name?: string
  department?: string
  manager?: string
  members?: string[]
  description?: string
}

export interface PaginatedGroupsResponse {
  records: Group[]
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
export const groupApi = {
  // Get all groups with pagination
  getGroups: async (
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      department?: string
    },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedGroupsResponse> => {
    const response = await api.get('/user-management/groups', {
      params,
      signal: options?.signal
    })
    return response.data.data // Extract just the data part
  },

  // Get group by ID
  getGroup: async (id: string): Promise<Group> => {
    const response = await api.get(`/user-management/groups/${id}`)
    return response.data.data
  },

  // Create group
  createGroup: async (data: CreateGroupData): Promise<CreateGroupResponse> => {
    const response = await api.post('/user-management/groups', data)
    return {
      group: response.data.data,
      message: response.data.message
    }
  },

  // Update group
  updateGroup: async (id: string, data: UpdateGroupData): Promise<Group> => {
    const response = await api.patch(`/user-management/groups/${id}`, data)
    return response.data.data
  },

  // Get all groups without pagination
  getAllGroups: async (): Promise<Group[]> => {
    const response = await api.get('/user-management/groups/all')
    return response.data.data || response.data
  },

  // Delete group
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/user-management/groups/${id}`)
  },

  // Get group members with pagination and filters
  getGroupMembers: async (
    groupId: string,
    params?: {
      page?: number
      page_size?: number
      search_string?: string
      department?: string
      status?: string
    }
  ): Promise<PaginatedGroupsResponse> => {
    const response = await api.get(`/user-management/groups/${groupId}/members`, { params })
    return response.data.data
  },
}
