import api from "../../../lib/api"

export async function forgotPassword(email: string) {
  try {
    const res = await api.post('/user/forgot-password', { email })
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Login failed'
    throw new Error(message)
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    const res = await api.post('/user/verify-otp', { email, otp })
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Verify OTP failed'
    throw new Error(message)
  }
}

export async function updatePassword(email: string,  password: string) {
  try {
    const res = await api.post('/user/updatePasswordByEmail', { email, password })
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Update password failed'
    throw new Error(message)
  }
}