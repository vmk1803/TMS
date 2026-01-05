import api from '@/lib/api'

export interface LoginResponseShape {
  token?: string
  data?: any
  user?: any,
  accessToken?: string
}

/**
 * Perform login against the backend. Adjust ENDPOINT if different.
 */
export async function login(email: string, password: string, application_type?:string) {
  try {
    const res = await api.post('/auth/login', { email, password, application_type })
    return res.data as LoginResponseShape
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Login failed'
    throw new Error(message)
  }
}
