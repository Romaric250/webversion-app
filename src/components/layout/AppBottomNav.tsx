'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/learning', label: 'Learning', icon: BookOpen },
  { href: '/app/dictionary', label: 'Dictionary', icon: Search },
  { href: '/app/profile', label: 'Profile', icon: User },
]

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-4 bg-background-secondary border-t border-background-tertiary safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px]',
              isActive ? 'text-primary bg-primary/10' : 'text-white/60 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
