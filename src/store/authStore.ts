'use client'

import { create } from 'zustand'
import type { User } from '@/types/auth.types'
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  removeUserData,
} from '@/lib/storage'
import { authApi } from '@/services/api/auth.api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  restoreSession: () => Promise<boolean>
  setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (user, token) => {
    setAuthToken(token)
    setUserData(JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    removeAuthToken()
    removeUserData()
    set({ user: null, token: null, isAuthenticated: false })
  },

  restoreSession: async () => {
    set({ isLoading: true })
    try {
      const token = getAuthToken()
      if (!token) {
        set({ isLoading: false, isAuthenticated: false })
        return false
      }
      const session = await authApi.getSession()
      if (session?.user && session?.token) {
        setAuthToken(session.token)
        setUserData(JSON.stringify(session.user))
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
    } catch {
      removeAuthToken()
      removeUserData()
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    return false
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}))
