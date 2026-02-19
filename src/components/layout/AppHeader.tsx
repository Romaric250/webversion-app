'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Home, BookOpen, Search, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Dashboard', icon: Home },
  { href: '/app/learning', label: 'Learning', icon: BookOpen },
  { href: '/app/dictionary', label: 'Dictionary', icon: Search },
  { href: '/app/profile', label: 'Profile', icon: User },
]

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    router.replace('/login')
  }

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-background-tertiary">
      <Link href="/app" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-background font-bold text-sm">SN</span>
        </div>
        <span className="font-bold text-white">SignNova</span>
      </Link>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 rounded-lg text-white/80 hover:bg-background-tertiary hover:text-white"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background-secondary border-b border-background-tertiary shadow-lg">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                    isActive ? 'bg-primary/15 text-primary' : 'text-white/80 hover:bg-background-tertiary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
