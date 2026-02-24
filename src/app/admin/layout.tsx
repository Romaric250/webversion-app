'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, Search, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace('/login')
      else if (!user?.isAdmin) router.replace('/app')
    }
  }, [isAuthenticated, isLoading, user?.isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-background-secondary border-r border-background-tertiary p-4 flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-white">Admin</span>
        </Link>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
          >
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link
            href="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
          >
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link
            href="/admin/signs"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
          >
            <Search className="h-5 w-5" />
            Dictionary
          </Link>
        </nav>
        <div className="mt-auto pt-4 border-t border-background-tertiary">
          <Link
            href="/app"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white text-sm"
          >
            ← Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
