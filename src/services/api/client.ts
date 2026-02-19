import axios, { InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/api'
import { getAuthToken, removeAuthToken } from '@/lib/storage'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeAuthToken()
    }
    const message = error.response?.data?.error || error.response?.data?.message || error.message
    return Promise.reject(new Error(message || 'An error occurred'))
  }
)
