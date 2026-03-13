'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { navItems, footerNavItems, isActive } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { PlansModal } from '@/components/PlansModal'

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)
  const planName = user?.subscriptionPlan ? String(user.subscriptionPlan).charAt(0).toUpperCase() + String(user.subscriptionPlan).slice(1) : 'Free'
  const isFree = !user?.subscriptionPlan || user.subscriptionPlan === 'free'

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    router.replace('/login')
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const mobileSidebarContent = mobileMenuOpen && (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden
      />
      <div className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-background-secondary border-r border-background-tertiary shadow-xl z-[9999] overflow-y-auto">
        <div className="p-4 border-b border-background-tertiary flex items-center gap-3">
          <img src="/logo.png" alt="SignNova" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-bold text-white text-lg">SignNova</span>
        </div>
        <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                active ? 'bg-primary/15 text-primary' : 'text-white/80 hover:bg-background-tertiary'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        <div className="my-2 border-t border-background-tertiary" />
        {footerNavItems.map((item) => {
          const Icon = item.icon
          const basePath = item.href.split('?')[0].split('#')[0]
          const active = pathname === basePath || pathname.startsWith(basePath + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                active ? 'bg-primary/15 text-primary' : 'text-white/60 hover:bg-background-tertiary'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        {user?.isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
              pathname.startsWith('/admin') ? 'bg-primary/15 text-primary' : 'text-white/60 hover:bg-background-tertiary'
            )}
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        )}
        <div className="my-2 border-t border-background-tertiary" />
        <button
          onClick={() => { setMobileMenuOpen(false); setPlansOpen(true) }}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-background-tertiary",
            isFree ? "text-amber-400/90 hover:text-amber-400" : "text-white/80 hover:text-white"
          )}
        >
          {planName} {isFree && '• Upgrade'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </nav>
      </div>
    </>
  )

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-background-tertiary">
      <Link href="/app" className="flex items-center gap-2">
        <img src="/logo.png" alt="SignNova" className="w-9 h-9 rounded-lg object-contain" />
        <span className="font-bold text-white">SignNova</span>
      </Link>

      <button
        onClick={() => setPlansOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background-tertiary/80 hover:bg-background-tertiary text-xs font-medium",
          isFree ? "text-amber-400/90 hover:text-amber-400" : "text-white/80 hover:text-white"
        )}
      >
        <span>{planName}</span>
        {isFree && <span className="text-amber-400">Upgrade</span>}
      </button>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {typeof document !== 'undefined' && createPortal(mobileSidebarContent, document.body)}
      <PlansModal isOpen={plansOpen} onClose={() => setPlansOpen(false)} />
    </header>
  )
}
