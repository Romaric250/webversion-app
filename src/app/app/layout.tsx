'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppBottomNav } from '@/components/layout/AppBottomNav'
import { useAuthStore } from '@/store/authStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      const redirect = typeof window !== 'undefined'
        ? encodeURIComponent(window.location.pathname + window.location.search)
        : '/app'
      router.replace(`/login?redirect=${redirect}`)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-sidebar">
        <AppHeader />
        <main className="pt-16 lg:pt-0 pb-20 lg:pb-8 min-h-screen">
          <div className="page-container py-6 lg:py-8">{children}</div>
        </main>
        <AppBottomNav />
      </div>
    </div>
  )
}
