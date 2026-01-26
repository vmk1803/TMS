import axios from 'axios'

const BASE =
  process.env.RESTAPI_URL ||
  'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor → Attach user headers automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor → Existing error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_CONNECTION_REFUSED') {
      throw new Error(
        'Unable to connect to the server. Please make sure the backend server is running.'
      )
    }
    throw error
  }
)

export default api
