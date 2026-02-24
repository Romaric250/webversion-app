import { apiClient } from './client'
import { API_ENDPOINTS } from '@/config/api'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/auth.types'

export interface ProfileUpdate {
  name?: string
  avatar?: string
}

export const userApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<{ id: string; email: string; name: string; avatar?: string }>>(
      API_ENDPOINTS.USER.PROFILE
    )
    if (data.success && data.data)
      return { id: data.data.id, email: data.data.email, name: data.data.name, image: data.data.avatar }
    throw new Error(data.message || 'Failed to load profile')
  },

  updateProfile: async (payload: ProfileUpdate): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<{ id: string; email: string; name: string; avatar?: string }>>(
      API_ENDPOINTS.USER.PROFILE,
      { name: payload.name, avatar: payload.avatar }
    )
    if (data.success && data.data)
      return { id: data.data.id, email: data.data.email, name: data.data.name, image: data.data.avatar }
    throw new Error(data.message || 'Failed to update profile')
  },
}
