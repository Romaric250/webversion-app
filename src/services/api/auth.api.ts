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
}
