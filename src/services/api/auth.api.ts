import { apiClient } from './client'
import { API_ENDPOINTS } from '@/config/api'
import type { ApiResponse } from '@/types/api.types'
import type { AuthResponse, LoginCredentials, SignupData } from '@/types/auth.types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    if (data.success && data.data) return data.data
    throw new Error(data.message || 'Login failed')
  },

  signup: async (payload: Omit<SignupData, 'confirmPassword'>): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      payload
    )
    if (data.success && data.data) return data.data
    throw new Error(data.message || 'Signup failed')
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  getSession: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.get<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.SESSION
    )
    if (data.success && data.data) return data.data
    throw new Error(data.error || 'No active session')
  },

  forgotPassword: async (email: string): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    )
    if (!data.success) throw new Error(data.error || 'Failed to send reset email')
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    )
    if (!data.success) throw new Error(data.error || 'Failed to reset password')
  },

  sendVerificationEmail: async (): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL
    )
    if (!data.success) throw new Error(data.error || 'Failed to send verification email')
  },

  verifyOtp: async (code: string): Promise<{ emailVerified: boolean }> => {
    const { data } = await apiClient.post<ApiResponse<{ emailVerified: boolean }>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { code }
    )
    if (!data.success || !data.data) throw new Error(data.error || 'Verification failed')
    return data.data
  },

  resendVerificationCode: async (): Promise<void> => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION_CODE
    )
    if (!data.success) throw new Error(data.error || 'Failed to resend code')
  },
}
