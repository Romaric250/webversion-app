'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Shield, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { navItems, footerNavItems, isActive } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { PlansModal } from '@/components/PlansModal'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [plansOpen, setPlansOpen] = useState(false)
  const planName = user?.subscriptionPlan ? String(user.subscriptionPlan).charAt(0).toUpperCase() + String(user.subscriptionPlan).slice(1) : 'Free'
  const isFree = !user?.subscriptionPlan || user.subscriptionPlan === 'free'

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-sidebar lg:bg-background-secondary lg:border-r lg:border-background-tertiary">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-background-tertiary">
        <img src="/logo.png" alt="SignNova" className="w-10 h-10 rounded-xl object-contain flex-shrink-0" />
        <p className="font-bold text-white text-lg">SignNova</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-white/80 hover:bg-background-tertiary hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
        <div className="mt-6 pt-4 border-t border-background-tertiary space-y-1">
          {footerNavItems.map((item) => {
            const Icon = item.icon
            const basePath = item.href.split('?')[0].split('#')[0]
            const active = pathname === basePath || pathname.startsWith(basePath + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-white/60 hover:bg-background-tertiary hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-background-tertiary hover:text-white"
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              Admin
            </Link>
          )}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-background-tertiary space-y-4">
        <button
          onClick={() => setPlansOpen(true)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-background-tertiary transition-colors"
        >
          <Sparkles className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-left">{planName}</span>
          {isFree && <span className="text-primary text-xs">Upgrade</span>}
        </button>
        {user && (
          <div className="px-4 py-2 rounded-lg bg-background-tertiary/50">
            <p className="text-white font-medium text-sm truncate">{user.name}</p>
            <p className="text-white/60 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
      <PlansModal isOpen={plansOpen} onClose={() => setPlansOpen(false)} />
    </aside>
  )
}
