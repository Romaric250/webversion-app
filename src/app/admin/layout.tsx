'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, Search, Shield, MessageSquare, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === '/admin'
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin/users')
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link
            href="/admin/courses"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin/courses')
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link
            href="/admin/signs"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin/signs')
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <Search className="h-5 w-5" />
            Dictionary
          </Link>
          <Link
            href="/admin/plans"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin/plans')
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <Sparkles className="h-5 w-5" />
            Plans
          </Link>
          <Link
            href="/admin/feedback"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin/feedback')
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-white/70 hover:bg-background-tertiary hover:text-white border border-transparent'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            Feedback
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
