'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppBottomNav } from '@/components/layout/AppBottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
