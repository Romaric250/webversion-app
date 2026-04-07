'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppBottomNav } from '@/components/layout/AppBottomNav'
import { bottomNavItems } from '@/lib/nav'
import { EmailVerificationModal } from '@/components/ui/EmailVerificationModal'
import { FeedbackPrompt } from '@/components/FeedbackPrompt'
import { useAuthStore } from '@/store/authStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()

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
        <main className={bottomNavItems.length > 0 ? 'pt-16 lg:pt-0 pb-20 lg:pb-8 min-h-screen' : 'pt-16 lg:pt-0 pb-8 min-h-screen'}>
          <div className="page-container py-6 lg:py-8">{children}</div>
        </main>
        <AppBottomNav />
      </div>
      {user?.emailVerified === false && (
        <EmailVerificationModal
          isOpen={true}
          onClose={() => {}}
          userEmail={user.email}
        />
      )}
      {user?.emailVerified === true && <FeedbackPrompt />}
    </div>
  )
}
