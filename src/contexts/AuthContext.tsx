'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

const AuthContext = createContext<ReturnType<typeof useAuthStore.getState> | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore()

  useEffect(() => {
    store.restoreSession()
  }, [])

  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
