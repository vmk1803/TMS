import api from '@/lib/api'

// Types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

// API Functions
export const userApi = {
  // Get all users without pagination
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/all')
    return response.data.data
  },
}
